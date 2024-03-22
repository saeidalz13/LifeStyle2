import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user/userSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

// getState is the function and we're getting the type of the return value
export type RootState = ReturnType<typeof store.getState>;

// type of the dispatch func
export type AppDispatch = typeof store.dispatch;
