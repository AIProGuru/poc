import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { normalizeRole } from "../../utils/roles";

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

  const tenantValue = `${tenant || ""}`.toLowerCase();
  const tenantBases = new Set(["rebound", "pilotcustomer", "betacustomer", "demo"]);
  const pathBase = (location.pathname.split("/")[1] || "").toLowerCase();
  const enforceTenant = tenantBases.has(pathBase) && tenantBases.has(tenantValue);
  if (isAuth && enforceTenant && pathBase !== tenantValue) {
    return <Navigate to="/error-404" replace />;
  }

  return (isAuth && canAccess) ? <Component {...rest} /> : <Navigate to="/" replace />;
};

export default PrivateRoute;
