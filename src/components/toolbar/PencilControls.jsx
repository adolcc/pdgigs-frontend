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
      <input
        type="color"
        className="color-input-square"
        value={brushColor || "#8B4513"}
        onChange={(e) =>
          onColorPickerChange && onColorPickerChange(e.target.value)
        }
      />
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontSize: "12px" }}>●</span>
        <div style={{ width: "50px" }}>
          <RangeInput
            value={brushWidth}
            onChange={onBrushWidthChange}
            min={1}
            max={20}
          />
        </div>
        <span style={{ fontSize: "10px", fontWeight: "800" }}>
          {brushWidth}px
        </span>
      </div>
    </div>
  );
};
export default PencilControls;
