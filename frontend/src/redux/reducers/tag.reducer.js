import { createSlice } from "@reduxjs/toolkit";
import { setTabDefaults } from "./app.reducer";

const initialState = {
  allTags: [],
  selectedTags: [],
  allPayers: [],
};

const tagsReducer = createSlice({
  name: "tags",
  initialState,
  reducers: {
    setTags: (state, action) => {
      state.allTags = [...action.payload];
    },
    setSelectedTags: (state, action) => {
      state.selectedTags = [...action.payload];
    },
    setAllPayers: (state, action) => {
      state.allPayers = [...action.payload]
    }
  },
  extraReducers: (builder) => {
    builder.addCase(setTabDefaults, (state, action) => {
      const nextTags = action.payload?.selectedTags ?? [];
      state.selectedTags = [...nextTags];
    });
  }
});

export const { setTags, setSelectedTags, setAllPayers } = tagsReducer.actions;

export default tagsReducer.reducer;
