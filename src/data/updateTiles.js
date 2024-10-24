import dotenv from "dotenv";
import { google } from "googleapis";
import sqlite3 from "sqlite3";
import puppeteer from "puppeteer";
import fs from "fs";

//todo clean up this whole file
// Load environment variables from .env file
dotenv.config();

// Function to batch insert data into SQLite
async function upsertTiles(db) {
  return new Promise((resolve, reject) => {
    const upsertStatement = db.prepare(`
     INSERT INTO tiles (
       name, url, upload_date, creator, generic, combo, dispenser, hole, jump, layer, mechanical, no_path, secret, trap,
       on_play_setup, trigger, on_destroy, ongoing, alters_tiles, alters_balls, alters_hands, alters_turns, forbidden, novelty,
       premium, is_unique, virtual, board, accessory
   )
   SELECT
       name, url, upload_date, creator, generic, combo, dispenser, hole, jump, layer, mechanical, no_path, secret, trap,
       on_play_setup, trigger, on_destroy, ongoing, alters_tiles, alters_balls, alters_hands, alters_turns, forbidden, novelty,
       premium, is_unique, virtual, board, accessory
   FROM tile_import WHERE true
   ON CONFLICT(name) DO UPDATE SET
       url = excluded.url,
       upload_date = excluded.upload_date,
       creator = excluded.creator,
       generic = excluded.generic,
       combo = excluded.combo,
       dispenser = excluded.dispenser,
       hole = excluded.hole,
       jump = excluded.jump,
       layer = excluded.layer,
       mechanical = excluded.mechanical,
       no_path = excluded.no_path,
       secret = excluded.secret,
       trap = excluded.trap,
       on_play_setup = excluded.on_play_setup,
       trigger = excluded.trigger,
       on_destroy = excluded.on_destroy,
       ongoing = excluded.ongoing,
       alters_tiles = excluded.alters_tiles,
       alters_balls = excluded.alters_balls,
       alters_hands = excluded.alters_hands,
       alters_turns = excluded.alters_turns,
       forbidden = excluded.forbidden,
       novelty = excluded.novelty,
       premium = excluded.premium,
       is_unique = excluded.is_unique,
       virtual = excluded.virtual,
       board = excluded.board,
       accessory = excluded.accessory;
    `);

    upsertStatement.run((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

async function deleteNonImportedTiles(db) {
  return new Promise((resolve, reject) => {
    const deleteStatement = db.prepare(`DELETE FROM tiles WHERE name NOT IN (SELECT tile_import.name FROM tile_import)`);

    deleteStatement.run((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

async function importTiles(db, data) {
  return new Promise((resolve, reject) => {
    const clearImportTableStatement = db.prepare(`DELETE FROM tile_import;`);

    clearImportTableStatement.run((err) => {
      if (err) return reject(err);

      const insertStatement = db.prepare(
        `INSERT INTO tile_import(name, url, upload_date, creator, generic, combo, dispenser, hole, jump, layer, mechanical, no_path, secret, trap, on_play_setup, trigger, on_destroy, ongoing, alters_tiles, alters_balls, alters_hands, alters_turns, forbidden, novelty, premium, is_unique, virtual, board, accessory)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );

      // Create an array of promises for inserts
      const insertPromises = [];
      let insertCount = 0;

      // iterate through sheet data, insert into import table
      for (const rowData of data) {
        for (const row of rowData.rowData) {
          const cellData = row.values;
          let values = [];

          if (cellData[0]?.formattedValue === undefined) {
            // console.log("empty row");
          } else {
            // console.log("my row", cellData[0]);
            for (let i = 0; i < 29; i++) {
              let cell = cellData[i] || {};
              if (i < 4) {
                // First 4 columns: take the formatted value or hyperlink for URLs
                values[i] = cell.hyperlink || cell.formattedValue || "";
              } else {
                // Remaining columns: convert TRUE to 1 and anything else to 0
                values[i] = cell.formattedValue === "TRUE" ? 1 : 0;
              }
            }

            // Push the promise for the insert into the array
            const insertPromise = new Promise((insertResolve, insertReject) => {
              insertStatement.run(values, (err) => {
                if (err) return insertReject(err);
                insertResolve();
              });
            });

            insertPromises.push(insertPromise); // Collect the promise
          }
        }
      }

      // Wait for all insertions to complete
      Promise.all(insertPromises)
        .then(() => {
          insertStatement.finalize(); // Finalize the insert statement
          console.log(`Inserted ${insertPromises.length} rows into tile_import.`);
          resolve(db);
        })
        .catch(reject); // Handle any insertion errors
    });
  });
}

async function getOGImage(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Extract the OG image URL
  const ogImageUrl = await page.$eval('meta[property="og:image"]', meta => meta.getAttribute('content'));

  await browser.close();
  return ogImageUrl;
}

async function listTilesWithoutImages(db) {
  // from testing, could not get an og image from makerworld or printables
  // sticking with thangs until can get some support on this
  return new Promise((resolve, reject) => {
    const listTilesNeedingImagesSql = db.prepare(`
      SELECT id, url
      FROM tiles
      WHERE
        image IS NULL
        AND url LIKE 'https://than%'
    `);

    listTilesNeedingImagesSql.all((err, tiles) => {
      if (err) return reject(err);
      resolve(tiles);
    });
  });
}

async function downloadImage(url, filepath) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  // Convert response to ArrayBuffer and then to Buffer
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  fs.writeFileSync(filepath, buffer);
}

async function main() {
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
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      ranges: range,
      includeGridData: true,
    });

    const db = new sqlite3.Database("./src/data/data.db");

    await importTiles(db, response.data.sheets[0].data);
    await upsertTiles(db);
    await deleteNonImportedTiles(db);

    // [{id: 1, url: 'foo'}, {id: 1, url: 'bar'} ...]
    const tilesWithoutImages = await listTilesWithoutImages(db);
    console.log(`retrieved ${tilesWithoutImages.length} tiles without images`);

    //todo: add sleep before turning on
    // for (const t of tilesWithoutImages) {
    //   try {
    //     const ogImageUrl = await getOGImage(t.url);

    //     if (ogImageUrl) {
    //       // Download the OG image
    //       await downloadImage(ogImageUrl, `./public/images/tiles/${t.id}.jpg`);

    //       const fileName = `${t.id}.jpg`;
    //       await db.run('UPDATE tiles SET image = ? WHERE id = ?', fileName, t.id);
    //     } else {
    //       console.log(`No OG image found for ${t.url}`);
    //       await db.run('UPDATE tiles SET image = ? WHERE id = ?', "invalid", t.id);

    //     }
    //   } catch (error) {
    //     console.error(`Failed to process ${t.url}:`, error);
    //     await db.run('UPDATE tiles SET image = ? WHERE id = ?', "invalid", t.id);
    //   }
    // }

    //todo
    // await cleanImportTable(db);

    console.log("Data successfully inserted into the SQLite database.");
  } catch (err) {
    console.error("Error:", err);
    throw new Error(err);
  }
}

main();
