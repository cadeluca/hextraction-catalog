import dotenv from "dotenv";
import { google } from "googleapis";
import sqlite3 from "sqlite3";

//todo clean up this whole file
// Load environment variables from .env file
dotenv.config();

// Setup SQLite Database
async function setupDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./data/data.db", (err) => {
      if (err) {
        return reject(err);
      }

      const deleteTableSQL = `DROP TABLE IF EXISTS tiles;`;

      db.run(deleteTableSQL, (err) => {
        if (err) {
          return reject(err);
        }

        const createTableSQL = `CREATE TABLE IF NOT EXISTS tiles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          url TEXT,
          upload_date TEXT,
          creator TEXT,
          generic INTEGER,
          combo INTEGER,
          dispenser INTEGER,
          hole INTEGER,
          jump INTEGER,
          layer INTEGER,
          mechanical INTEGER,
          no_path INTEGER,
          secret INTEGER,
          trap INTEGER,
          on_play_setup INTEGER,
          trigger INTEGER,
          on_destroy INTEGER,
          ongoing INTEGER,
          alters_tiles INTEGER,
          alters_balls INTEGER,
          alters_hands INTEGER,
          alters_turns INTEGER,
          forbidden INTEGER,
          novelty INTEGER,
          premium INTEGER,
          is_unique INTEGER,
          virtual INTEGER,
          board INTEGER,
          accessory INTEGER
        );`;

        db.run(createTableSQL, (err) => {
          if (err) {
            return reject(err);
          }
          resolve(db);
        });
      });
    });
  });
}

// Function to batch insert data into SQLite
async function batchInsert(db, data) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(
      `INSERT INTO tiles(name, url, upload_date, creator, generic, combo, dispenser, hole, jump, layer, mechanical, no_path, secret, trap, on_play_setup, trigger, on_destroy, ongoing, alters_tiles, alters_balls, alters_hands, alters_turns, forbidden, novelty, premium, is_unique, virtual, board, accessory)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    for (const rowData of data) {
      for (const row of rowData.rowData) {
        const cellData = row.values;
        let values = [];

        if (cellData[0]?.formattedValue === undefined) {
          console.log("empty row");
        } else {
          for (let i = 0; i < 29; i++) {
            let cell = cellData[i] || {};

            // console.log("my cell", cell);

            if (i < 4) {
              // First 4 columns: take the formatted value or hyperlink for URLs
              values[i] = cell.hyperlink || cell.formattedValue || "";
            } else {
              // Remaining columns: convert TRUE to 1 and anything else to 0
              values[i] = cell.formattedValue === "TRUE" ? 1 : 0;
            }
          }

          stmt.run(values, (err) => {
            if (err) return reject(err);
          });
        }
      }
    }

    stmt.finalize((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

async function main() {
  // Load the service account key from environment variables
  const serviceAccountKey = process.env.SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    throw new Error("SERVICE_ACCOUNT_KEY is not set in the environment");
  }

  const credentials = JSON.parse(serviceAccountKey);
  const auth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ["https://www.googleapis.com/auth/spreadsheets.readonly"]
  );

  const sheets = google.sheets({ version: "v4", auth });

  const spreadsheetId = process.env.SPREADSHEET_ID;
  const range = "Master!A3:AC";

  try {
    // Fetch data from Google Sheets
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      ranges: range,
      includeGridData: true,
    });

    // Setup SQLite database
    const db = await setupDatabase();

    // Batch insert the fetched data into the database
    await batchInsert(db, response.data.sheets[0].data);

    console.log("Data successfully inserted into the SQLite database.");
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
