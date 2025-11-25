import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // Archivo principal con todas las rutas
import { AuthProvider } from "./context/AuthContext"; // Importa el AuthProvider
import "./index.css"; // Estilos globales opcionales

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <h1>TEST: React se monta ✅</h1>
  </React.StrictMode>
);