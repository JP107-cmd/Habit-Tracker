import Database from 'better-sqlite3';

// A single, long-lived connection shared across all requests. better-sqlite3 is
// synchronous and file-based, so one connection for the process lifetime is the
// idiomatic pattern — no per-request open/close and no connection pool needed.
// The path is configurable so local dev and a deployed volume can differ.
const DB_PATH = process.env.DATABASE_PATH ?? './database/database.db';

export const db = new Database(DB_PATH);
