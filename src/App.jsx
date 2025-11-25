import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<h1>Página principal</h1>} />
      <Route path="/login" element={<h1>Login placeholder</h1>} />
      <Route path="/create" element={<h1>Create placeholder</h1>} />
      <Route path="/admin" element={<h1>Admin placeholder</h1>} />
    </Routes>
  </Router>
);

export default App;