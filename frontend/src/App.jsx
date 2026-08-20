import { useRoutes } from "react-router-dom";
import { useEffect, useRef, useContext, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import routesConfig from "./routes";
import { MAINTAINING } from "./utils/config";
import {
  setAuth,
  setAuthReady,
  setUsername,
  setRole,
  setFirstname,
  setLastname,
  setPermission,
  setEmail,
  setTenant,
  setAppType,
  setModules,
  setDenialCategory,
  setPayer,
  setValue,
  setFacility,
} from "./redux/reducers/auth.reducer";
import { useApiEndpoint } from "./ApiEndpointContext";
import { AccountContext } from "./utils/Account";
import {
  increaseLoading,
  decreaseLoading,
  setTagLoading,
  setType,
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
  setTabIndex,
  setModels,
  setNavGrouped,
  setNavPendCounts,
  setLoading,
  setPart1Loading,
  setPart2Loading,
  setTableLoading,
  setCountLoading,
  setStatisticsLoading,
  setPayerLoading,
  setRecoveryLoading,
  resetViewState,
} from "./redux/reducers/app.reducer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import { app, auth } from "./FirebaseConfig";
import { setTags, setAllPayers, setSelectedTags } from "./redux/reducers/tag.reducer";
import { setCount, setPart1Count, setPart2Count, setRecovery } from "./redux/reducers/count.reducer";
import { setCategoryLabel, setCategoryValue } from "./redux/reducers/statistics.reducer";

import {
  PLATFORM_TENANTS,
  resolveAppType,
  resolvePlatformTenant,
} from "./utils/platformTenant";

const isPublicPath = (pathname = "") => {
  if (pathname === "/") return true;
  return [
    "/signin",
    "/signup",
    "/forgot-password",
    "/contact",
    "/privacy",
    "/verify_email",
    "/update_password",
    "/verify_error",
  ].some((path) => pathname === path || pathname.startsWith(`${path}/`));
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getSession } = useContext(AccountContext);
  useApiEndpoint();
  const dispatch = useDispatch();
  const routes = useRoutes(routesConfig);
  const isLoading = useSelector((state) => state.app.loading);
  const bootstrapLoading = useSelector((state) => state.app.bootstrapLoading);
  const getAuth = useSelector((state) => state.auth.isAuthenticated);
  const authReady = useSelector((state) => state.auth.authReady);
  const tenant = useSelector((state) => state.auth.tenant);
  const realtimeDb = useRef(getFirestore(app));
  const lastUidRef = useRef("");
  const lastTenantRef = useRef("");

  const resetAuthState = useCallback(() => {
    dispatch(setAuth(false));
    dispatch(setUsername(''));
    dispatch(setFirstname(''));
    dispatch(setLastname(''));
    dispatch(setEmail(''));
    dispatch(setRole(''));
    dispatch(setPermission(''));
    dispatch(setTenant(''));
    dispatch(setAppType(null));
    dispatch(setModules([]));
    dispatch(setDenialCategory([]));
    dispatch(setPayer([]));
    dispatch(setValue([]));
    dispatch(setFacility([]));
    lastUidRef.current = "";
    lastTenantRef.current = "";
  }, [dispatch]);

  const clearTenantState = useCallback(() => {
    dispatch(resetViewState());
    dispatch(setTableData([]));
    dispatch(setTags([]));
    dispatch(setAllPayers([]));
    dispatch(setSelectedTags([]));
    dispatch(setCount([]));
    dispatch(setPart1Count([]));
    dispatch(setPart2Count([]));
    dispatch(setRecovery([]));
    dispatch(setCategoryLabel([]));
    dispatch(setCategoryValue([]));
    dispatch(setModels([]));
    dispatch(setNavGrouped({}));
    dispatch(setNavPendCounts({}));
    dispatch(setExtraFilter({}));
    dispatch(setKeyword(''));
    dispatch(setCurrentPage(1));
    dispatch(setStartDate(null));
    dispatch(setEndDate(null));
    dispatch(setCode(''));
    dispatch(setRemark(''));
    dispatch(setProcedure(''));
    dispatch(setPOS(''));
  }, [dispatch]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!getAuth) return;
      // Extract the page_name from the URL
      const url = window.location.pathname;
      const parts = url.split('/').filter(Boolean); // Split by '/' and remove empty parts
      const pageName = parts.length > 1 ? `/${parts[0]}/${parts[1]}` : `/${parts[0]}`; // Join the first two parts if they exist

      // If the URL contains 'detail', extract only up to 'detail'
      const pageNameIndex = url.indexOf('detail');
      const finalPageName = pageNameIndex !== -1 ? url.substring(0, pageNameIndex + 'detail'.length) : pageName;
      if (finalPageName === '/undefined') {
        return;
      }

      console.log(finalPageName);

      // Call the backend endpoint
      // axios.post(`${SERVER_URL}/v2/pilotcustomer/analysis/update-view`, {
      //   page_name: finalPageName,
      // })
      //   .then(response => response.json())
      //   .then(data => {
      //     if (data.error) {
      //       console.error('Error:', data.error);
      //     } else {
      //       console.log('Success:', data);
      //     }
      //   })
      //   .catch((error) => {
      //     console.error('Error:', error);
      //   });
    }, 1000);

    return () => clearTimeout(timeoutId); // Cleanup timeout on component unmount
  }, [getAuth, location.pathname]);

  useEffect(() => {
    dispatch(increaseLoading())
    getSession()
      .then((session) => {
        if (!session?.userData) {
          resetAuthState();
          clearTenantState();
          return;
        }
        dispatch(setAuth(true));
        dispatch(setUsername(session.userData.firstname ?? ""))
        dispatch(setFirstname(session.userData.firstname ?? ""));
        dispatch(setLastname(session.userData.lastname ?? ""));
        dispatch(setEmail(session.userData.email ?? ""));
        dispatch(setRole(session.userData.role ?? ""))
        {
          const resolvedTenant = resolvePlatformTenant(session.userData);
          const resolvedType = resolveAppType(session.userData);
          dispatch(setTenant(resolvedTenant));
          dispatch(setAppType(resolvedType));
          dispatch(setType(resolvedType));
        }
        dispatch(setModules(session.userData.client ?? []))
        dispatch(setDenialCategory(session.userData.denialCategory ?? []))
        dispatch(setPayer(session.userData.payer ?? []))
        dispatch(setValue(session.userData.value ?? []))
        dispatch(setFacility(session.userData.facility ?? []))
        dispatch(setPermission(""))
      })
      .catch((err) => {
        console.error("Failed to restore auth session", err);
        resetAuthState();
        clearTenantState();
      })
      .finally(() => {
        dispatch(decreaseLoading());
        dispatch(setAuthReady(true));
      });
  }, []);

  useEffect(() => {
    let unsubscribeDoc = null;
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }
      if (!user) {
        resetAuthState();
        dispatch(setType(0));
        clearTenantState();
        return;
      }
      if (lastUidRef.current && lastUidRef.current !== user.uid) {
        clearTenantState();
        lastTenantRef.current = "";
        dispatch(setUsername(''));
        dispatch(setFirstname(''));
        dispatch(setLastname(''));
        dispatch(setEmail(''));
        dispatch(setRole(''));
        dispatch(setPermission(''));
        dispatch(setTenant(''));
        dispatch(setAppType(null));
        dispatch(setType(0));
        dispatch(setModules([]));
        dispatch(setDenialCategory([]));
        dispatch(setPayer([]));
        dispatch(setValue([]));
        dispatch(setFacility([]));
      }
      lastUidRef.current = user.uid;
      const docRef = doc(realtimeDb.current, "users", user.uid);
      unsubscribeDoc = onSnapshot(docRef, (snapshot) => {
        if (!snapshot.exists()) {
          // If the user profile is deleted, force sign-out immediately.
          auth.signOut().catch((error) => {
            console.error("Failed to sign out deleted user", error);
          });
          return;
        }
        const userData = snapshot.data() || {};
        const resolvedTenant = resolvePlatformTenant(userData);
        const resolvedType = resolveAppType(userData);
        if (lastTenantRef.current && lastTenantRef.current !== resolvedTenant) {
          clearTenantState();
        }
        lastTenantRef.current = resolvedTenant;
        dispatch(setFirstname(userData.firstname ?? ""));
        dispatch(setLastname(userData.lastname ?? ""));
        dispatch(setEmail(userData.email ?? ""));
        dispatch(setRole(userData.role ?? ""));
        dispatch(setTenant(resolvedTenant));
        dispatch(setAppType(resolvedType));
        dispatch(setType(resolvedType));
        dispatch(setModules(userData.client ?? []));
        dispatch(setDenialCategory(userData.denialCategory ?? []));
        dispatch(setPayer(userData.payer ?? []));
        dispatch(setValue(userData.value ?? []));
        dispatch(setFacility(userData.facility ?? []));
      });
    });

    return () => {
      if (unsubscribeDoc) {
        unsubscribeDoc();
      }
      unsubscribeAuth();
    };
  }, [clearTenantState, dispatch, resetAuthState]);

  useEffect(() => {
    if (!authReady) return;
    const tenantValue = `${tenant || ""}`.toLowerCase();
    if (!tenantValue || !PLATFORM_TENANTS.includes(tenantValue)) return;

    const path = location.pathname || "";
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return;

    const currentBase = parts[0];
    if (!PLATFORM_TENANTS.includes(currentBase)) return;

    if (currentBase !== tenantValue) {
      const rest = parts.slice(1).join('/');
      const target = rest ? `/${tenantValue}/${rest}` : `/${tenantValue}`;
      navigate(target, { replace: true });
    }
  }, [authReady, tenant, location.pathname, navigate]);

  const isMaintaining = MAINTAINING === "true";
  const publicPath = isPublicPath(location.pathname);
  const shouldShowLoader = !isMaintaining && !publicPath && (isLoading !== 0 || bootstrapLoading);
  const shouldShowRoutes = !isMaintaining && (publicPath || (isLoading === 0 && !bootstrapLoading));

  return (
    <div className="w-full h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      {isMaintaining && <div className="flex bg-indigo-400 w-full h-full">
        <div
          role="status"
          className="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2 text-white text-[48px]"
        >
          Maintaining now...Will come soon!
        </div>
      </div>}
      {shouldShowLoader && (
        <div className="flex w-full h-full items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
          <div className="relative flex items-center justify-center">
            <div className="h-24 w-24 rounded-full border-4 border-slate-700 border-t-orange-500 animate-spin" />
            <div className="absolute flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg shadow-slate-950/30">
              <img
                src="/favicon.png"
                alt="Helio RCM"
                className="max-h-[36px]"
              />
            </div>
          </div>
          <div
            role="status"
            className="sr-only"
          >
            Loading...
          </div>
        </div>
      )}
      {shouldShowRoutes && (
        <div className="flex flex-col h-full">
          <div className="flex-1">{routes}</div>
        </div>
      )}
    </div>
  );
}

export default App;
