import React, { useEffect, useRef } from "react";
import { attachTextHandlers } from "./fabric/TextTools.js";

const FabricOverlay = ({
  containerRef,
  activeTool,
  brushColor = "#8B4513",
  brushWidth = 4,
  textProps = {},
  onSelectionChange,
  onPathCreated,
  scale = 1,
}) => {
  const overlayRef = useRef(null);
  const fabricRef = useRef(null);
  const textToolRef = useRef(null);
  const fabricLibRef = useRef(null);
  const prevScaleRef = useRef(scale);

  const activeToolRef = useRef(activeTool);
  const textPropsRef = useRef(textProps);

  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);
  useEffect(() => {
    textPropsRef.current = textProps;
  }, [textProps]);

  useEffect(() => {
    let mounted = true;
    async function init() {
      if (!containerRef || !containerRef.current) return;
      const overlayWrapper =
        containerRef.current.querySelector(".overlay-wrapper");
      const pdfWrapper = containerRef.current.querySelector(
        ".pdf-canvas-wrapper"
      );
      if (!overlayWrapper || !pdfWrapper) return;

      if (!overlayRef.current) {
        const el = document.createElement("canvas");
        el.className = "fabric-overlay";
        el.style.position = "absolute";
        el.style.top = "0";
        el.style.left = "0";
        overlayRef.current = el;
        overlayWrapper.appendChild(el);
      }

      const canvasEl = overlayRef.current;
      canvasEl.width = pdfWrapper.clientWidth;
      canvasEl.height = pdfWrapper.clientHeight;

      if (!window.fabric) {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js";
        document.head.appendChild(script);
        await new Promise((resolve) => (script.onload = resolve));
      }

      if (!mounted) return;
      const fabric = window.fabric;
      fabricLibRef.current = fabric;

      const f = new fabric.Canvas(canvasEl, {
        selection: activeTool === "select",
        isDrawingMode: activeTool === "pencil",
        allowTouchScrolling: false, // Evita conflictos en tablets
      });
      fabricRef.current = f;

      f.on("path:created", (e) => onPathCreated && onPathCreated(e.path));
      f.on(
        "selection:created",
        (e) => onSelectionChange && onSelectionChange(e.selected)
      );
      f.on(
        "selection:updated",
        (e) => onSelectionChange && onSelectionChange(e.selected)
      );
      f.on(
        "selection:cleared",
        () => onSelectionChange && onSelectionChange([])
      );

      textToolRef.current = attachTextHandlers(f, {
        activeToolRef,
        textPropsRef,
        onSelectionChange,
      });
    }

    init();
    return () => {
      mounted = false;
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
      }
      if (overlayRef.current && overlayRef.current.parentNode) {
        overlayRef.current.parentNode.removeChild(overlayRef.current);
        overlayRef.current = null;
      }
    };
  }, [containerRef]);

  useEffect(() => {
    const f = fabricRef.current;
    const el = overlayRef.current;

    if (el) {
      if (activeTool) {
        el.style.pointerEvents = "auto";
        el.style.zIndex = "5000"; // Se pone al frente de todo
        el.style.cursor = activeTool === "text" ? "text" : "crosshair";
      } else {
        el.style.pointerEvents = "none";
        el.style.zIndex = "1000"; // Se va al fondo
        el.style.cursor = "default";
      }
    }

    if (!f) return;

    // Forzar actualización de modo dibujo
    f.isDrawingMode = activeTool === "pencil";
    if (f.isDrawingMode && f.freeDrawingBrush) {
      f.freeDrawingBrush.color = brushColor;
      f.freeDrawingBrush.width = parseInt(brushWidth, 10) || 4;
    }

    f.selection = activeTool === "select";
    f.skipTargetFind = activeTool === "pencil"; // Optimiza rendimiento al dibujar

    f.requestRenderAll();
  }, [activeTool, brushColor, brushWidth]);

  useEffect(() => {
    const f = fabricRef.current;
    const prev = prevScaleRef.current || 1;
    const next = scale || 1;
    if (f && Math.abs(next - prev) > 1e-6) {
      const ratio = next / prev;
      f.getObjects().forEach((o) => {
        o.left *= ratio;
        o.top *= ratio;
        o.scaleX *= ratio;
        o.scaleY *= ratio;
        o.setCoords();
      });
      f.setDimensions({
        width: f.width * ratio,
        height: f.height * ratio,
      });
      f.requestRenderAll();
    }
    prevScaleRef.current = next;
  }, [scale]);

  return null;
};

export default FabricOverlay;
