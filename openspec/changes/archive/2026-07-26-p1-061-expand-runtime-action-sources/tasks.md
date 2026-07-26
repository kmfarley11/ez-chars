## 1. Pre-Playtest Baseline and Source Identity

- [x] 1.1 Rebase the current character-data identifier and strict schema to the complete `dnd5e-2014.schema.v0` shape, require stable spell and feature identities, and widen runtime-action sources to inventory items, spells, and features.
- [x] 1.2 Remove pre-v0 version constants, historical schemas, migration transforms, frozen legacy fixtures, and compatibility tests while retaining centralized hydration, serialization, and explicit outdated/future classification.
- [x] 1.3 Enforce current-document identity uniqueness and source resolution rules, including rejection of missing identities and unresolved, ambiguous, or ineligible source links without automatic repair.
- [x] 1.4 Add current v0 validation, idempotence, import/export, persistence, outdated-data, and future-version tests before updating canonical seed and test fixtures to v0.

## 2. Runtime-Action Source Domain

- [x] 2.1 Implement a 5e-specific source resolver and normalized candidate projection for inventory items, spells, general features, class/subclass features, and ancestry traits.
- [x] 2.2 Encode source eligibility, category labels, context, search text, source-owned action text, and navigation metadata in pure domain helpers.
- [x] 2.3 Add pure tests for mixed-source candidate ordering, category and text filtering, inventory-only equipped filtering, duplicate display names, and empty results.
- [x] 2.4 Implement reusable source-validity and source-deletion reconciliation helpers without introducing a cross-system registry or external-provider interface.

## 3. Features and Traits Editing

- [x] 3.1 Present top-level general features and class/subclass features as one editable Features collection with an explicit non-persisted ownership discriminator.
- [x] 3.2 Route add and edit operations to the correct underlying feature owner, allocate stable identities for newly created features, and preserve fields not represented by the focused editor.
- [x] 3.3 Keep ancestry Traits as a separate collection and add typed structured editing that preserves stable identities and unedited trait data.
- [x] 3.4 Add reducer and projection tests covering general features, class features, subclass features, ancestry traits, duplicate names, deletion, and runtime-action source reconciliation.

## 4. Runtime-Action Lifecycle

- [x] 4.1 Widen typed action commands and reducers to create custom actions or snapshot actions from any eligible normalized source.
- [x] 4.2 Resolve source links when an action edit is committed and reject invalid, ambiguous, or ineligible source selections without partially mutating the character.
- [x] 4.3 Implement source-kind-specific resynchronization ownership so name-only sources preserve action notes while text-owning sources replace the owned snapshot fields.
- [x] 4.4 Apply source unlinking centrally after source-mutating structured edits, preserving the action snapshot and custom edits when the source disappears.
- [x] 4.5 Extend action-row source context and navigation to inventory groups, spell-level collections, Features, and Traits.

## 5. Guided Multi-Source Dialog

- [x] 5.1 Evolve the source-picker molecule to consume normalized candidates and provide text search, All/Inventory/Spells/Features/Traits filters, inventory-only equipped filtering, accessible selection state, and clear empty results.
- [x] 5.2 Evolve the paged action-dialog organism to offer source selection or direct custom entry on the first page and focused single-action review on the second page.
- [x] 5.3 Preserve the selected candidate and draft while navigating backward, and reset source-owned draft fields coherently when the user deliberately chooses a different source.
- [x] 5.4 Remove obsolete asynchronous loading and error states from the on-sheet picker while preserving a boundary where future compendium results can first become character-owned records.
- [x] 5.5 Update the runtime-action card to expose one Add action command, source-aware context and navigation, and a confirmation warning before resynchronization.
- [x] 5.6 Register spell, feature, and trait collection anchors in the sheet route and provide focused navigation for every source category.
- [x] 5.7 Run the official Svelte autofixer against every modified Svelte component and resolve its actionable findings.

## 6. Stories and Behavioral Coverage

