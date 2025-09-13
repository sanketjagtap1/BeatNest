import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle } from '@ionic/angular/standalone';
import { MusicService } from '../services/music.service';
import { select, Store } from '@ngrx/store';
import { setCurrentIndex } from '../state/actions/current-index.actions';
import { NgFor, NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { selectPlaylist } from '../state/selectors/playlist.selectors';
import { MiniPlayerComponent } from "../components/mini-player/mini-player.component";

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonCardHeader, IonCard, IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar, IonCardTitle, IonCardSubtitle, NgFor, NgIf, MiniPlayerComponent]
})
export class Tab2Page implements OnInit {
  playList$: Observable<any>
  musicData: any;
  isIos: boolean = false;
  query:any;
  constructor(private readonly musicService: MusicService, private readonly store: Store) {
    this.playList$ = this.store.pipe(select(selectPlaylist));

  }
  ngOnInit(): void {
    this.query = 'Trending-Hindi';
    this.musicService.getSongs(this.query)
    this.playList$.subscribe(list => {
      this.musicData = list;
    });
  }
  ionViewWillEnter() {
    
    this.musicService.getSongs(this.query);
  }
  handleInput(event: any) {
    this.query = event.target.value.toLowerCase();
    if (this.query === '') {
      this.query = 'Trending-Hindi';
    }
    this.musicService.getSongs(this.query)
  }

  setCurrentSong(index: number) {

    console.log(index)
    this.store.dispatch(setCurrentIndex({ currentIndex: index }));
  }

}
