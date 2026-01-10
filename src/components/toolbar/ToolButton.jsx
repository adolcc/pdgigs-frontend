import React from "react";

const ToolButton = ({
  onClick,
  active,
  title,
  children,
  disabled = false,
  style = {},
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        background: active ? "#5d4037" : "transparent",
        border: "none",
        color: active ? "#fff" : "rgba(255,255,255,0.8)",
        padding: "4px",
        borderRadius: "3px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s ease",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !active) {
          e.currentTarget.style.background = "rgba(93, 64, 55, 0.3)";
          e.currentTarget.style.color = "#fff";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "rgba(255,255,255,0.8)";
        }
      }}
    >
      {children}
    </button>
  );
};

export default ToolButton;
