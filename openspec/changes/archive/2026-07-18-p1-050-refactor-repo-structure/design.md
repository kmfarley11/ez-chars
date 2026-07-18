## Context

The repository's `src/lib/` folder currently houses an ad-hoc mixture of Svelte UI components, DOM string formatting utilities, application storage synchronization, and configuration files. With the 5e schema normalized in `p1-060`, the data foundation is solid, but development velocity is hampered by poor discoverability and entangled module boundaries. Furthermore, `src/data.ts` serves as a catch-all root-level store wiring file.

## Goals / Non-Goals

**Goals:**

- Segregate visual UI components, non-visual utility helpers, and storage/persistence wiring into their own distinct directories under `src/lib/`.
- Isolate mock/seed data completely to `src/fixtures/`.
- Introduce Vite path aliases (`$components`, `$storage`, `$utils`, `$fixtures`) to replace fragile relative imports across the codebase.
- Preserve Git history during this refactor using `git mv`.

**Non-Goals:**

- Modifying Svelte component implementations or Svelte 5 rune migration (completed in `p1-022`).
- Relocating feature-local 5e modules from `src/routes/charsheets/5e/` to generic folders, as SvelteKit routes naturally benefit from high domain cohesion.
- Adding third-party UI component libraries or form managers.

## Decisions

### Decision 1: Create distinct domain folders inside `src/lib/`

We will partition `src/lib/` into three primary concerns:

- `components/`: Pure visual Svelte files (`BaseButton.svelte`, `GridContainer.svelte`).
- `storage/`: `characterStorage.ts` and the newly relocated `store.ts` (formerly `src/data.ts`).
- `utils/`: Reusable formatters, logic validators, and helpers (`urlHelpers.ts`, `theme.ts`).

Rationale: This isolates visual changes from data changes and simplifies testing.

### Decision 2: Retain `src/routes/charsheets/5e/` feature boundaries

We will NOT move `sheetProjections.ts` or `sheetEditIntents.ts` into a global `$utils` or a generic `src/lib/features/5e/` folder.
Rationale: SvelteKit's file-based routing encourages grouping route-specific logic next to the routes that use it. Since these modules are exclusively used by the 5e sheet, keeping them local reduces indirection.

### Decision 3: Use SvelteKit aliases instead of relative paths

We will add a `kit.alias` mapping in `svelte.config.js`. SvelteKit automatically synchronizes these aliases into `.svelte-kit/tsconfig.json` paths.
Rationale: Relative paths like `../../../../lib/displayHelpers.ts` are fragile to refactoring. `$utils/displayHelpers` is robust.

## Risks / Trade-offs

- **[Risk] Git history loss** → **Mitigation**: We will execute the migration via `git mv` and commit the physical file moves before rewriting the import paths.
- **[Risk] Circular dependencies introduced by alias refactor** → **Mitigation**: Run `npm run check` to ensure TypeScript compilation remains circular-free, as previously validated.
