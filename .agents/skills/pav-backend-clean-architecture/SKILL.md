---
name: pav-backend-clean-architecture
description: Implement, refactor, diagnose, or review the FastAPI backend of PAV Evidence Navigator using Clean Architecture. Use for changes under backend/; do not use for frontend-only work.
---

# PAV backend Clean Architecture

The backend uses the common layered Clean Architecture variant. Dependencies point inward:

```text
presentation → application → domain
infrastructure → application/domain contracts
```

## Ownership

- `backend/app/domain`: pure evidence rules and domain transformations. No FastAPI, HTTP client, environment, or filesystem framework concerns.
- `backend/app/application`: use cases that coordinate domain functions and dependency boundaries. This is where an API action becomes a business operation.
- `backend/app/infrastructure`: adapters for files, HTTP services, and external systems. Keep provider-specific payloads and error translation here.
- `backend/app/presentation`: request/response schemas, HTTP routes, status mapping, and dependency wiring. It must not contain selection or filtering rules.
- `backend/app/config.py`: environment-backed configuration only.

## Change rules

1. Start from the public API contract and trace to the owning use case before modifying code.
2. Add a use case before adding route orchestration. Keep route handlers thin and translate known infrastructure errors to HTTP errors at the presentation edge.
3. Add a port/protocol in the application or domain layer before introducing a second interchangeable infrastructure adapter. Do not over-abstract a single local adapter.
4. Preserve `/api` response shapes unless the requested change explicitly changes the public contract.
5. Keep external credentials in environment configuration. Never pass them to frontend responses or logs.

## Verification

Run the backend test suite from the repository root in the project Python environment: `pytest backend/tests`. For container delivery, build with `docker compose build backend` and verify `/api/health` after startup.
