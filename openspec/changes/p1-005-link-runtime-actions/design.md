## Context

The approved [runtime-action templating architecture](../../../../docs/decisions/2026-07-19-runtime-action-templating-architecture.md) establishes an atomic link from a runtime action to a character-owned inventory item, spell, or feature while keeping the shared source records generic. This change is the first delivery slice: inventory items have required stable IDs today, whereas 5e spell and feature references still permit missing IDs and need a dedicated schema-identity decision before they can be safe link targets.

The current canonical 5e character layout is the strict, versioned `dnd5e-2014.v2` shape. Persisting a new optional source property while retaining the v2 label would make two different strict layouts claim the same version. This change therefore advances the current layout to `dnd5e-2014.v3` and migrates v2 documents without inventing source links or otherwise changing their semantics.

## Goals / Non-Goals

**Goals:**

- Suggest runtime-action snapshots from equipped inventory items through a narrow 5e-specific asynchronous boundary.
- Persist accepted actions with an atomic item-source link while keeping every accepted action independently editable.
- Keep ID allocation, reducer behavior, asynchronous component states, and migration tests deterministic.
- Establish an inventory implementation that can be widened to spell and feature sources through a subsequent explicit change rather than a speculative present-day adapter contract.

**Non-Goals:**

- Implement spell- or feature-derived actions in this change. Refined backlog item `p1-061` owns their stable-identity and source-specific behavior.
- Implement automatic field propagation or per-field override tracking. The source relationship supports status, navigation, and explicit resync; it is not a live normalized view.
- Add external compendium fetching, a bundled SRD rules database, rules automation, a multi-system registry, or a universal source adapter.
- Change the generic core item or feature schemas.

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

### 5. Compose feature-local source controls around the generic editor

Build a 5e-local runtime-action component that composes the existing `GridContent` action editor with suggestion and per-action source controls. Do not add item/action semantics to `GridContent` and do not create a generic extension API solely for this feature.

The component receives a suggestion loader and callbacks for acceptance, resync, and navigation. Production uses the inventory suggestion function; Storybook and component tests inject resolved, pending, and rejected loaders so loading, empty, failure, linked, and custom states are deterministic. Storybook wraps the component in a small stateful harness that applies the same projection, patch decoder, and typed reducer path as production, so the catalog remains a useful human playground rather than stopping at callback-spy assertions. Manual action creation through the existing editor remains available in every request state.

Source navigation remains route-owned because the route owns sheet layout. It resolves the item to its current inventory group, scrolls a focusable wrapper around that group card into view, and moves focus to the wrapper. This supplies a concrete keyboard-visible destination without teaching the generic grid component about runtime-action links.

### 6. Preserve source kinds as an explicit follow-up

This change completes only the inventory slice of the original `p1-005` outcome. During backlog reconciliation, move that completed slice to `Done Recently` while preserving refined item `p1-061` for spell and feature sources. The follow-up covers stable spell/feature identity, their source-specific suggestion semantics, deletion fallback, navigation targets, and widening the atomic source union; it must not be collapsed into a generic adapter task.

## Risks / Trade-offs

- **[Risk] A data-layout bump adds migration work for one optional field.** → Use the sequential migration boundary built by `p1-060`; the v2-to-v3 transformation changes only the version marker and is protected by identity, semantic-equivalence, idempotence, storage, and import/export tests.
- **[Risk] Asynchronous results become stale before acceptance.** → Revalidate the source item's existence and equipped state inside the acceptance reducer transaction.
- **[Risk] Resync erases unrelated customization.** → Update only `name` and `notes`, test preservation of every other current field, and treat absent source notes as an intentional clearing operation.
- **[Risk] Feature-local UI duplicates generic editing behavior.** → Compose the existing `GridContent` editor instead of reimplementing it; keep only suggestion/source controls in the feature-local wrapper.
- **[Risk] The item-only schema is mistaken for abandonment of spells/features.** → Preserve the three-kind architecture in the ADR and keep refined follow-up `p1-061` explicitly sequenced during backlog reconciliation.
- **[Trade-off] Snapshots duplicate source text.** → Accept the small local-storage cost for offline stability, independent editing, and graceful source deletion; explicit resync makes the duplication manageable.

## Migration Plan

1. Freeze and test the existing v2 input shape before extending the current runtime-action schema.
2. Add v3 schemas and a pure v2-to-v3 migration; route pre-v2 inputs sequentially through v2 and then v3.
3. Rewire the version constant, factory, hydration, serialization, fixtures, storage, and import/export expectations to the current v3 layout.
4. Add source-link behavior and UI only after old and current unlinked documents hydrate successfully.
5. If implementation is rolled back before release, restore the v2 current-schema selection before any v3 document is distributed. Once v3 documents are in use, retain the migration and correct forward rather than silently relabeling the shape.

## Open Questions

None block implementation. Spell and feature identity/source semantics remain deliberately deferred to the required follow-up change.
