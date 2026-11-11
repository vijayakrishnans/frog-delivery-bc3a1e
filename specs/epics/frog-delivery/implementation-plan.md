# Frog Delivery — implementation plan

Milestones land in order. Each is one task, one pull request, landed with `orun pr land`. A milestone is marked ✅ here when its "done when" list is true, and recorded in `IMPLEMENTATION-STATUS.md`.

## APP-1 — The plan, written down

This doc set, merged to `main` and attached to the epic with `orun spec push`.

**Done when**
- `specs/epics/frog-delivery/README.md`, `design.md`, `implementation-plan.md`, `risks-and-open-questions.md` and `IMPLEMENTATION-STATUS.md` exist and are pushed
- `tasks/APP-1.TaskContract.yaml`, `tasks/APP-2.TaskContract.yaml` and `tasks/APP-3.TaskContract.yaml` exist
- Each of the five docs is attached to the epic with `orun spec push`

## APP-2 — Frogs catalogue & ordering

A new `frogs-worker` bounded-context worker behind the edge, a new D1 migration creating the tables, new facade handlers in api-edge, and new public pages in the console. Visitors can browse the catalogue, see frog details, and place orders.

**Done when**
- The home page (`/`) lists frogs with name, species, size and location
- Clicking a frog shows its full details on `/frogs/:id`
- A form on each frog detail page lets a visitor place an order with their name and contact info
- The order is saved and the visitor sees a confirmation
- All new routes return expected responses

## APP-3 — Delivery management

A password-protected admin area in the console and corresponding admin API routes through the edge. Admins can manage orders and the frog catalogue.

**Done when**
- A password-protected admin page lists all orders with their status
- An admin can mark an order as "in transit" or "delivered"
- An admin can add a new frog to the catalogue with name, species, size and location
- An admin can edit or remove a frog from the catalogue

## Sequencing note

APP-2 must land first because it creates the database tables, the worker and the facade that APP-3 extends. APP-3 adds admin routes on top of the same resources and worker — it depends on the schema and the worker infrastructure that APP-2 establishes. There is no overlap in the console pages (public vs admin), so they can be reviewed independently, but APP-3 cannot be built before APP-2 because the database tables and workers must exist. Task contracts and design docs must be finalised in APP-1 before any code changes begin.