import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { normalizeRole } from "../../utils/roles";
import { PLATFORM_TENANTS, normalizePlatformTenant } from "../../utils/platformTenant";

const PrivateRoute = ({ role, element: Component, ...rest }) => {
  const myRole = useSelector((state) => state.auth.role);
  const tenant = useSelector((state) => state.auth.tenant);
  const location = useLocation();

  const isAuth = useSelector((state) => state.auth.isAuthenticated);
  const authReady = useSelector((state) => state.auth.authReady);

  if (!authReady) {
    return null;
  }

  const normalizedRole = normalizeRole(myRole);
  const canAccess = role.includes(myRole) || role.includes(normalizedRole);

  const tenantValue = normalizePlatformTenant(tenant);
  const pathBase = (location.pathname.split("/")[1] || "").toLowerCase();
  const enforceTenant = PLATFORM_TENANTS.includes(pathBase) && PLATFORM_TENANTS.includes(tenantValue);
  if (isAuth && enforceTenant && pathBase !== tenantValue) {
    const restPath = location.pathname.split("/").filter(Boolean).slice(1).join("/");
    const target = restPath ? `/${tenantValue}/${restPath}` : `/${tenantValue}`;
    return <Navigate to={target} replace />;
  }

  return isAuth && canAccess ? <Component {...rest} /> : <Navigate to="/signin" replace />;
};

export default PrivateRoute;
