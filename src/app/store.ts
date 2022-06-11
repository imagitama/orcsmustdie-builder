import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { save, load } from "redux-localstorage-simple";
import builderReducer from "../features/builder/builderSlice";

const getPreloadedState = () => {
  const params = new URLSearchParams(window.location.search);
  const paramState = params.get("state");

  if (typeof paramState === "string") {
    const json = paramState;
    const result = JSON.parse(json);
    return result;
  } else {
    return load();
  }
};

export const store = configureStore({
  reducer: {
    builder: builderReducer,
  },
  middleware: [save()],
  preloadedState: getPreloadedState(),
});

export const getUrlFriendlyState = () => {
  const state = store.getState();
  const json = JSON.stringify(state);
  const urlFriendly = encodeURIComponent(json);
  return urlFriendly;
};

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
