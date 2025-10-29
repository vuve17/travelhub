"use client";

import { configureStore } from "@reduxjs/toolkit";
import countriesReducer from "./countires.slice";
import notificationReducer from "./notification.slice";

export const store = configureStore({
  reducer: {
    countriesReducer: countriesReducer,
    notificationReducer: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
