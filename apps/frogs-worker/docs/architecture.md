# frogs-worker — Architecture

The worker follows the standard bounded-context pattern: a single entry point (`src/index.ts`) routes requests through `src/router.ts` to handler functions in `src/handlers/`. Persistence is through the `@saas/db` package using the frog/order repository in `packages/db/src/frogs/`.

The worker is not publicly addressable — all traffic arrives through `apps/api-edge` via a service binding. The edge facade handles public-auth passthrough and admin-password verification before forwarding.

## Dependencies

- `@saas/db` — D1 executor and frogs repository
- `@saas/contracts` — shared type definitions
- `cloudflare-d1` — D1 database binding (via wrangler template wiring)