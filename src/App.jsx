import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import RegisterAdmin from "./components/RegisterAdmin";
import CreatePdf from "./components/CreatePdf";
import DashboardAdmin from "./components/DashboardAdmin";
import DashboardUser from "./components/DashboardUser"; // ✅ Nuevo
import PrivateRoute from "./components/PrivateRoute";
import Unauthorized from "./components/Unauthorized";
import { AuthProvider } from "./context/AuthContext"; // ✅ Asegurar que AuthProvider esté aquí

const App = () => (
  <AuthProvider> {/* ✅ Envuelve todo con AuthProvider */}
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-admin" element={<RegisterAdmin />} />

        {/* ✅ Ruta para usuarios normales */}
        <Route
          path="/my-scores"
          element={
            <PrivateRoute allowedRoles={['USER', 'ADMIN']}>
              <DashboardUser />
            </PrivateRoute>
          }
        />

        {/* ✅ Ruta para subir PDFs (mantener si la quieres separada) */}
        <Route
          path="/create"
          element={
            <PrivateRoute allowedRoles={['USER', 'ADMIN']}>
              <CreatePdf />
            </PrivateRoute>
          }
        />

        {/* ✅ Ruta para admin */}
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <DashboardAdmin />
            </PrivateRoute>
          }
        />

        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;