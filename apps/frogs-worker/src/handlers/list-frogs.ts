import type { FrogsRepository } from "@saas/db/frogs";
import { successResponse } from "../http.js";

export async function handleListFrogs(repo: FrogsRepository, requestId: string): Promise<Response> {
  const frogs = await repo.listFrogs();
  return successResponse(
    frogs.map((f) => ({
      id: f.id,
      name: f.name,
      species: f.species,
      size: f.size,
      location: f.location,
      createdAt: f.created_at,
      updatedAt: f.updated_at,
    })),
    requestId,
  );
}