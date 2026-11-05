-- Dropship Hub schema (Cloudflare D1 / SQLite)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  sku TEXT NOT NULL,
  supplier TEXT NOT NULL,
  cost REAL NOT NULL DEFAULT 0,
  price REAL NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  lead_time INTEGER NOT NULL DEFAULT 10,
  created TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT NOT NULL,
  orders INTEGER NOT NULL DEFAULT 0,
  spent REAL NOT NULL DEFAULT 0,
  last_order TEXT NOT NULL,
  segment TEXT NOT NULL DEFAULT 'New'
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  ref TEXT NOT NULL,
  channel TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  qty INTEGER NOT NULL DEFAULT 1,
  total REAL NOT NULL,
  cost REAL NOT NULL,
  status TEXT NOT NULL,
  date TEXT NOT NULL,
  country TEXT NOT NULL,
  risk INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT NOT NULL,
  date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shipments (
  id TEXT PRIMARY KEY,
  tracking TEXT NOT NULL,
  order_ref TEXT NOT NULL,
  carrier TEXT NOT NULL,
  destination TEXT NOT NULL,
  checkpoint TEXT NOT NULL,
  status TEXT NOT NULL,
  eta TEXT NOT NULL,
  updated TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  when_cond TEXT NOT NULL,
  then_action TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  hits INTEGER NOT NULL DEFAULT 0,
  created TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
