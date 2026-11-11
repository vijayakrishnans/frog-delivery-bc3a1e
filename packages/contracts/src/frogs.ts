/**
 * Frog catalogue and order types for Frog Delivery
 */

// ── Frog ───────────────────────────────────────────────────

export interface Frog {
  id: string;
  name: string;
  species: string;
  size: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFrogRequest {
  name: string;
  species: string;
  size: string;
  location: string;
}

export interface UpdateFrogRequest {
  name?: string;
  species?: string;
  size?: string;
  location?: string;
}

// ── Order ──────────────────────────────────────────────────

export interface Order {
  id: string;
  frogId: string;
  customerName: string;
  contactInfo: string;
  status: "pending" | "in_transit" | "delivered";
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  frogId: string;
  customerName: string;
  contactInfo: string;
}

export interface OrderWithFrog extends Order {
  frogName: string;
  frogSpecies: string;
}

// ── API envelopes ──────────────────────────────────────────

export interface FrogListResponse {
  data: Frog[];
}

export interface FrogDetailResponse {
  data: Frog;
}

export interface OrderCreateResponse {
  data: Order;
}

export interface OrderListResponse {
  data: OrderWithFrog[];
}