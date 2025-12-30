import React, { createContext, useState, useEffect, useCallback } from "react";
import axiosInstance from "../services/axiosInstance";

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
    try {
      const token = localStorage.getItem("jwt");
      const role = localStorage.getItem("userRole");
      const email = localStorage.getItem("userEmail");
      if (token) {
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setAuthTokenState(token);
      }
      if (role) setUserRoleState(role);
      if (email) setUserEmailState(email);
    } catch (e) {}
  }, []);

  const setAuthToken = useCallback((token) => {
    try {
      if (token) {
        localStorage.setItem("jwt", token);
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setAuthTokenState(token);
      } else {
        localStorage.removeItem("jwt");
        delete axiosInstance.defaults.headers.common["Authorization"];
        setAuthTokenState(null);
      }
    } catch (e) {
      setAuthTokenState(token);
      axiosInstance.defaults.headers.common["Authorization"] = token ? `Bearer ${token}` : undefined;
    }
  }, []);

  const setUserRole = useCallback((role) => {
    try {
      if (role) localStorage.setItem("userRole", role);
      else localStorage.removeItem("userRole");
    } catch (e) {}
    setUserRoleState(role);
  }, []);

  const setUserEmail = useCallback((email) => {
    try {
      if (email) localStorage.setItem("userEmail", email);
      else localStorage.removeItem("userEmail");
    } catch (e) {}
    setUserEmailState(email);
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