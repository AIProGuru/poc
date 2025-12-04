import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  menuState: true,
};

const menuReducer = createSlice({
  name: "menu",
  initialState,
  reducers: {
    setToggleMenu: (state, action) => {
      state.menuState = action.payload
    },
  }
});

export const {
  setToggleMenu
} = menuReducer.actions;

export default menuReducer.reducer;
