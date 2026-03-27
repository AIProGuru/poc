import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { SERVER_URL } from './utils/config';
import axios from 'axios';
import {
  setPart1Loading,
  setPart2Loading,
  setTableLoading,
  setType,
  setBootstrapLoading,
  setTagLoading,
  setCountLoading,
  setStatisticsLoading,
  setPayerLoading,
  setRecoveryLoading,
  setTabIndex,
  setModels,
  setNavGrouped,
  setNavPendCounts,
  setTableData,
  setExtraFilter,
  setCurrentPage,
  setKeyword,
  setStartDate,
  setEndDate,
  setCode,
  setRemark,
  setProcedure,
  setPOS,
} from './redux/reducers/app.reducer';

import {
  setTags,
  setAllPayers,
} from './redux/reducers/tag.reducer';
import { setSelectedTags } from './redux/reducers/tag.reducer';

import { setCount, setRecovery } from './redux/reducers/count.reducer';
import { setCategoryLabel, setCategoryValue } from './redux/reducers/statistics.reducer';
import { buildAccessExtra } from './utils/accessFilters';

import { useDispatch, useSelector } from 'react-redux';

const ApiEndpointContext = createContext();
const LAST_APP_TYPE_KEY = 'lastAppType';
const LAST_TENANT_BASE_KEY = 'lastTenantBase';

const readStoredTenantBase = () => {
  try {
    const value = localStorage.getItem(LAST_TENANT_BASE_KEY);
    return ['rebound', 'pilotcustomer', 'betacustomer', 'demo'].includes(value || '')
      ? value
      : '';
  } catch (err) {
    return '';
  }
};

const persistTenantBase = (base) => {
  try {
    localStorage.setItem(LAST_TENANT_BASE_KEY, base);
  } catch (err) {
    // Ignore storage write errors.
  }
};

