# frogs-worker — Runbook

## Health check

`GET /health` returns 200 when the worker is reachable.

## D1 database

The worker binds `PLATFORM_DB` (D1) for frog and order persistence. The binding is provisioned through the wrangler template wiring mechanism. No migrations are run by this worker — migrations are applied by `infra/db-migrate` on merge to main.

## Deployment

Deployed as part of the `orun` plan's deploy lane on merge to `main`. The `component.yaml` in this directory defines the deploy profile.