import React, { createContext, useState, useEffect } from "react";

// Crea el contexto
export const AuthContext = createContext();

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  // Estados para el token de sesión (JWT), rol y email del usuario
  const [authToken, setAuthToken] = useState(localStorage.getItem("jwt") || "");
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || "");
  const [userEmail, setUserEmail] = useState(localStorage.getItem("userEmail") || ""); // ✅ Nuevo

  // Sincroniza con localStorage cuando cambian authToken, userRole o userEmail
  useEffect(() => {
    console.log("authToken cambió a:", authToken);
    console.log("userRole cambió a:", userRole);
    console.log("userEmail cambió a:", userEmail); // ✅ Nuevo

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

    if (userEmail) { // ✅ Nuevo
      localStorage.setItem("userEmail", userEmail);
    } else {
      localStorage.removeItem("userEmail");
    }
  }, [authToken, userRole, userEmail]); // ✅ Actualizado

  return (
    <AuthContext.Provider value={{ 
      authToken, setAuthToken, 
      userRole, setUserRole,
      userEmail, setUserEmail // ✅ Nuevo
    }}>
      {children}
    </AuthContext.Provider>
  );
};