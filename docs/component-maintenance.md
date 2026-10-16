# Component and Catalog Maintenance

Use this map to find an existing component before creating another one. The [composition decision](decisions/2026-07-25-classify-ui-component-composition.md) owns the rationale; this guide owns everyday navigation and contribution practices.

## Source and Catalog Map

| Responsibility                                   | Source                                                                        | Storybook                                   |
| ------------------------------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------- |
| Shared controls, focused groupings, workflows    | [ui](../src/lib/ui/README.md): `atoms/`, `molecules/`, `organisms/`           | Design System / Atoms, Molecules, Organisms |
| Game-specific presentation, projection and edits | [systems](../src/lib/systems/README.md): `dnd5e-2014/components/`, `editing/` | Systems / D&D 2014                          |
| Actual sheet composition with canonical data     | `src/lib/systems/dnd5e-2014/pages/`                                           | Systems / D&D 2014 / Character Sheet        |
| App navigation, list, import/export              | `src/lib/components/`, `src/routes/components/`                               | Application                                 |
| Explicitly deferred experiments                  | `src/lib/storybook/concepts/`                                                 | Concepts                                    |

Stories and wrappers live beside their component; contract tests live in nearby `__tests__/` directories. For example, start with `ui/atoms/icon-button.svelte` and `icon-button.stories.ts`, or `ui/organisms/read-first-detail.stories.ts` for a composed independent-edit workflow. The responsive CharacterList story exercises the shared table presentation in its actual application owner.

Bryltin, Zindra and Saturated Pages mount the **same** `character-sheet.svelte` as the app route, with isolated cloned data, local navigation and reset. They are authoritative composition examples, not persistence or browser-history demonstrations. Their visible Canvas introduction explains rejected-write coverage and host limits. System section/error stories retain smaller useful boundaries. Generic organisms instead use small schema-light data to demonstrate reusable behavior, not a parallel 5e renderer.

## Ownership and Dependencies

### Find the interaction pattern

Interaction tiers describe player behavior, not atom/molecule/organism size:

| Familiar term       | Current pattern                                                 | Smallest useful catalog example                                                                                                                                         |
| ------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tier 1 / edit-first | Direct inline value editing, Save/Cancel and independent notes  | Design System / Molecules / Edit-first (Tier 1 Field); implementation: `grid-primitive-field.svelte`                                                                    |
| Tier 2 / read-first | Label opens focused detail; fields save independently within it | Design System / Organisms / Read-first Detail (Tier 2 Field)                                                                                                            |
| Tier 3 / collection | Search, bounded rows, priority and focused record entry         | Design System / Organisms / Collections (Tier 3 Field); implementation: `grid-content-list.svelte`; system stories cover domain-owned Add/Remove and grouping/filtering |

Use FieldGroupView for mixed-field layout and the canonical Pages for these patterns together. A collection record can itself use read-first detail; tiers are not mutually exclusive component classes. Do not create a duplicate organism just to mirror a tier name. The molecule's existing Default, Annotated and QuietAffordance fixtures retain distinct primitive states; QuietAffordance is not the current read-first workflow.

For tables, Design System / Molecules / Table / Composition demonstrates Table, TableHeader, TableRow and TableCell together. Application / CharacterList remains the responsive integration example. Separate isolated row/cell stories are unnecessary unless they acquire a distinct behavior or state.

### Dependency boundaries

Application hosts → system composition → shared UI → neutral contracts/utilities. Production never imports stories or concepts. Shared UI must not choose a game system indirectly through a helper, reference catalog or default provider. Inject domain resolution/mutations at the owning system boundary.

Keep `src/schema/`, `src/lib/storage/`, `src/fixtures/`, `src/lib/resources/` and neutral `src/lib/utils/` in their existing homes. They are not alternative component directories. Route hosts own persistence and browser navigation; story hosts own sandbox state. The concrete 2014 edit session serves both hosts—do not copy its decoding or validation into a story.

Shared semantic table, row and cell presentation does not own columns, responsive cards or record actions. Those remain in CharacterList. Native elements need not acquire wrappers unless reuse or a shared behavior justifies them.

## Naming and Reuse

- Use kebab-case folders and filenames for new or moved components, helpers, stories and tests; retain PascalCase component identifiers in code.
- Within a system folder, prefer short component names such as `QuickReference`; the folder/import path and Systems / D&D 2014 catalog parent identify the system. Keep qualification for exported domain/schema APIs or alias imports when combining multiple systems. Do not repeat `Dnd5e2014` in every component/story label.
- Preserve framework conventions (`+page.svelte`, `+page.js`) and existing retained subsystem/app filenames. Do not rename unrelated files merely to satisfy this convention.
- First inspect the closest shared component and its stories. Reuse it when its contract fits; extend a focused variant when the requirement is genuinely shared; create a component only for a distinct responsibility. Explain any deliberate bypass.
- Classify by responsibility, not size: atoms are primitives, molecules perform one focused UI job, organisms coordinate a region/workflow. System-owned organisms need not become generic. Pages are concrete compositions; speculative templates remain deferred.
- Keep optional value context, paired fields, independent saves, notes, pinning, density and error behavior in their existing shared boundaries rather than reproducing them in a page.

## Contribution Checklist

1. Locate the production consumer and closest sandbox; decide ownership before editing.
2. Keep domain rules and state ownership out of generic UI. Story-local controls may simulate rejection/reset, but must not reimplement domain saves.
3. Add a story only for a distinct fixture, render/layout boundary or error state. Reuse its viewport controls for phone review. No Storybook play functions; use explicit manual bullets and the owning Vitest/Playwright layer for repeatable contracts.
4. Label provenance and host limitations visibly when a sandbox could be mistaken for the application. Canonical Pages must retain real values, edit behavior and isolated writes.
5. Before retiring a proof, map unique evidence to retained stories/tests. Preserve intentionally deferred concepts with a backlog trigger; obsolete interaction semantics need not survive as tests.
6. Run the relevant [verification gates](verification.md), including the separate catalog host regression suite for host changes. Render/accessibility checks do not establish manual story-switching or physical-device behavior.
7. Update imports, source/catalog links and any changed ownership guidance in the same change. Put broader follow-ups in the backlog, not only in a proof description.
