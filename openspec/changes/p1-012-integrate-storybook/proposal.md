## Why

We are preparing for Phase 2 (UX Polish & Playtest Prep) and recognize the need to improve "Dev UX" significantly. Building Svelte 5 components directly within the main character sheet requires navigating complex 5e state hydration and layout grids, making it slow and brittle. We need a way to isolate visual UI components so they can be built, styled, and audited independent of the application logic. This will allow human developers and AI agents to rapidly iterate on visual primitives.

## What Changes

- Initialize Storybook using the official `@storybook/svelte-vite` framework for local development.
- Configure Storybook to inherit the existing Vite setup (CSS imports, `$components` and `$utils` aliases).
- Enforce the use of standard TypeScript Component Story Format (CSF) `.stories.ts`.
- Install and configure `@storybook/addon-a11y` to run real-time accessibility audits (axe-core) on components.
- Write 2-3 baseline stories for core atoms (e.g., `BaseButton`, `Heading`) as proof of concept.

## Capabilities

### New Capabilities
- `component-sandbox`: A local development sandbox and accessibility testing environment for UI components.

### Modified Capabilities
None.

## Impact

- **Code:** Adds new `.stories.ts` files alongside components in `src/lib/components`.
- **Dependencies:** Adds Storybook and related addons to `devDependencies` in `package.json`.
- **Workflows:** Adds new `npm run storybook` command to `package.json`. Adds accessibility auditing to the component development loop.
