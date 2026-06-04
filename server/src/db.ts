import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH || '/data/typing.db';
const DB_DIR = path.dirname(DB_PATH);

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = -64000');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT '文章',
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_name TEXT NOT NULL,
    employee_group TEXT NOT NULL,
    article_id INTEGER NOT NULL,
    article_title TEXT NOT NULL DEFAULT '',
    wpm REAL NOT NULL,
    accuracy TEXT NOT NULL,
    duration INTEGER NOT NULL,
    total_keystrokes INTEGER NOT NULL DEFAULT 0,
    wrong_keystrokes INTEGER NOT NULL DEFAULT 0,
    strict_wrong_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE INDEX IF NOT EXISTS idx_records_name ON records(employee_name);
  CREATE INDEX IF NOT EXISTS idx_records_group ON records(employee_group);
  CREATE INDEX IF NOT EXISTS idx_records_created ON records(created_at);
`);

export default db;
