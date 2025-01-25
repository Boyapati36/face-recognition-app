import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { LabeledFaceDescriptors } from 'face-api.js';

interface FaceRecognitionState {
  labeledDescriptors: LabeledFaceDescriptors[];
}

const initialState: FaceRecognitionState = {
  labeledDescriptors: []
};

const FaceRecognitionSlice = createSlice({
  name: 'faceRecognition',
  initialState,
  reducers: {
    setLabeledDescriptors: (state, action: PayloadAction<LabeledFaceDescriptors[]>) => {
      state.labeledDescriptors = [...state.labeledDescriptors, ...action.payload];
    },
  }
});

export const { setLabeledDescriptors } = FaceRecognitionSlice.actions;
export const FaceRecognitionReducer = FaceRecognitionSlice.reducer;
