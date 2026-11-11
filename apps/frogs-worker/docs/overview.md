# frogs-worker — Frog Delivery API worker

A bounded-context Cloudflare Worker behind `apps/api-edge` serving the Frog Delivery catalogue and ordering operations. Exposes frog and order CRUD through the edge's facade pattern, with D1 persistence.

## Routes

**Public routes** (forwarded through api-edge):
- `GET /api/frogs` — list all frogs
- `GET /api/frogs/:id` — get frog details
- `POST /api/orders` — place an order

**Admin routes** (forwarded through api-edge, password-protected):
- `GET /api/admin/orders` — list all orders
- `PATCH /api/admin/orders/:id/status` — update order status
- `POST /api/admin/frogs` — add a frog
- `PUT /api/admin/frogs/:id` — edit a frog
- `DELETE /api/admin/frogs/:id` — remove a frog