import type { Env } from "../env.js";
import { successResponse } from "../http.js";

export async function handleHealth(env: Env, requestId: string): Promise<Response> {
  return successResponse(
    {
      status: "ok",
      service: "frogs-worker",
      environment: env.ENVIRONMENT ?? "local",
      timestamp: new Date().toISOString(),
    },
    requestId,
  );
}