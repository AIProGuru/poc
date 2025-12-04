import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router";

const PrivateRoute = ({ role, element: Component, ...rest }) => {
  const myRole = useSelector(state => state.auth.role);

  const isAuth = useSelector(state => state.auth.isAuthenticated);

  return (isAuth && role.indexOf(myRole) !== -1) ? <Component {...rest} /> : <Navigate to="/" />;
};

export default PrivateRoute;