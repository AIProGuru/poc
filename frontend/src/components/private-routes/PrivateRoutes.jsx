import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router";
import { normalizeRole } from "../../utils/roles";

const PrivateRoute = ({ role, element: Component, ...rest }) => {
  const myRole = useSelector(state => state.auth.role);

  const isAuth = useSelector(state => state.auth.isAuthenticated);
  const authReady = useSelector(state => state.auth.authReady);

  if (!authReady) {
    return null;
  }

  const normalizedRole = normalizeRole(myRole);
  const canAccess = role.includes(myRole) || role.includes(normalizedRole);

  return (isAuth && canAccess) ? <Component {...rest} /> : <Navigate to="/" />;
};

export default PrivateRoute;
