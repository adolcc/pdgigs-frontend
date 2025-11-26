import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext"; 

const CreatePdf = () => {
  const [file, setFile] = useState(null); 
  const [title, setTitle] = useState(""); 
  const [author, setAuthor] = useState(""); 
  const [musicalStyle, setMusicalStyle] = useState(""); 
  const [status, setStatus] = useState(""); 

  const { authToken } = useContext(AuthContext); 

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("Uploading...");

    if (!file) {
      setStatus("Please select a valid file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title); 
    formData.append("author", author); 
    formData.append("musicalStyle", musicalStyle); 

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/scores`, 
        formData,
        {
          headers: {
            "Authorization": `Bearer ${authToken}`, 
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setStatus("PDF uploaded successfully!");
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
          <label className="file-input-label">
            📁 Select PDF File
            <input 
              type="file" 
              accept="application/pdf" 
              onChange={handleFileChange} 
              style={{ display: 'none' }}
            />
          </label>
          {file && <p style={{ fontSize: '0.8em', marginTop: '5px' }}>Selected: {file.name}</p>}
          {!file && <p style={{ fontSize: '0.8em', marginTop: '5px', color: '#666' }}>No file selected</p>}
        </div>
        <div>
          <label>Title (Optional):</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="minecraft-input"
          />
        </div>
        <div>
          <label>Author (Optional):</label>
          <input 
            type="text" 
            value={author} 
            onChange={(e) => setAuthor(e.target.value)} 
            className="minecraft-input"
          />
        </div>
        <div>
          <label>Musical Style (Optional):</label>
          <input 
            type="text" 
            value={musicalStyle} 
            onChange={(e) => setMusicalStyle(e.target.value)} 
            className="minecraft-input"
          />
        </div>
        <button type="submit">Create</button>
      </form>
      <p>{status}</p>
    </div>
  );
};

export default CreatePdf;