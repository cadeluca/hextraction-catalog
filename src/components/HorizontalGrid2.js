import React from 'react';

// HorizontalGrid component
const HorizontalGrid2 = ({ data }) => {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: '16px', // Adjust spacing between boxes
    }}>
      {Object.entries(data).map(([key, value]) => (
        <div key={key} style={{
          flex: '1 1 150px', // Box will grow to fill space but have a min-width
          // border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '8px', // 16px,
          textAlign: 'center',
        }}>
          <h4>{key}</h4>
          <p>{value}</p>
        </div>
      ))}
    </div>
  );
};

export default HorizontalGrid2;
