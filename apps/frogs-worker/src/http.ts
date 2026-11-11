import type { ErrorCode } from "@saas/contracts/errors";

export function successResponse<T>(data: T, requestId: string, status = 200): Response {
  return Response.json(
    { data, meta: { requestId } },
    { status, headers: { "content-type": "application/json" } },
  );
}

export function errorResponse(
  code: ErrorCode | string,
  message: string,
  status: number,
  requestId: string,
): Response {
  return Response.json(
    { error: { code, message }, meta: { requestId } },
    { status, headers: { "content-type": "application/json" } },
  );
}

export function notFound(requestId: string, pathname: string): Response {
  return errorResponse("not_found", `Not found: ${pathname}`, 404, requestId);
}

export function methodNotAllowed(requestId: string): Response {
  return errorResponse("method_not_allowed", "Method not allowed", 405, requestId);
}