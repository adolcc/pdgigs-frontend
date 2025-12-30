import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import { downloadBlob } from "../services/downloadHelpers";
import LogoutButton from "./LogoutButton";
import PdfViewerModal from "./PdfViewerModal";
import MinecraftConfirm from "./MinecraftConfirm";
import MinecraftAlert from "./MinecraftAlert";

const PdfList = ({ refreshKey }) => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewer, setViewer] = useState({ isOpen: false, url: null, filename: null, displayName: null, scoreId: null });
  const [confirm, setConfirm] = useState({ isOpen: false, id: null, title: "" });
  const [alert, setAlert] = useState({ isOpen: false, title: "", message: "", type: "info" });

  const navigate = useNavigate();

  const fetchScores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/api/scores");
      setScores(res.data || []);
    } catch (e) {
      setError("Error loading scores");
      console.error("PdfList fetch error", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScores();
    const onUpdated = (evt) => fetchScores();
    window.addEventListener("scores:updated", onUpdated);
    const onVisibility = () => { if (document.visibilityState === "visible") fetchScores(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("scores:updated", onUpdated);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fetchScores, refreshKey]);

  const viewPdf = async (id, title, filename) => {
    try {
      const response = await axiosInstance.get(`/api/scores/${id}/pdf`, {
        responseType: "blob",
        headers: { Accept: "application/pdf" },
      });
      const contentType = response.headers?.["content-type"] || "application/pdf";
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const displayName = (title && title.trim()) ? title.trim() : "Untitled";
      setViewer({ isOpen: true, url, filename: filename || id, displayName, scoreId: id });
    } catch (err) {
      console.error("View PDF error", err);
      setAlert({ isOpen: true, title: "Error", message: "Failed to load PDF", type: "error" });
    }
  };

  const closeViewer = () => {
    try { if (viewer.url) window.URL.revokeObjectURL(viewer.url); } catch (e) {}
    setViewer({ isOpen: false, url: null, filename: null, displayName: null, scoreId: null });
  };

  const handleDownload = async (id, filenameFallback) => {
    try {
      const response = await axiosInstance.get(`/api/scores/${id}/pdf`, {
        responseType: "blob",
        headers: { Accept: "application/pdf" },
      });
      const dispositionFilename = filenameFallback || `${id}.pdf`;
      downloadBlob(response, dispositionFilename);
    } catch (err) {
      console.error("Download failed", err);
      setAlert({ isOpen: true, title: "Download failed", message: "Could not download PDF", type: "error" });
    }
  };

  const openDeleteConfirm = (id, title) => setConfirm({ isOpen: true, id, title: title || "" });
  const cancelDelete = () => setConfirm({ isOpen: false, id: null, title: "" });

  const confirmDelete = async () => {
    const id = confirm.id;
    const title = confirm.title;
    if (!id) return;
    try {
      await axiosInstance.delete(`/api/scores/${id}`);
      setScores(prev => prev.filter(s => s.id !== id));
      setConfirm({ isOpen: false, id: null, title: "" });
      setAlert({
        isOpen: true,
        title: "Deleted",
        message: title ? `"${title}" was deleted.` : "Score was deleted.",
        type: "success",
      });
      try { window.dispatchEvent(new CustomEvent("scores:updated", { detail: { id } })); } catch (e) {}
    } catch (err) {
      console.error("Delete failed", err);
      setConfirm({ isOpen: false, id: null, title: "" });
      setAlert({ isOpen: true, title: "Delete failed", message: "Could not delete the score", type: "error" });
    }
  };

  const closeAlert = () => setAlert({ isOpen: false, title: "", message: "", type: "info" });

  return (
    <div className="minecraft-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ color: "var(--color-glow)", margin: 0 }}>My Scores</h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link to="/upload" className="minecraft-button" style={{ textDecoration: "none" }}>📤 Upload New</Link>
          <LogoutButton>Logout</LogoutButton>
        </div>
      </div>

      <div className="minecraft-item" style={{ padding: 16 }}>
        {error && <p style={{ color: "#ff8a80" }}>{error}</p>}
        {loading && <p>⛏️ Loading scores...</p>}

        {scores.length > 0 ? (
          <div className="minecraft-list" role="list" style={{ marginTop: 8 }}>
            {scores.map(score => (
              <div className="list-row" key={score.id} role="listitem" tabIndex={0}>
                <div className="row-left">
                  <div className="row-info" style={{ flex: "1 1 auto" }}>
                    <div className="row-title">{score.title || "No Title"}</div>
                    <div className="row-meta" style={{ marginTop: 8 }}>
                      <span className="meta-item">Author: {score.author || "Unknown"}</span>
                      <span className="meta-item" style={{ marginLeft: 12 }}>Style: {score.musicStyle || "Not specified"}</span>
                    </div>
                  </div>

                  <div className="row-actions" aria-hidden>
                    <button
                      type="button"
                      className="minecraft-button small icon"
                      title="View"
                      aria-label={`View ${score.title || "score"}`}
                      onClick={() => viewPdf(score.id, score.title, score.filename)}
                    >
                      👀
                    </button>

                    <button
                      type="button"
                      className="minecraft-button small icon"
                      title="Download"
                      aria-label={`Download ${score.title || "score"}`}
                      onClick={() => handleDownload(score.id, score.filename)}
                    >
                      ⬇️
                    </button>

                    <Link
                      to={`/scores/${score.id}/edit`}
                      className="minecraft-button small icon"
                      title="Edit"
                      aria-label={`Edit ${score.title || "score"}`}
                    >
                      ✏️
                    </Link>

                    <button
                      type="button"
                      className="minecraft-button small icon"
                      onClick={() => openDeleteConfirm(score.id, score.title)}
                      title="Delete"
                      aria-label={`Delete ${score.title || "score"}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && <div style={{ padding: "12px 8px", background: "var(--row-bg)", borderRadius: 6 }}>No scores found</div>
        )}

        <div className="reload-section" style={{ marginTop: 18 }}>
          <button className="minecraft-button" onClick={fetchScores} disabled={loading}>
            {loading ? "Refreshing..." : "🔄 Refresh List"}
          </button>
        </div>
      </div>

      <PdfViewerModal isOpen={viewer.isOpen} onClose={closeViewer} blobUrl={viewer.url} filename={viewer.filename} displayName={viewer.displayName} scoreId={viewer.scoreId} />

      <MinecraftConfirm
        isOpen={confirm.isOpen}
        message={confirm.title ? `Are you sure you want to delete "${confirm.title}"? This action is irreversible.` : undefined}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        type="danger"
      />

      <MinecraftAlert isOpen={alert.isOpen} onClose={closeAlert} title={alert.title} message={alert.message} type={alert.type} />
    </div>
  );
};

export default PdfList;