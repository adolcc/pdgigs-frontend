import React, { createContext, useState, useEffect } from "react";

// Crea el contexto
export const AuthContext = createContext();

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  // Estados para el token de sesión (JWT) y el rol del usuario
  const [authToken, setAuthToken] = useState(localStorage.getItem("jwt") || "");
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || "");

  // Sincroniza con localStorage cuando cambian authToken o userRole
  useEffect(() => {
    console.log("authToken cambió a:", authToken); // Depura cambios de authToken
    console.log("userRole cambió a:", userRole);   // Depura cambios de userRole

    if (authToken) {
      localStorage.setItem("jwt", authToken);
    } else {
      localStorage.removeItem("jwt");
    }

    if (userRole) {
      localStorage.setItem("userRole", userRole);
    } else {
      localStorage.removeItem("userRole");
    }
  }, [authToken, userRole]);

  return (
    <AuthContext.Provider value={{ authToken, setAuthToken, userRole, setUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};