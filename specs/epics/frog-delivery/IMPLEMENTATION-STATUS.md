# Frog Delivery (APP) — Implementation status

As-built ≠ intent. This file records what actually shipped, and every place the code departed from `design.md`.

| Milestone | State | PR |
|---|---|---|
| APP-1 — The plan, written down | ✅ Done | #1 |
| APP-2 — Frogs catalogue & ordering | ✅ Done | orun/APP-2-frogs-catalogue-ordering |
| APP-3 — Delivery management | ✅ Complete | #5 |

## Departures from the design

- **Admin password env var**: The design specifies `FROG_ADMIN_PASSWORD` on the edge worker's wrangler template. This is set in the stage and prod env sections but not in dev. The admin routes and auth middleware are built (in the frogs-worker and api-edge facade) ahead of APP-3's console admin pages, since they depend on the same infrastructure. The admin pages in the console are deferred to APP-3.
- **No `dev` service binding for FROGS_WORKER**: The wrangler template only binds `FROGS_WORKER` in stage/prod. The binding will be added for dev in a separate change when local development is configured.
- **Database timestamps as TEXT**: D1 doesn't support timestamptz natively; the migration uses ISO 8601 text strings with `strftime`, matching the existing migrations pattern in the project.
- **Admin layout duplicated per page**: The admin `AdminLayout` component is defined inline in each page file (`orders/page.tsx`, `frogs/page.tsx`) rather than as a shared layout in `admin/layout.tsx`. This keeps the admin pages self-contained and matches the pattern elsewhere in the console where layouts are page-local. A shared layout can be extracted later.
- **No `/admin` redirect root**: The design mentions `/admin` as a login page, but the actual login is at `/admin/login`. After login, the user is redirected to `/admin/orders` rather than `/admin`. This is a pragmatic choice — the login page is the functional entry point.
- **Admin frog form validation backend-only**: The frog fields (name, species, size, location) are validated as required by the backend handler, but the frontend relies on HTML `required` attributes. No additional client-side validation is implemented, matching the simple pattern used in the order form.