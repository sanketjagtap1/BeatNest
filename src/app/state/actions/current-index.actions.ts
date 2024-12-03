import { createAction, props } from "@ngrx/store";

export const setCurrentIndex = createAction(
    '[CurrentIndex] Set Current Index',
    props<{ currentIndex: number }>() // Correctly define the payload type
  );

export const setNextIndex = createAction('[CurrentIndex] Set Next Index');
export const setPreviousIndex = createAction('[CurrentIndex] Set Previous Index');