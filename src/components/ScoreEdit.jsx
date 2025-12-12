import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";


const MAX_TITLE = 200;
const MAX_AUTHOR = 200;
const MAX_STYLE = 100;

const ScoreEdit = ({ onSaved }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [musicStyle, setMusicStyle] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoadingMeta(true);
    axiosInstance.get(`/api/scores/${id}`)
      .then(res => {
        if (!mounted) return;
        const data = res.data || {};
        setTitle(data.title || "");
        setAuthor(data.author || "");
        setMusicStyle(data.musicStyle ?? data.musicalStyle ?? "");
      })
      .catch(err => {
        console.error("Error loading score metadata", err);
        if (mounted) setError("Failed to load score metadata");
      })
      .finally(() => { if (mounted) setLoadingMeta(false); });

    return () => { mounted = false; };
  }, [id]);

  const validate = () => {
    if (title && title.length > MAX_TITLE) return `Title must be <= ${MAX_TITLE} chars`;
    if (author && author.length > MAX_AUTHOR) return `Author must be <= ${MAX_AUTHOR} chars`;
    if (musicStyle && musicStyle.length > MAX_STYLE) return `Style must be <= ${MAX_STYLE} chars`;
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title?.trim() === "" ? null : (title?.trim() ?? null),
        author: author?.trim() === "" ? null : (author?.trim() ?? null),
        musicStyle: musicStyle?.trim() === "" ? null : (musicStyle?.trim() ?? null),
      };

      const res = await axiosInstance.put(`/api/scores/${id}`, payload);

      try { window.dispatchEvent(new CustomEvent("scores:updated", { detail: { id } })); } catch (e) {}

      if (typeof onSaved === "function") onSaved(res.data);

      navigate("/my-scores", { replace: true });
    } catch (err) {
      console.error("Update failed", err.response?.status, err.response?.data || err.message);
      const msg = err.response?.data?.message || "Update failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loadingMeta) {
    return (
      <div className="page-center">
        <div className="minecraft-container">
          <div className="minecraft-item" style={{ padding: 18 }}>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-center">
      <div className="minecraft-container">
        <div style={{ textAlign: "left", marginBottom: 8 }}>
          <h2 style={{ color: "var(--color-glow)", margin: 0 }}>Edit Score</h2>
        </div>

        <div className="minecraft-item" style={{ padding: 18 }}>
          {error && (
            <div style={{ marginBottom: 12 }}>
              <div className="status-message error" role="alert" aria-live="assertive">
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="edit-form">
            <div className="form-row">
              <label htmlFor="score-title">Title</label>
              <input
                id="score-title"
                className="minecraft-input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={MAX_TITLE}
              />
            </div>

            <div className="form-row">
              <label htmlFor="score-author">Author</label>
              <input
                id="score-author"
                className="minecraft-input"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                maxLength={MAX_AUTHOR}
              />
            </div>

            <div className="form-row">
              <label htmlFor="score-style">Style</label>
              <input
                id="score-style"
                className="minecraft-input"
                value={musicStyle}
                onChange={e => setMusicStyle(e.target.value)}
                maxLength={MAX_STYLE}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="minecraft-button save-btn" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </button>
              <button type="button" className="minecraft-button cancel-btn" onClick={() => navigate("/my-scores")}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScoreEdit;