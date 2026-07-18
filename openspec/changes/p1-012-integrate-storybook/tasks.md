## 1. Environment Setup

- [ ] 1.1 Run `npx storybook@latest init --type svelte` to scaffold the Storybook configuration within the Vite environment. Choose yes to any prompts for automatic setup of eslint/vite plugins if asked.
- [ ] 1.2 Install `@storybook/addon-a11y` as a devDependency.
- [ ] 1.3 Update `.storybook/main.js` (or `.ts`) to register the `@storybook/addon-a11y` addon in the `addons` array.

## 2. Configuration & Integration

- [ ] 2.1 Update `.storybook/preview.js` (or `.ts`) to import the global `src/app.css` file so that styling and CSS variables load correctly.
- [ ] 2.2 Verify that Storybook correctly inherits Vite's `kit.alias` settings (such as `$components` and `$utils`) so that component imports resolve properly in stories. Add Vite explicit alias configuration in `.storybook/main.js` if it does not automatically inherit SvelteKit's configuration.

## 3. Baseline Stories

- [ ] 3.1 Create `src/lib/components/BaseButton.stories.ts` and write a baseline story showcasing its primary states (e.g., default, disabled).
- [ ] 3.2 Create `src/lib/components/Heading.stories.ts` and write a baseline story showcasing its styles.
- [ ] 3.3 Verify that running `npm run storybook` successfully builds the dashboard and passes the axe-core accessibility tests in the Addon panel for both baseline stories.

## 4. Backlog Updates & Reconciliation

- [ ] 4.1 Prune `p1-012` from the prioritized P1 queue in `docs/backlog.md`.
- [ ] 4.2 Add `p1-012` to the `## Done Recently` section in `docs/backlog.md` with a brief summary of the Storybook integration.
- [ ] 4.3 Reconcile the 'Next recommended target' header in `docs/backlog.md` to point to `p1-005` as the next active goal.

## Executor Recommendation

**Recommended Executor:** Codex (Medium reasoning, simple complexity)
**Rationale:** The tasks involve standard package installation, basic Vite/Storybook configuration, and writing simple TypeScript Component Story Format (CSF) files. There is no complex 5e business logic involved, making it a straightforward configuration and scaffolding task perfectly suited for a standard implementation agent.
