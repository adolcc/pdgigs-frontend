import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom"; // Importamos Link
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  // Usamos setAuthToken y setUserRole para iniciar sesión automáticamente
  const { setAuthToken, setUserRole } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("Registering...");
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
        email,
        name,
        password,
      });

      // El backend crea y autentica devolviendo token y role en response.data
      const token = response.data?.token;
      const role = response.data?.role;

      if (token) {
        // 1. Actualizar el Contexto
        setAuthToken(token);
        setUserRole(role);
        
        // La persistencia en localStorage la maneja el AuthContext
      }

      setStatus("Registration successful! Redirecting...");
      
      // Redirigir al usuario estándar a la página de creación
      navigate("/create"); 
    } catch (error) {
      // Manejo de errores (por ejemplo, email ya existe)
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      setStatus(errorMessage);
      console.error("Registration Error:", error.response || error);
    }
  };

  return (
    <div className="auth-container"> {/* <--- CLASE DE MINECRAFT AQUÍ */}
      <h1>¡Únete a la Banda!</h1>
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
          <label>Nombre:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Alex/Steve"
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
        <button type="submit">¡A Minar Partituras!</button>
      </form>
      {status && <p>{status}</p>}

      <p>
        ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--color-glow)' }}>¡Ingresa!</Link>
      </p>
    </div>
  );
};

export default Register;