// selectors/playlist.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PlaylistState } from '../reducers/playlist.reducer';

export const selectPlaylistState = createFeatureSelector<PlaylistState>('playlist');

export const selectPlaylist = createSelector(
  selectPlaylistState,
  (state: PlaylistState) => state.playlist
);
