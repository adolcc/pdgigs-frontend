const FALLBACK_COLOR = "#8B4513";

function normalizeColorOrFallback(col) {
  if (!col) return FALLBACK_COLOR;
  const v = String(col).trim().toLowerCase();
  if (v === "transparent") return FALLBACK_COLOR;
  if (v.startsWith("rgba")) {
    const parts = v.replace("rgba(", "").replace(")", "").split(",");
    if (parts.length === 4 && parseFloat(parts[3]) === 0) return FALLBACK_COLOR;
  }
  return col;
}

function hexToRgb(hex) {
  if (!hex) return null;
  const s = hex.replace("#", "");
  if (s.length === 3) {
    return {
      r: parseInt(s[0] + s[0], 16),
      g: parseInt(s[1] + s[1], 16),
      b: parseInt(s[2] + s[2], 16),
    };
  }
  return {
    r: parseInt(s.substr(0, 2), 16),
    g: parseInt(s.substr(2, 2), 16),
    b: parseInt(s.substr(4, 2), 16),
  };
}

function isLightColor(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const srgb = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  const lum = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  return lum > 0.75;
}

function ensureVisibleStroke(obj, colorHex, bgColor) {
  const fontSize = obj.fontSize || 18;
  if (bgColor) {
    obj.set({ stroke: null, strokeWidth: 0 });
    return;
  }
  const strokeWidth = Math.max(1, Math.round(fontSize * 0.08));
  obj.set({
    stroke: "#111111",
    strokeWidth,
    strokeUniform: true,
    strokeLineJoin: "round",
    paintFirst: "stroke",
  });
  obj.set("shadow", {
    color: "rgba(0,0,0,0.45)",
    blur: 2,
    offsetX: 1,
    offsetY: 1,
  });
}

