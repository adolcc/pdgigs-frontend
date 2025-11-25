import React from "react";
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children, role }) => {
  const { authToken, userRole } = useContext(AuthContext); // Consume los valores del contexto

  // Si no hay token, redirige al login
  if (!authToken) {
    return <Navigate to="/login" />;
  }

  // Si se requiere un rol específico y no coincide, redirige a una página de no autorizado
  if (role && role !== userRole) {
    return <Navigate to="/unauthorized" />;
  }

  // Si todo está correcto, renderiza el componente hijo
  return children;
};

export default PrivateRoute;