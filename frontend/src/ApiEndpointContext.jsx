import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
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
  setRecoveryLoading,
  setTabIndex,
  setModels,
  setNavGrouped,
  setNavPendCounts,
  increaseLoading,
  decreaseLoading,
  setTableData,
} from './redux/reducers/app.reducer';

import {
  setTags,
  setAllPayers,
} from './redux/reducers/tag.reducer';

import { setCount, setRecovery } from './redux/reducers/count.reducer';
import { setCategoryLabel, setCategoryValue } from './redux/reducers/statistics.reducer';
import { buildAccessExtra } from './utils/accessFilters';

import { useDispatch, useSelector } from 'react-redux';

const ApiEndpointContext = createContext();
const LAST_APP_TYPE_KEY = 'lastAppType';

export const ApiEndpointProvider = ({ children }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const appType = useSelector((state) => state.app.type);
  const authReady = useSelector((state) => state.auth.authReady);
  const tenant = useSelector((state) => state.auth.tenant);
  const role = useSelector((state) => state.auth.role);
  const accessModules = useSelector((state) => state.auth.modules);
  const accessDenialCategory = useSelector((state) => state.auth.denialCategory);
  const accessPayer = useSelector((state) => state.auth.payer);
  const accessValue = useSelector((state) => state.auth.value);
  const access = useMemo(
    () => ({
      modules: accessModules,
      denialCategory: accessDenialCategory,
      payer: accessPayer,
      value: accessValue,
    }),
    [accessModules, accessDenialCategory, accessPayer, accessValue]
  );
  const accessExtra = useMemo(
    () => buildAccessExtra({}, access, role),
    [access, role]
  );
  const [apiUrl, setApiUrl] = useState('');
  const lastTenantRef = useRef('');

  useEffect(() => {
    const tenantValue = `${tenant || ""}`.toLowerCase();
    if (!authReady || !tenantValue) return;
    if (lastTenantRef.current && lastTenantRef.current !== tenantValue) {
      // Clear tenant-scoped data when switching tenants to avoid stale counts.
      dispatch(setTableData([]));
      dispatch(setTags([]));
      dispatch(setAllPayers([]));
      dispatch(setNavGrouped({}));
      dispatch(setNavPendCounts({}));
      dispatch(setCount([]));
      dispatch(setCategoryLabel([]));
      dispatch(setCategoryValue([]));
      dispatch(setRecovery([]));
      dispatch(setModels([]));
      dispatch(setTabIndex(0));
      setApiUrl('');
    }
    lastTenantRef.current = tenantValue;
  }, [authReady, tenant, dispatch]);

  useEffect(() => {
    const tenantValue = `${tenant || ""}`.toLowerCase();
    if (!authReady) {
      // Avoid selecting a tenant-specific API before auth is resolved.
      setApiUrl('');
      return;
    }
    if (tenantValue) {
      if (tenantValue === 'rebound') {
        setApiUrl(`${SERVER_URL}/api/v1/rebound`);
        dispatch(setType(0));
        try {
          localStorage.setItem(LAST_APP_TYPE_KEY, '0');
        } catch (err) {
          // Ignore storage write errors (private mode, etc.)
        }
        return;
      }
      if (tenantValue === 'pilotcustomer') {
        setApiUrl(`${SERVER_URL}/api/v1/pilotcustomer`);
        dispatch(setType(1));
        try {
          localStorage.setItem(LAST_APP_TYPE_KEY, '1');
        } catch (err) {
          // Ignore storage write errors (private mode, etc.)
        }
        return;
      }
      if (tenantValue === 'betacustomer') {
        setApiUrl(`${SERVER_URL}/api/v1/betacustomer`);
        dispatch(setType(3));
        try {
          localStorage.setItem(LAST_APP_TYPE_KEY, '3');
        } catch (err) {
          // Ignore storage write errors (private mode, etc.)
        }
        return;
      }
      if (tenantValue === 'demo') {
        setApiUrl(`${SERVER_URL}/api/v1/rebound`);
        dispatch(setType(2));
        try {
          localStorage.setItem(LAST_APP_TYPE_KEY, '2');
        } catch (err) {
          // Ignore storage write errors (private mode, etc.)
        }
        return;
      }
    }

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
    } else if (location.pathname.startsWith('/betacustomer')) {
      setApiUrl(`${SERVER_URL}/api/v1/betacustomer`)
      dispatch(setType(3))
      try {
        localStorage.setItem(LAST_APP_TYPE_KEY, '3');
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
      if (resolvedType !== 1 && resolvedType !== 2 && resolvedType !== 3) {
        try {
          const storedType = Number(localStorage.getItem(LAST_APP_TYPE_KEY));
          if (storedType === 1 || storedType === 2 || storedType === 3) {
            resolvedType = storedType;
            dispatch(setType(storedType));
          }
        } catch (err) {
          // Ignore storage read errors.
        }
      }
      if (resolvedType === 1) {
        setApiUrl(`${SERVER_URL}/api/v1/pilotcustomer`)
      } else if (resolvedType === 3) {
        setApiUrl(`${SERVER_URL}/api/v1/betacustomer`)
      } else {
        setApiUrl(`${SERVER_URL}/api/v1/rebound`)
      }
    }
  }, [location.pathname, appType, authReady, tenant, dispatch]);

  useEffect(() => {
    if (!apiUrl || !authReady) return;
    dispatch(setPart1Loading(true));
    dispatch(setPart2Loading(true));
    dispatch(setTableLoading(true));
    dispatch(setTagLoading(true));
    dispatch(setCountLoading(true));
    dispatch(setStatisticsLoading(true));
    dispatch(setPayerLoading(true));
    dispatch(setRecoveryLoading(true));
    dispatch(setTabIndex(0));

    const navBadgeTabIndexes = [6, 2, 1, 4];
    dispatch(increaseLoading());
    axios
      .post(`${apiUrl}/platform_bootstrap`, {
        tabIndexes: navBadgeTabIndexes,
        keyword: "",
        startDate: null,
        endDate: null,
        code: "",
        remark: "",
        procedure: "",
        pos: "",
        extra: accessExtra,
      })
      .then((res) => {
        const data = res?.data || {};
        dispatch(setTags(data.tags || []));
        dispatch(setAllPayers(data.payers || []));
        dispatch(setNavGrouped(data.grouped || {}));
        dispatch(setNavPendCounts(data.pendCounts || {}));

        const counts = data.counts || {};
        dispatch(
          setCount([
            { count: counts.cnt1, amount: counts.amount1 },
            { count: counts.cnt2, amount: counts.amount2 },
            { count: counts.cnt3, amount: counts.amount3 },
            { count: counts.cnt4, amount: counts.amount4 },
            { count: 0, amount: 0 },
            { count: counts.cnt6, amount: 0 },
            { count: counts.cnt7, amount: 0 },
          ])
        );

        const stats = data.statistics || [];
        dispatch(setCategoryLabel(stats.map((row) => row.label)));
        dispatch(setCategoryValue(stats.map((row) => row.value)));

        dispatch(setRecovery(data.recovery || []));

        const mapModels = (rows) =>
          (rows || []).map((row) => ({
            ...row,
            Group: (() => {
              switch (row.Category) {
                case 'Contractual Adj':
                  return 'Non-Recoverable';
                case 'Patient Resp':
                  return 'Patient Resp';
                case null:
                  return 'Delinquent';
                default:
                  return 'Recoverable';
              }
            })(),
          }));
        dispatch(setModels(mapModels(data.models || [])));

        dispatch(decreaseLoading());
        dispatch(setTagLoading(false));
        dispatch(setCountLoading(false));
        dispatch(setStatisticsLoading(false));
        dispatch(setPayerLoading(false));
        dispatch(setRecoveryLoading(false));
      })
      .catch(() => {
        dispatch(decreaseLoading());
        dispatch(setTagLoading(false));
        dispatch(setCountLoading(false));
        dispatch(setStatisticsLoading(false));
        dispatch(setPayerLoading(false));
        dispatch(setRecoveryLoading(false));
      });
  }, [apiUrl, accessExtra, authReady, dispatch])

  return (
    <ApiEndpointContext.Provider value={apiUrl}>
      {children}
    </ApiEndpointContext.Provider>
  );
};

export const useApiEndpoint = () => useContext(ApiEndpointContext);