- [x] 6.1 Add Storybook stories and interaction coverage for mixed sources, duplicate names with disambiguating context, custom entry, no matches, backward navigation, resynchronization confirmation, and narrow-screen presentation.
- [x] 6.2 Add focused component and reducer tests for dialog state, search and category filters, draft preservation, source switching, cancellation, and resynchronization ownership.
- [x] 6.3 Extend black-box Playwright coverage across inventory, spell, feature, trait, and custom action creation; cancellation and confirmation of resynchronization; source deletion; navigation; current-v0 persistence and import/export; and non-destructive outdated-data recovery.
- [x] 6.4 Ensure default UI seed data and Playwright fixtures retain both a completely custom runtime action and a source-derived runtime action while satisfying the complete v0 identity shape.

## 7. Documentation, Reconciliation, and Verification

- [x] 7.1 Reconcile the schema-versioning ADR with the v0 pre-playtest compatibility epoch and the v1 migration starting line, and reconcile the runtime-action templating ADR with the final identity, local-source adapter, Features/Traits, synchronous picker, and resynchronization decisions.
- [x] 7.2 Reconcile legacy schema, import/export, runtime-action, or character-editing documentation only where this change intentionally supersedes its authoritative behavior.
- [x] 7.3 Review implementation fallout and update the design and tasks for material technical decisions; update the proposal or delta specifications only if observable scope or behavior changed.
- [x] 7.4 Run focused current-schema, version-rejection, storage, reducer, component, Storybook, and Playwright tests as each implementation slice lands.
- [x] 7.5 Run `npm run verify:smoke` and `openspec validate p1-061-expand-runtime-action-sources --strict`, resolving all actionable failures before archival.

## 8. Backlog Updates & Reconciliation

- [x] 8.1 Remove p1-061 from the active priority queue and detailed backlog catalog, and add a brief timestamped completion entry to `Done Recently`.
- [x] 8.2 Remove p1-061 from the Next recommended sequence, shift the remaining targets into their new order, and preserve the deferred retrospective-linking, feature-provenance, collection-scaling, and compendium follow-ups.
- [x] 8.3 Update `docs/active-goals.md` if the completed behavior changes the current MVP goals, then verify that backlog references and IDs remain coherent.

## 9. Strategic Review Fallout

- [x] 9.1 Enforce character-wide inventory identity uniqueness in the strict v0 schema and add coverage proving duplicate unlinked inventory records are rejected before candidate rendering.
- [x] 9.2 Restore inventory quantity context in normal and selected-filtered source options, make leveled spell options explicitly identify their source type, and cover both behaviors in pure and Storybook tests.
- [x] 9.3 Reconcile the approved identity and source-context fallout in the OpenSpec artifacts and schema-versioning ADR, then rerun focused tests, `npm run verify:smoke`, and strict OpenSpec validation.
- [x] 9.4 Give every source option a discrete Inventory, Spell, Feature, or Trait badge; keep cantrip/level, preparation, provenance, equipped state, and quantity as secondary context; and preserve badges for a selected option hidden by filters.
- [x] 9.5 Cover duplicate-name and cantrip disambiguation in pure and Storybook tests, rerun the official Svelte autofixer, then rerun focused tests, `npm run verify:smoke`, and strict OpenSpec validation.
- [x] 9.6 Add a reusable badge atom and shared source-category label projection, then pronounce each runtime-action row as Inventory, Spell, Feature, Trait, or Custom without moving source commands out of their existing menu.
- [x] 9.7 Reconcile the approved runtime-list presentation in the proposal, specification, and design; add row-projection and Storybook coverage; run the official Svelte autofixer, focused tests, `npm run verify:smoke`, and strict OpenSpec validation.
- [x] 9.8 Reconcile pre-archive documentation by removing the superseded inventory-only suggestion requirement, clarifying optional spell-preparation context, updating current repository summaries, and syncing all delta specifications to their main capabilities.

## Executor Recommendation

- **Reasoning level:** High
- **Model complexity:** Complex
- **Rationale:** The change crosses a breaking pre-playtest schema reset, persistence validation, heterogeneous edit ownership, runtime-action lifecycle semantics, and a stateful Svelte workflow. It benefits from a model that can prune compatibility deliberately while maintaining the remaining contracts across incremental implementation slices and tests.
