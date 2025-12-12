import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";


const PrivateRoute = ({ children, role }) => {
  const { isAuthenticated, authToken, userRole } = useContext(AuthContext);
  const location = useLocation();

  if (!isAuthenticated && !authToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!allowed.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default PrivateRoute;