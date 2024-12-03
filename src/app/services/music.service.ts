import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { setPlaylist } from '../state/actions/playlist.actions';

@Injectable({
  providedIn: 'root'
})
export class MusicService {

  constructor(public http: HttpClient, private store: Store) { }

  getSongs(query: string) {
    this.getTrendingSongs(query).subscribe(res => {
      
      console.log(res.data.results)
      res.data.results.map((item: any)=>{
        item.primaryArtists = item.primaryArtists.split(',')[0]
        
      })
      this.store.dispatch(setPlaylist({ playlist: res.data.results }));
    });
  }

   getTrendingSongs(filter:any):Observable<any>{
    return this.http.get(`https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${filter}&limit=40`);
  }

}
