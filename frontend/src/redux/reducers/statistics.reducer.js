import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  categoryLabel: [],
  categoryValue: [],
};

const statisticsReducer = createSlice({
  name: "app",
  initialState,
  reducers: {
    setCategoryLabel: (state, action) => {
      state.categoryLabel = action.payload;
    },

    setCategoryValue: (state, action) => {
      state.categoryValue = action.payload
    }
  },
});

export const { setCategoryLabel, setCategoryValue } = statisticsReducer.actions;

export default statisticsReducer.reducer;
