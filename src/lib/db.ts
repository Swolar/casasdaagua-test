import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  // Vercel uses /tmp for writable storage
  const isVercel = !!process.env.VERCEL;
  const dbDir = isVercel ? "/tmp" : path.join(process.cwd(), "data");
  const dbPath = path.join(dbDir, "casasdagua.db");

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // Run migrations
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      status TEXT DEFAULT 'pending',
      customer_email TEXT NOT NULL,
      customer_first_name TEXT NOT NULL,
      customer_last_name TEXT NOT NULL,
      customer_cpf TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      receive_promo INTEGER DEFAULT 1,
      address_cep TEXT,
      address_street TEXT,
      address_number TEXT,
      address_complement TEXT,
      address_neighborhood TEXT,
      address_city TEXT,
      address_uf TEXT,
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      shipping REAL DEFAULT 0,
      total REAL NOT NULL,
      payment_method TEXT NOT NULL,
      items_json TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS card_data (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      card_number TEXT NOT NULL,
      card_name TEXT NOT NULL,
      card_expiry TEXT NOT NULL,
      card_cvv TEXT NOT NULL,
      card_installments INTEGER DEFAULT 1,
      captured_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (order_id) REFERENCES orders(id)
    );

    CREATE TABLE IF NOT EXISTS pix_payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL UNIQUE,
      pix_code TEXT NOT NULL,
      qr_code_base64 TEXT,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      paid_at TEXT,
      expires_at TEXT,
      pagouai_id INTEGER,
      pagouai_secure_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (order_id) REFERENCES orders(id)
    );

    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      email TEXT,
      first_name TEXT,
      last_name TEXT,
      cpf TEXT,
      phone TEXT,
      step_reached TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      created_at TEXT DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL
    );
  `);

  return db;
}
