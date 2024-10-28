// components/HorizontalGrid.js

import React from "react";

const HorizontalGrid = ({ items }) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        gap: "16px",
      }}
    >
      {items.map((item, index) => (
        <div key={index} style={{ padding: "8px", textAlign: "center" }}>
          {item}
        </div>
      ))}
    </div>
  );
};

export default HorizontalGrid;
