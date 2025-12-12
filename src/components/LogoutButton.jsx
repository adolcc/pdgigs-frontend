import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const LogoutButton = ({ children }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (typeof logout === "function") logout();

    try {
      localStorage.removeItem("jwt");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userEmail");
    } catch (e) {}

    navigate("/login", { replace: true });
  };

  return (
    <button className="minecraft-button" onClick={handleLogout}>
      {children || "Logout"}
    </button>
  );
};

export default LogoutButton;