## Context

Our application relies on a rich, highly-interactive UI for the D&D 5e character sheet. However, developing Svelte 5 components within the main application context (`src/routes/charsheets/5e/+page.svelte`) forces developers and AI agents to contend with complex 5e state hydration and layout grids, slowing down visual development. We need a local component sandbox.

## Goals / Non-Goals

**Goals:**
- Provide an isolated rendering environment for our Svelte 5 UI components using Storybook.
- Allow developers and AI agents to build, test, and view UI states without running the full app.
- Provide continuous, real-time accessibility auditing via the Axe-core engine.
- Establish `.stories.ts` as the standard contract format for components.

**Non-Goals:**
- Automated visual regression testing (e.g., Chromatic).
- Deploying Storybook to GitHub Pages or any remote hosting.
- Writing stories for page-level or highly-complex composite layouts (e.g., `GridContainer`).

## Decisions

1. **Use `@storybook/svelte-vite` with TypeScript CSF**:
   We will initialize Storybook using its native Svelte-Vite builder, but we will write our stories in TypeScript (`.stories.ts`) rather than Svelte CSF. TS CSF is the industry standard, ensuring maximum compatibility with AI code generators and avoiding breakage when Svelte compiler versions shift (e.g., Svelte 5 runes).

2. **Integrate `@storybook/addon-a11y`**:
   We will configure Storybook with the accessibility addon to surface contrast and ARIA issues immediately during component development, aligning with our P1 mobile/accessibility goals.

3. **Reuse Vite configuration**:
   Storybook's Vite builder will be configured to automatically inherit our existing `svelte.config.js` aliases (`$components`, `$utils`) so that stories and components can resolve paths correctly. It must also import the global `app.css` to ensure our CSS variables and vanilla styling rules are applied in the Storybook iframe.

## Risks / Trade-offs

- **Risk: Storybook bloats `package.json` dependencies.**
  - **Mitigation:** Storybook and all its addons will be strictly confined to `devDependencies`. It will not affect the production build of the SvelteKit app.
- **Risk: AI agents failing to navigate Storybook visually.**
  - **Mitigation:** We explicitly define that agents should use headless commands (e.g. `@storybook/test-runner`) to verify components rather than attempting to render and navigate the local Storybook dashboard in a headless browser.
