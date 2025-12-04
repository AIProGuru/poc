import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  showSampleQuestion: true,
  messages: [],
  generating: false,
  showGPT: false,
};

const gptReducer = createSlice({
  name: "app",
  initialState,
  reducers: {
    setShowSampleQuestion: (state, action) => {
      state.showSampleQuestion = action.payload
    },
    setMessages: (state, action) => {
      state.messages = action.payload
    },
    setGenerating: (state, action) => {
      state.generating = action.payload
    },
    setShowGPT: (state, action) => {
      state.showGPT = action.payload
    },
  },
});

export const {
  setShowSampleQuestion,
  setMessages,
  setGenerating,
  setShowGPT,
} = gptReducer.actions;

export default gptReducer.reducer;
