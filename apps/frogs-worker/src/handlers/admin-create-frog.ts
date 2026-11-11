import type { FrogsRepository } from "@saas/db/frogs";
import type { CreateFrogRequest } from "@saas/contracts/frogs";
import { successResponse, errorResponse } from "../http.js";
import { generateId } from "../ids.js";

export async function handleAdminCreateFrog(
  repo: FrogsRepository,
  request: Request,
  requestId: string,
): Promise<Response> {
  let body: CreateFrogRequest;
  try {
    body = await request.json();
  } catch {
    return errorResponse("bad_request", "Invalid JSON body", 400, requestId);
  }

  if (!body.name || !body.species || !body.size || !body.location) {
    return errorResponse("bad_request", "name, species, size, and location are required", 400, requestId);
  }

  const frog = await repo.createFrog({
    id: generateId("frog"),
    name: body.name,
    species: body.species,
    size: body.size,
    location: body.location,
  });

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
    201,
  );
}