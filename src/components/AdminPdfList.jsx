import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../services/axiosInstance";
import { downloadBlob } from "../services/downloadHelpers";
import PdfViewerModal from "./PdfViewerModal";
import MinecraftModal from "./MinecraftModal";
import MinecraftAlert from "./MinecraftAlert";

const AdminPdfList = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [viewer, setViewer] = useState({ isOpen: false, url: null, filename: null, displayName: null });

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, score: null });
  const [alert, setAlert] = useState({ isOpen: false, title: "", message: "", type: "info" });

  const fetchScores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/admin/scores");
      setScores(res.data || []);
    } catch (err) {
      console.error("AdminPdfList fetch error", err);
      setError("Error loading scores");
      setAlert({ isOpen: true, title: "Error", message: "Failed to load scores", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScores();
    const onUpdated = () => fetchScores();
    window.addEventListener("scores:updated", onUpdated);
    return () => window.removeEventListener("scores:updated", onUpdated);
  }, [fetchScores]);

  const showAlert = (title, message, type = "info") => setAlert({ isOpen: true, title, message, type });

  const viewPdf = async (id) => {
    try {
      const res = await axiosInstance.get(`/api/scores/${id}/pdf`, {
        responseType: "blob",
        headers: { Accept: "application/pdf" },
      });
      const contentType = res.headers?.["content-type"] || "application/pdf";
      const blob = res.data instanceof Blob ? res.data : new Blob([res.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const meta = await axiosInstance.get(`/api/scores/${id}`).then(r => r.data).catch(() => null);
      const displayName = meta?.title || meta?.filename || id;

      setViewer({ isOpen: true, url, filename: `${displayName}.pdf`, displayName });
    } catch (err) {
      console.error("Admin view error", err);
      const status = err.response?.status;
      if (status === 403) showAlert("Access Denied", "You do not have permission to view this PDF", "error");
      else if (status === 404) showAlert("Not found", "PDF not found", "error");
      else showAlert("View Error", err.response?.data?.message || "Failed to load PDF", "error");
    }
  };

  const closeViewer = () => {
    try { if (viewer.url) window.URL.revokeObjectURL(viewer.url); } catch (e) {}
    setViewer({ isOpen: false, url: null, filename: null, displayName: null });
  };

  const downloadPdf = async (id) => {
    try {
      const meta = await axiosInstance.get(`/api/scores/${id}`).then(r => r.data).catch(() => null);
      const res = await axiosInstance.get(`/api/scores/${id}/pdf`, {
        responseType: "blob",
        headers: { Accept: "application/pdf" },
      });
      const name = (meta?.filename || meta?.title || id).trim() || id;
      downloadBlob(res, `${name}.pdf`);
      showAlert("Downloaded", `Downloaded ${name}.pdf`, "success");
    } catch (err) {
      console.error("Admin download error", err);
      const status = err.response?.status;
      if (status === 403) showAlert("Access Denied", "You do not have permission to download this PDF", "error");
      else if (status === 404) showAlert("Not found", "PDF not found", "error");
      else showAlert("Download Error", err.response?.data?.message || "Failed to download PDF", "error");
    }
  };

  const openDeleteModal = (score) => setDeleteModal({ isOpen: true, score });
  const closeDeleteModal = () => setDeleteModal({ isOpen: false, score: null });

  const confirmDelete = async () => {
    const score = deleteModal.score;
    if (!score) return;
    try {
      await axiosInstance.delete(`/admin/scores/${score.id}`);
      showAlert("Deleted", `"${score.title || "Untitled"}" was deleted`, "success");
      closeDeleteModal();
      fetchScores();
    } catch (err) {
      console.error("Admin delete error", err);
      showAlert("Delete Error", err.response?.data?.message || "Failed to delete score", "error");
    }
  };

  if (loading) return <div className="minecraft-loading"><p>⛏️ Loading scores...</p></div>;

  return (
    <div className="minecraft-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ color: "var(--color-glow)", margin: 0 }}>📚 All System Scores (Admin)</h2>
        <div>
          <button className="minecraft-button" onClick={fetchScores}>🔄 Refresh List</button>
        </div>
      </div>

      <div className="minecraft-item" style={{ padding: 16 }}>
        {error && <p style={{ color: "#ff8a80" }}>{error}</p>}

        {scores.length > 0 ? (
          <div className="minecraft-list" role="list" style={{ marginTop: 8 }}>
            {scores.map(score => (
              <div className="list-row" key={score.id} role="listitem" tabIndex={0}>
                <div className="row-left">
                  <div className="row-info" style={{ flex: "1 1 auto" }}>
                    <div className="row-title">{score.title || "No Title"}</div>
                    <div className="row-meta" style={{ marginTop: 8 }}>
                      <span className="meta-item">Author: {score.author || "Unknown"}</span>
                      <span className="meta-item" style={{ marginLeft: 12 }}>Style: {score.musicStyle || score.musicalStyle || "Not specified"}</span>
                      <span className="meta-item" style={{ display: "block", marginTop: 8 }}>
                        Uploaded by: {score.userEmail || score.userId || "Unknown user"}
                      </span>
                    </div>
                  </div>

                  <div className="row-actions" aria-hidden>
                    <button
                      type="button"
                      className="minecraft-button small icon"
                      title="View"
                      aria-label={`View ${score.title || "score"}`}
                      onClick={() => viewPdf(score.id)}
                    >
                      👀
                    </button>

                    <button
                      type="button"
                      className="minecraft-button small icon"
                      title="Download"
                      aria-label={`Download ${score.title || "score"}`}
                      onClick={() => downloadPdf(score.id)}
                    >
                      ⬇️
                    </button>

                    <button
                      type="button"
                      className="minecraft-button small icon"
                      title="Delete"
                      aria-label={`Delete ${score.title || "score"}`}
                      onClick={() => openDeleteModal(score)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: "12px 8px", background: "var(--row-bg)", borderRadius: 6 }}>No scores found</div>
        )}
      </div>

      <MinecraftModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="🗑️ Delete Score (Admin)"
        message={`Are you sure you want to delete "${deleteModal.score?.title}"?`}
        type="danger"
      />

      <MinecraftAlert
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />

      <PdfViewerModal
        isOpen={viewer.isOpen}
        onClose={closeViewer}
        blobUrl={viewer.url}
        filename={viewer.filename}
        displayName={viewer.displayName}
      />
    </div>
  );
};

export default AdminPdfList;