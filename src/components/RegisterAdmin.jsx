import React, { useState } from "react";
import axios from "axios";

const RegisterAdmin = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("Registering...");
    try {
      // NOTA: el backend /auth/register no acepta role en el body,
      // por eso aquí sólo enviamos email, name y password.
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
        email,
        name,
        password,
      });
      setStatus(`User registered successfully! ${response.data?.name || ""}`);
    } catch (error) {
      setStatus("Registration failed. Please try again.");
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Register (Admin form placeholder)</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Email:
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
        </div>
        <div>
          <label>
            Name:
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
        </div>
        <div>
          <label>
            Password:
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
        </div>
        <button type="submit">Register</button>
      </form>
      <p>{status}</p>
      <p><small>Nota: para convertir a un usuario en admin usa el endpoint protegido /admin/users/{`{id}`}/role (requiere ser admin).</small></p>
    </div>
  );
};

export default RegisterAdmin;