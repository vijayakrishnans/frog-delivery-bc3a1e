-- 200_frogs_foundation
-- Frog catalogue and order persistence for Frog Delivery
-- Bounded context: frogs
-- Idempotent: uses IF NOT EXISTS throughout.
-- schema frogs: Frog Delivery bounded context — owns frogs catalogue and orders.

-- ============================================================
-- Frogs: the catalogue of frogs available for delivery
-- ============================================================

CREATE TABLE IF NOT EXISTS frogs (
  id              TEXT        PRIMARY KEY,
  name            TEXT        NOT NULL,
  species         TEXT        NOT NULL,
  size            TEXT        NOT NULL,
  location        TEXT        NOT NULL,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Unique frog name
CREATE UNIQUE INDEX IF NOT EXISTS frogs_name_idx ON frogs (name);

-- Listing order
CREATE INDEX IF NOT EXISTS frogs_created_idx ON frogs (created_at DESC, id DESC);

-- table frogs: Catalogue of frogs available for delivery.
-- column frogs.id: ULID-based public identifier (frog_ prefix).
-- column frogs.name: Display name of the frog.
-- column frogs.species: Species classification.
-- column frogs.size: Size description (e.g. Small, Medium, Large).
-- column frogs.location: Origin or current location.
-- column frogs.created_at: ISO 8601 timestamp of creation.
-- column frogs.updated_at: ISO 8601 timestamp of last update.

-- ============================================================
-- Orders: visitor-placed delivery orders for frogs
-- ============================================================

CREATE TABLE IF NOT EXISTS orders (
  id              TEXT        PRIMARY KEY,
  frog_id         TEXT        NOT NULL,
  customer_name   TEXT        NOT NULL,
  contact_info    TEXT        NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'pending',
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),

  CONSTRAINT orders_frog_id_fk FOREIGN KEY (frog_id) REFERENCES frogs(id),
  CONSTRAINT orders_status_check CHECK (status IN ('pending', 'in_transit', 'delivered'))
);

-- Orders by frog
CREATE INDEX IF NOT EXISTS orders_frog_id_idx ON orders (frog_id);

-- Orders by status
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status, created_at DESC);

-- Orders listing
CREATE INDEX IF NOT EXISTS orders_created_idx ON orders (created_at DESC, id DESC);

-- table orders: Delivery orders placed by visitors.
-- column orders.id: ULID-based public identifier (ord_ prefix).
-- column orders.frog_id: Reference to frogs.id.
-- column orders.customer_name: Name of the customer placing the order.
-- column orders.contact_info: Contact information (email or phone).
-- column orders.status: Order status — pending, in_transit, or delivered.
-- column orders.created_at: ISO 8601 timestamp of order placement.
-- column orders.updated_at: ISO 8601 timestamp of last update.