-- Cloudflare D1 Database Schema for NovaNewz
-- Run this to create the articles table

CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT, -- JSON array stored as string
  author TEXT,
  published_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_published_at ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_created_at ON articles(created_at);

