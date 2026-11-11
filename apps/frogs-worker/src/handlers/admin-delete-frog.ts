import type { FrogsRepository } from "@saas/db/frogs";
import { successResponse, errorResponse } from "../http.js";

export async function handleAdminDeleteFrog(
  repo: FrogsRepository,
  id: string,
  requestId: string,
): Promise<Response> {
  const frog = await repo.getFrog(id);
  if (!frog) {
    return errorResponse("not_found", "Frog not found", 404, requestId);
  }

  await repo.deleteFrog(id);
  return successResponse({ deleted: true }, requestId);
}