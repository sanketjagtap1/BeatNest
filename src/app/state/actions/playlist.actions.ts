import { createAction, props } from "@ngrx/store";

export const setPlaylist = createAction(
  '[Music] Set Playlist',
  props<{ playlist: any }>()
);