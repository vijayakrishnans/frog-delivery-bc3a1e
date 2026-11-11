import type { FrogsRepository } from "@saas/db/frogs";
import type { CreateOrderRequest } from "@saas/contracts/frogs";
import { successResponse, errorResponse } from "../http.js";
import { generateId } from "../ids.js";

export async function handleCreateOrder(
  repo: FrogsRepository,
  request: Request,
  requestId: string,
): Promise<Response> {
  let body: CreateOrderRequest;
  try {
    body = await request.json();
  } catch {
    return errorResponse("bad_request", "Invalid JSON body", 400, requestId);
  }

  if (!body.frogId || !body.customerName || !body.contactInfo) {
    return errorResponse("bad_request", "frogId, customerName, and contactInfo are required", 400, requestId);
  }

  // Verify frog exists
  const frog = await repo.getFrog(body.frogId);
  if (!frog) {
    return errorResponse("not_found", "Frog not found", 404, requestId);
  }

  const order = await repo.createOrder({
    id: generateId("ord"),
    frog_id: body.frogId,
    customer_name: body.customerName,
    contact_info: body.contactInfo,
  });

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
    201,
  );
}