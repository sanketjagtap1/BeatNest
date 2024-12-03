import { Component, OnInit, ViewChild } from '@angular/core';
import { addIcons } from 'ionicons';
import { playSkipForward, pause, playSkipBack, play, logoIonic } from 'ionicons/icons';
import { MusicService } from 'src/app/services/music.service';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { selectCurrentIndex } from 'src/app/state/selectors/current-index.selectors';
import { selectPlaylist } from 'src/app/state/selectors/playlist.selectors';
import { setNextIndex, setPreviousIndex } from 'src/app/state/actions/current-index.actions';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonMenu, IonMenuButton, IonButton, IonButtons, IonSearchbar, IonList, IonItem, IonLabel, IonTabBar, IonIcon, IonTabButton, IonTabs, IonCard, IonCardHeader, IonCardSubtitle, IonCardContent, IonCardTitle, IonProgressBar, IonFooter, IonText } from '@ionic/angular/standalone';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-mini-player',
  templateUrl: './mini-player.component.html',
  styleUrls: ['./mini-player.component.scss'],
  standalone: true,
  imports: [IonToolbar, IonButton, IonProgressBar, IonIcon, NgIf]
})
export class MiniPlayerComponent implements OnInit {

  @ViewChild('audioPlayer') audioPlayer: any;
  @ViewChild('progressBar') progressBar: any;
  rect: any;
  musicData: any;
  currentSongIndex: number = 0;
  isPlaying: boolean = false;
  currentTime: string = '0:00';
  duration: string = '0:00';
  progress: number = 0;
  updateProgressInterval: any;
  storedCurrentTime: number = 0; // To store the current time when paused
  currentIndex$: Observable<number | null>;
  playList$: Observable<any>;

  constructor(public musicService: MusicService, private store: Store) {
    addIcons({ logoIonic, play, playSkipBack, pause, playSkipForward });
    this.currentIndex$ = this.store.pipe(select(selectCurrentIndex));
    this.playList$ = this.store.pipe(select(selectPlaylist));
  }

  ngOnInit() {
    this.currentIndex$.subscribe(index => {
      this.playList$.subscribe(list => {
        this.musicData = list;
      });
      this.currentSongIndex = Number(index);
      this.play(this.musicData[this.currentSongIndex]);
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.rect = this.progressBar.getBoundingClientRect();
    }, 150);
  }

  play(song: any) {
    const audio = this.audioPlayer.nativeElement;
    audio.src = song.downloadUrl[song.downloadUrl.length - 1].link;
    audio.load();

    // If the song was paused, resume from the stored time
    if (this.storedCurrentTime > 0) {
      audio.currentTime = this.storedCurrentTime;
    } else {
      audio.currentTime = 0;  // Start from the beginning if it's the first time playing
    }

    audio.play();
    this.isPlaying = true;
    this.currentSongIndex = this.musicData.indexOf(song);

    audio.onloadedmetadata = () => {
      this.duration = this.formatTime(audio.duration);
      this.updateProgressInterval = setInterval(() => {
        this.updateProgress();
      }, 1000);
    };

    audio.onended = () => {
      this.resetProgress();
      this.next();
    };
  }

  pause() {
    const audio = this.audioPlayer.nativeElement;
    audio.pause();
    this.isPlaying = false;

    // Store the current time when paused
    this.storedCurrentTime = audio.currentTime;

    clearInterval(this.updateProgressInterval);
  }

  next() {
    this.resetProgress(); // Reset progress when moving to the next song
    if (this.currentSongIndex < this.musicData.length - 1) {
      this.store.dispatch(setNextIndex());
    }
    this.isPlaying = true;
  }

  previous() {
    this.resetProgress(); // Reset progress when moving to the previous song
    if (this.currentSongIndex > 0) {
      this.store.dispatch(setPreviousIndex());
    }
    this.isPlaying = true;
  }

  slideForward(seconds: number = 10) {
    const audio = this.audioPlayer.nativeElement;
    if (audio.currentTime + seconds < audio.duration) {
      audio.currentTime += seconds;
    } else {
      audio.currentTime = audio.duration;
    }
    this.updateProgress();
  }

  slideBackward(seconds: number = 10) {
    const audio = this.audioPlayer.nativeElement;
    if (audio.currentTime - seconds > 0) {
      audio.currentTime -= seconds;
    } else {
      audio.currentTime = 0;
    }
    this.updateProgress();
  }

  updateProgress() {
    const audio = this.audioPlayer.nativeElement;
    this.progress = audio.currentTime / audio.duration;
    this.currentTime = this.formatTime(audio.currentTime);
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds}`;
  }

  resetProgress() {
    this.progress = 0;
    this.currentTime = '0:00';
    this.storedCurrentTime = 0; // Reset the stored time when changing songs
    this.isPlaying = false;
    clearInterval(this.updateProgressInterval);
  }

  handleInput(event: any) {
    let query = event.target.value.toLowerCase();
    if (query === '') {
      query = 'Trending-Hindi';
    }
    // this.getSongs(query);
  }

  seekToPosition(event: MouseEvent) {
    const audio = this.audioPlayer.nativeElement as HTMLAudioElement;
    const clickPosition = event.clientX - this.rect.left;
    const progress = clickPosition / this.rect.width;
    audio.currentTime = progress * audio.duration;
    this.updateProgress(); // Update immediately after seeking
  }
}
