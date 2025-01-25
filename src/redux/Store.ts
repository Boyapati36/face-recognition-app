import { configureStore } from '@reduxjs/toolkit';
import { cameraReducer } from './CameraSlice';
import { FaceRecognitionReducer } from './FaceRecognitionSlice';
import { VideoAndDetectReducer } from './VideoAndDetectSlice';

export const Store = configureStore({
  reducer: {
    camera: cameraReducer,
    FaceRecognition: FaceRecognitionReducer,
    VideoAndDetect: VideoAndDetectReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false
  })
});

export type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;
