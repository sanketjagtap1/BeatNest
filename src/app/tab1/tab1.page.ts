import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardTitle, IonCardSubtitle, IonCardHeader, IonCardContent } from '@ionic/angular/standalone';
import { MusicService } from '../services/music.service';
import { NgFor } from '@angular/common';
import { MiniPlayerComponent } from '../components/mini-player/mini-player.component';
import { Store } from '@ngrx/store';
import { setCurrentIndex, setNextIndex } from '../state/actions/current-index.actions';
import { setPlaylist } from '../state/actions/playlist.actions';
import { Platform } from '@ionic/angular';  // Import Platform
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardTitle, IonCardSubtitle, IonCardHeader, IonCardContent, NgFor, MiniPlayerComponent],
})
export class Tab1Page {
  musicData: any;
  isIos: boolean = false;
  constructor(public musicService: MusicService, private store: Store, private platform: Platform,) { this.getSongs('Latest-Hindi-2024');
    this.isIos = this.platform.is('ios');
  }
  

  getSongs(query: string) {
    this.musicService.getTrendingSongs(query).subscribe(res => {
      this.musicData = res.data.results;
      this.musicData.map((item: any)=>{
        item.primaryArtists = item.primaryArtists.split(',')[0]
        
      })
      console.log(this.musicData)
      this.store.dispatch(setPlaylist({ playlist: this.musicData }));

    });
  }

  setCurrentSong(index: number) {
    this.store.dispatch(setPlaylist({ playlist: this.musicData }));
    console.log(index)
    this.store.dispatch(setCurrentIndex({ currentIndex: index }));
  }
}
