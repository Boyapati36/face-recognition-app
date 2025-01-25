import { createSlice } from '@reduxjs/toolkit';

interface VideoAndDetect {
    isVideoEnabled: boolean,
    detect: boolean
}

const initialState: VideoAndDetect = {
    isVideoEnabled: false,
    detect: false
};

const VideoAndDetectSlice = createSlice({
  name: 'videoAndDetect',
  initialState,
  reducers: {
    toggleDetect: (state) => {
      state.detect = !state.detect
    },
    toggleVideo: (state) => {
      if(state.isVideoEnabled){
        state.detect = false
      }
      state.isVideoEnabled = !state.isVideoEnabled
    }
  }
});

export const { toggleDetect, toggleVideo } = VideoAndDetectSlice.actions;
export const VideoAndDetectReducer = VideoAndDetectSlice.reducer;
