import React, { useEffect, useRef, useState, useCallback } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";
import FabricOverlay from "./FabricOverlay";
import Toolbar from "./toolbar/Toolbar";
import "../styles/pdf-annotator.css";
import axiosInstance from "../services/axiosInstance";
import { PDFDocument } from "pdf-lib";
import axios from "axios";

GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

const PdfAnnotator = ({
  pdfUrl,
  scoreId,
  onSaveAnnotations,
  onLoadAnnotations,
  onClose,
  initialPage = 1,
}) => {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const pdfRef = useRef(null);
  const containerRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  const [pageNum, setPageNum] = useState(initialPage);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [annotations, setAnnotations] = useState({});
  const [isDoublePage, setIsDoublePage] = useState(false);

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
      const page1 = await pdfRef.current.getPage(pageNum);
      const page2 = await pdfRef.current.getPage(pageNum + 1);

      const viewport1 = page1.getViewport({ scale });
      const viewport2 = page2.getViewport({ scale });

      const canvas = canvasRef.current;
      canvas.width = (viewport1.width + viewport2.width) * 2;
      canvas.height = Math.max(viewport1.height, viewport2.height) * 2;

      const ctx = canvas.getContext("2d");
      ctx.scale(2, 2);

      await page1.render({ canvasContext: ctx, viewport: viewport1 }).promise;

      ctx.save();
      ctx.translate(viewport1.width, 0);
      await page2.render({ canvasContext: ctx, viewport: viewport2 }).promise;
      ctx.restore();

      console.log("📖 Modo DOBLE PÁGINA activado - Ancho total:", canvas.width);
    } else {
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
      canvasRef.current.height,
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

  const handleDownload = async () => {
    if (!scoreId) {
      alert("Score ID is required for download");
      return;
    }

    try {
      const response = await axiosInstance.get(`/api/scores/${scoreId}/pdf`, {
        responseType: "blob",
      });

      const filename = `annotated-${scoreId}.pdf`;

      const contentType =
        response.headers?.["content-type"] || "application/pdf";
      const blob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      console.log("✅ PDF downloaded successfully");
    } catch (error) {
      console.error("❌ Download failed:", error);
      alert("Failed to download PDF");
    }
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

  const handleSetScale = (newScale) => {
    const clampedScale = Math.max(0.1, Math.min(3, newScale));
    setScale(clampedScale);
  };

  const saveWithDebounce = useCallback(
    (json) => {
      if (!scoreId || !onSaveAnnotations) return;

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        onSaveAnnotations(json, pageNum);
        console.log("💾 Auto-saved annotations");
      }, 1000);
    },
    [scoreId, onSaveAnnotations, pageNum],
  );

  useEffect(() => {
    if (!scoreId || !onSaveAnnotations) return;

    const saveCurrentPageAnnotations = async () => {
      if (annotations[pageNum]) {
        try {
          await onSaveAnnotations(annotations[pageNum], pageNum);
          console.log(`✅ Auto-saved page ${pageNum}`);
        } catch (error) {
          console.error("Auto-save failed:", error);
        }
      }
    };

    saveCurrentPageAnnotations();
  }, [pageNum, annotations[pageNum]]);

  useEffect(() => {
    const loadPageAnnotations = async () => {
      if (!scoreId || !onLoadAnnotations) return;

      try {
        const saved = await onLoadAnnotations(pageNum);
        if (saved?.annotationsJson && saved.annotationsJson.trim() !== "") {
          setAnnotations((prev) => ({
            ...prev,
            [pageNum]: JSON.parse(saved.annotationsJson),
          }));
          console.log(`📂 Loaded saved annotations for page ${pageNum}`);
        }
      } catch (error) {
        console.log("No saved annotations:", error.message);
      }
    };

    loadPageAnnotations();
  }, [scoreId, pageNum]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleExportAndUpload = async () => {
    try {
      console.log("1. Iniciando proceso de exportación...");

      // A. Pedir URL firmada a Java
      const response = await axiosInstance.get(
        `/api/scores/${scoreId}/annotations/upload-url`,
      );
      const { uploadUrl } = response.data;

      // B. Descargar PDF con Seguridad
      console.log("Descargando copia limpia del PDF...");
      const pdfResponse = await axiosInstance.get(
        `/api/scores/${scoreId}/pdf`,
        {
          responseType: "arraybuffer",
        },
      );
      const existingPdfBytes = pdfResponse.data;

      // C. Cargar el PDF en pdf-lib
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      // D. Obtener la imagen de tus dibujos (FabricJS)
      const fabricCanvas = document.querySelector(".upper-canvas");
      if (!fabricCanvas) throw new Error("No se encontró el lienzo de dibujo");

      const annotationImageUri = fabricCanvas.toDataURL({
        format: "png",
        multiplier: 2,
      });
      const annotationImage = await pdfDoc.embedPng(annotationImageUri);

      // E. Pegar la imagen en la página actual
      const pages = pdfDoc.getPages();
      const currentPage = pages[pageNum - 1];
      const { width, height } = currentPage.getSize();

      currentPage.drawImage(annotationImage, {
        x: 0,
        y: 0,
        width: width,
        height: height,
      });

      // F. Generar los bytes del nuevo PDF
      const pdfBytes = await pdfDoc.save();

      console.log("2. Subiendo PDF modificado a S3...");

      // G. Subida a Amazon S3 usando FETCH nativo
      // Usamos fetch porque NO añade cabeceras de Authorization automáticamente
      const s3Response = await fetch(uploadUrl, {
        method: "PUT",
        body: pdfBytes,
        headers: {
          "Content-Type": "application/pdf",
        },
      });

      if (!s3Response.ok) {
        const errorText = await s3Response.text();
        console.error("Error detalle S3:", errorText);
        throw new Error(`Amazon S3 rechazó la subida: ${s3Response.status}`);
      }

      alert("¡Éxito total! Tu partitura con anotaciones ya está en Amazon S3.");
    } catch (error) {
      console.error("Error detallado:", error);
      alert("Error al guardar: " + error.message);
    }
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
          justifyContent: "space-between",
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
          onSaveToCloud={handleExportAndUpload}
          isDoublePage={isDoublePage}
          onToggleDoublePage={() => setIsDoublePage(!isDoublePage)}
          brushColor={brushColor}
          onColorPickerChange={setBrushColor}
          brushWidth={brushWidth}
          onBrushWidthChange={setBrushWidth}
          textProps={textProps}
          onTextPropsChange={setTextProps}
        />
        <button
          onClick={onClose}
          className="minecraft-button small icon"
          style={{
            marginLeft: "8px",
            fontSize: "16px",
            padding: "0 6px",
            height: "24px",
            minWidth: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Close Annotation Editor"
        >
          ✕
        </button>
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
            onSaveAnnotations={(json) => {
              setAnnotations((prev) => ({ ...prev, [pageNum]: json }));
              saveWithDebounce(json);
            }}
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
