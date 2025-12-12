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
      const role = response.data?.role;
      if (token) {
        setAuthToken(token);
        setUserRole(role);
        setUserEmail(email);
        localStorage.setItem("jwt", token);
        localStorage.setItem("userRole", role);
        localStorage.setItem("userEmail", email);
      }
      setStatus({ type: "success", text: "Registration successful! Redirecting..." });
      setTimeout(() => navigate("/my-scores"), 700);
    } catch (error) {
      const msg = error.response?.data?.message || "Registration failed. Please try again.";
      setStatus({ type: "error", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const statusStyle = (type) => {
    if (type === "success") return { color: "var(--color-accent-green)" };
    if (type === "error") return { color: "#ff8a80" };
    return { color: "var(--row-text)" };
  };

  return (
    <div style={{ minHeight: "calc(100vh - 48px)", display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
      <div className="minecraft-container" style={{ maxWidth: 900, width: "100%", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 720 }}>
          {/* Logo PDgigs */}
          <div style={{ textAlign: "center", marginBottom: 10 }}>
            <div className="pdgigs-logo pdgigs-logo--inline" aria-hidden="true">PDgigs</div>
            <h1 style={{ margin: 6 }}>Join the Band!</h1>
          </div>

          <div className="minecraft-item" style={{ padding: 18 }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label>Email:</label>
                <input className="minecraft-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="steve@minecraft.com" />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label>Name:</label>
                <input className="minecraft-input" type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Alex/Steve" />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label>Password:</label>
                <input className="minecraft-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="CreeperAwMan!" />
              </div>

              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <button type="submit" className="minecraft-button" disabled={submitting}>
                  {submitting ? "Registering..." : "Start Mining Scores!"}
                </button>
                <div style={{ marginLeft: 8 }}>
                  <Link to="/login" style={{ color: "var(--color-glow)", textDecoration: "underline" }}>Login!</Link>
                </div>
              </div>
            </form>

            {status && <p style={{ marginTop: 12, ...statusStyle(status.type) }}>{status.text}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;