# Frog Delivery (APP) — Implementation status

As-built ≠ intent. This file records what actually shipped, and every place the code departed from `design.md`.

| Milestone | State | PR |
|---|---|---|
| APP-1 — The plan, written down | ✅ Done | #1 |
| APP-2 — Frogs catalogue & ordering | ✅ Done | orun/APP-2-frogs-catalogue-ordering |
| APP-3 — Delivery management | Not started | |

## Departures from the design

- **Admin password env var**: The design specifies `FROG_ADMIN_PASSWORD` on the edge worker's wrangler template. This is set in the stage and prod env sections but not in dev. The admin routes and auth middleware are built (in the frogs-worker and api-edge facade) ahead of APP-3's console admin pages, since they depend on the same infrastructure. The admin pages in the console are deferred to APP-3.
- **No `dev` service binding for FROGS_WORKER**: The wrangler template only binds `FROGS_WORKER` in stage/prod. The binding will be added for dev in a separate change when local development is configured.
- **Database timestamps as TEXT**: D1 doesn't support timestamptz natively; the migration uses ISO 8601 text strings with `strftime`, matching the existing migrations pattern in the project.