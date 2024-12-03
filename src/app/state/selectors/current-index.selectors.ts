import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CurrentIndexState } from '../model/currentIndex.model';

export const selectCurrentIndexState = createFeatureSelector<CurrentIndexState>('currentIndex');

export const selectCurrentIndex = createSelector(
  selectCurrentIndexState,
  (state) => state.currentIndex
);
