# Frog Delivery (EP-1)

**Frog Delivery is a public frog-ordering application built on the Cirrus SaaS baseline. Today there is no way to browse or order frogs online. This epic delivers a public catalogue of frogs available for delivery, an ordering flow for visitors, and a password-protected admin area to manage orders and the catalogue. The one design idea that makes it possible: the baseline's api-edge and web-console-next already provide the patterns for public routes, server-rendered pages, D1 persistence, and service bindings — we extend them rather than start from scratch.**

Frog Delivery is for visitors who want to order live frogs for delivery and for the team that manages orders. When it ships, anyone can browse the catalogue, see frog details, and place an order, and an admin can track fulfilment and manage the catalogue.

## Status

| Field | Value |
|-------|-------|
| Status | Draft |
| Cluster | **APP** (APP-1–APP-3) |
| Owner(s) | `apps/frogs-worker` (the resource) · `packages/contracts` + `packages/db` (the wire) · `apps/web-console-next` (the surface) |
| Builds on | `cirrus-baseline baseline-v28` — extends the edge API, the console, the D1 database, and the contracts package |
| Changes | Adds two new bounded-context Workers (frog catalogue + ordering), a new public surface in the console, and a simple password-protected admin area |
| Decisions locked | (1) Frogs and orders live in a new D1 schema, served by a new facade through the edge. (2) The console adds unauthenticated catalogue pages and a password-gated admin section. (3) Authentication for admin is a simple shared-password check — no identity-worker integration in this milestone. |
| Gate | APP-2 is the first user-visible change (visitors can see frogs and order). APP-3 extends it with admin controls. |
| Shipped as | |

## Read order

1. `design.md` — the resource, the routes, the surfaces, what is out of scope
2. `implementation-plan.md` — the milestones and what "done" means for each
3. `risks-and-open-questions.md` — what could go wrong and what was decided
4. `IMPLEMENTATION-STATUS.md` — what actually shipped (kept distinct from intent)

## Milestones at a glance

| Milestone | What it lands | Done when |
|---|---|---|
| APP-1 — The plan, written down | this doc set | the five docs exist, task contracts written, `orun spec push` run |
| APP-2 — Frogs catalogue & ordering | public frog catalogue and ordering | visitors can browse frogs, see details, place orders, and receive confirmation |
| APP-3 — Delivery management | admin area for orders and catalogue management | admins can list orders, update status, and add/edit/remove frogs |