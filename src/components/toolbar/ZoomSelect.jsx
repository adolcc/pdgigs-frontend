import React from "react";

const ZoomSelect = ({ value, onChange, options, style = {} }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{
        background: "transparent",
        color: "#fff",
        border: "none",
        padding: "2px 4px",
        fontSize: "13px",
        fontWeight: "bold",
        cursor: "pointer",
        outline: "none",
        ...style,
      }}
    >
      {options.map((option) => (
        <option
          key={option}
          value={option}
          style={{
            background: "#5d4037",
            color: "#fff",
            padding: "8px",
          }}
        >
          {option}%
        </option>
      ))}
    </select>
  );
};

export default ZoomSelect;
