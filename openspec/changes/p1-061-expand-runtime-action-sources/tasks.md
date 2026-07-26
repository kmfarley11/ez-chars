## 1. Pre-Playtest Baseline and Source Identity

- [ ] 1.1 Rebase the current character-data identifier and strict schema to the complete `dnd5e-2014.schema.v0` shape, require stable spell and feature identities, and widen runtime-action sources to inventory items, spells, and features.
- [ ] 1.2 Remove pre-v0 version constants, historical schemas, migration transforms, frozen legacy fixtures, and compatibility tests while retaining centralized hydration, serialization, and explicit outdated/future classification.
- [ ] 1.3 Enforce current-document identity uniqueness and source resolution rules, including rejection of missing identities and unresolved, ambiguous, or ineligible source links without automatic repair.
- [ ] 1.4 Add current v0 validation, idempotence, import/export, persistence, outdated-data, and future-version tests before updating canonical seed and test fixtures to v0.

## 2. Runtime-Action Source Domain

- [ ] 2.1 Implement a 5e-specific source resolver and normalized candidate projection for inventory items, spells, general features, class/subclass features, and ancestry traits.
- [ ] 2.2 Encode source eligibility, category labels, context, search text, source-owned action text, and navigation metadata in pure domain helpers.
- [ ] 2.3 Add pure tests for mixed-source candidate ordering, category and text filtering, inventory-only equipped filtering, duplicate display names, and empty results.
- [ ] 2.4 Implement reusable source-validity and source-deletion reconciliation helpers without introducing a cross-system registry or external-provider interface.

## 3. Features and Traits Editing

- [ ] 3.1 Present top-level general features and class/subclass features as one editable Features collection with an explicit non-persisted ownership discriminator.
- [ ] 3.2 Route add and edit operations to the correct underlying feature owner, allocate stable identities for newly created features, and preserve fields not represented by the focused editor.
- [ ] 3.3 Keep ancestry Traits as a separate collection and add typed structured editing that preserves stable identities and unedited trait data.
- [ ] 3.4 Add reducer and projection tests covering general features, class features, subclass features, ancestry traits, duplicate names, deletion, and runtime-action source reconciliation.

## 4. Runtime-Action Lifecycle

- [ ] 4.1 Widen typed action commands and reducers to create custom actions or snapshot actions from any eligible normalized source.
- [ ] 4.2 Resolve source links when an action edit is committed and reject invalid, ambiguous, or ineligible source selections without partially mutating the character.
- [ ] 4.3 Implement source-kind-specific resynchronization ownership so name-only sources preserve action notes while text-owning sources replace the owned snapshot fields.
- [ ] 4.4 Apply source unlinking centrally after source-mutating structured edits, preserving the action snapshot and custom edits when the source disappears.
- [ ] 4.5 Extend action-row source context and navigation to inventory groups, spell-level collections, Features, and Traits.

## 5. Guided Multi-Source Dialog

- [ ] 5.1 Evolve the source-picker molecule to consume normalized candidates and provide text search, All/Inventory/Spells/Features/Traits filters, inventory-only equipped filtering, accessible selection state, and clear empty results.
- [ ] 5.2 Evolve the paged action-dialog organism to offer source selection or direct custom entry on the first page and focused single-action review on the second page.
- [ ] 5.3 Preserve the selected candidate and draft while navigating backward, and reset source-owned draft fields coherently when the user deliberately chooses a different source.
- [ ] 5.4 Remove obsolete asynchronous loading and error states from the on-sheet picker while preserving a boundary where future compendium results can first become character-owned records.
- [ ] 5.5 Update the runtime-action card to expose one Add action command, source-aware context and navigation, and a confirmation warning before resynchronization.
- [ ] 5.6 Register spell, feature, and trait collection anchors in the sheet route and provide focused navigation for every source category.
- [ ] 5.7 Run the official Svelte autofixer against every modified Svelte component and resolve its actionable findings.

## 6. Stories and Behavioral Coverage

- [ ] 6.1 Add Storybook stories and interaction coverage for mixed sources, duplicate names with disambiguating context, custom entry, no matches, backward navigation, resynchronization confirmation, and narrow-screen presentation.
- [ ] 6.2 Add focused component and reducer tests for dialog state, search and category filters, draft preservation, source switching, cancellation, and resynchronization ownership.
- [ ] 6.3 Extend black-box Playwright coverage across inventory, spell, feature, trait, and custom action creation; cancellation and confirmation of resynchronization; source deletion; navigation; current-v0 persistence and import/export; and non-destructive outdated-data recovery.
- [ ] 6.4 Ensure default UI seed data and Playwright fixtures retain both a completely custom runtime action and a source-derived runtime action while satisfying the complete v0 identity shape.

## 7. Documentation, Reconciliation, and Verification

- [ ] 7.1 Reconcile the schema-versioning ADR with the v0 pre-playtest compatibility epoch and the v1 migration starting line, and reconcile the runtime-action templating ADR with the final identity, local-source adapter, Features/Traits, synchronous picker, and resynchronization decisions.
- [ ] 7.2 Reconcile legacy schema, import/export, runtime-action, or character-editing documentation only where this change intentionally supersedes its authoritative behavior.
- [ ] 7.3 Review implementation fallout and update the design and tasks for material technical decisions; update the proposal or delta specifications only if observable scope or behavior changed.
- [ ] 7.4 Run focused current-schema, version-rejection, storage, reducer, component, Storybook, and Playwright tests as each implementation slice lands.
- [ ] 7.5 Run `npm run verify:smoke` and `openspec validate p1-061-expand-runtime-action-sources --strict`, resolving all actionable failures before archival.

## 8. Backlog Updates & Reconciliation

- [ ] 8.1 Remove p1-061 from the active priority queue and detailed backlog catalog, and add a brief timestamped completion entry to `Done Recently`.
- [ ] 8.2 Remove p1-061 from the Next recommended sequence, shift the remaining targets into their new order, and preserve the deferred retrospective-linking, feature-provenance, collection-scaling, and compendium follow-ups.
- [ ] 8.3 Update `docs/active-goals.md` if the completed behavior changes the current MVP goals, then verify that backlog references and IDs remain coherent.

## Executor Recommendation

- **Reasoning level:** High
- **Model complexity:** Complex
- **Rationale:** The change crosses a breaking pre-playtest schema reset, persistence validation, heterogeneous edit ownership, runtime-action lifecycle semantics, and a stateful Svelte workflow. It benefits from a model that can prune compatibility deliberately while maintaining the remaining contracts across incremental implementation slices and tests.
