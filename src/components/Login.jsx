import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom"; // Importamos Link
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  // Usamos setAuthToken y setUserRole del contexto
  const { setAuthToken, setUserRole } = useContext(AuthContext);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("Logging in...");
    try {
      // Usamos el endpoint del backend que provee token y role
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email,
        password,
      });

      const token = response.data.token;
      const role = response.data.role; // espera "ROLE_ADMIN" o "ROLE_USER"

      // 1. Actualizar el Contexto
      setAuthToken(token);
      setUserRole(role);

      // 2. Limpiar/Actualizar localStorage (redundante si el AuthContext está bien configurado, pero no hace daño)
      localStorage.setItem("jwt", token);
      localStorage.setItem("userRole", role);

      setStatus(`Login successful! Welcome, ${response.data.name || email}`);

      // Redirigir según el rol
      navigate(role === "ROLE_ADMIN" ? "/admin" : "/create");
    } catch (error) {
      // Mostrar mensaje de error del backend o genérico
      setStatus("Login failed. Please check your credentials.");
      console.error("Login Error:", error.response || error);
    }
  };

  return (
    <div className="auth-container"> {/* <--- CLASE DE MINECRAFT AQUÍ */}
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
        <button type="submit">Ingresar</button> {/* <--- Usa el estilo de botón CSS */}
      </form>
      {status && <p>{status}</p>}

      <p>
        ¿No tienes cuenta? <Link to="/register" style={{ color: 'var(--color-glow)' }}>¡Regístrate!</Link>
      </p>
    </div>
  );
};

export default Login;