import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext"; 
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/buttons.css";
import "./styles/modals.css";
import "./styles/status.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);