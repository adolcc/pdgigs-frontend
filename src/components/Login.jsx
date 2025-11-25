import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom"; // Para redirigir al Dashboard
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
      setAuthToken(response.data.token); // Guarda el token en el contexto
      setUserRole(response.data.role); // Guarda el rol en el contexto
      localStorage.setItem("jwt", response.data.token); // También guarda el token en localStorage
      localStorage.setItem("role", response.data.role); // Guarda el rol para persistencia
      setStatus(`Login successful! Welcome, ${response.data.name}`);
      // Redirige al dashboard
      navigate(response.data.role === "ROLE_ADMIN" ? "/admin/dashboard" : "/create");
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