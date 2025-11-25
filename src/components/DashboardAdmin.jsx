import React, { useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const DashboardAdmin = () => {
  const { authToken, userRole } = useContext(AuthContext);

  const handleFetchScores = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/scores`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      console.log(response.data); // Aquí podrías mostrar las partituras en el dashboard
      alert("Scores fetched successfully! Check console.");
    } catch (error) {
      console.error("Failed to fetch scores: ", error);
      alert("Failed to fetch scores.");
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, Administrator! Your role: <strong>{userRole}</strong></p>
      <button onClick={handleFetchScores}>Fetch Scores (Admin Only)</button>
      {/* Puedes agregar más botones para otras acciones */}
    </div>
  );
};

export default DashboardAdmin;