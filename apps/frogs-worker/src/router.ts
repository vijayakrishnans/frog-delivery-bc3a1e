import type { Env } from "./env.js";
import { createD1Adapter } from "@saas/db/d1";
import { createFrogsRepository } from "@saas/db/frogs";
import { handleHealth } from "./handlers/health.js";
import { handleListFrogs } from "./handlers/list-frogs.js";
import { handleGetFrog } from "./handlers/get-frog.js";
import { handleCreateOrder } from "./handlers/create-order.js";
import { handleAdminListOrders } from "./handlers/admin-list-orders.js";
import { handleAdminUpdateOrderStatus } from "./handlers/admin-update-order-status.js";
import { handleAdminCreateFrog } from "./handlers/admin-create-frog.js";
import { handleAdminUpdateFrog } from "./handlers/admin-update-frog.js";
import { handleAdminDeleteFrog } from "./handlers/admin-delete-frog.js";
import { errorResponse, notFound } from "./http.js";
import { generateRequestId } from "./ids.js";

// Public routes
const LIST_FROGS_RE = /^\/api\/frogs$/;
const GET_FROG_RE = /^\/api\/frogs\/([^/]+)$/;
const CREATE_ORDER_RE = /^\/api\/orders$/;

// Admin routes
const ADMIN_LIST_ORDERS_RE = /^\/api\/admin\/orders$/;
const ADMIN_UPDATE_ORDER_STATUS_RE = /^\/api\/admin\/orders\/([^/]+)\/status$/;
const ADMIN_LIST_FROGS_RE = /^\/api\/admin\/frogs$/;
const ADMIN_FROG_ITEM_RE = /^\/api\/admin\/frogs\/([^/]+)$/;

export async function route(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const requestId = generateRequestId();

  try {
    if (url.pathname === "/health" && request.method === "GET") {
      return handleHealth(env, requestId);
    }

    // Public: list frogs
    if (LIST_FROGS_RE.test(url.pathname)) {
      if (request.method !== "GET") return methodNotAllowedResponse(requestId);
      const db = createD1Adapter(env.PLATFORM_DB!);
      const repo = createFrogsRepository(db);
      return handleListFrogs(repo, requestId);
    }

    // Public: get frog
    const frogMatch = url.pathname.match(GET_FROG_RE);
    if (frogMatch) {
      if (request.method !== "GET") return methodNotAllowedResponse(requestId);
      const db = createD1Adapter(env.PLATFORM_DB!);
      const repo = createFrogsRepository(db);
      return handleGetFrog(repo, frogMatch[1]!, requestId);
    }

    // Public: create order
    if (CREATE_ORDER_RE.test(url.pathname)) {
      if (request.method !== "POST") return methodNotAllowedResponse(requestId);
      const db = createD1Adapter(env.PLATFORM_DB!);
      const repo = createFrogsRepository(db);
      return handleCreateOrder(repo, request, requestId);
    }

    // Admin: list orders
    if (ADMIN_LIST_ORDERS_RE.test(url.pathname)) {
      if (request.method !== "GET") return methodNotAllowedResponse(requestId);
      const db = createD1Adapter(env.PLATFORM_DB!);
      const repo = createFrogsRepository(db);
      return handleAdminListOrders(repo, requestId);
    }

    // Admin: update order status
    const orderStatusMatch = url.pathname.match(ADMIN_UPDATE_ORDER_STATUS_RE);
    if (orderStatusMatch) {
      if (request.method !== "PATCH") return methodNotAllowedResponse(requestId);
      const db = createD1Adapter(env.PLATFORM_DB!);
      const repo = createFrogsRepository(db);
      return handleAdminUpdateOrderStatus(repo, request, orderStatusMatch[1]!, requestId);
    }

    // Admin: create frog
    if (ADMIN_LIST_FROGS_RE.test(url.pathname) && request.method === "POST") {
      const db = createD1Adapter(env.PLATFORM_DB!);
      const repo = createFrogsRepository(db);
      return handleAdminCreateFrog(repo, request, requestId);
    }

    // Admin: update/delete frog
    const frogItemMatch = url.pathname.match(ADMIN_FROG_ITEM_RE);
    if (frogItemMatch) {
      const db = createD1Adapter(env.PLATFORM_DB!);
      const repo = createFrogsRepository(db);
      if (request.method === "PUT") {
        return handleAdminUpdateFrog(repo, request, frogItemMatch[1]!, requestId);
      }
      if (request.method === "DELETE") {
        return handleAdminDeleteFrog(repo, frogItemMatch[1]!, requestId);
      }
      return methodNotAllowedResponse(requestId);
    }

    return notFound(requestId, url.pathname);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return errorResponse("internal_error", message, 500, requestId);
  }
}

function methodNotAllowedResponse(requestId: string): Response {
  return errorResponse("method_not_allowed", "Method not allowed", 405, requestId);
}