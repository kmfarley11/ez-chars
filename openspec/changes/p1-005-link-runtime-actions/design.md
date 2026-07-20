## Context

The approved [runtime-action templating architecture](../../../../docs/decisions/2026-07-19-runtime-action-templating-architecture.md) establishes an atomic link from a runtime action to a character-owned inventory item, spell, or feature while keeping the shared source records generic. This change is the first delivery slice: inventory items have required stable IDs today, whereas 5e spell and feature references still permit missing IDs and need a dedicated schema-identity decision before they can be safe link targets.

The current canonical 5e character layout is the strict, versioned `dnd5e-2014.v2` shape. Persisting a new optional source property while retaining the v2 label would make two different strict layouts claim the same version. This change therefore advances the current layout to `dnd5e-2014.v3` and migrates v2 documents without inventing source links or otherwise changing their semantics.

## Goals / Non-Goals

**Goals:**

- Suggest runtime-action snapshots from equipped inventory items through a narrow 5e-specific asynchronous boundary.
- Persist accepted actions with an atomic item-source link while keeping every accepted action independently editable.
- Keep the runtime summary player-focused by presenting each action once with its note content visible while retaining the current card-level bulk editing controls.
- Keep ID allocation, reducer behavior, asynchronous component states, and migration tests deterministic.
- Establish an inventory implementation that can be widened to spell and feature sources through a subsequent explicit change rather than a speculative present-day adapter contract.

**Non-Goals:**

- Implement spell- or feature-derived actions in this change. Refined backlog item `p1-061` owns their stable-identity and source-specific behavior.
- Implement automatic field propagation or per-field override tracking. The source relationship supports status, navigation, and explicit resync; it is not a live normalized view.
- Add external compendium fetching, a bundled SRD rules database, rules automation, a multi-system registry, or a universal source adapter.
- Change the generic core item or feature schemas.
- Redesign item-level editing for every grid-backed collection or rename the repository-wide annotation Notes affordance.

## Decisions

### 1. Version the persisted source-link shape

Advance the canonical layout constant to `dnd5e-2014.v3`. Freeze the existing v2 character/action shape as a historical input schema, classify v2 as a supported historical version, and migrate it to v3 by preserving all character content and changing only the data-layout version. Existing pre-v2 entry paths must continue through their current semantic normalization and then through the v2-to-v3 step before current-schema validation.

The current runtime-action schema will reference a named, strict item-source schema equivalent to:

```ts
const runtimeActionSourceSchema = z
	.object({ kind: z.literal('item'), id: z.string().min(1) })
	.strict();
```

Naming this data invariant makes the later union widening deliberate without accepting unsupported spell/feature links today. The action source always identifies a character-owned record; future external rules-provider identity belongs on the source record or in an enrichment layer, never in this link.

### 2. Treat accepted actions as linked snapshots

The source link is referential metadata, not a substitute for materialized runtime-action fields. Acceptance copies the suggestion into a new action. Later source edits do not affect it automatically.

Explicit resync reads the current source item and overwrites exactly `name` and `notes`; if source notes are absent, stale snapshot notes are removed. The reducer preserves `id`, `source`, `timing`, `category`, `target`, `annotations`, and any future fields it does not explicitly resync. Multiple runtime actions may share one source item because variants and situational actions are valid.

Automatic bubbling plus an override mask remains a possible later refinement only if playtesting demonstrates that explicit resync is too cumbersome. It is intentionally not encoded now.

### 3. Keep the async seam inventory-specific and transient

Create `src/lib/compendium/dnd5e2014/suggestInventoryRuntimeActions.ts` with this narrow boundary:

```ts
async function suggest5eInventoryRuntimeActions(
	items: ReadonlyArray<Item>
): Promise<RuntimeActionSuggestion[]>;
```

`RuntimeActionSuggestion` is a transient type colocated with this boundary, not another persisted Zod schema. It omits action identity and annotations, includes the runtime fields a future suggestion may populate, and requires the item source link. The MVP implementation returns one suggestion for every item whose `equipped` value is exactly `true`, preserves input order, copies `name` and optional `notes`, and performs no text matching or mechanical inference.

The source-specific function name avoids implying a stable universal source collection. A future spell/feature change may add its own narrow lookup or deliberately introduce a composition layer once concrete requirements exist.

### 4. Commit source-sensitive changes through typed intents

Add feature-local `accept-runtime-action-suggestion` and `resync-runtime-action` intents to the existing 5e reducer boundary.

- Acceptance verifies that the referenced item still exists and is equipped at commit time, allocates the action ID through the reducer's existing injected `createId` boundary, and appends the snapshot. This prevents a stale asynchronous result from creating a dangling source link.
- Resync identifies the action by ID, resolves its current item source, and updates only `name` and `notes`. Missing actions, non-item/custom actions, and missing sources produce structured reducer issues rather than partial writes.
- The existing `replace-runtime-actions` edit path must continue spreading the current record so ordinary edits preserve source metadata.
- `replace-inventory-group` computes removed IDs from the previous records in the edited group and the committed replacement records, then strips matching action-source links in the same validated transaction. Action fields and order remain unchanged.

