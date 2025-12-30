import React, { useState, useRef, useEffect } from "react";
import ToolButton from "./ToolButton";

const ZoomSelect = ({
  value = 100,
  onChange = () => {},
  options = [50, 75, 100, 125, 150, 200],
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div
      ref={rootRef}
      className="zoom-select"
      style={{ display: "inline-block", position: "relative" }}
    >
      <ToolButton
        onClick={() => setOpen((s) => !s)}
        active={open}
        className="toolbutton"
        style={{ minWidth: 65 }}
      >
        {value}%
      </ToolButton>

      {open && (
        <div
          className="zoom-menu"
          role="menu"
          style={{ position: "absolute", right: 0, marginTop: 8, zIndex: 2200 }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`zoom-menu-item ${opt === value ? "active" : ""}`}
              onClick={() => {
                onChange(opt / 100);
                setOpen(false);
              }}
              role="menuitem"
              style={{
                display: "block",
                width: "100%",
                background: "transparent",
                border: "none",
                padding: "6px 10px",
                textAlign: "left",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 12,
                color: "#111",
              }}
            >
              {opt}%
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ZoomSelect;
