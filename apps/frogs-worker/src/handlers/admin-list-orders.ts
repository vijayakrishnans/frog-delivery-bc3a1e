import type { FrogsRepository } from "@saas/db/frogs";
import { successResponse } from "../http.js";

export async function handleAdminListOrders(repo: FrogsRepository, requestId: string): Promise<Response> {
  const orders = await repo.listOrders();
  // Enrich with frog names
  const enriched = await Promise.all(
    orders.map(async (o) => {
      const frog = await repo.getFrog(o.frog_id);
      return {
        id: o.id,
        frogId: o.frog_id,
        frogName: frog?.name ?? "Unknown",
        frogSpecies: frog?.species ?? "Unknown",
        customerName: o.customer_name,
        contactInfo: o.contact_info,
        status: o.status,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
      };
    }),
  );
  return successResponse(enriched, requestId);
}