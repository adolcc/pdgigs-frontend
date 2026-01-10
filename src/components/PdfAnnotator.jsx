import React, { useEffect, useRef, useState, useCallback } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";
import FabricOverlay from "./FabricOverlay";
import Toolbar from "./toolbar/Toolbar";
import "../styles/pdf-annotator.css";

GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

const PdfAnnotator = ({ pdfUrl, initialPage = 1 }) => {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const pdfRef = useRef(null);
  const containerRef = useRef(null);

  const [pageNum, setPageNum] = useState(initialPage);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [annotations, setAnnotations] = useState({});
  const [isDoublePage, setIsDoublePage] = useState(false);

  // Estados de configuración de herramientas
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushWidth, setBrushWidth] = useState(5);
  const [textProps, setTextProps] = useState({
    fontSize: 18,
    fill: "#000000",
    bold: false,
  });

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFs);
    return () => document.removeEventListener("fullscreenchange", handleFs);
  }, []);

  useEffect(() => {
    if (!pdfUrl) return;
    getDocument(pdfUrl).promise.then((pdf) => {
      pdfRef.current = pdf;
      setNumPages(pdf.numPages);
      renderPage();
    });
  }, [pdfUrl]);

  const renderPage = useCallback(async () => {
    if (!pdfRef.current || !canvasRef.current) return;

    console.log("🔄 Renderizando página:", {
      page: pageNum,
      scale,
      doublePage: isDoublePage,
      numPages,
    });

    if (isDoublePage && pageNum < numPages) {
      // Renderizar dos páginas
      const page1 = await pdfRef.current.getPage(pageNum);
      const page2 = await pdfRef.current.getPage(pageNum + 1);

      const viewport1 = page1.getViewport({ scale });
      const viewport2 = page2.getViewport({ scale });

      // Canvas más ancho para dos páginas
      const canvas = canvasRef.current;
      canvas.width = (viewport1.width + viewport2.width) * 2;
      canvas.height = Math.max(viewport1.height, viewport2.height) * 2;

      const ctx = canvas.getContext("2d");
      ctx.scale(2, 2);

      // Renderizar primera página
      await page1.render({ canvasContext: ctx, viewport: viewport1 }).promise;

      // Renderizar segunda página al lado
      ctx.save();
      ctx.translate(viewport1.width, 0);
      await page2.render({ canvasContext: ctx, viewport: viewport2 }).promise;
      ctx.restore();

      console.log("📖 Modo DOBLE PÁGINA activado - Ancho total:", canvas.width);
    } else {
      // Página simple
      const page = await pdfRef.current.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;

      canvas.width = viewport.width * 2;
      canvas.height = viewport.height * 2;

      const ctx = canvas.getContext("2d");
      ctx.scale(2, 2);

      await page.render({ canvasContext: ctx, viewport }).promise;

      console.log("📄 Modo PÁGINA SIMPLE activado");
    }

    console.log(
      "📏 PDF Canvas size:",
      canvasRef.current.width,
      "x",
      canvasRef.current.height
    );
  }, [pageNum, scale, isDoublePage, numPages]);

  useEffect(() => {
    renderPage();
  }, [pageNum, scale, isDoublePage, renderPage]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement)
      document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  const handleDownload = () => {
    console.log("Enviando anotaciones al Backend Java:", annotations);
    alert("Preparando descarga...");
  };

  const handlePrevPage = () => {
    if (isDoublePage && pageNum > 1) {
      setPageNum((p) => Math.max(1, p - 2));
    } else {
      setPageNum((p) => Math.max(1, p - 1));
    }
  };

  const handleNextPage = () => {
    if (isDoublePage && pageNum + 1 < numPages) {
      setPageNum((p) => Math.min(numPages - 1, p + 2));
    } else {
      setPageNum((p) => Math.min(numPages, p + 1));
    }
  };

  // Función para ajustar el zoom
  const handleSetScale = (newScale) => {
    // Permitir zoom desde 0.1 (10%) hasta 3 (300%)
    const clampedScale = Math.max(0.1, Math.min(3, newScale));
    setScale(clampedScale);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#1a1a1a",
        position: "fixed",
        top: 0,
        left: 0,
        overflow: "hidden",
      }}
    >
      <header
        className="toolbar pdf-annotator"
        style={{
          minHeight: "32px",
          height: "32px",
          width: "100%",
          backgroundColor: "#b09b77",
          display: "flex",
          alignItems: "center",
          padding: "1px 4px",
          borderBottom: "1px solid #5d4037",
          zIndex: 1000,
          boxSizing: "border-box",
          flexShrink: 0,
        }}
      >
        <Toolbar
          pageNum={pageNum}
          numPages={numPages}
          onPrev={handlePrevPage}
          onNext={handleNextPage}
          onToggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
          scale={scale}
          onSetScale={handleSetScale}
          activeTool={activeTool}
          onTogglePencil={() =>
            setActiveTool(activeTool === "pencil" ? null : "pencil")
          }
          onToggleEraser={() =>
            setActiveTool(activeTool === "eraser" ? null : "eraser")
          }
          onToggleText={() =>
            setActiveTool(activeTool === "text" ? null : "text")
          }
          onToggleSelect={() =>
            setActiveTool(activeTool === "select" ? null : "select")
          }
          onDownload={handleDownload}
          isDoublePage={isDoublePage}
          onToggleDoublePage={() => setIsDoublePage(!isDoublePage)}
          brushColor={brushColor}
          onColorPickerChange={setBrushColor}
          brushWidth={brushWidth}
          onBrushWidthChange={setBrushWidth}
          textProps={textProps}
          onTextPropsChange={setTextProps}
        />
      </header>

      <main
        ref={containerRef}
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "20px",
          backgroundColor: "#111",
        }}
      >
        <div
          ref={wrapperRef}
          style={{
            position: "relative",
            width: "fit-content",
            height: "fit-content",
            boxShadow: "0 0 40px rgba(0,0,0,0.6)",
            minWidth: isDoublePage ? "100%" : "auto",
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              display: "block",
              backgroundColor: "white",
              maxWidth: isDoublePage ? "100%" : "none",
            }}
          />
          <div
            className="overlay-wrapper"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 100,
              pointerEvents: "auto",
            }}
          />
          <FabricOverlay
            containerRef={wrapperRef}
            activeTool={activeTool}
            scale={scale}
            pageNum={pageNum}
            savedData={annotations[pageNum]}
            onSaveAnnotations={(json) =>
              setAnnotations((prev) => ({ ...prev, [pageNum]: json }))
            }
            brushColor={brushColor}
            brushWidth={brushWidth}
            textProps={textProps}
            isDoublePage={isDoublePage}
          />
        </div>
      </main>
    </div>
  );
};

export default PdfAnnotator;
