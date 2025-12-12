import React, { useEffect } from "react";


const MinecraftConfirm = ({
  isOpen,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  type = "danger",
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onCancel?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const displayMessage = message?.trim()
    ? message
    : "Are you sure you want to delete this score? This action is irreversible.";

  const confirmClass = type === "danger" ? "delete-btn" : type === "success" ? "save-btn" : "save-btn";

  return (
    <div className="minecraft-modal-overlay" style={{ zIndex: 2200 }}>
      <div
        className="minecraft-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Confirm"
        style={{
          background: "var(--panel-bg, #f3efe6)",
          border: "4px solid rgba(0,0,0,0.6)",
          width: "min(740px, 96%)",
          boxShadow: "6px 6px 0 rgba(0,0,0,0.35)",
          borderRadius: 8,
          padding: 16,
          fontFamily: '"Press Start 2P", monospace',
        }}
      >

        <div style={{ marginBottom: 12 }}>
          <p style={{ margin: 0, color: "var(--row-text, #2b2b2b)", fontSize: 16, lineHeight: 1.4 }}>
            {displayMessage}
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button
            type="button"
            className="minecraft-button cancel-btn"
            onClick={onCancel}
            style={{ minWidth: 104 }}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            className={`minecraft-button ${confirmClass}`}
            onClick={onConfirm}
            style={{ minWidth: 104 }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        .minecraft-modal-overlay {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.55);
        }
        /* fallback fonts/spacing so it looks like the alerts theme even if CSS differs */
        .minecraft-modal p { font-family: "Press Start 2P", monospace; }
      `}</style>
    </div>
  );
};

export default MinecraftConfirm;