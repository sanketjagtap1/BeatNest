import { createReducer, on } from '@ngrx/store';
import { setCurrentIndex, setNextIndex, setPreviousIndex } from '../actions/current-index.actions';
import { initialCurrentIndexState } from '../state/currentIndex.state';

export interface CurrentIndexState {
  currentIndex: number | null; // The current song index
}

export const currentIndexReducer = createReducer(
  initialCurrentIndexState,
  on(setCurrentIndex, (state, {currentIndex}) => ({
    ...state,
    currentIndex: currentIndex,
  })),
  on(setNextIndex, (state) => ({
    ...state,
    currentIndex: state.currentIndex !== null ? state.currentIndex + 1 : 0,
  })),
  on(setPreviousIndex, (state) => ({
    ...state,
    currentIndex: state.currentIndex !== null && state.currentIndex > 0 ? state.currentIndex - 1 : 0,
  }))
);
