import type { Env } from "./env.js";
import { errorResponse } from "./http.js";

// Public frog catalogue routes
const PUBLIC_FROG_RE = /^\/api\/frogs(\/.*)?$/;
const PUBLIC_ORDER_RE = /^\/api\/orders(\/.*)?$/;

// Admin routes
const ADMIN_FROG_RE = /^\/api\/admin\/frogs(\/.*)?$/;
const ADMIN_ORDER_RE = /^\/api\/admin\/orders(\/.*)?$/;

const FORWARDED_HEADERS = [
  "content-type",
  "x-request-id",
];

export function isFrogsRoute(pathname: string): boolean {
  return (
    PUBLIC_FROG_RE.test(pathname) ||
    PUBLIC_ORDER_RE.test(pathname) ||
    ADMIN_FROG_RE.test(pathname) ||
    ADMIN_ORDER_RE.test(pathname)
  );
}

export async function handleFrogsRoute(
  request: Request,
  env: Env,
  requestId: string,
  pathname: string,
): Promise<Response> {
  // Public routes pass through directly
  const isPublicRoute = PUBLIC_FROG_RE.test(pathname) || PUBLIC_ORDER_RE.test(pathname);

  // Admin routes check password header
  const isAdminRoute = ADMIN_FROG_RE.test(pathname) || ADMIN_ORDER_RE.test(pathname);

  if (!isPublicRoute && !isAdminRoute) {
    return errorResponse("not_found", "Not found", 404, requestId);
  }

  // Admin auth check
  if (isAdminRoute) {
    const adminPassword = env.FROG_ADMIN_PASSWORD;
    const authHeader = request.headers.get("x-admin-password") || request.headers.get("authorization")?.replace("Bearer ", "");
    if (!adminPassword || !authHeader || authHeader !== adminPassword) {
      return errorResponse("unauthorized", "Invalid or missing admin credentials", 401, requestId);
    }
  }

  if (!env.FROGS_WORKER) {
    return errorResponse("internal_error", "Frogs service unavailable", 503, requestId);
  }

  // Forward request to frogs-worker
  const headers = new Headers(request.headers);
  headers.set("x-request-id", requestId);

  const forwardedRequest = new Request(request.url, {
    method: request.method,
    headers,
    body: request.method !== "GET" && request.method !== "HEAD" ? request.body : null,
  });

  return env.FROGS_WORKER.fetch(forwardedRequest);
}