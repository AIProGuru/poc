import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  count: [],
  part1Count: [],
  part2Count: [],
  recovery: []
};

const countReducer = createSlice({
  name: "count",
  initialState,
  reducers: {
    setCount: (state, action) => {
      state.count = [...action.payload];
    },
    setPart1Count: (state, action) => {
      state.part1Count = [...action.payload]
    },
    setPart2Count: (state, action) => {
      state.part2Count = [...action.payload]
    },
    setRecovery: (state, action) => {
      state.recovery = [...action.payload]
    }
  },
});

export const { setCount, setPart1Count, setPart2Count, setRecovery } = countReducer.actions;

export default countReducer.reducer;