### 5. Compose row-oriented runtime actions around the existing bulk editor

Build a 5e-local runtime-action component that owns the player-facing action list. Each action appears exactly once: name, timing, and category form its primary summary; an optional target may remain concise secondary metadata; and non-empty player-authored notes appear as secondary italic text. Remove the separate action-source status list.

Retain one `GridContent` instance with the original collection descriptor so its existing card-level Edit and Notes workflows remain the only value-editing and annotation entry points in this change. If composition requires suppressing the generic value summary to avoid duplicating the feature-local list, permit only the smallest semantic-free controls-only presentation option. Do not add per-action editor descriptors, direct row Edit/Notes controls, runtime-action callbacks, or source semantics to the generic grid API.

For linked actions, render one compact feature-local source menu on the action row with commands such as "View Longsword" and "Resync from source." Custom actions render no source menu and need no persistent custom-status label. This keeps source operations discoverable without duplicating every action in a second list.

The component continues to receive a suggestion loader and callbacks for acceptance, resync, and navigation. Production uses the inventory suggestion function; Storybook and component tests inject resolved, pending, and rejected loaders so loading, empty, failure, linked, and custom states are deterministic. Storybook's stateful harness applies the same projection, patch decoder, and typed reducer path as production so row presentation, bulk editing, annotation access, acceptance, and resync remain useful to humans and testable in the browser. Manual and bulk action creation remain available in every suggestion-request state.

Source navigation remains route-owned because the route owns sheet layout. It resolves the item to its current inventory group, scrolls a focusable wrapper around that group card into view, and moves focus to the wrapper. This supplies a concrete keyboard-visible destination without teaching the generic grid component about runtime-action links.

### 6. Preserve source kinds as an explicit follow-up

This change completes only the inventory slice of the original `p1-005` outcome. During backlog reconciliation, move that completed slice to `Done Recently` while preserving refined item `p1-061` for spell and feature sources. The follow-up covers stable spell/feature identity, their source-specific suggestion semantics, deletion fallback, navigation targets, and widening the atomic source union; it must not be collapsed into a generic adapter task.

## Risks / Trade-offs

- **[Risk] A data-layout bump adds migration work for one optional field.** → Use the sequential migration boundary built by `p1-060`; the v2-to-v3 transformation changes only the version marker and is protected by identity, semantic-equivalence, idempotence, storage, and import/export tests.
- **[Risk] Asynchronous results become stale before acceptance.** → Revalidate the source item's existence and equipped state inside the acceptance reducer transaction.
- **[Risk] Resync erases unrelated customization.** → Update only `name` and `notes`, test preservation of every other current field, and treat absent source notes as an intentional clearing operation.
- **[Risk] Feature-local rows duplicate the generic summary.** → Render the runtime summary only in the feature-local list and, if required, use a controls-only presentation option on the one collection-level `GridContent` instance rather than hiding duplicate output through CSS or duplicating editor logic.
- **[Risk] “Notes” may be confused with authored action notes.** → Retain the existing annotation-dialog label for consistency in this change and defer repository-wide annotation terminology to the collection-interaction UX follow-up.
- **[Risk] The item-only schema is mistaken for abandonment of spells/features.** → Preserve the three-kind architecture in the ADR and keep refined follow-up `p1-061` explicitly sequenced during backlog reconciliation.
- **[Trade-off] Snapshots duplicate source text.** → Accept the small local-storage cost for offline stability, independent editing, and graceful source deletion; explicit resync makes the duplication manageable.

## Migration Plan

1. Freeze and test the existing v2 input shape before extending the current runtime-action schema.
2. Add v3 schemas and a pure v2-to-v3 migration; route pre-v2 inputs sequentially through v2 and then v3.
3. Rewire the version constant, factory, hydration, serialization, fixtures, storage, and import/export expectations to the current v3 layout.
4. Add source-link behavior and UI only after old and current unlinked documents hydrate successfully.
5. Replace the first-pass source-status list with the row-oriented runtime summary, compact linked-source controls, and retained card-level bulk workflows without changing the persisted v3 contract.
6. If implementation is rolled back before release, restore the v2 current-schema selection before any v3 document is distributed. Once v3 documents are in use, retain the migration and correct forward rather than silently relabeling the shape.

## Open Questions

None block implementation. Spell and feature identity/source semantics remain deliberately deferred to the required follow-up change. The repository-wide name for annotation/reference-note affordances remains a non-blocking UX follow-up; this change retains the current Notes label.
