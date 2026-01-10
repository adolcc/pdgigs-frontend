const FALLBACK_COLOR = "#8B4513";

function normalizeColorOrFallback(col) {
  if (!col) return FALLBACK_COLOR;
  return String(col).trim();
}

export function attachTextHandlers(canvas, fabricLib, opts = {}) {
  if (!canvas || !fabricLib)
    return {
      detach: () => {},
      applyTextPropsToActive: () => {},
      onMouseDown: () => {},
    };

  const getActiveTool = opts.getActiveTool || (() => null);
  const getTextProps = opts.getTextProps || (() => ({}));
  const onCreateText = opts.onCreateText || (() => {});

  let isEditing = false;
  let lastClickTime = 0;
  let clickTimeout = null;

  const onMouseDown = (opt) => {
    const active = getActiveTool();

    // Debug más claro
    console.log(
      "🖱️ TextTools - Tool actual:",
      active,
      "Es texto?:",
      active === "text"
    );

    // IMPORTANTE: Check más flexible para tool de texto
    if (active !== "text") {
      console.log("❌ TextTools - No es modo texto o herramienta es:", active);
      return;
    }

    console.log("✅ TextTools - Creando/Editando texto...");

    // Limpiar timeout anterior si existe
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
    }

    // Verificar si estamos en un texto existente
    if (
      opt.target &&
      (opt.target.type === "i-text" || opt.target.type === "textbox")
    ) {
      console.log("📝 Clic en texto existente");

      const now = Date.now();
      const isDoubleClick = now - lastClickTime < 300;
      lastClickTime = now;

      // Para doble clic, entrar en edición
      if (isDoubleClick && !isEditing) {
        console.log("✏️ Doble clic - editando texto");
        canvas.setActiveObject(opt.target);
        opt.target.enterEditing();
        opt.target.selectAll();
        isEditing = true;
        canvas.requestRenderAll();
      }
      // Para clic simple, solo seleccionar
      else if (!isEditing) {
        canvas.setActiveObject(opt.target);
        canvas.requestRenderAll();
      }
      return;
    }

    // Solo crear nuevo texto si no estamos editando y no hay objeto activo
    const activeObject = canvas.getActiveObject();
    if (!activeObject && !isEditing) {
      console.log("📝 Creando nuevo texto");

      // Usar timeout para permitir que otros eventos se procesen
      clickTimeout = setTimeout(() => {
        const tp = getTextProps();
        const pointer = canvas.getPointer(opt.e);
        const IText = fabricLib.IText || fabricLib.Textbox;

        // Crear texto con placeholder
        const it = new IText("Escribe aquí...", {
          left: pointer.x,
          top: pointer.y,
          fill: tp.fill || "#000000",
          fontSize: tp.fontSize || 20,
          fontWeight: tp.bold ? "bold" : "normal",
          fontFamily: "Arial",
          selectable: true,
          editable: true,
          hasControls: true,
          hasBorders: true,
          fontStyle: tp.italic ? "italic" : "normal",
          textDecoration: tp.underline ? "underline" : "",
          backgroundColor: "transparent",
        });

        canvas.add(it);
        canvas.setActiveObject(it);

        // Entrar en modo edición después de un pequeño delay
        setTimeout(() => {
          it.enterEditing();
          it.selectAll();
          isEditing = true;
          canvas.requestRenderAll();

          // Notificar creación
          onCreateText();
        }, 50);

        // Evento cuando termina la edición
        const onEditingExited = () => {
          isEditing = false;
          it.off("editing:exited", onEditingExited);

          // Si el texto está vacío, eliminarlo
          if (
            !it.text ||
            it.text.trim() === "" ||
            it.text === "Escribe aquí..."
          ) {
            setTimeout(() => {
              canvas.remove(it);
              canvas.discardActiveObject();
              canvas.requestRenderAll();
            }, 10);
          }
        };

        it.on("editing:exited", onEditingExited);

        canvas.requestRenderAll();
      }, 10);
    }
  };

  const applyTextPropsToActive = (textProps) => {
    const obj = canvas.getActiveObject();
    if (obj && (obj.type === "i-text" || obj.type === "textbox")) {
      obj.set({
        fill: textProps.fill || "#000000",
        fontSize: textProps.fontSize || 20,
        fontWeight: textProps.bold ? "bold" : "normal",
        fontStyle: textProps.italic ? "italic" : "normal",
        textDecoration: textProps.underline ? "underline" : "",
      });
      canvas.requestRenderAll();
    }
  };

  const detach = () => {
    canvas.off("mouse:down", onMouseDown);
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
    }
    isEditing = false;
  };

  // Conectar el evento
  canvas.on("mouse:down", onMouseDown);

  return {
    onMouseDown,
    detach,
    applyTextPropsToActive,
    clearEditing: () => {
      isEditing = false;
    },
  };
}
