# Frog Delivery — design

## 1. The resource

Two new resources, stored in D1 under the existing `cloudflare-d1` data plane. The frog catalogue is read-heavy and browsed by unauthenticated visitors; orders are write-heavy and managed by admins.

```
frog
  id              text        frog_<ulid>, unique globally
  name            text        display name of the frog
  species         text        species name
  size            text        size description (e.g. "Small", "Medium", "Large")
  location        text        origin or current location
  created_at      timestamptz
  updated_at      timestamptz

order
  id              text        ord_<ulid>, unique globally
  frog_id         text        references frog.id, not-null
  customer_name   text
  contact_info    text        email or phone
  status          text        one of: pending, in_transit, delivered
  created_at      timestamptz
  updated_at      timestamptz
```

The existing `packages/db` package provides the D1 executor, repositories, and migration runner. A new numbered migration directory creates these tables. The existing repository pattern in `packages/db/src/repositories/` is followed for each resource.

## 2. The API

A new facade in `apps/api-edge` exposes the frog and order operations through the edge. The baseline already has a facade pattern (`apps/api-edge/src/*-facade.ts`) where each bounded-context worker exposes its handlers and the edge routes requests to them. We follow the same pattern with a new `frogs-worker`.

**Public routes (no auth):**

```
GET    /api/frogs                              — list all frogs (name, species, size, location)
GET    /api/frogs/:id                           — full frog details
POST   /api/orders                              — place an order (body: frog_id, customer_name, contact_info)
```

**Admin routes (password-protected):**

```
GET    /api/admin/orders                        — list all orders with status
PATCH  /api/admin/orders/:id/status             — update order status
POST   /api/admin/frogs                         — add a new frog
PUT    /api/admin/frogs/:id                     — edit a frog
DELETE /api/admin/frogs/:id                     — remove a frog
```

Admin routes are protected by a shared secret passed as a header or cookie, validated against an environment variable. This is deliberately simple — no identity-worker integration for the admin area at this stage.

Response envelopes follow the baseline's `{ data, meta }` shape from `packages/contracts`.

Error codes: `400` on validation failure, `401` on missing or bad admin auth, `404` on missing resource, `409` on duplicate frog name. The existing `api-edge` error-handling middleware covers unhandled cases (500).

## 3. The console

**Public pages (no auth):**

- `/` — Home page listing all frogs with name, species, size and location. Each row links to the frog's detail page.
- `/frogs/:id` — Full frog detail page with an order form. The form collects customer name and contact info. On submit, the order is placed and a confirmation page is shown.

**Admin pages (password-protected):**

- `/admin` — A login page (shared-password prompt) that sets a session cookie. Redirects to the admin dashboard after login.
- `/admin/orders` — Table of all orders with status, frog name and customer info. Status-change buttons to mark as "in transit" or "delivered".
- `/admin/frogs` — Table of all frogs with add, edit and remove actions. Add/edit uses a form for name, species, size and location. Remove shows a confirmation.

The console is `apps/web-console-next` (Next.js on Workers + Static Assets). New pages live under `apps/web-console-next/src/app/`. The public pages use the existing layout without the authenticated shell; the admin pages add a minimal auth check via middleware.

## 4. Events, secrets, and integrations

- **No new secrets or provider connections**. The admin password is set via an environment variable (`FROG_ADMIN_PASSWORD`) on the edge worker's `wrangler.jsonc` template, provisioned through the baseline's wiring/secrets mechanism.
- **No audit events or webhooks** in this milestone. Order state changes are logged in the database only.
- **No rate-limiting** changes beyond what the baseline already has in `api-edge`.
- **No billing or metering** integration — ordering is free in this version.

## 5. Out of scope

- **Identity provider integration.** Admin auth uses a shared password, not the baseline's identity-worker or any SSO provider. This can be upgraded later.
- **Email notifications.** Orders are confirmed in-browser only. No email or SMS confirmation.
- **Payment.** Orders are free. Payment integration is a future concern.
- **Image uploads for frogs.** Frog images are not part of the catalogue in this milestone.
- **Search and filtering.** The catalogue lists all frogs. Search and species/location filters are future enhancements.
- **Order cancellation by the visitor.** Only admins can change order status.
- **Audit log.** There is no audit trail for admin actions in this milestone.