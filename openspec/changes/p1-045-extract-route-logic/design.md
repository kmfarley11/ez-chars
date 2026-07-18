## Context

Currently, the single-file Svelte route `src/routes/charsheets/5e/+page.svelte` is overcrowded, containing everything from layout templates to static metadata, Zod-parsing validations, reactive store orchestrations, and JSON patch translations. Separating visual composition from data manipulation is necessary to scale the app to support other TTRPG character sheet types (like Pathfinder or 5e 2024).

## Goals / Non-Goals

**Goals:**

- Separate pure calculations and static configuration constants out of [+page.svelte](../../src/routes/charsheets/5e/+page.svelte) to reduce its line count and focus it on layout and orchestration.
- Establish an adapter pattern (Constants, Projections, and Patches) in the local folder structure, laying a reusable blueprint for future game systems.
- Cover all extracted calculation modules with isolated Vitest unit tests in a local `__tests__/` directory.

**Non-Goals:**

- Migrating `$charsArray` or other Svelte stores to a different architecture (this is deferred to `p1-050`).
- Consolidating the component definitions in `src/lib/` or changing the grid interaction model.
- Restructuring visual CSS layouts or changing color themes.

## Decisions

### Decision 1: Establishing the Sheet Adapter Blueprint
To align with the goal of supporting multiple TTRPG systems, we will structure the extracted files around an adapter pattern. The route page will only import this adapter, ensuring the Svelte orchestration layer remains uniform across different game folders.

For 5e 2014, the adapter will consist of:
1. `sheetConstants.ts`: Houses all static configurations.
2. `sheetProjections.ts`: Exposes a pure projection function `project5eCharacter(char)` returning `GridContentData`.
3. `sheetPatches.ts`: Exposes a pure patch translation function `normalize5ePatches(char, patches)` returning a clean `JSONPatchDocument`.

*Alternatives Considered:*
- *Generating a global schema-driven registry:* Deferred for now. Creating a centralized layout registry to dynamically load sheet components makes sense long-term once we support multiple similar schemas (like 5e 2024, Nimble 5e, Pathfinder). For the current single-system MVP, building local adapters avoids upfront over-abstraction while establishing the clean interfaces required for a future registry. We will document this decision and roadmap in `docs/decisions/2026-07-17-sheet-architecture-adapter-vs-registry.md`.

### Decision 2: Location of Extracted Helper Files
The helper files will live under `src/routes/charsheets/5e/` rather than in a global `src/lib/` or `src/schema/` namespace. This keeps sheet-specific layout projections and constants local to the page route they decorate, leaving global directories clean.

### Decision 3: Keeping Route Reactive and Helpers Pure
All extracted helpers must remain pure, side-effect-free, and stateless. Svelte stores (`$charsArray`), page props, search params, and save dispatching logic remain inside [+page.svelte](../../src/routes/charsheets/5e/+page.svelte). The helpers will receive the raw `CharacterDocument5e2014` object and return the computed properties or patches.

## Sheet Adapter Registry Roadmap

The design separates D&D 5e-specific calculations into localized adapter helpers (`sheetProjections.ts`, `sheetPatches.ts`). While these helpers remain local to the route folder for now, they establish the clean, stateless interfaces necessary to transition to a global schema-driven registry in the future:

1. **System Adapters Contract:**
   - Any future system (e.g., Pathfinder 2e) will implement the same adapter signature:
     - `project(char: TChar): GridContentData`
     - `normalizePatches(char: TChar, patches: GridContentPatch[]): JSONPatchDocument`
2. **Dynamic Route Registration (Long-Term):**
   - Once multiple sheets are implemented, the route path can be unified into a single dynamic Svelte route (e.g., `src/routes/charsheets/[id]/+page.svelte`).
   - A central registry (`src/schema/registry.ts`) will map `systemId` (e.g., `dnd5e-2014`, `pathfinder-2e`) to its respective adapter class and dynamic JSON layout configuration.
   - This ensures we retain maximum visual layout flexibility for system-specific sheet details while eliminating route-level boilerplate duplication.

## Risks / Trade-offs

- **[Risk]** The virtual path mapping rules (e.g. `__spellLevelList`, `__inventory`) are complex, and refactoring them could introduce regressions where editing a field fails to patch the character document correctly.
  - **[Mitigation]** The Playwright browser smoke test suite (`npm run test:e2e`) and the new Vitest unit tests will validate both calculations and end-to-end character updates before check-in.
