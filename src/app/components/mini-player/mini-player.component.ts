import { Component, OnInit, NgZone } from '@angular/core';
import { addIcons } from 'ionicons';
import { playSkipForward, pause, playSkipBack, play, logoIonic, shuffle, repeat } from 'ionicons/icons';
import { MusicService } from 'src/app/services/music.service';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { selectCurrentIndex } from 'src/app/state/selectors/current-index.selectors';
import { selectPlaylist } from 'src/app/state/selectors/playlist.selectors';
import { setNextIndex, setPreviousIndex } from 'src/app/state/actions/current-index.actions';
import { IonToolbar, IonButton, IonProgressBar, IonIcon, IonText } from '@ionic/angular/standalone';
import { NgIf } from '@angular/common';
import { Media, MediaObject } from '@awesome-cordova-plugins/media/ngx';

@Component({
  selector: 'app-mini-player',
  templateUrl: './mini-player.component.html',
  styleUrls: ['./mini-player.component.scss'],
  standalone: true,
  providers: [Media],
  imports: [IonToolbar, IonButton, IonProgressBar, IonIcon, IonText, NgIf]
})
export class MiniPlayerComponent implements OnInit {
  musicData: any;
  currentSongIndex: number = 0;

  isPlaying: boolean = false;
  currentTime: string = '0:00';
  duration: string = '0:00';
  progress: number = 0;
  updateProgressInterval: any;

  currentFile: MediaObject | null = null;

  isShuffle: boolean = false;
  isRepeat: boolean = false;
  isExpanded: boolean = false;

  currentIndex$: Observable<number | null>;
  playList$: Observable<any>;

  constructor(
    public musicService: MusicService,
    private store: Store,
    private media: Media,
    private zone: NgZone
  ) {
    addIcons({ logoIonic, play, playSkipBack, pause, playSkipForward, shuffle, repeat });
    this.currentIndex$ = this.store.pipe(select(selectCurrentIndex));
    this.playList$ = this.store.pipe(select(selectPlaylist));
  }

  ngOnInit() {
    this.enableBgMode();  // 👈 Add this
    this.currentIndex$.subscribe(index => {
      this.playList$.subscribe(list => this.musicData = list);

      this.currentSongIndex = Number(index);
      if (this.musicData && this.musicData[this.currentSongIndex]) {
        this.play(this.musicData[this.currentSongIndex]);
      }
    });
  }

  play(song?: any) {
    // Resume current song if no new song passed
    if (!song && this.currentFile) {
      this.currentFile.play();
      this.isPlaying = true;
      return;
    }

    // Stop previous song if new one
    if (this.currentFile) {
      this.currentFile.stop();
      this.currentFile.release();
      clearInterval(this.updateProgressInterval);
    }

    if (!song) return;

    const url = song.downloadUrl[song.downloadUrl.length - 1].link;
    this.currentFile = this.media.create(url);

    this.currentFile.play();
    this.isPlaying = true;
    console.log(this.currentSongIndex)
    this.currentSongIndex = this.musicData.indexOf(song);

    // Fetch duration after delay
    setTimeout(() => {
      if (this.currentFile) {
        const dur = this.currentFile.getDuration();
        if (dur > 0) this.zone.run(() => this.duration = this.formatTime(dur));
      }
    }, 1000);

    // Update progress
    this.updateProgressInterval = setInterval(() => {
      if (this.currentFile) {
        this.currentFile.getCurrentPosition().then(pos => {
          if (pos >= 0) {
            this.zone.run(() => {
              const dur = this.currentFile!.getDuration();
              this.currentTime = this.formatTime(pos);
              this.duration = dur > 0 ? this.formatTime(dur) : this.duration;
              this.progress = dur > 0 ? pos / dur : 0;
            });
          }
        });
      }
    }, 1000);

    // Song completed
    this.currentFile.onSuccess.subscribe(() => {
      this.zone.run(() => {
        this.resetProgress();
        this.next();
      });
    });

    this.currentFile.onError.subscribe(err => console.error('[Player] Media error: ', err));
  }

  pause() {
    if (this.currentFile && this.isPlaying) {
      this.currentFile.pause();
      this.isPlaying = false;
    }
    clearInterval(this.updateProgressInterval);
  }

  stop() {
    if (this.currentFile) {
      this.currentFile.stop();
      this.currentFile.release();
      this.currentFile = null;
    }
    this.resetProgress();
  }

  next() {
    this.stop();
    if (this.isShuffle) {
      const randomIndex = Math.floor(Math.random() * this.musicData.length);
      this.currentSongIndex = randomIndex;
      this.play(this.musicData[this.currentSongIndex]);
    } else {
      if (this.currentSongIndex < this.musicData.length - 1) {
        this.store.dispatch(setNextIndex());
      } else if (this.isRepeat) {
        this.currentSongIndex = 0;
        this.play(this.musicData[this.currentSongIndex]);
      }
    }
  }

  previous() {
    this.stop();
    if (this.currentSongIndex > 0) {
      this.store.dispatch(setPreviousIndex());
    }
  }

  toggleShuffle() {
    this.isShuffle = !this.isShuffle;
  }

  toggleRepeat() {
    this.isRepeat = !this.isRepeat;
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds}`;
  }

  resetProgress() {
    this.progress = 0;
    this.currentTime = '0:00';
    this.duration = '0:00';
    this.isPlaying = false;
    clearInterval(this.updateProgressInterval);
  }

  seekToPosition(event: MouseEvent) {
    if (!this.musicData[this.currentSongIndex] || !this.currentFile) return;

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const clickPosition = event.clientX - rect.left;
    const ratio = clickPosition / rect.width;

    const dur = this.currentFile.getDuration();
    if (dur > 0) this.currentFile.seekTo(ratio * dur * 1000);
  }
}
