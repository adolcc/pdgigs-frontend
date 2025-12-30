import React, { useEffect, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";
import FabricOverlay from "./FabricOverlay";
import { Toolbar } from "./toolbar";
GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";
import "../styles/pdf-annotator.css";

const DEFAULT_THEME_MINECRAFT_COLOR = "#00AA00";
const DEFAULT_TEXT_PROPS = {
  fontSize: 18,
  fontFamily: "Arial",
  bold: false,
  italic: false,
  fill: DEFAULT_THEME_MINECRAFT_COLOR,
  backgroundColor: "",
  shadow: false
};

const PdfAnnotator = ({ pdfUrl, initialPage = 1 }) => {
  const wrapperRef = useRef(null);
  const canvasRef = useRef({ c1: null, c2: null });
  const pdfRef = useRef(null);

  const [pageNum, setPageNum] = useState(initialPage);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [scale, setScale] = useState(1.0);
  const [viewMode, setViewMode] = useState("single"); // "single" | "two-up"
  const [centerSingle, setCenterSingle] = useState(true);

  const [activeTool, setActiveTool] = useState(null);
  const [brushColor, setBrushColor] = useState("#8B4513");
  const [brushWidth, setBrushWidth] = useState(4);

  const [textProps, setTextProps] = useState(DEFAULT_TEXT_PROPS);
  const [textSelectionActive, setTextSelectionActive] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!pdfUrl) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        let loadingTask;
        if (pdfUrl instanceof ArrayBuffer || ArrayBuffer.isView(pdfUrl)) {
          loadingTask = getDocument({ data: pdfUrl });
        } else {
          loadingTask = getDocument(pdfUrl);
        }
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        pdfRef.current = pdf;
        setNumPages(pdf.numPages || 0);
        await renderPages();
      } catch (err) {
        console.error("PdfAnnotator: failed to load PDF", err);
      } finally {
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [pdfUrl]);

  useEffect(() => {
    if (!pdfRef.current) return;
    renderPages();
  }, [pageNum, scale, viewMode, centerSingle]);

  useEffect(() => {
    const handler = () => {
      const docFs = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || null;
      setIsFullscreen(!!docFs);
    };
    document.addEventListener("fullscreenchange", handler);
    document.addEventListener("webkitfullscreenchange", handler);
    document.addEventListener("mozfullscreenchange", handler);
    return () => {
      document.removeEventListener("fullscreenchange", handler);
      document.removeEventListener("webkitfullscreenchange", handler);
      document.removeEventListener("mozfullscreenchange", handler);
    };
  }, []);

  async function renderPageToCanvas(pageNumber, canvas) {
    if (!pdfRef.current || !canvas) return;
    try {
      const page = await pdfRef.current.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const DPR = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * DPR);
      canvas.height = Math.floor(viewport.height * DPR);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      const ctx = canvas.getContext("2d");
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport }).promise;
    } catch (e) {
      console.error("renderPageToCanvas error", e);
    }
  }

  async function renderPages() {
    const wrapper = wrapperRef.current && wrapperRef.current.querySelector(".pdf-canvas-wrapper");
    if (!wrapper || !pdfRef.current) return;
    let c1 = canvasRef.current.c1;
    let c2 = canvasRef.current.c2;

    if (!c1) {
      c1 = document.createElement("canvas");
      c1.className = "pdf-page-canvas-1";
      canvasRef.current.c1 = c1;
      wrapper.appendChild(c1);
    }

    await renderPageToCanvas(pageNum, c1);

    const showSecond = viewMode === "two-up" && pageNum < (pdfRef.current.numPages || 0);
    if (showSecond) {
      if (!c2) {
        c2 = document.createElement("canvas");
        c2.className = "pdf-page-canvas-2";
        canvasRef.current.c2 = c2;
        wrapper.appendChild(c2);
      }
      await renderPageToCanvas(pageNum + 1, c2);
      c1.style.marginRight = "12px";
      c2.style.display = "inline-block";
      wrapper.classList.add("two-up");
    } else {
      if (c2) c2.style.display = "none";
      c1.style.marginRight = "0";
      wrapper.classList.remove("two-up");
    }

    try { window.dispatchEvent(new CustomEvent('pdf-annotator-page-rendered')); } catch (e) {}
  }

  const toggleTool = (tool) => {
    setActiveTool((t) => (t === tool ? null : tool));
  };
  const togglePencil = () => toggleTool("pencil");
  const toggleEraser = () => toggleTool("eraser");
  const toggleText = () => toggleTool("text");
  const toggleSelect = () => toggleTool("select");

  const toggleFullscreen = async () => {
    try {
      const el = wrapperRef.current;
      if (!el) return;
      const doc = document;
      const isFs = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement);
      if (!isFs) {
        if (el.requestFullscreen) await el.requestFullscreen();
        else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
        else if (el.mozRequestFullScreen) await el.mozRequestFullScreen();
        setIsFullscreen(true);
      } else {
        if (doc.exitFullscreen) await doc.exitFullscreen();
        else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
        else if (doc.mozCancelFullScreen) await doc.mozCancelFullScreen();
        setIsFullscreen(false);
      }
    } catch (e) {
      console.error("toggleFullscreen failed", e);
    }
  };

  const onSetScale = (s) => setScale(s);
  const onToggleViewMode = () => setViewMode(v => (v === "two-up" ? "single" : "two-up"));
  const onToggleCenter = () => setCenterSingle(s => !s);

  const palette = [
    { color: "#FFFF00", title: "Yellow" },
    { color: "#000000", title: "Black" },
    { color: "#0000FF", title: "Blue" },
    { color: "#00AA00", title: "Green" }
  ];

  const handleSelectionChange = (objProps) => {
    if (!objProps) {
      setTextSelectionActive(false);
      return;
    }
    setTextProps((prev) => ({ ...prev, ...objProps }));
    setTextSelectionActive(true);
  };

  const handleTextPropsChange = (tp) => {
    if (!tp.fill || tp.fill === "transparent") tp.fill = DEFAULT_THEME_MINECRAFT_COLOR;
    setTextProps(tp);
  };

  return (
    <div className={`pdf-annotator ${centerSingle ? "center-single" : ""}`} ref={wrapperRef} style={{ width: "100%", height: "100%", position: "relative" }}>
      <Toolbar
        pageNum={pageNum}
        numPages={numPages}
        onPrev={() => { setActiveTool(null); if (pageNum>1) setPageNum(p=>p-1); }}
        onNext={() => { setActiveTool(null); if (pageNum < numPages) setPageNum(p=>p+1); }}
        activeTool={activeTool}
        onTogglePencil={togglePencil}
        onToggleEraser={toggleEraser}
        onToggleText={toggleText}
        onToggleSelect={toggleSelect}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        onToggleViewMode={onToggleViewMode}
        viewMode={viewMode}
        scale={scale}
        onSetScale={onSetScale}
        palette={palette}
        brushColor={brushColor}
        onColorChange={(c) => { setBrushColor(c); }}
        onColorPickerChange={(c) => { setBrushColor(c); }}
        brushWidth={brushWidth}
        onBrushWidthChange={(w) => setBrushWidth(w)}
        textProps={textProps}
        onTextPropsChange={handleTextPropsChange}
        textSelectionActive={textSelectionActive}
        centerSingle={centerSingle}
        onToggleCenter={onToggleCenter}
      />

      <div className="viewer" style={{ position: "relative", flex: 1 }}>
        <div className="pdf-canvas-wrapper" />
        <div className="overlay-wrapper" />
      </div>

      <FabricOverlay
        containerRef={wrapperRef}
        activeTool={activeTool}
        brushColor={brushColor}
        brushWidth={brushWidth}
        textProps={textProps}
        onSelectionChange={handleSelectionChange}
        scale={scale}
      />

      {loading && <div className="loading-overlay">Loading PDF...</div>}
    </div>
  );
};

export default PdfAnnotator;