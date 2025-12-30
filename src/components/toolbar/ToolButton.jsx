import React from "react";

const ToolButton = ({ onClick, active, children, className = "", style = {} }) => {
  return (
    <button
      onClick={onClick}
      className={active ? `${className} active` : className}
      style={style}
      type="button"
    >
      {children}
    </button>
  );
};

export default ToolButton;