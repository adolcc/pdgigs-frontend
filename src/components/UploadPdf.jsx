import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import { AuthContext } from "../context/AuthContext";

const UploadPdf = () => {
  const navigate = useNavigate();
  const { authToken, userEmail } = useContext(AuthContext);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [musicStyle, setMusicStyle] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status?.type === "success") {
      const id = setTimeout(() => setStatus(null), 2000); 
      return () => clearTimeout(id);
    }
  }, [status]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
    setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!file) {
      setStatus({ type: "error", text: "Select a PDF file before uploading." });
      return;
    }

    setSubmitting(true);
    setStatus({ type: "info", text: "Uploading..." });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("author", author);
      formData.append("musicStyle", musicStyle);

      const res = await axiosInstance.post("/api/scores/upload", formData);

      console.log("Upload success:", res.status, res.data);
      setStatus({ type: "success", text: "Upload successful!" });
      setTimeout(() => navigate("/my-scores", { replace: true }), 700);
    } catch (err) {
      console.error("Upload error status:", err.response?.status);
      console.error("Upload error data:", err.response?.data);
      const msg = err.response?.data?.message || err.message || "Upload failed";
      setStatus({ type: "error", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="minecraft-container" style={{ maxWidth: 760 }}>
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <div className="pdgigs-logo pdgigs-logo--inline" aria-hidden="true">PDgigs</div>
        <h1 style={{ margin: 6 }}>Upload PDF</h1>
      </div>

      <div className="minecraft-item" style={{ padding: 18 }}>
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-row">
            <label>Title:</label>
            <input
              className="minecraft-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Song title"
            />
          </div>

          <div className="form-row">
            <label>Author:</label>
            <input
              className="minecraft-input"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author name"
            />
          </div>

          <div className="form-row">
            <label>Style:</label>
            <input
              className="minecraft-input"
              value={musicStyle}
              onChange={(e) => setMusicStyle(e.target.value)}
              placeholder="e.g. rock, pop"
            />
          </div>

          <div className="form-row file-input-row">
            <label>Browse for PDF</label>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <label className="file-input-label" style={{ display: "inline-block" }}>
                Browse for PDF
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </label>

              <span className="file-input-name" style={{ color: "var(--row-text)" }}>
                {file ? file.name : "No file selected"}
              </span>
            </div>
          </div>

          <div className="edit-actions form-actions" style={{ marginTop: 12 }}>
            <button type="submit" className="minecraft-button save-btn" disabled={submitting}>
              {submitting ? "Uploading..." : "Upload PDF"}
            </button>
            <button type="button" className="minecraft-button cancel-btn" onClick={() => navigate("/my-scores")}>
              Cancel
            </button>
          </div>
        </form>

        {status && (
          <div
            className={`status-message ${status.type || "info"}`}
            role={status.type === "error" ? "alert" : "status"}
            aria-live={status.type === "error" ? "assertive" : "polite"}
            style={{ marginTop: 12 }}
          >
            {status.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPdf;