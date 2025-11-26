import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom"; 
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { setAuthToken, setUserRole, setUserEmail } = useContext(AuthContext);

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

      setStatus("Registration successful! Redirecting...");

      navigate("/my-scores");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      setStatus(errorMessage);
      console.error("Registration Error:", error.response || error);
    }
  };

  return (
    <div className="auth-container"> {/* <--- CLASE DE MINECRAFT AQUÍ */}
      <h1>Join the Band!</h1>
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
          <label>Name:</label>
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
        <button type="submit">Start Mining Scores!</button>
      </form>
      {status && <p>{status}</p>}

      <p>
        Already have an account? <Link to="/login" style={{ color: 'var(--color-glow)' }}>Login!</Link>
      </p>
    </div>
  );
};

export default Register;