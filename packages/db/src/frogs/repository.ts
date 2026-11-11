import type { SqlExecutor, SqlRow } from "../d1/executor.js";

// ── Types ──────────────────────────────────────────────────

export interface FrogRow {
  id: string;
  name: string;
  species: string;
  size: string;
  location: string;
  created_at: string;
  updated_at: string;
}

export interface OrderRow {
  id: string;
  frog_id: string;
  customer_name: string;
  contact_info: string;
  status: "pending" | "in_transit" | "delivered";
  created_at: string;
  updated_at: string;
}

export interface CreateFrogInput {
  id: string;
  name: string;
  species: string;
  size: string;
  location: string;
}

export interface CreateOrderInput {
  id: string;
  frog_id: string;
  customer_name: string;
  contact_info: string;
}

export interface UpdateFrogInput {
  name?: string;
  species?: string;
  size?: string;
  location?: string;
}

// ── Repository ─────────────────────────────────────────────

export function createFrogsRepository(db: SqlExecutor) {
  async function listFrogs(): Promise<FrogRow[]> {
    const result = await db.execute(
      "SELECT id, name, species, size, location, created_at, updated_at FROM frogs ORDER BY created_at DESC, id DESC",
    );
    return result.rows as unknown as FrogRow[];
  }

  async function getFrog(id: string): Promise<FrogRow | null> {
    const result = await db.execute(
      "SELECT id, name, species, size, location, created_at, updated_at FROM frogs WHERE id = ?",
      [id],
    );
    return (result.rows[0] as unknown as FrogRow) ?? null;
  }

  async function createFrog(input: CreateFrogInput): Promise<FrogRow> {
    await db.execute(
      "INSERT INTO frogs (id, name, species, size, location) VALUES (?, ?, ?, ?, ?)",
      [input.id, input.name, input.species, input.size, input.location],
    );
    return (await db.execute(
      "SELECT id, name, species, size, location, created_at, updated_at FROM frogs WHERE id = ?",
      [input.id],
    )).rows[0] as unknown as FrogRow;
  }

  async function updateFrog(id: string, input: UpdateFrogInput): Promise<FrogRow | null> {
    const sets: string[] = [];
    const params: unknown[] = [];
    if (input.name !== undefined) { sets.push("name = ?"); params.push(input.name); }
    if (input.species !== undefined) { sets.push("species = ?"); params.push(input.species); }
    if (input.size !== undefined) { sets.push("size = ?"); params.push(input.size); }
    if (input.location !== undefined) { sets.push("location = ?"); params.push(input.location); }
    if (sets.length === 0) return getFrog(id);

    sets.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')");
    params.push(id);
    await db.execute(
      `UPDATE frogs SET ${sets.join(", ")} WHERE id = ?`,
      params,
    );
    return getFrog(id);
  }

  async function deleteFrog(id: string): Promise<boolean> {
    const result = await db.execute("DELETE FROM frogs WHERE id = ?", [id]);
    return result.rows.length > 0;
  }

  async function listOrders(): Promise<OrderRow[]> {
    const result = await db.execute(
      "SELECT id, frog_id, customer_name, contact_info, status, created_at, updated_at FROM orders ORDER BY created_at DESC, id DESC",
    );
    return result.rows as unknown as OrderRow[];
  }

  async function getOrder(id: string): Promise<OrderRow | null> {
    const result = await db.execute(
      "SELECT id, frog_id, customer_name, contact_info, status, created_at, updated_at FROM orders WHERE id = ?",
      [id],
    );
    return (result.rows[0] as unknown as OrderRow) ?? null;
  }

  async function createOrder(input: CreateOrderInput): Promise<OrderRow> {
    await db.execute(
      "INSERT INTO orders (id, frog_id, customer_name, contact_info, status) VALUES (?, ?, ?, ?, 'pending')",
      [input.id, input.frog_id, input.customer_name, input.contact_info],
    );
    return (await db.execute(
      "SELECT id, frog_id, customer_name, contact_info, status, created_at, updated_at FROM orders WHERE id = ?",
      [input.id],
    )).rows[0] as unknown as OrderRow;
  }

  async function updateOrderStatus(id: string, status: "in_transit" | "delivered"): Promise<OrderRow | null> {
    await db.execute(
      "UPDATE orders SET status = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?",
      [status, id],
    );
    return getOrder(id);
  }

  return {
    listFrogs,
    getFrog,
    createFrog,
    updateFrog,
    deleteFrog,
    listOrders,
    getOrder,
    createOrder,
    updateOrderStatus,
  };
}

export type FrogsRepository = ReturnType<typeof createFrogsRepository>;