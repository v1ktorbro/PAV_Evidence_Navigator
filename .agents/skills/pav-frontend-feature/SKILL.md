---
name: pav-frontend-feature
description: Implement a new or expanded user-facing feature in the PAV Evidence Navigator React frontend. Do not use for a bug fix, review-only request, or behavior-preserving refactor.
---

# PAV frontend feature

First apply [pav-frontend-core](../pav-frontend-core/SKILL.md). Deliver a complete user flow, not disconnected components.

Trace the screen owner, API contract, loading/error/empty states, and all consumers before editing. Place route-local UI under the owning `src/app` subtree; only promote a component after a real second consumer. Keep the REST request in `src/api`, map transport details at that boundary, and let the screen own the interaction state.

Check keyboard-accessible controls and responsive layout. Validate with `npm run lint` and `npm run build` from `frontend`.
