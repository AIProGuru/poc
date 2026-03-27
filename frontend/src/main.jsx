import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import './index.css'
import { store, persistor } from "./redux/store";
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx'
import { Account } from './utils/Account';
import { ApiEndpointProvider } from './ApiEndpointContext';

const bootFallback = (
  <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
    <div className="flex items-center gap-3 text-sm font-medium">
      <div className="h-3 w-3 rounded-full bg-orange-500 animate-pulse" />
      <span>Loading Helio RCM...</span>
    </div>
  </div>
);

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Provider store={store}>
      <PersistGate loading={bootFallback} persistor={persistor}>
        <Account>
          <ApiEndpointProvider>
            <App />
          </ApiEndpointProvider>
        </Account>
      </PersistGate>
    </Provider>
  </BrowserRouter>
)
