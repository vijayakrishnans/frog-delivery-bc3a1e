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

  const input: { name?: string; species?: string; size?: string; location?: string } = {};
    if (body.name !== undefined) input.name = body.name;
    if (body.species !== undefined) input.species = body.species;
    if (body.size !== undefined) input.size = body.size;
    if (body.location !== undefined) input.location = body.location;

    const frog = await repo.updateFrog(id, input);

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