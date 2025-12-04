import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: true,
  username: '',
  firstname: '',
  lastname: '',
  email: '',
  role: 'admin',
  permission: '',
};

const authReducer = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.isAuthenticated = action.payload
    },
    setUsername: (state, action) => {
      state.username = action.payload
    },
    setEmail: (state, action) => {
      state.email = action.payload
    },
    setRole: (state, action) => {
      state.role = action.payload
    },
    setFirstname: (state, action) => {
      state.firstname = action.payload
    },
    setLastname: (state, action) => {
      state.lastname = action.payload
    },
    setPermission: (state, action) => {
      state.permission = action.payload
    },
  }
});

export const {
  setAuth,
  setRole,
  setUsername,
  setEmail,
  setFirstname,
  setLastname,
  setPermission,
} = authReducer.actions;

export default authReducer.reducer;
