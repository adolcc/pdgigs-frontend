import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import { AuthContext } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { setAuthToken, setUserRole, setUserEmail } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => () => setStatus(null), []);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setStatus({ type: "info", text: "Registering..." });

    try {
      const response = await axiosInstance.post("/auth/register", { email, name, password });
      const token = response.data?.token;
      const role = response.data?.role || "ROLE_USER";
      if (token) {
        setAuthToken(token);
        setUserRole(role);
        setUserEmail(email);
        try {
          localStorage.setItem("jwt", token);
          if (role) localStorage.setItem("userRole", role);
          localStorage.setItem("userEmail", email);
        } catch (e) {}
        navigate("/my-scores", { replace: true });
      } else {
        setStatus({ type: "error", text: "Registration succeeded but no token returned. Please login." });
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Registration failed. Please try again.";
      setStatus({ type: "error", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-center">
      <div className="minecraft-container">
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div className="pdgigs-logo pdgigs-logo--inline" aria-hidden="true">PDgigs</div>
          <h1 style={{ margin: 6 }}>Join the Band!</h1>
        </div>

        <div className="minecraft-item" style={{ padding: 18 }}>
          <form onSubmit={handleSubmit} className="edit-form">
            <div className="form-row">
              <label>Email:</label>
              <input
                className="minecraft-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="steve@minecraft.com"
              />
            </div>

            <div className="form-row">
              <label>Name:</label>
              <input
                className="minecraft-input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Alex/Steve"
              />
            </div>

            <div className="form-row">
              <label>Password:</label>
              <input
                className="minecraft-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="CreeperAwMan!"
              />
            </div>

            <div className="form-actions" style={{ marginTop: 12 }}>
              <button type="submit" className="minecraft-button" disabled={submitting}>
                {submitting ? "Registering..." : "Start Mining Scores!"}
              </button>

              <Link to="/login" className="register-link" style={{ marginLeft: 18 }}>
                Login!
              </Link>
            </div>
          </form>

          {status && (
            <div style={{ marginTop: 12 }}>
              <div className={`status-message ${status.type || "info"}`}>
                {status.text}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;