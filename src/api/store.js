import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import jobsReducer from "./slices/jobsSlice";
import usersReducer from "./slices/usersSlice";
import adminReducer from "./slices/adminSlice";
import uiReducer from "./slices/uiSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobsReducer,
    users: usersReducer,
    admin: adminReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
