import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import userReducer from "./services/Slices/userSlice";
import { authSlice } from "./services/apiSlices/authSlice";
import { courseSlice } from "./services/apiSlices/courseSlice";
import { teacherSlice } from "./services/apiSlices/teacherSlice";
import { studentSlice } from "./services/apiSlices/studentSlice";
import { notificationSlice } from "./services/apiSlices/notificationSlice";
import { chatSlice } from "./services/apiSlices/chatSlice";
import { quizSlice } from "./services/apiSlices/quizSlice";
import { certificateSlice } from "./services/apiSlices/certificateSlice";
import { vidLibrarySlice } from "./services/apiSlices/vidLibrarySlice";
import { surveySlice } from "./services/apiSlices/surveySlice";

const rootReducer = combineReducers({
  user: userReducer,
  [authSlice.reducerPath]: authSlice.reducer,
  [courseSlice.reducerPath]: courseSlice.reducer,
  [teacherSlice.reducerPath]: teacherSlice.reducer,
  [studentSlice.reducerPath]: studentSlice.reducer,
  [notificationSlice.reducerPath]: notificationSlice.reducer,
  [chatSlice.reducerPath]: chatSlice.reducer,
  [quizSlice.reducerPath]: quizSlice.reducer,
  [certificateSlice.reducerPath]: certificateSlice.reducer,
  [vidLibrarySlice.reducerPath]: vidLibrarySlice.reducer,
  [surveySlice.reducerPath]: surveySlice.reducer,
});

const persistConfig = {
  key: "iteach_ifuntology",
  storage,
  blacklist: [
    authSlice.reducerPath,
    courseSlice.reducerPath,
    teacherSlice.reducerPath,
    studentSlice.reducerPath,
    notificationSlice.reducerPath,
    chatSlice.reducerPath,
    quizSlice.reducerPath,
    certificateSlice.reducerPath,
    vidLibrarySlice.reducerPath,
    surveySlice.reducerPath,
  ],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware: any) =>
    getDefaultMiddleware({ serializableCheck: false })
      .concat(authSlice.middleware)
      .concat(courseSlice.middleware)
      .concat(teacherSlice.middleware)
      .concat(studentSlice.middleware)
      .concat(notificationSlice.middleware)
      .concat(chatSlice.middleware)
      .concat(quizSlice.middleware)
      .concat(certificateSlice.middleware)
      .concat(vidLibrarySlice.middleware)
      .concat(surveySlice.middleware),
});

setupListeners(store.dispatch);
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
