import type { FrogsRepository } from "@saas/db/frogs";
import { successResponse, errorResponse } from "../http.js";

export async function handleGetFrog(repo: FrogsRepository, id: string, requestId: string): Promise<Response> {
  const frog = await repo.getFrog(id);
  if (!frog) {
    return errorResponse("not_found", "Frog not found", 404, requestId);
  }
  return successResponse(
    {
      id: frog.id,
      name: frog.name,
      species: frog.species,
      size: frog.size,
      location: frog.location,
      createdAt: frog.created_at,
      updatedAt: frog.updated_at,
    },
    requestId,
  );
}