import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthToken, setUserRole, setUserEmail } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/auth/login", { email, password });
      const token = res.data?.token || res.data?.accessToken || res.data?.jwt;
      const role = res.data?.role || res.data?.userRole || res.data?.roles?.[0] || res.data?.user?.role || null;
      const emailResp = res.data?.email || res.data?.user?.email || email;

      if (!token) {
        setStatus({ type: "error", text: "Login failed: no token returned" });
        return;
      }

      setAuthToken(token);
      if (role) setUserRole(role);
      if (emailResp) setUserEmail(emailResp);
      
      const from = location.state?.from?.pathname;
      if (role && typeof role === "string" && role.toUpperCase().includes("ADMIN")) {
        navigate("/admin", { replace: true });
      } else {
        navigate(from || "/my-scores", { replace: true });
      }
    } catch (err) {
      console.error("Login error", err);
      setStatus({ type: "error", text: err.response?.data?.message || "Login failed" });
    }
  };

  return (
    <div className="page-center">
      <div className="minecraft-container">
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div className="pdgigs-logo pdgigs-logo--inline" aria-hidden="true">PDgigs</div>
          <h1 style={{ margin: 6 }}>Login</h1>
        </div>

        <div className="minecraft-item" style={{ padding: 18 }}>
          <form onSubmit={handleSubmit} className="edit-form">
            <div className="form-row">
              <label>Email:</label>
              <input
                type="email"
                className="minecraft-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="form-row">
              <label>Password:</label>
              <input
                type="password"
                className="minecraft-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
              />
            </div>

            <div className="form-actions" style={{ marginTop: 12 }}>
              <button type="submit" className="minecraft-button" style={{ minWidth: 120 }}>Login</button>
              <a href="/register" className="register-link" style={{ marginLeft: 18 }}>Register!</a>
            </div>
          </form>

          {status && (
            <div className={`status-message ${status.type || "info"}`} style={{ marginTop: 12 }}>
              {status.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;