const isTenantScopedAdminPath = (pathname = '') =>
  pathname.startsWith('/management') ||
  pathname.startsWith('/clientmanagement') ||
  pathname.startsWith('/client/') ||
  pathname.startsWith('/governance-management') ||
  pathname.startsWith('/appeal-templates') ||
  pathname.startsWith('/account-settings');

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
  const accessFacility = useSelector((state) => state.auth.facility);
  const access = useMemo(
    () => ({
      modules: accessModules,
      denialCategory: accessDenialCategory,
      payer: accessPayer,
      value: accessValue,
      facility: accessFacility,
    }),
    [accessModules, accessDenialCategory, accessPayer, accessValue, accessFacility]
  );
  const accessExtra = useMemo(
    () => buildAccessExtra({}, access, role),
    [access, role]
  );
  const [apiUrl, setApiUrl] = useState('');
  const lastTenantRef = useRef('');
  const didInitRef = useRef(false);
  const bootstrapRef = useRef({ key: '', id: 0 });

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
      bootstrapRef.current = { key: '', id: 0 };
    }
    lastTenantRef.current = tenantValue;
  }, [authReady, tenant, dispatch]);

  useEffect(() => {
    const tenantValue = `${tenant || ""}`.toLowerCase();
    const pathBase = (location.pathname.split('/')[1] || '').toLowerCase();
    const hasTenantRoute =
      pathBase === 'rebound' || pathBase === 'pilotcustomer' || pathBase === 'betacustomer' || pathBase === 'demo';
    const storedTenantBase = readStoredTenantBase();
    const hasTenantScopedAdminRoute = isTenantScopedAdminPath(location.pathname);
    if (!authReady) {
      // Avoid selecting a tenant-specific API before auth is resolved.
      setApiUrl('');
      dispatch(setBootstrapLoading(false));
      didInitRef.current = false;
      bootstrapRef.current = { key: '', id: 0 };
      return;
    }
    if (!tenantValue && !hasTenantRoute && !hasTenantScopedAdminRoute) {
      setApiUrl('');
      dispatch(setBootstrapLoading(false));
      didInitRef.current = false;
      bootstrapRef.current = { key: '', id: 0 };
      return;
    }
    const desiredBase =
      tenantValue === 'rebound' || tenantValue === 'pilotcustomer' || tenantValue === 'betacustomer' || tenantValue === 'demo'
        ? tenantValue
        : hasTenantRoute
          ? pathBase
          : '';

    if (desiredBase) {
      const desiredUrl =
        desiredBase === 'rebound' ? `${SERVER_URL}/api/v1/rebound`
          : desiredBase === 'pilotcustomer' ? `${SERVER_URL}/api/v1/pilotcustomer`
            : desiredBase === 'betacustomer' ? `${SERVER_URL}/api/v1/betacustomer`
              : `${SERVER_URL}/api/v1/rebound`;

      if (apiUrl !== desiredUrl) {
        setApiUrl(desiredUrl);
        dispatch(setType(desiredBase === 'rebound' ? 0 : desiredBase === 'pilotcustomer' ? 1 : desiredBase === 'betacustomer' ? 3 : 2));
        didInitRef.current = true;
        persistTenantBase(desiredBase);
        try {
          localStorage.setItem(LAST_APP_TYPE_KEY, String(desiredBase === 'rebound' ? 0 : desiredBase === 'pilotcustomer' ? 1 : desiredBase === 'betacustomer' ? 3 : 2));
        } catch (err) {
          // Ignore storage write errors (private mode, etc.)
        }
      }
      return;
    }
    if (tenantValue) {
      if (tenantValue === 'rebound') {
        setApiUrl(`${SERVER_URL}/api/v1/rebound`);
        dispatch(setType(0));
        didInitRef.current = true;
        persistTenantBase('rebound');
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
        didInitRef.current = true;
        persistTenantBase('pilotcustomer');
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
        didInitRef.current = true;
        persistTenantBase('betacustomer');
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
        didInitRef.current = true;
        persistTenantBase('demo');
        try {
          localStorage.setItem(LAST_APP_TYPE_KEY, '2');
        } catch (err) {
          // Ignore storage write errors (private mode, etc.)
        }
        return;
      }
    }

    if (didInitRef.current) {
      return;
    }

    if (location.pathname.startsWith('/rebound')) {
      setApiUrl(`${SERVER_URL}/api/v1/rebound`)
      dispatch(setType(0))
      didInitRef.current = true;
      persistTenantBase('rebound');
      try {
        localStorage.setItem(LAST_APP_TYPE_KEY, '0');
      } catch (err) {
        // Ignore storage write errors (private mode, etc.)
      }
    } else if (location.pathname.startsWith('/pilotcustomer')) {
      setApiUrl(`${SERVER_URL}/api/v1/pilotcustomer`)
      dispatch(setType(1))
      didInitRef.current = true;
      persistTenantBase('pilotcustomer');
      try {
        localStorage.setItem(LAST_APP_TYPE_KEY, '1');
      } catch (err) {
        // Ignore storage write errors (private mode, etc.)
      }
    } else if (location.pathname.startsWith('/betacustomer')) {
      setApiUrl(`${SERVER_URL}/api/v1/betacustomer`)
      dispatch(setType(3))
      didInitRef.current = true;
      persistTenantBase('betacustomer');
      try {
        localStorage.setItem(LAST_APP_TYPE_KEY, '3');
      } catch (err) {
        // Ignore storage write errors (private mode, etc.)
      }
    } else if(location.pathname.startsWith('/demo')) {
      // setApiUrl(`${SERVER_URL}/api/v1/demo`)
      setApiUrl(`${SERVER_URL}/api/v1/rebound`)
      dispatch(setType(2))
      didInitRef.current = true;
      persistTenantBase('demo');
      try {
        localStorage.setItem(LAST_APP_TYPE_KEY, '2');
      } catch (err) {
        // Ignore storage write errors (private mode, etc.)
      }
    } else if (hasTenantScopedAdminRoute) {
      if (storedTenantBase === 'pilotcustomer') {
        setApiUrl(`${SERVER_URL}/api/v1/pilotcustomer`)
        dispatch(setType(1));
        didInitRef.current = true;
        return;
      }
      if (storedTenantBase === 'betacustomer') {
        setApiUrl(`${SERVER_URL}/api/v1/betacustomer`)
        dispatch(setType(3));
        didInitRef.current = true;
        return;
      }
      if (storedTenantBase === 'demo') {
        setApiUrl(`${SERVER_URL}/api/v1/rebound`)
        dispatch(setType(2));
        didInitRef.current = true;
        return;
      }
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
        didInitRef.current = true;
      } else if (resolvedType === 3) {
        setApiUrl(`${SERVER_URL}/api/v1/betacustomer`)
        didInitRef.current = true;
      } else {
        setApiUrl(`${SERVER_URL}/api/v1/rebound`)
        didInitRef.current = true;
      }
    }
  }, [location.pathname, appType, authReady, tenant, dispatch]);

  useEffect(() => {
    if (!apiUrl || !authReady) return;
    // Reset filters/table state when switching tenants so data loads correctly.
    dispatch(setExtraFilter({ IncludeAllCategories: true }));
    dispatch(setSelectedTags([]));
    dispatch(setCurrentPage(1));
    dispatch(setKeyword(''));
    dispatch(setStartDate(null));
    dispatch(setEndDate(null));
    dispatch(setCode(''));
    dispatch(setRemark(''));
    dispatch(setProcedure(''));
    dispatch(setPOS(''));
    dispatch(setTabIndex(0));
    dispatch(setTableLoading(true));
    dispatch(setPart1Loading(true));
    dispatch(setPart2Loading(true));
  }, [apiUrl, authReady, dispatch]);

  useEffect(() => {
    if (!apiUrl || !authReady) return;
    const bootstrapKey = `${apiUrl}::${JSON.stringify(accessExtra || {})}`;
    if (bootstrapRef.current.key === bootstrapKey) {
      return;
    }
    bootstrapRef.current.key = bootstrapKey;
    const requestId = ++bootstrapRef.current.id;

    dispatch(setBootstrapLoading(true));
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
        if (bootstrapRef.current.id !== requestId || bootstrapRef.current.key !== bootstrapKey) {
          return;
        }
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

        dispatch(setTagLoading(false));
        dispatch(setCountLoading(false));
        dispatch(setStatisticsLoading(false));
        dispatch(setPayerLoading(false));
        dispatch(setRecoveryLoading(false));
        dispatch(setBootstrapLoading(false));
      })
      .catch(() => {
        if (bootstrapRef.current.id !== requestId || bootstrapRef.current.key !== bootstrapKey) {
          return;
        }
        dispatch(setTagLoading(false));
        dispatch(setCountLoading(false));
        dispatch(setStatisticsLoading(false));
        dispatch(setPayerLoading(false));
        dispatch(setRecoveryLoading(false));
        dispatch(setBootstrapLoading(false));
      });
  }, [apiUrl, accessExtra, authReady, dispatch])

  return (
    <ApiEndpointContext.Provider value={apiUrl}>
      {children}
    </ApiEndpointContext.Provider>
  );
};

export const useApiEndpoint = () => useContext(ApiEndpointContext);