export function attachTextHandlers(canvas, fabricLib, opts = {}) {
  if (!canvas || !fabricLib) return () => ({});
  const getActiveTool = opts.getActiveTool || (() => null);
  const getTextProps = opts.getTextProps || (() => ({}));
  const onSelectionChange = opts.onSelectionChange || (() => {});

  function notifySelection() {
    try {
      const obj = canvas.getActiveObject && canvas.getActiveObject();
      if (!obj) {
        onSelectionChange(null);
        return;
      }
      const isText =
        obj &&
        ((obj.type && obj.type === "i-text") ||
          (obj.isType && obj.isType("i-text")));
      if (isText) {
        onSelectionChange({
          fontSize: obj.fontSize || 18,
          fontFamily: obj.fontFamily || "Arial",
          bold: obj.fontWeight === "bold",
          italic: obj.fontStyle === "italic",
          fill: obj.fill || FALLBACK_COLOR,
          backgroundColor: obj.backgroundColor || "",
          shadow: !!obj.shadow,
        });
      } else {
        onSelectionChange(null);
      }
    } catch (e) {}
  }

  function eraseAtEvent(opt) {
    try {
      const ev = opt && opt.e;
      if (ev && ev.stopImmediatePropagation) {
        ev.stopImmediatePropagation();
        ev.preventDefault && ev.preventDefault();
      }
      let target = opt && opt.target;
      if (!target && canvas.findTarget) {
        target = canvas.findTarget(opt.e, true);
      }
      if (target) {
        canvas.remove(target);
        canvas.discardActiveObject && canvas.discardActiveObject();
        canvas.requestRenderAll && canvas.requestRenderAll();
        return true;
      }
      const p = canvas.getPointer && canvas.getPointer(opt.e);
      const objs = canvas.getObjects && canvas.getObjects();
      if (p && objs) {
        for (let i = objs.length - 1; i >= 0; i--) {
          const obj = objs[i];
          if (obj.containsPoint && obj.containsPoint(p)) {
            canvas.remove(obj);
            canvas.discardActiveObject && canvas.discardActiveObject();
            canvas.requestRenderAll && canvas.requestRenderAll();
            return true;
          }
        }
      }
    } catch (e) {}
    return false;
  }

  let isDown = false;
  let downPos = null;
  let moved = false;
  let downTarget = null;

  function createTextObjectAt(pointer, tp) {
    const fontSize = Math.max(14, tp.fontSize || 18);
    const fillColor = normalizeColorOrFallback(tp.fill);
    const IText = fabricLib.IText || fabricLib.Textbox || fabricLib.Text;
    if (!IText) return null;
    const it = new IText("Text", {
      left: pointer.x,
      top: pointer.y,
      fill: fillColor,
      fontSize,
      fontFamily: tp.fontFamily || "Arial",
      fontStyle: tp.italic ? "italic" : "normal",
      fontWeight: tp.bold ? "bold" : "normal",
      backgroundColor: tp.backgroundColor || "",
      selectable: true,
      opacity: 1,
    });
    return it;
  }

  function createTextAtPointer(opt) {
    try {
      const tp = getTextProps() || {};
      const pointer = canvas.getPointer(opt.e || opt);
      const it = createTextObjectAt(pointer, tp);
      if (!it) return;
      if (tp.shadow)
        it.set("shadow", {
          color: tp.fill || "#000000",
          blur: 2,
          offsetX: 2,
          offsetY: 2,
        });
      ensureVisibleStroke(it, it.fill, tp.backgroundColor);
      canvas.add(it);
      canvas.setActiveObject(it);
      it.enterEditing && it.enterEditing();
      setTimeout(() => {
        try {
          if (
            it.hiddenTextarea &&
            typeof it.hiddenTextarea.focus === "function"
          ) {
            it.hiddenTextarea.focus();
          } else if (it.canvas && it.canvas.wrapperEl) {
            const ta = it.canvas.wrapperEl.querySelector("textarea");
            if (ta && ta.focus) ta.focus();
          }
        } catch (e) {}
      }, 40);
      canvas.requestRenderAll && canvas.requestRenderAll();
      notifySelection();
    } catch (e) {}
  }

  function onMouseDown(opt) {
    try {
      const active = getActiveTool();
      isDown = true;
      moved = false;
      downPos = canvas.getPointer(opt.e || opt);
      downTarget = opt && opt.target;
      if (!downTarget && canvas.findTarget)
        downTarget = canvas.findTarget(opt.e, true);
      if (active === "eraser") {
        if (eraseAtEvent(opt)) {
          isDown = false;
          return;
        }
        return;
      }
    } catch (e) {}
  }

  function onMouseMove(opt) {
    try {
      if (!isDown) return;
      const p = canvas.getPointer(opt.e || opt);
      if (!p || !downPos) return;
      const dx = Math.abs(p.x - downPos.x);
      const dy = Math.abs(p.y - downPos.y);
      if (!moved && (dx > 4 || dy > 4)) {
        moved = true;
      }
    } catch (e) {}
  }

  function onMouseUp(opt) {
    try {
      const active = getActiveTool();
      const upTarget =
        opt && opt.target
          ? opt.target
          : canvas.findTarget
          ? canvas.findTarget(opt.e, true)
          : null;
      if (active === "text") {
        if (moved) {
          isDown = false;
          downPos = null;
          downTarget = null;
          return;
        }
        const isUpText =
          upTarget &&
          ((upTarget.type && upTarget.type === "i-text") ||
            (upTarget.isType && upTarget.isType("i-text")));
        if (isUpText) {
          canvas.setActiveObject && canvas.setActiveObject(upTarget);
          upTarget.enterEditing && upTarget.enterEditing();
          setTimeout(() => {
            try {
              if (
                upTarget.hiddenTextarea &&
                typeof upTarget.hiddenTextarea.focus === "function"
              ) {
                upTarget.hiddenTextarea.focus();
              } else if (upTarget.canvas && upTarget.canvas.wrapperEl) {
                const ta = upTarget.canvas.wrapperEl.querySelector("textarea");
                if (ta && ta.focus) ta.focus();
              }
            } catch (e) {}
          }, 30);
          notifySelection();
          isDown = false;
          downPos = null;
          downTarget = null;
          return;
        }
        createTextAtPointer(opt);
        isDown = false;
        downPos = null;
        downTarget = null;
        return;
      }
      isDown = false;
      downPos = null;
      downTarget = null;
    } catch (e) {}
  }

  canvas.on("mouse:down", onMouseDown);
  canvas.on("mouse:move", onMouseMove);
  canvas.on("mouse:up", onMouseUp);

  canvas.on("selection:created", notifySelection);
  canvas.on("selection:updated", notifySelection);
  canvas.on("selection:cleared", () => onSelectionChange(null));

  function applyTextPropsToActive(textProps) {
    try {
      const ao = canvas.getActiveObject && canvas.getActiveObject();
      if (!ao) return;
      const isText =
        ao &&
        ((ao.type && ao.type === "i-text") ||
          (ao.isType && ao.isType("i-text")));
      if (!isText) return;
      const fill = normalizeColorOrFallback(textProps.fill || ao.fill);
      ao.set("fontSize", textProps.fontSize || ao.fontSize || 18);
      ao.set("fontFamily", textProps.fontFamily || ao.fontFamily);
      ao.set("fontWeight", textProps.bold ? "bold" : "normal");
      ao.set("fontStyle", textProps.italic ? "italic" : "normal");
      ao.set("fill", fill);
      ao.set("backgroundColor", textProps.backgroundColor || "");
      ao.set("opacity", 1);
      if (textProps.shadow) {
        ao.set("shadow", {
          color: textProps.fill || "#000000",
          blur: 2,
          offsetX: 2,
          offsetY: 2,
        });
      } else {
        ao.set("shadow", null);
      }
      ensureVisibleStroke(ao, fill, textProps.backgroundColor);
      canvas.requestRenderAll && canvas.requestRenderAll();
    } catch (e) {}
  }

  const detach = () => {
    try {
      canvas.off && canvas.off("mouse:down", onMouseDown);
      canvas.off && canvas.off("mouse:move", onMouseMove);
      canvas.off && canvas.off("mouse:up", onMouseUp);
      canvas.off && canvas.off("selection:created", notifySelection);
      canvas.off && canvas.off("selection:updated", notifySelection);
      canvas.off && canvas.off("selection:cleared");
    } catch (e) {}
  };

  return { detach, applyTextPropsToActive };
}
