import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const { setAuthToken, setUserRole } = useContext(AuthContext);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("Logging in...");
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email,
        password,
      });

      const token = response.data.token;
      const role = response.data.role; // espera "ROLE_ADMIN" o null

      setAuthToken(token);
      setUserRole(role);

      localStorage.setItem("jwt", token);
      localStorage.setItem("userRole", role); // clave unificada con AuthContext

      setStatus(`Login successful! Welcome, ${response.data.name || email}`);

      navigate(role === "ROLE_ADMIN" ? "/admin" : "/create");
    } catch (error) {
      setStatus("Login failed. Please check your credentials.");
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <p>{status}</p>
    </div>
  );
};

export default Login;