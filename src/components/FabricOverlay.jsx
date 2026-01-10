import React, { useEffect, useRef, useCallback, useState } from "react";
import * as fabricLib from "fabric";
import { attachTextHandlers } from "./fabric/TextTools";

const fabric = fabricLib.fabric || fabricLib;

const FabricOverlay = ({
  containerRef,
  activeTool,
  scale,
  pageNum,
  savedData,
  onSaveAnnotations,
  brushColor,
  brushWidth,
  textProps,
  isDoublePage,
}) => {
  const fabricRef = useRef(null);
  const textHandlersRef = useRef(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const currentScaleRef = useRef(scale || 1);
  const isCreatingTextRef = useRef(false);
  const initializingRef = useRef(false);
  const previousPageNumRef = useRef(pageNum);
  const activeToolRef = useRef(activeTool);

  // Actualizar ref cuando cambia activeTool
  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  // Función para guardar anotaciones
  const saveAnnotations = useCallback(() => {
    const f = fabricRef.current;
    if (!f) return;

    const data = f.toJSON();
    data.metadata = {
      scale: currentScaleRef.current,
      pageNum: pageNum,
    };
    onSaveAnnotations(data);
  }, [pageNum, onSaveAnnotations]);

  // Escalar objetos cuando cambia el zoom
  const scaleObjects = useCallback((newScale) => {
    const f = fabricRef.current;
    if (!f) return;

    const oldScale = currentScaleRef.current;
    const scaleRatio = newScale / oldScale;

    if (Math.abs(scaleRatio - 1) < 0.001) return;

    console.log("📏 Escalando objetos:", oldScale, "→", newScale);

    f.getObjects().forEach((obj) => {
      obj.left = (obj.left || 0) * scaleRatio;
      obj.top = (obj.top || 0) * scaleRatio;
      obj.scaleX = (obj.scaleX || 1) * scaleRatio;
      obj.scaleY = (obj.scaleY || 1) * scaleRatio;

      if (obj.type === "i-text" || obj.type === "textbox") {
        if (obj.originalFontSize === undefined) {
          obj.originalFontSize = obj.fontSize;
        }
        obj.fontSize = (obj.fontSize || 20) * scaleRatio;
      }

      obj.setCoords();
    });

    currentScaleRef.current = newScale;
    f.requestRenderAll();
  }, []);

  // Función para aplicar la herramienta actual
  const applyCurrentTool = useCallback(
    (f) => {
      if (!f || activeTool === undefined || activeTool === null) {
        console.log("⚠️ Canvas no listo o herramienta no definida");
        return;
      }

      console.log("🔧 Aplicando herramienta:", activeTool);

      f.isDrawingMode = activeTool === "pencil";
      f.selection = activeTool === "select";

      f.forEachObject((obj) => {
        if (activeTool === "select") {
          obj.selectable = true;
          obj.evented = true;
        } else if (activeTool === "text") {
          obj.selectable = true;
          obj.evented = true;
        } else if (activeTool === "pencil") {
          obj.selectable = false;
          obj.evented = false;
        } else if (activeTool === "eraser") {
          obj.selectable = false;
          obj.evented = true;
        } else {
          obj.selectable = false;
          obj.evented = false;
        }
      });

      f.off("mouse:down");
      f.off("mouse:move");
      f.off("mouse:up");

      if (activeTool === "eraser") {
        console.log("🧹 Borrador activado");
        f.on("mouse:down", (opt) => {
          if (opt.target) {
            f.remove(opt.target);
            saveAnnotations();
            f.requestRenderAll();
          }
        });
      } else if (activeTool === "text") {
        console.log("📝 Texto activado");

        if (textHandlersRef.current && textHandlersRef.current.onMouseDown) {
          f.on("mouse:down", textHandlersRef.current.onMouseDown);
        }
      }

      if (f.freeDrawingBrush) {
        const adjustedBrushWidth = Math.max(1, brushWidth / (scale || 1));
        f.freeDrawingBrush.width = adjustedBrushWidth;
        f.freeDrawingBrush.color = brushColor;

        if (f.isDrawingMode) {
          setTimeout(() => {
            if (f.freeDrawingBrush && f.freeDrawingBrush.canvas) {
              try {
                f.freeDrawingBrush.width = adjustedBrushWidth;
                f.freeDrawingBrush.color = brushColor;
                f.requestRenderAll();
              } catch (e) {
                console.warn("⚠️ Error al configurar brush:", e.message);
              }
            }
          }, 0);
        }
      }

      f.requestRenderAll();
    },
    [activeTool, brushColor, brushWidth, scale, saveAnnotations]
  );

  // Efecto principal: inicialización y cambio de página
  useEffect(() => {
    if (!containerRef.current || initializingRef.current) return;

    // Solo inicializar si cambió la página
    if (previousPageNumRef.current === pageNum && fabricRef.current) {
      return;
    }

    initializingRef.current = true;
    previousPageNumRef.current = pageNum;

    console.log("🔄 Inicializando overlay para página:", pageNum);

    const initOverlay = () => {
      const pdfCanvas = containerRef.current.querySelector("canvas");
      const overlayWrapper =
        containerRef.current.querySelector(".overlay-wrapper");

      if (!pdfCanvas || !overlayWrapper) {
        console.log("⚠️ No se encontraron elementos del PDF");
        initializingRef.current = false;
        return;
      }

      if (fabricRef.current) {
        if (textHandlersRef.current?.detach) {
          textHandlersRef.current.detach();
        }
        const f = fabricRef.current;
        f.off();
        f.dispose();
        fabricRef.current = null;
      }

      const el = document.createElement("canvas");
      overlayWrapper.innerHTML = "";
      overlayWrapper.appendChild(el);

      el.style.position = "absolute";
      el.style.top = "0";
      el.style.left = "0";
      el.style.width = pdfCanvas.width + "px";
      el.style.height = pdfCanvas.height + "px";
      el.style.pointerEvents = "auto";

      const f = new fabric.Canvas(el, {
        width: pdfCanvas.width,
        height: pdfCanvas.height,
        preserveObjectStacking: true,
        isDrawingMode: false,
        selection: false,
        stopContextMenu: true,
        fireRightClick: true,
      });

      f.hoverCursor = "pointer";
      f.defaultCursor = "default";
      f.perPixelTargetFind = true;
      f.targetFindTolerance = 5;

      console.log("✅ Overlay creado:", pdfCanvas.width, "x", pdfCanvas.height);

      f.freeDrawingBrush = new fabric.PencilBrush(f);
      if (f.freeDrawingBrush) {
        const adjustedBrushWidth = Math.max(1, brushWidth / (scale || 1));
        f.freeDrawingBrush.width = adjustedBrushWidth;
        f.freeDrawingBrush.color = brushColor;

        if (f.freeDrawingBrush.initialize) {
          f.freeDrawingBrush.initialize();
        }
      }

      currentScaleRef.current = scale || 1;

      if (savedData && savedData.objects) {
        f.loadFromJSON(savedData, () => {
          console.log("📦 Datos cargados");

          const savedScale = savedData.metadata?.scale || 1;
          if (Math.abs(savedScale - (scale || 1)) > 0.001) {
            f.getObjects().forEach((obj) => {
              const scaleRatio = (scale || 1) / savedScale;
              obj.left = (obj.left || 0) * scaleRatio;
              obj.top = (obj.top || 0) * scaleRatio;
              obj.scaleX = (obj.scaleX || 1) * scaleRatio;
              obj.scaleY = (obj.scaleY || 1) * scaleRatio;

              if (obj.type === "i-text" || obj.type === "textbox") {
                obj.fontSize = (obj.fontSize || 20) * scaleRatio;
                obj.originalFontSize = obj.fontSize;
              }

              obj.setCoords();
            });
          }

          f.requestRenderAll();
        });
      }

      const saveHandler = () => {
        setTimeout(saveAnnotations, 50);
      };

      f.on("object:added", saveHandler);
      f.on("object:modified", saveHandler);
      f.on("object:removed", saveHandler);

      fabricRef.current = f;

      textHandlersRef.current = attachTextHandlers(f, fabric, {
        getActiveTool: () => activeToolRef.current,
        getTextProps: () => textProps,
        onCreateText: () => {
          isCreatingTextRef.current = true;
          setTimeout(() => {
            isCreatingTextRef.current = false;
          }, 100);
        },
      });

      applyCurrentTool(f);

      setCanvasReady(true);
      initializingRef.current = false;

      f.requestRenderAll();
    };

    const timeoutId = setTimeout(() => {
      requestAnimationFrame(initOverlay);
    }, 150);

    return () => {
      clearTimeout(timeoutId);
      if (initializingRef.current) {
        initializingRef.current = false;
      }
    };
  }, [
    pageNum,
    scale,
    brushColor,
    brushWidth,
    textProps,
    containerRef,
    savedData,
    applyCurrentTool,
    saveAnnotations,
  ]);

  // Efecto para cambiar herramienta
  useEffect(() => {
    if (
      !fabricRef.current ||
      !canvasReady ||
      initializingRef.current ||
      activeTool === undefined
    ) {
      return;
    }

    console.log("🔄 Cambiando herramienta a:", activeTool);
    applyCurrentTool(fabricRef.current);
  }, [activeTool, applyCurrentTool, canvasReady]);

  // Efecto para redimensionamiento (zoom)
  useEffect(() => {
    if (
      !fabricRef.current ||
      !containerRef.current ||
      !canvasReady ||
      initializingRef.current
    ) {
      return;
    }

    const pdfCanvas = containerRef.current.querySelector("canvas");
    if (!pdfCanvas) return;

    fabricRef.current.setDimensions({
      width: pdfCanvas.width,
      height: pdfCanvas.height,
    });

    const fabricElement = fabricRef.current.getElement();
    if (fabricElement) {
      fabricElement.style.width = pdfCanvas.width + "px";
      fabricElement.style.height = pdfCanvas.height + "px";
    }

    if (fabricRef.current.freeDrawingBrush) {
      const adjustedBrushWidth = Math.max(1, brushWidth / (scale || 1));
      fabricRef.current.freeDrawingBrush.width = adjustedBrushWidth;
      fabricRef.current.freeDrawingBrush.color = brushColor;
    }

    scaleObjects(scale || 1);

    fabricRef.current.requestRenderAll();
  }, [scale, containerRef, canvasReady, brushWidth, brushColor, scaleObjects]);

  // Efecto para propiedades de pincel
  useEffect(() => {
    const f = fabricRef.current;
    if (!f || !f.freeDrawingBrush || initializingRef.current) return;

    f.freeDrawingBrush.color = brushColor;

    if (f.isDrawingMode) {
      setTimeout(() => {
        if (f.freeDrawingBrush && f.freeDrawingBrush.canvas) {
          try {
            f.freeDrawingBrush.color = brushColor;
            f.requestRenderAll();
          } catch (e) {
            console.warn("⚠️ Error al configurar brush (retry):", e.message);
          }
        }
      }, 0);
    }
  }, [brushColor]);

  // Efecto para propiedades de texto
  useEffect(() => {
    if (!textHandlersRef.current?.applyTextPropsToActive || !fabricRef.current)
      return;

    textHandlersRef.current.applyTextPropsToActive(textProps);
  }, [textProps]);

  // Efecto para limpieza
  useEffect(() => {
    return () => {
      if (fabricRef.current) {
        if (textHandlersRef.current?.detach) {
          textHandlersRef.current.detach();
        }
        fabricRef.current.dispose();
        fabricRef.current = null;
      }
      setCanvasReady(false);
      initializingRef.current = false;
    };
  }, []);

  return null;
};

export default FabricOverlay;
