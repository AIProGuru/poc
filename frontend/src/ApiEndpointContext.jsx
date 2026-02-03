import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SERVER_URL } from './utils/config';
import axios from 'axios';
import {
  setPart1Loading,
  setPart2Loading,
  setTableLoading,
  setType,
  setTagLoading,
  setCountLoading,
  setStatisticsLoading,
  setPayerLoading,
  setTabIndex,
  setExtraFilter,
  increaseLoading,
  decreaseLoading,
} from './redux/reducers/app.reducer';

import {
  setTags,
  setSelectedTags,
} from './redux/reducers/tag.reducer';

import { useDispatch, useSelector } from 'react-redux';

const ApiEndpointContext = createContext();
const LAST_APP_TYPE_KEY = 'lastAppType';

export const ApiEndpointProvider = ({ children }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const appType = useSelector((state) => state.app.type);
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    if (location.pathname.startsWith('/rebound')) {
      setApiUrl(`${SERVER_URL}/api/v1/rebound`)
      dispatch(setType(0))
      try {
        localStorage.setItem(LAST_APP_TYPE_KEY, '0');
      } catch (err) {
        // Ignore storage write errors (private mode, etc.)
      }
    } else if (location.pathname.startsWith('/pilotcustomer')) {
      setApiUrl(`${SERVER_URL}/api/v1/pilotcustomer`)
      dispatch(setType(1))
      try {
        localStorage.setItem(LAST_APP_TYPE_KEY, '1');
      } catch (err) {
        // Ignore storage write errors (private mode, etc.)
      }
    } else if(location.pathname.startsWith('/demo')) {
      // setApiUrl(`${SERVER_URL}/api/v1/demo`)
      setApiUrl(`${SERVER_URL}/api/v1/rebound`)
      dispatch(setType(2))
      try {
        localStorage.setItem(LAST_APP_TYPE_KEY, '2');
      } catch (err) {
        // Ignore storage write errors (private mode, etc.)
      }
    } else if (location.pathname.startsWith('/management')) {
      let resolvedType = appType;
      if (resolvedType !== 1 && resolvedType !== 2) {
        try {
          const storedType = Number(localStorage.getItem(LAST_APP_TYPE_KEY));
          if (storedType === 1 || storedType === 2) {
            resolvedType = storedType;
            dispatch(setType(storedType));
          }
        } catch (err) {
          // Ignore storage read errors.
        }
      }
      if (resolvedType === 1) {
        setApiUrl(`${SERVER_URL}/api/v1/pilotcustomer`)
      } else {
        setApiUrl(`${SERVER_URL}/api/v1/rebound`)
      }
    }
  }, [location.pathname, appType, dispatch]);

  useEffect(() => {
    if (!apiUrl) return;
    dispatch(setPart1Loading(true))
    dispatch(setPart2Loading(true))
    dispatch(setTableLoading(true))
    dispatch(setCountLoading(true))
    dispatch(setStatisticsLoading(true))
    dispatch(setPayerLoading(true))
    dispatch(setTabIndex(0));


    dispatch(increaseLoading())
    axios.get(`${apiUrl}/get_all_tags`).then((res) => {
      dispatch(setTags(res.data));
      // Default to showing all categories on initial load.
      dispatch(setSelectedTags([]));
      dispatch(setExtraFilter({ IncludeAllCategories: true }));
      dispatch(decreaseLoading())
      dispatch(setTagLoading(false));
    }).catch(err => {
      dispatch(decreaseLoading())
      dispatch(setTagLoading(false));
    });
  }, [apiUrl])

  return (
    <ApiEndpointContext.Provider value={apiUrl}>
      {children}
    </ApiEndpointContext.Provider>
  );
};

export const useApiEndpoint = () => useContext(ApiEndpointContext);
