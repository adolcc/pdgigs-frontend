import React, { createContext, useState, useEffect, useCallback } from "react";

export const AuthContext = createContext({
  authToken: null,
  userRole: null,
  userEmail: null,
  isAuthenticated: false,
  setAuthToken: () => {},
  setUserRole: () => {},
  setUserEmail: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthTokenState] = useState(null);
  const [userRole, setUserRoleState] = useState(null);
  const [userEmail, setUserEmailState] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const role = localStorage.getItem("userRole");
    const email = localStorage.getItem("userEmail");
    if (token) setAuthTokenState(token);
    if (role) setUserRoleState(role);
    if (email) setUserEmailState(email);
  }, []);

  const setAuthToken = useCallback((token) => {
    if (token) {
      localStorage.setItem("jwt", token);
      setAuthTokenState(token);
    } else {
      localStorage.removeItem("jwt");
      setAuthTokenState(null);
    }
  }, []);

  const setUserRole = useCallback((role) => {
    if (role) {
      localStorage.setItem("userRole", role);
      setUserRoleState(role);
    } else {
      localStorage.removeItem("userRole");
      setUserRoleState(null);
    }
  }, []);

  const setUserEmail = useCallback((email) => {
    if (email) {
      localStorage.setItem("userEmail", email);
      setUserEmailState(email);
    } else {
      localStorage.removeItem("userEmail");
      setUserEmailState(null);
    }
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUserRole(null);
    setUserEmail(null);
  }, [setAuthToken, setUserRole, setUserEmail]);

  const isAuthenticated = !!authToken;

  return (
    <AuthContext.Provider
      value={{
        authToken,
        userRole,
        userEmail,
        isAuthenticated,
        setAuthToken,
        setUserRole,
        setUserEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};