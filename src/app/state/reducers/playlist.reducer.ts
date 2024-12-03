// reducers/playlist.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { setPlaylist } from '../actions/playlist.actions';

export interface PlaylistState {
  playlist: any;
}

export const initialState: PlaylistState = {
  playlist: []
};

const _playlistReducer = createReducer(
  initialState,
  on(setPlaylist, (state, { playlist }) => ({ ...state, playlist }))
);

export function playlistReducer(state: PlaylistState | undefined, action: any) {
  return _playlistReducer(state, action);
}
