import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext"; // Importamos el contexto para la autenticación

const CreatePdf = () => {
  const [file, setFile] = useState(null); // Estado para el archivo
  const [title, setTitle] = useState(""); // Metadata opcional
  const [author, setAuthor] = useState(""); // Metadata opcional
  const [musicalStyle, setMusicalStyle] = useState(""); // Metadata opcional
  const [status, setStatus] = useState(""); // Estado para mensajes de error o éxito

  const { authToken } = useContext(AuthContext); // Obtener el JWT del contexto de autenticación

  // Maneja el cambio en el campo de archivo
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // Maneja el envío del formulario
  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("Uploading...");

    if (!file) {
      setStatus("Please select a valid file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file); // Archivo obligatorio
    formData.append("title", title); // Metadata opcional
    formData.append("author", author); // Metadata opcional
    formData.append("musicalStyle", musicalStyle); // Metadata opcional

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/scores/create`, // Endpoint del backend
        formData,
        {
          headers: {
            "Authorization": `Bearer ${authToken}`, // Agregar el token JWT al encabezado
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setStatus(`PDF uploaded successfully! ID: ${response.data.id}`);
    } catch (error) {
      setStatus("Upload failed. Please try again.");
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Create PDF</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Select a PDF:
            <input type="file" accept="application/pdf" onChange={handleFileChange} />
          </label>
        </div>
        <div>
          <label>
            Title (Optional):
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Author (Optional):
            <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Musical Style (Optional):
            <input type="text" value={musicalStyle} onChange={(e) => setMusicalStyle(e.target.value)} />
          </label>
        </div>
        <button type="submit">Create</button>
      </form>
      <p>{status}</p>
    </div>
  );
};

export default CreatePdf;