import React, { useEffect, useState } from "react";
import PdfAnnotatorModal from "./PdfAnnotatorModal";

const PdfViewerModal = ({ isOpen, onClose, blobUrl, filename, displayName, scoreId }) => {
  const [annotateOpen, setAnnotateOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const headerTitle = (displayName && displayName.trim()) ? displayName : "Untitled";

  return (
    <>
      <div
        className="pdf-viewer-overlay"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1200,
          background: "rgba(0,0,0,0.55)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="pdf-viewer-panel minecraft-container"
          style={{
            width: "min(1100px, 96%)",
            height: "min(80vh, 900px)",
            display: "flex",
            flexDirection: "column",
            padding: 0,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 18px",
              borderBottom: "2px solid rgba(0,0,0,0.15)",
              background: "transparent",
            }}
          >
            <div
              style={{ color: "var(--color-glow)", fontSize: "1rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
              title={headerTitle}
            >
              {headerTitle}
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <a
                href={blobUrl}
                download={filename || "score.pdf"}
                className="minecraft-button"
                style={{ textDecoration: "none" }}
                target="_blank"
                rel="noreferrer"
              >
                ⬇️ Download
              </a>

              {scoreId && (
                <button className="minecraft-button" onClick={() => setAnnotateOpen(true)}>
                  ✏️ Annotate
                </button>
              )}

              <button className="minecraft-button" onClick={onClose}>
                Close
              </button>
            </div>
          </div>

          <div style={{ flex: 1, background: "var(--row-bg)" }}>
            {blobUrl ? (
              <object
                data={blobUrl}
                type="application/pdf"
                width="100%"
                height="100%"
                aria-label="PDF viewer"
                style={{ border: "none" }}
              >
                <iframe
                  src={blobUrl}
                  title={headerTitle}
                  style={{ width: "100%", height: "100%", border: "none" }}
                />
                <div style={{ padding: 18 }}>
                  <p>
                    Your browser doesn't support inline PDF viewing. <a href={blobUrl} target="_blank" rel="noreferrer">Open in a new tab</a> or download it.
                  </p>
                </div>
              </object>
            ) : (
              <div style={{ padding: 18 }}>
                <p>No PDF to display</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {annotateOpen && <PdfAnnotatorModal scoreId={scoreId} onClose={() => setAnnotateOpen(false)} />}
    </>
  );
};

export default PdfViewerModal;