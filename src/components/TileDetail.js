import React from "react";

// had AI generate me random sample props for this
const gameProperties = {
  mechanics: {
    generic: { name: "Generic", checked: true },
    combo: { name: "Combo", checked: false },
    dispenser: { name: "Dispenser", checked: true },
    hole: { name: "Hole", checked: false },
    jump: { name: "Jump", checked: true },
    layer: { name: "Layer", checked: false },
    mechanical: { name: "Mechanical", checked: true },
    no_path: { name: "No Path", checked: false },
    secret: { name: "Secret", checked: true },
    trap: { name: "Trap", checked: false },
  },
  cause: {
    on_play_setup: { name: "On Play Setup", checked: true },
    trigger: { name: "Trigger", checked: false },
    on_destroy: { name: "On Destroy", checked: true },
    ongoing: { name: "Ongoing", checked: false },
  },
  action: {
    alters_tiles: { name: "Alters Tiles", checked: true },
    alters_balls: { name: "Alters Balls", checked: false },
    alters_hands: { name: "Alters Hands", checked: true },
    alters_turns: { name: "Alters Turns", checked: false },
  },
  special: {
    forbidden: { name: "Forbidden", checked: true },
    novelty: { name: "Novelty", checked: false },
    premium: { name: "Premium", checked: true },
    is_unique: { name: "Is Unique", checked: false },
    virtual: { name: "Virtual", checked: true },
  },
  components: {
    board: { name: "Board", checked: true },
    accessory: { name: "Accessory", checked: false },
  },
};

const cardStyle = {
  border: '1px solid #e2e8f0',
  borderRadius: '0.5rem',
  padding: '0rem',
  transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
  // cursor: 'pointer',
}

const cardHoverStyle = {
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  borderColor: '#3182ce',
}

export default function TileDetail() {
  const summaryCounts = Object.entries(gameProperties).reduce(
    (acc, [sectionKey, section]) => {
      acc[sectionKey] = {
        checked: Object.values(section).filter((prop) => prop.checked).length,
        total: Object.values(section).length,
      };
      return acc;
    },
    {}
  );

  return (
    // <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      // <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '2rem' }}>Game Piece Properties</h1>

      <div style={{ display: 'grid', gap: '0rem' }}>
        {Object.entries(gameProperties).map(([sectionKey, section]) => (
          <section key={sectionKey} style={{ ...cardStyle }} onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHoverStyle)} onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}>
            {/* <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#2d3748' }}>{sectionKey}</h2> */}
            {/* <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '1rem' }}>
              Checked: {summaryCounts[sectionKey].checked} / {summaryCounts[sectionKey].total}
            </div> */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {Object.values(section).map((property, index) => (
                <div key={index} style={{
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  // backgroundColor: property.checked ? '#ebf8ff' : '#f7fafc',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s',
                  border: '1px solid',
                  borderColor: property.checked ? '#90cdf4' : '#e2e8f0',
                }}>
                  <span style={{ fontWeight: '500', color: '#2d3748' }}>{property.name}</span>
                  <div style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    borderRadius: '50%',
                    backgroundColor: property.checked ? '#4299e1' : '#cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}>
                    {property.checked ? '✓' : ''}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    // </div>
  )
}
