import React from "react";

const TextControls = ({ textProps = {}, onChange }) => {
  const set = (patch) => onChange && onChange({ ...textProps, ...patch });
  return (
    <div className="control-panel-mini">
      {/* Tamaño de fuente */}
      <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
        <span className="tiny-icon">A↕</span>
        <input
          type="number"
          className="mini-input-num"
          value={textProps.fontSize || 18}
          onChange={(e) =>
            set({ fontSize: parseInt(e.target.value, 10) || 12 })
          }
        />
      </div>

      <span style={{ color: "#d1c4b9" }}>|</span>

      {/* Color de texto */}
      <input
        type="color"
        className="color-input-square"
        value={textProps.fill || "#8B4513"}
        onChange={(e) => set({ fill: e.target.value })}
      />

      {/* Negrita */}
      <button
        className={`mini-toggle ${textProps.bold ? "active" : ""}`}
        onClick={() => set({ bold: !textProps.bold })}
        style={{ fontWeight: "bold" }}
      >
        B
      </button>
    </div>
  );
};

export default TextControls;
