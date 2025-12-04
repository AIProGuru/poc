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
  increaseLoading,
  decreaseLoading,
} from './redux/reducers/app.reducer';

import {
  setTags,
  setSelectedTags,
} from './redux/reducers/tag.reducer';

import { useDispatch } from 'react-redux';

const ApiEndpointContext = createContext();

export const ApiEndpointProvider = ({ children }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    if (location.pathname.startsWith('/rebound')) {
      setApiUrl(`${SERVER_URL}/api/v1/rebound`)
      dispatch(setType(0))
    } else if (location.pathname.startsWith('/medevolve')) {
      setApiUrl(`${SERVER_URL}/api/v1/medevolve`)
      dispatch(setType(1))
    } else if(location.pathname.startsWith('/demo')) {
      // setApiUrl(`${SERVER_URL}/api/v1/demo`)
      setApiUrl(`${SERVER_URL}/api/v1/rebound`)
      dispatch(setType(2))
    }
  }, [location.pathname]);

  useEffect(() => {
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
      dispatch(setSelectedTags(res.data.filter(row => row !== 'Contractual Adj' && row !== 'Patient Resp' && row !== '')));
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
