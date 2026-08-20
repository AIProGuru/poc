import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { SERVER_URL } from './utils/config';
import axios from 'axios';
import {
  PLATFORM_TENANTS,
  LAST_TENANT_BASE_KEY,
  normalizePlatformTenant,
  persistPlatformTenant,
} from './utils/platformTenant';
import {
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
  setArByCategory,
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

const readStoredTenantBase = () => {
  try {
    const value = localStorage.getItem(LAST_TENANT_BASE_KEY);
    return PLATFORM_TENANTS.includes(value || '') ? value : '';
  } catch (err) {
    return '';
  }
};

const isPublicPath = (pathname = '') => {
  if (pathname === '/' || pathname === '') return true;
  return [
    '/signin',
    '/signup',
    '/forgot-password',
    '/contact',
    '/privacy',
    '/verify_email',
    '/update_password',
    '/verify_error',
  ].some((path) => pathname === path || pathname.startsWith(`${path}/`));
};

const isTenantScopedAdminPath = (pathname = '') =>
  pathname.startsWith('/management') ||
  pathname.startsWith('/clientmanagement') ||
  pathname.startsWith('/client/') ||
  pathname.startsWith('/governance-management') ||
  pathname.startsWith('/appeal-templates') ||
  pathname.startsWith('/account-settings');

const tenantToApiUrl = (base) => {
  if (base === 'betacustomer') return `${SERVER_URL}/api/v1/betacustomer`;
  if (base === 'pilotcustomer') return `${SERVER_URL}/api/v1/pilotcustomer`;
  if (base === 'rebound' || base === 'demo') return `${SERVER_URL}/api/v1/rebound`;
  return '';
};

const tenantToAppType = (base) => {
  if (base === 'rebound') return 0;
  if (base === 'pilotcustomer') return 1;
  if (base === 'demo') return 2;
  if (base === 'betacustomer') return 3;
  return null;
};

export const ApiEndpointProvider = ({ children }) => {
  const location = useLocation();
  const dispatch = useDispatch();
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
    const tenantValue = normalizePlatformTenant(tenant);
    if (!authReady) return;
    if (lastTenantRef.current && tenantValue && lastTenantRef.current !== tenantValue) {
      // Clear tenant-scoped data when switching tenants to avoid stale counts.
      dispatch(setTableData([]));
      dispatch(setTags([]));
      dispatch(setAllPayers([]));
      dispatch(setNavGrouped({}));
      dispatch(setNavPendCounts({}));
      dispatch(setArByCategory([]));
      dispatch(setCount([]));
      dispatch(setCategoryLabel([]));
      dispatch(setCategoryValue([]));
      dispatch(setRecovery([]));
      dispatch(setModels([]));
      dispatch(setTabIndex(0));
      setApiUrl('');
      bootstrapRef.current = { key: '', id: 0 };
    }
    if (tenantValue) {
      lastTenantRef.current = tenantValue;
    }
  }, [authReady, tenant, dispatch]);

  useEffect(() => {
    const tenantValue = normalizePlatformTenant(tenant);
    const pathBase = (location.pathname.split('/')[1] || '').toLowerCase();
    const hasTenantRoute = PLATFORM_TENANTS.includes(pathBase);
    const storedTenantBase = readStoredTenantBase();
    const hasTenantScopedAdminRoute = isTenantScopedAdminPath(location.pathname);

    if (!authReady || isPublicPath(location.pathname)) {
      // Avoid selecting a tenant-specific API before auth is resolved / on public pages.
      setApiUrl('');
      dispatch(setBootstrapLoading(false));
      didInitRef.current = false;
      bootstrapRef.current = { key: '', id: 0 };
      return;
    }

    // Wait until the URL matches the authenticated tenant before bootstrapping.
    // This prevents empty first paints when login lands on the wrong path briefly.
    if (hasTenantRoute && tenantValue && pathBase !== tenantValue) {
      setApiUrl('');
      dispatch(setBootstrapLoading(true));
      return;
    }

    if (!tenantValue && !hasTenantRoute && !hasTenantScopedAdminRoute) {
      setApiUrl('');
      dispatch(setBootstrapLoading(false));
      didInitRef.current = false;
      bootstrapRef.current = { key: '', id: 0 };
      return;
    }

    const desiredBase = tenantValue
      || (hasTenantRoute ? pathBase : '')
      || (hasTenantScopedAdminRoute ? storedTenantBase : '');

    if (!desiredBase) {
      return;
    }

    const desiredUrl = tenantToApiUrl(desiredBase);
    const desiredType = tenantToAppType(desiredBase);
    if (!desiredUrl) return;

    if (apiUrl !== desiredUrl) {
      setApiUrl(desiredUrl);
      if (desiredType !== null) {
        dispatch(setType(desiredType));
      }
      didInitRef.current = true;
      persistPlatformTenant(desiredBase);
    }
  }, [location.pathname, authReady, tenant, apiUrl, dispatch]);

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
        dispatch(setArByCategory(data.arByCategory || []));

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
