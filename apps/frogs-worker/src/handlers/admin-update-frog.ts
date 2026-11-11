import type { FrogsRepository } from "@saas/db/frogs";
import type { UpdateFrogRequest } from "@saas/contracts/frogs";
import { successResponse, errorResponse } from "../http.js";

export async function handleAdminUpdateFrog(
  repo: FrogsRepository,
  request: Request,
  id: string,
  requestId: string,
): Promise<Response> {
  let body: UpdateFrogRequest;
  try {
    body = await request.json();
  } catch {
    return errorResponse("bad_request", "Invalid JSON body", 400, requestId);
  }

  const frog = await repo.updateFrog(id, {
    name: body.name,
    species: body.species,
    size: body.size,
    location: body.location,
  });

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