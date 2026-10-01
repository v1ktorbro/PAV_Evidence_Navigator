---
name: pav-frontend-core
description: Project conventions for the PAV Evidence Navigator React and TypeScript frontend. Use for implementing, debugging, refactoring, reviewing, or configuring code under frontend/.
---

# PAV frontend core

This skill adapts the `t-front` skill set for this repository's Vite React client.

## Structure and ownership

- Keep application screens and screen-local composition in `src/app/<domain>`.
- Put reusable domain-agnostic UI in `src/components`; primitives belong in `src/components/ui/<PascalCase>`.
- Keep shared API contracts in `src/assets/types/<domain>` and HTTP calls in `src/api`.
- A component uses a PascalCase `.tsx` filename and a neighbouring camelCase `.module.scss` stylesheet. Import the stylesheet as `scss`.
- Keep one-use hooks, types, and pure helpers with their feature. Move them to `assets` only once they have a genuine second consumer.

## React and TypeScript

- Use functional components. Default-export the primary component; use named exports for utilities and types.
- Name handlers `handle<Action>`, callbacks `on<Action>`, booleans `is`/`has`/`can`, and constants `UPPER_SNAKE_CASE`.
- Use `import type` for erased contracts. Do not introduce barrels or aliases just to shorten an import.
- The owner of a screen or collection owns its request, filter, loading, and error state. Do not duplicate API state into another state layer without a concrete need.
- Async UI must expose loading and error outcomes; preserve user input on failure and clear it only after confirmed success.

## Styling

- Do not use Tailwind or inline layout utilities. Component layout, states, and responsiveness belong in the neighbouring SCSS module.
- Reuse tokens from `src/styles/palette.scss` and `constants.scss`; use the `media` and `mixin` modules instead of recreating breakpoints and transitions.
- Global selectors are restricted to `src/styles`. Do not add a global selector for a component.
- Use camelCase class names and `root` for the component root. Keep visual spacing on a 4px/rem grid.
- Format SCSS for reviewability: put every declaration on its own line and leave exactly one blank line between rule sets (including class selectors). Do not use one-line rule sets.

## Verification

Run `npm run lint` and `npm run build` from `frontend` after code or configuration changes. Read [project map](references/project-map.md) for the current ownership map.
