// redux/cameraSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CaptureState {
  capturedImage: string;
  label: string;
}

const initialState: CaptureState[] = []

const cameraSlice = createSlice({
  name: 'camera',
  initialState,
  reducers: {
    setCapturedImage: (state: CaptureState[], action: PayloadAction<CaptureState>) => {
      state.push(action.payload);
    },
    clearCapturedImage: (state: CaptureState[]) => {
      state.length = 0;
    },
    removeCapturedImageAt: (state: CaptureState[], action: PayloadAction<number>) => {
      state.splice(action.payload, 1);
    }
  },
});

export const { setCapturedImage, clearCapturedImage, removeCapturedImageAt } = cameraSlice.actions;
export const cameraReducer = cameraSlice.reducer;