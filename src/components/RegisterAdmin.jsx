import React, { useState } from "react";
import axios from "axios";

const RegisterAdmin = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("Registering administrator...");
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
        email,
        name,
        password,
        role: "ADMIN", // Diseño para establecer explícitamente el rol
      });
      setStatus(`Admin registered successfully! Welcome, ${response.data.name}`);
    } catch (error) {
      setStatus("Admin registration failed. Please try again.");
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Register Admin</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
        </div>
        <button type="submit">Register Admin</button>
      </form>
      <p>{status}</p>
    </div>
  );
};

export default RegisterAdmin;