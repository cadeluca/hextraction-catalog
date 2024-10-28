// lib/db.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function openDb() {
  return open({
    filename: './src/data/data.db',
    driver: sqlite3.Database,
  });
}

export async function getTiles() {
  const db = await openDb();
  const items = await db.all('SELECT * FROM tiles');
  await db.close();
  return items;
}
