import fs from "fs";
import sqlite3 from "sqlite3";
import path from "path";

const db = new sqlite3.Database("./src/data/data.db");

async function fetchAndGenerateMdx() {
  const tilesDir = path.join("./src/pages/tiles");
  fs.rmSync(tilesDir, { recursive: true, force: true });
  // should always be true
  if (!fs.existsSync(tilesDir)) {
    fs.mkdirSync(tilesDir, { recursive: true });
  }

  db.all("SELECT * FROM tiles", (error, rows) => {
    if (error) {
      console.error(`Error fetching tiles: ${error.message}`);
      return;
    }

    rows.forEach((row) => {
      const content = generateContent(row);
      const cleansedFileName = row.name.replace(/[\/\\:*?"',!.<>| ]/g, "_");
      const filePath = path.join(tilesDir, `${cleansedFileName}.mdx`);

      fs.writeFile(filePath, content, (err) => {
        if (err) {
          console.error(
            `Error writing file ${cleansedFileName}.mdx: ${err.message}`
          );
        }
      });
    });
  });
}

function generateContent(row) {
  const escapedName = row.name;

  return `---
title: "${escapedName}"
---
# ${row.name}

${row.id}
`;
}

fetchAndGenerateMdx();
