import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const { setAuthToken, setUserRole, setUserEmail } = useContext(AuthContext); 

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("Logging in...");
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email,
        password,
      });

      const token = response.data.token;
      const role = response.data.role; 
      
      setAuthToken(token);
      setUserRole(role);
      setUserEmail(email); 

      
      localStorage.setItem("jwt", token);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userEmail", email); 

      setStatus(`Login successful! Welcome, ${response.data.name || email}`);

      navigate(role === "ROLE_ADMIN" ? "/admin" : "/my-scores");
    } catch (error) {
      setStatus("Login failed. Please check your credentials.");
      console.error("Login Error:", error.response || error);
    }
  };

  return (
    <div className="auth-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="steve@minecraft.com"
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="CreeperAwMan!"
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {status && <p>{status}</p>}

      <p>
        Don't have an account? <Link to="/register" style={{ color: 'var(--color-glow)' }}>Register!</Link>
      </p>
    </div>
  );
};

export default Login;