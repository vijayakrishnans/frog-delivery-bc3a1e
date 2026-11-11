import type { FrogsRepository } from "@saas/db/frogs";
import { successResponse, errorResponse } from "../http.js";

const VALID_STATUSES = ["in_transit", "delivered"] as const;

export async function handleAdminUpdateOrderStatus(
  repo: FrogsRepository,
  request: Request,
  id: string,
  requestId: string,
): Promise<Response> {
  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return errorResponse("bad_request", "Invalid JSON body", 400, requestId);
  }

  if (!body.status || !VALID_STATUSES.includes(body.status as typeof VALID_STATUSES[number])) {
    return errorResponse("bad_request", "status must be 'in_transit' or 'delivered'", 400, requestId);
  }

  const order = await repo.updateOrderStatus(id, body.status as "in_transit" | "delivered");
  if (!order) {
    return errorResponse("not_found", "Order not found", 404, requestId);
  }

  return successResponse(
    {
      id: order.id,
      frogId: order.frog_id,
      customerName: order.customer_name,
      contactInfo: order.contact_info,
      status: order.status,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    },
    requestId,
  );
}