import React from "react";

const ColorSwatch = ({ color, selected, title, onClick }) => {
  const cls = selected ? "swatch active-swatch" : "swatch";
  const style = { background: color };
  return (
    <button
      type="button"
      title={title}
      aria-label={title || color}
      className={cls}
      onClick={() => onClick && onClick(color)}
      style={style}
    />
  );
};

export default ColorSwatch;
