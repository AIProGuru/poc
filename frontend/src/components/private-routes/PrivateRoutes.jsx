import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { normalizeRole } from "../../utils/roles";
import {
  PLATFORM_TENANTS,
  resolvePlatformTenantFromHint,
} from "../../utils/platformTenant";

const PrivateRoute = ({ role, element: Component, ...rest }) => {
  const myRole = useSelector(state => state.auth.role);
  const tenant = useSelector(state => state.auth.tenant);
  const location = useLocation();

  const isAuth = useSelector(state => state.auth.isAuthenticated);
  const authReady = useSelector(state => state.auth.authReady);

  if (!authReady) {
    return null;
  }

  const normalizedRole = normalizeRole(myRole);
  const canAccess = role.includes(myRole) || role.includes(normalizedRole);

  const tenantValue = resolvePlatformTenantFromHint(tenant, { defaultTenant: "" });
  const pathBase = (location.pathname.split("/")[1] || "").toLowerCase();
  const enforceTenant = PLATFORM_TENANTS.includes(pathBase) && PLATFORM_TENANTS.includes(tenantValue);
  if (isAuth && enforceTenant && pathBase !== tenantValue) {
    return <Navigate to="/error-404" replace />;
  }

  return (isAuth && canAccess) ? <Component {...rest} /> : <Navigate to="/signin" replace />;
};

export default PrivateRoute;
