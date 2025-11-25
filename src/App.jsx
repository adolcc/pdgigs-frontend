import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import RegisterAdmin from "./components/RegisterAdmin";
import CreatePdf from "./components/CreatePdf";
import DashboardAdmin from "./components/DashboardAdmin";
import PrivateRoute from "./components/PrivateRoute";
import Unauthorized from "./components/Unauthorized";

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register-admin" element={<RegisterAdmin />} />

      <Route
        path="/create"
        element={
          <PrivateRoute>
            <CreatePdf />
          </PrivateRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <PrivateRoute role="ROLE_ADMIN">
            <DashboardAdmin />
          </PrivateRoute>
        }
      />

      <Route path="/unauthorized" element={<Unauthorized />} />
    </Routes>
  </Router>
);

export default App;