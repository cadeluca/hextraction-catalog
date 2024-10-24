import sqlite3 from "sqlite3";

async function setupDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./src/data/data.db", (err) => {
      if (err) {
        return reject(err);
      }

      const deleteTileTableSQL = `DROP TABLE IF EXISTS tiles;`;
      const deleteTileImportTableSQL = `DROP TABLE IF EXISTS tile_import;`;

      db.run(deleteTileTableSQL, (err) => {
        if (err) {
          return reject(err);
        }

        const createTableSQL = `CREATE TABLE IF NOT EXISTS tiles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE,
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
          accessory INTEGER,
          image TEXT
        );`;

        db.run(createTableSQL);
      });

      db.run(deleteTileImportTableSQL, (err) => {
        if (err) {
          return reject(err);
        }

        const createTableSQL = `CREATE TABLE IF NOT EXISTS tile_import (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE,
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

        db.run(createTableSQL);
      });
    });
  });
}

setupDatabase();
