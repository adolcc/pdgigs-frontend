import React from "react";
import ToolButton from "./ToolButton";
import TextControls from "./TextControls";
import PencilControls from "./PencilControls";
import ZoomSelect from "./ZoomSelect";
import "../../styles/pdf-annotator.css";

const Toolbar = ({
  pageNum,
  numPages,
  onPrev,
  onNext,
  activeTool,
  onTogglePencil,
  onToggleEraser,
  onToggleText,
  onToggleSelect,
  onToggleFullscreen,
  isFullscreen,
  brushColor,
  onColorPickerChange,
  brushWidth,
  onBrushWidthChange,
  textProps,
  onTextPropsChange,
  textSelectionActive,
  scale,
  onSetScale,
  viewMode,
  onToggleViewMode,
}) => {
  const presets = [50, 75, 100, 125, 150, 200];

  return (
    <div className="toolbar">
      {/* Navegación */}
      <div className="toolbar-group">
        <button onClick={onPrev}>◀</button>
        <span className="page-indicator-mini">
          {pageNum}/{numPages}
        </span>
        <button onClick={onNext}>▶</button>
      </div>

      {/* Herramientas Principales */}
      <div className="toolbar-group border-left">
        <ToolButton
          onClick={onTogglePencil}
          active={activeTool === "pencil"}
          title="Lápiz"
        >
          ✏️
        </ToolButton>
        <ToolButton
          onClick={onToggleText}
          active={activeTool === "text"}
          title="Texto"
        >
          <b>T</b>
        </ToolButton>
        <ToolButton
          onClick={onToggleEraser}
          active={activeTool === "eraser"}
          title="Borrador"
        >
          🧼
        </ToolButton>
        <ToolButton
          onClick={onToggleSelect}
          active={activeTool === "select"}
          title="Seleccionar"
        >
          ↖️
        </ToolButton>
      </div>

      {/* Vista y Pantalla Completa */}
      <div className="toolbar-group border-left">
        <ToolButton
          onClick={onToggleViewMode}
          active={viewMode === "double"}
          title="Vista"
        >
          {viewMode === "single" ? "📄" : "📖"}
        </ToolButton>
        <ToolButton
          onClick={onToggleFullscreen}
          active={isFullscreen}
          title="Fullscreen"
        >
          {isFullscreen ? "🔳" : "⛶"}
        </ToolButton>
      </div>

      {/* Paneles de Ajuste */}
      <div className="toolbar-dynamic-panel">
        {activeTool === "pencil" && (
          <PencilControls
            brushColor={brushColor}
            onColorPickerChange={onColorPickerChange}
            brushWidth={brushWidth}
            onBrushWidthChange={onBrushWidthChange}
          />
        )}
        {(activeTool === "text" || textSelectionActive) && (
          <TextControls textProps={textProps} onChange={onTextPropsChange} />
        )}
      </div>

      <div style={{ flex: 1 }} />

      {/* Zoom */}
      <div className="toolbar-group border-left">
        <button onClick={() => onSetScale(scale - 0.25)}>-</button>
        <ZoomSelect
          value={Math.round(scale * 100)}
          onChange={onSetScale}
          options={presets}
        />
        <button onClick={() => onSetScale(scale + 0.25)}>+</button>
      </div>
    </div>
  );
};

export default Toolbar;
