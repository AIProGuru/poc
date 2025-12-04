import { configureStore } from "@reduxjs/toolkit";
import { createBrowserHistory } from "history";
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from "./reducers/auth.reducer";
import menuReducer from "./reducers/menu.reducer";
import tagsReducer from "./reducers/tag.reducer";
import appReducer from "./reducers/app.reducer";
import countReducer from "./reducers/count.reducer";
import statisticsReducer from "./reducers/statistics.reducer";
import gptReducer from './reducers/gpt.reducer';

export const history = createBrowserHistory();

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['app'] // Only persist app reducer which contains theme
};

// Create persisted app reducer
const persistedAppReducer = persistReducer(persistConfig, appReducer);

// combineReducers will be handled internally by configureStore
const rootReducer = (history) => ({
  app: persistedAppReducer,
  auth: authReducer,
  menu: menuReducer,
  tags: tagsReducer,
  count: countReducer,
  statistics: statisticsReducer,
  gpt: gptReducer,
});

const preloadedState = {};

export const store = configureStore({
  reducer: rootReducer(history),
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    })
});

export const persistor = persistStore(store);