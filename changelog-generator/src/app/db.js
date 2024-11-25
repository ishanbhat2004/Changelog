import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let initialized = false;

// Open SQLite database connection
export async function openDb() {
  return open({
    filename: './changelogs.db', // Path to the SQLite database file
    driver: sqlite3.Database,
  });
}

// Initialize the database schema
export async function initializeDb() {
  if (!initialized) {
    const db = await openDb();
    await db.exec(`
      CREATE TABLE IF NOT EXISTS changelogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        repo_url TEXT NOT NULL,
        since_date TEXT NOT NULL,
        raw_commits TEXT NOT NULL,
        summary TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized');
    initialized = true; // Mark the database as initialized to avoid repeated calls
  }
}