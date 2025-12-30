import React from "react";

const RangeInput = ({ value, min = 1, max = 30, onChange, className = "", style = {} }) => {
  return (
    <input
      className={className}
      style={style}
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={e => onChange && onChange(parseInt(e.target.value, 10))}
    />
  );
};

export default RangeInput;