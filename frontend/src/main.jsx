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

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Account>
          <ApiEndpointProvider>
            <App />
          </ApiEndpointProvider>
        </Account>
      </PersistGate>
    </Provider>
  </BrowserRouter>
)