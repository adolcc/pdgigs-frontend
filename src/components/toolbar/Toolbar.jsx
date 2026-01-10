import React from "react";
import ToolButton from "./ToolButton";
import TextControls from "./TextControls";
import PencilControls from "./PencilControls";
import ZoomSelect from "./ZoomSelect";
import {
  IconSelect,
  IconPencil,
  IconText,
  IconEraser,
  IconDownload,
  IconFullscreen,
  IconDoublePage,
} from "./Icons";

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
  scale,
  onSetScale,
  onDownload,
  isDoublePage,
  onToggleDoublePage,
}) => {
  const presets = [25, 50, 75, 100, 125, 150, 200, 300];

  const groupStyle = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "0 8px",
    borderRight: "0.5px solid rgba(0,0,0,0.1)",
    height: "100%",
  };

  const handleZoomOut = () => {
    const newScale = Math.max(0.1, scale - 0.1);
    onSetScale(parseFloat(newScale.toFixed(1)));
  };

  const handleZoomIn = () => {
    const newScale = Math.min(3, scale + 0.1);
    onSetScale(parseFloat(newScale.toFixed(1)));
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* 1. NAVEGACIÓN - Mejor alineado */}
      <div style={groupStyle}>
        <button
          onClick={onPrev}
          disabled={pageNum <= 1}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            padding: "6px 8px",
            borderRadius: "4px",
            cursor: pageNum <= 1 ? "not-allowed" : "pointer",
            opacity: pageNum <= 1 ? 0.5 : 1,
            fontSize: "16px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "32px",
            height: "32px",
          }}
        >
          {"<"}
        </button>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minWidth: "80px",
          }}
        >
          <span
            style={{
              color: "#fff",
              fontSize: "13px",
              fontWeight: "bold",
              letterSpacing: "0.5px",
            }}
          >
            {pageNum} / {numPages}
          </span>
          {isDoublePage && (
            <span
              style={{
                color: "#f0e6d2",
                fontSize: "11px",
                marginTop: "2px",
              }}
            >
              📖 doble view
            </span>
          )}
        </div>

        <button
          onClick={onNext}
          disabled={pageNum >= numPages}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            padding: "6px 8px",
            borderRadius: "4px",
            cursor: pageNum >= numPages ? "not-allowed" : "pointer",
            opacity: pageNum >= numPages ? 0.5 : 1,
            fontSize: "16px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "32px",
            height: "32px",
          }}
        >
          {">"}
        </button>
      </div>

      {/* 2. HERRAMIENTAS PRINCIPALES */}
      <div style={groupStyle}>
        <ToolButton
          onClick={onToggleSelect}
          active={activeTool === "select"}
          title="Seleccionar"
          style={{ padding: "6px" }}
        >
          <IconSelect />
        </ToolButton>
        <ToolButton
          onClick={onTogglePencil}
          active={activeTool === "pencil"}
          title="Lápiz"
          style={{ padding: "6px" }}
        >
          <IconPencil />
        </ToolButton>
        <ToolButton
          onClick={onToggleText}
          active={activeTool === "text"}
          title="Texto"
          style={{ padding: "6px" }}
        >
          <IconText />
        </ToolButton>
        <ToolButton
          onClick={onToggleEraser}
          active={activeTool === "eraser"}
          title="Borrador"
          style={{ padding: "6px" }}
        >
          <IconEraser />
        </ToolButton>
        <ToolButton
          onClick={onToggleDoublePage}
          active={isDoublePage}
          title={isDoublePage ? "Doble página (Activo)" : "Doble página"}
          style={{
            background: isDoublePage ? "#5d4037" : "transparent",
            border: isDoublePage ? "1px solid #8B4513" : "none",
            padding: "6px",
          }}
        >
          <IconDoublePage />
        </ToolButton>
      </div>

      {/* 3. CONTROLES DINÁMICOS */}
      <div style={groupStyle}>
        {activeTool === "pencil" && (
          <PencilControls
            brushColor={brushColor}
            onColorPickerChange={onColorPickerChange}
            brushWidth={brushWidth}
            onBrushWidthChange={onBrushWidthChange}
          />
        )}
        {activeTool === "text" && (
          <TextControls textProps={textProps} onChange={onTextPropsChange} />
        )}
      </div>

      {/* 4. ZOOM Y ACCIONES - Diseño más integrado */}
      <div
        style={{
          ...groupStyle,
          borderRight: "none",
          gap: "8px",
          paddingRight: "15px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            background: "rgba(93, 64, 55, 0.3)",
            borderRadius: "4px",
            padding: "2px 6px",
            border: "0.5px solid rgba(139, 69, 19, 0.3)",
          }}
        >
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.1}
            style={{
              background: "transparent",
              border: "none",
              color: scale <= 0.1 ? "rgba(255,255,255,0.3)" : "#fff",
              padding: "4px 6px",
              cursor: scale <= 0.1 ? "not-allowed" : "pointer",
              fontSize: "18px",
              fontWeight: "bold",
              minWidth: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Zoom Out"
          >
            −
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              minWidth: "85px",
            }}
          >
            <ZoomSelect
              value={Math.round(scale * 100)}
              onChange={(val) => onSetScale(val / 100)}
              options={presets}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                padding: "4px 2px",
                fontSize: "13px",
                fontWeight: "bold",
                cursor: "pointer",
                minWidth: "60px",
              }}
            />

            <span
              style={{
                color: "#f0e6d2",
                fontSize: "12px",
                fontWeight: "bold",
                opacity: 0.8,
              }}
            >
              {Math.round(scale * 100)}%
            </span>
          </div>

          <button
            onClick={handleZoomIn}
            disabled={scale >= 3}
            style={{
              background: "transparent",
              border: "none",
              color: scale >= 3 ? "rgba(255,255,255,0.3)" : "#fff",
              padding: "4px 6px",
              cursor: scale >= 3 ? "not-allowed" : "pointer",
              fontSize: "18px",
              fontWeight: "bold",
              minWidth: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Zoom In"
          >
            +
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <ToolButton
            onClick={onDownload}
            title="Descargar"
            style={{ padding: "6px" }}
          >
            <IconDownload />
          </ToolButton>
          <ToolButton
            onClick={onToggleFullscreen}
            active={isFullscreen}
            title="Pantalla Completa"
            style={{ padding: "6px" }}
          >
            <IconFullscreen />
          </ToolButton>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
