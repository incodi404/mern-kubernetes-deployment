import { configureStore } from "@reduxjs/toolkit";
import adminReducer from "./slices/admin.slice"
import userReducer from "./slices/user.slice"

export const store = configureStore({
    reducer: {
        admin: adminReducer,
        user: userReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;