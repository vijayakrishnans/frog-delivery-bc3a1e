# Frog Delivery — risks and open questions

Each entry is a letter, a title, and a state: **RISK** (open, with a mitigation), **RESOLVED** (decided; say what and why), **ACCEPTED** (a cost we carry knowingly), **SETTLED** (decided for now; revisit on a stated cadence).

## APP-A — Shared-password admin auth (ACCEPTED)

Admin authentication via a shared environment variable password is deliberately simple and carries no user-level identity, session revocation, or audit trail. If the password is leaked, anyone who has it can manage orders and the catalogue.

Mitigation: we accept this for the initial milestone. The password is set per-environment through the wiring/secrets mechanism, which keeps it out of the codebase and allows rotation. Upgrading to identity-worker-backed auth with per-admin accounts is a future task (tracked in design.md §5 out of scope).

## APP-B — D1 transaction limits on order placement (RISK, mitigated)

Cloudflare D1 does not support interactive transactions. The baseline handles this through the existing `db` package patterns. Order placement requires a frog existence check and an insert — under concurrent writes, two visitors could theoretically place an order for the same frog with stale read. For a frog-ordering app this is an ordering-system concern, not a data-loss concern.

Mitigation: the facade validates the frog exists at write time within a single D1 query batch. If the frog is removed between the page load and the order submission, the order insert fails cleanly with a 404, and the visitor sees an error message. This is an acceptable UX trade-off.

## APP-C — No image support in the catalogue (RESOLVED)

Option A (rejected): store images as blob in D1 or external object storage — adds complexity, cost, and an upload pipeline with no clear use case for the initial milestone.

Option B (chosen): no images in the catalogue. Frogs are described by name, species, size and location. Images can be added as a future enhancement. This keeps the initial CRUD surface simple and avoids an upload pipeline.

Reason: nothing in the done-when conditions requires images. Adding them later does not change the data model or the API surface — only the frog create/edit forms and the display pages.

## APP-D — Single D1 database (ACCEPTED)

Frog and order tables share the same D1 database as the rest of the SaaS baseline. This creates a coupling — a migration or incident in a different domain could affect the frog catalogue. For an app in early milestones this is acceptable; separating into a dedicated D1 namespace is a scaling concern, not a launch concern.