import React from "react";
import RangeInput from "./RangeInput";

const PencilControls = ({
  brushColor,
  onColorPickerChange,
  brushWidth,
  onBrushWidthChange,
}) => {
  return (
    <div className="control-panel-mini">
      {/* Selector de color limpio */}
      <input
        type="color"
        className="color-input-square"
        value={brushColor || "#8B4513"}
        onChange={(e) =>
          onColorPickerChange && onColorPickerChange(e.target.value)
        }
      />

      {/* Línea vertical divisoria */}
      <div className="vertical-divider"></div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ color: "#000", fontSize: "14px", fontWeight: "bold" }}>
          ●
        </span>
        <div style={{ width: "60px", display: "flex", alignItems: "center" }}>
          <RangeInput
            value={brushWidth}
            onChange={onBrushWidthChange}
            min={1}
            max={20}
          />
        </div>
        <span style={{ color: "#000", fontSize: "11px", fontWeight: "900" }}>
          {brushWidth}px
        </span>
      </div>
    </div>
  );
};

export default PencilControls;
