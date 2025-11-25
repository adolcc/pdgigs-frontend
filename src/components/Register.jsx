import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
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

      // El backend crea y autentica devolviendo token y role
      const token = response.token || response.data?.token;
      const role = response.role || response.data?.role;

      if (token) {
        setAuthToken(token);
        setUserRole(role);
        localStorage.setItem("jwt", token);
        localStorage.setItem("userRole", role);
      }

      setStatus("Registration successful!");
      navigate(role === "ROLE_ADMIN" ? "/admin" : "/create");
    } catch (error) {
      setStatus("Registration failed. Please try again.");
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Register</button>
      </form>
      <p>{status}</p>
    </div>
  );
};

export default Register;