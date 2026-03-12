import { createSlice } from "@reduxjs/toolkit";
import { ROLE_STANDARD } from "../../utils/roles";

const initialState = {
  isAuthenticated: true,
  authReady: false,
  username: '',
  firstname: '',
  lastname: '',
  email: '',
  role: ROLE_STANDARD,
  permission: '',
  tenant: '',
  appType: null,
  modules: [],
  denialCategory: [],
  payer: [],
  value: [],
  facility: [],
};

const authReducer = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.isAuthenticated = action.payload
    },
    setAuthReady: (state, action) => {
      state.authReady = action.payload
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
    setTenant: (state, action) => {
      state.tenant = action.payload ?? '';
    },
    setAppType: (state, action) => {
      state.appType = action.payload ?? null;
    },
    setModules: (state, action) => {
      state.modules = Array.isArray(action.payload) ? action.payload : [];
    },
    setDenialCategory: (state, action) => {
      state.denialCategory = Array.isArray(action.payload) ? action.payload : [];
    },
    setPayer: (state, action) => {
      state.payer = Array.isArray(action.payload) ? action.payload : [];
    },
    setValue: (state, action) => {
      state.value = Array.isArray(action.payload) ? action.payload : [];
    },
    setFacility: (state, action) => {
      state.facility = Array.isArray(action.payload) ? action.payload : [];
    },
  }
});

export const {
  setAuth,
  setAuthReady,
  setRole,
  setUsername,
  setEmail,
  setFirstname,
  setLastname,
  setPermission,
  setTenant,
  setAppType,
  setModules,
  setDenialCategory,
  setPayer,
  setValue,
  setFacility,
} = authReducer.actions;

export default authReducer.reducer;
