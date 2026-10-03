## Context

BL-085 completed shared read-first detail and independent edits. Runtime Actions now have stable identities, timing/category metadata, source-aware snapshot search, and explicit source commands, but retain array-order display and no priority membership. Spells already have a global alphabetical pinned tier and level/name ordering elsewhere.

`ResponsiveCollectionView` owns Runtime Action/supporting browse geometry; `GridContentList` and `GridContentListView` own equipment/spell browsing. Both currently derive phone previews before text filtering and assume a text query is the only narrowing state. Extending just their desktop search rows would leave incorrect phone previews, counts, and recovery. Keep both existing composition boundaries; this change is not a merger of collection components.

The existing collection-priority main spec still describes the superseded batch/menu baseline despite BL-077's approved immediate row controls. Reconcile those clauses in this change; preserve the dormant batch concept, but do not restore it to production.

## Goals / Non-Goals

**Goals:** A player can quickly retrieve relevant actions/spells, combine filters with search, pin matching actions, and retain browse/edit context on phones and desktop. Reuse shared controls without placing 2014 category semantics in generic components.

**Non-Goals:** See proposal.md. In particular, no interactive row badges, arbitrary filter builder, persisted filter preferences, general sorting UI, source/category filters, batch manager, or new collection edit architecture.

## Decisions

### 1. Explicit facets, native multi-choice semantics

Use a focused reusable quickfilter grouping with native toggle buttons (`aria-pressed`) and an explicitly named group. The shared ChipButton atom composes BaseButton, inheriting themed foreground/background, keyboard focus, and the existing 44px coarse-pointer target policy. Selected shading distinguishes active choices without checkmarks, reserved icon space, or changing font weight. Reuse the same chip presentation for reset actions (without pressed semantics); keep resets mounted but disabled when inapplicable so selection does not insert controls or shift wrapping. Use established input classes for one search field per visible collection surface. No third-party dependency, single-choice tab semantics, or custom listbox keyboard model is needed. This replaces the initial checkbox proof in response to owner feedback on 2026-10-03.

The shared presentation receives only collection-supplied option keys/labels and controlled selection/change behavior. Domain projection/matching stays outside it. Use stable keys rather than display strings; passive badges and selectable controls share domain label definitions, not a parser that extracts filters from badge text. Do not create a universal facet registry or RPG schema.

An empty selection means all values. Selected values within one facet are OR; facets and tokenized text search combine with AND. Prepared-only accepts exactly recorded `prepared === true`; false/absent values and unmarked cantrips are not implicitly prepared. Disabling the toggle restores unrestricted preparation state without changing values. Existing missing timing/level presentation defaults remain authoritative (Action/Cantrip); use the same effective values in display and filtering rather than inventing Unknown or materializing defaults into saved data.

Runtime Action timing choices are Action, Bonus action, Reaction, Free, Other, always available for populated lists regardless of the five-record threshold. Spell levels expose Cantrip and 1–9 plus Prepared only. Keep options stable, including zero-result choices. Controls and reset remain reachable when active narrowing produces zero matches or the last record is removed. The baseline makes one text search available alongside filters for populated target collections, including short ones; other collections retain existing search thresholds. Label the groups “Quick filters: Timing” and “Quick filters: Spell level & preparedness”. Keep all spell choices visible together, wrapping at narrow widths: owner feedback on 2026-10-03 removes the initial Level disclosure and All levels/selection-count summary as unnecessary visual noise. Reset Level only clears levels; toggling Prepared only clears preparation, while Clear all clears every restriction.

Rejected: single-select (cannot express Action or Reaction), all badges as filters (unbounded/semantically arbitrary), automatic resets after zero results (changes the user's request), and mutually exclusive text/filter modes (prevents useful composition).

### 2. Pure presentation pipeline and stable ordering

```text
current character records + pins
            |
     domain row metadata
            |
     selected facets AND text
            |
     matching pins A–Z first
            |
 remaining domain order: timing/name or level/name
            |
 same result set -> phone preview / bounded view / focused browse
```

Actions: pinned names alphabetically; remaining timings in Action, Bonus action, Reaction, Free, Other order, then name. Spells: preserve pinned names alphabetically and remaining Cantrip through level 9/name order. Use the existing normalized label comparator and deterministic original-label/stable-ID tie rules. Category, preparation, creation time, last edit time, and pin time are not sort keys. Never sort the canonical array in place. Pins are membership, not a ranked sequence; every record appears once.

Use the approved lightweight timing headings for the unpinned multi-timing view; suppress them for a single visible timing. Row timing badges remain useful in the global pinned tier. The story retains a headings comparison control, not a second persisted ordering option.

Actions already have separate timing, category, and source-kind projections. Render those as passive badges in that order, using existing Badge, with note indicators last and source commands still separate. The owner resolved the audited conflicting defaults in favor of explicit absence: omit a missing category badge and show an unset Category editor. Do not infer category from source or silently write a new value merely to render a badge.

### 3. Share retrieval state, not dialog implementations

Own query, selected timings/levels, and Prepared-only at the collection controller above conditional browse/detail mounting. Extend the existing list presentations with narrow optional controls/result-state inputs so both consume the same filtered, ordered rows. Do not let the list view run a second incompatible search over already-filtered rows. Domain-owned source/record resolution continues to use the full collection, not only current matches.

Derive density from total collection size, not result count, so narrowing never unmounts controls or changes the scroll shell. Runtime Action and Spell phone previews show at most five matching ordered rows. Show filtered/total counts and a browse label reflecting matching results when narrowed; all records remain recoverable with independent resets. Independent resets preserve other selections and text. Owner follow-up during rollout removes the permanently visible Clear all pill and its touch-height header row to reduce visual weight: the no-match message alone retains Clear all as recovery, resetting query and every facet, never pins. A collection emptied by deletion keeps applicable independent resets until restrictions are cleared.

Browse/detail/Add transitions preserve retrieval state and one logical phone modal. Editing a name, timing, level, or Prepared flag may remove a record from results; retain its current Detail until the user leaves, then return to the same narrowed list with an explanatory count/no-match state and a stable collection focus fallback. Do not clear filters to make a saved record visible. Source navigation retains the origin's in-session state where the current workflow returns there. Filter controls stay fixed while results scroll; no horizontal page overflow or nested filter scroll owner.

Reset ephemeral retrieval state when changing characters or starting a fresh sheet session; do not persist it in localStorage or JSON. Preserve it while moving among views of the same collection in the mounted sheet session. Hidden duplicate responsive controls must not add keyboard stops; use unique label/input IDs in repeated surfaces.

### 4. Extend system-owned pins with stable action identity

Extend the existing 2014 optional `collectionPins` map and collection-kind validation with Runtime Actions; reuse collection identity validation, Pin mutation intent, and reconciliation helpers rather than adding flags to action/source records. Resolve membership against current character state at commit. Reuse IconButton's Pin/Unpin grammar, latest-state callback, explicit rejection feedback, stable keyed row focus, and existing reduced-motion-aware movement behavior if applicable. Do not introduce new pin timestamps or new animations.

| Event                           | Pin result                                                                                                                              |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Rename, field/note edit, resync | Same action identity retains membership; its displayed position may change                                                              |
| Delete source                   | Existing snapshot-detach behavior retains action and pin; source metadata becomes Custom                                                |
| Delete action                   | Remove its membership in the same validated mutation                                                                                    |
| Pin/unpin source                | No effect on action pins, and vice versa                                                                                                |
| Stale Pin command               | Reject without creating a record or partially updating character data                                                                   |
| Save/import/export              | Preserve valid membership; reject malformed, duplicate, ambiguous, wrong-collection, or dangling IDs through existing validation policy |

Internal removal cleans obsolete membership atomically; external invalid documents are not silently repaired to hide corruption. Old valid current-v0 documents with no action pins remain valid. The new optional key is an additive extension under the explicitly unstable pre-playtest epoch, not a new durable version or migration promise. Older app binaries may reject newer exports containing it; warn about rollback and retain exported backups rather than stripping user pins automatically.

Amend `docs/decisions/2026-08-28-share-collection-priority-ux-keep-data-system-owned.md` after proof approval with action adoption, ephemeral facets, derived ordering, lifecycle rationale, Last reviewed, and Latest refinement. This satisfies the ADR trigger for extending persisted priority and selecting display-order policy without introducing another cross-system architecture.

### 5. Proof before default rollout

Use existing `Organisms/RuntimeActionsCollection` boundary/saturated sandboxes and `Organisms/Dnd5e2014Spellcasting / SaturatedCharacter`, backed by real domain projections and mutation adapters. Add a distinct fixture only if existing ones cannot represent mixed timings, duplicate labels, missing optional metadata, pins, and nonmatching results. Keep stories passive; repeatable assertions belong in Vitest/Playwright.

Provide the same production components behind an explicit development-only sheet opt-in, preferably `proof=bl-078`, with concise coverage text identifying provisional versus unchanged regions. No copied sheet/proof implementation. The named **Collection retrieval and priority** approval gate reviews both collections, sparse/dense data, phone preview and focused browse, composition with real labels/editing, and navigation/Rules coexistence. Later default rollout, broad test updates, and ADR adoption wait for explicit approval. Final integrated review remains a separate gate.

Keep instructions and dated evidence in verify.md. Before approval, provisional schema/adapters may be tested, but ordinary users must not receive new default presentation or controls. Changing shared components must preserve untouched consumers' defaults.

**Approval and rollout — 2026-10-03:** The owner explicitly approved the revised proof and requested default rollout after adding one system-neutral `Molecules/CollectionQuickfilters / Playground` sandbox. It exercises a long option label, multiple selections, text, an additional toggle, and resets without character data. The dev-only query switch/banner and domain-component opt-in props are removed during rollout, leaving one production path for Runtime Actions and Spells. Initially empty collections omit unnecessary filter controls; active restrictions remain clearable if the last record disappears. Inventory and Supporting Collections retain their established retrieval behavior. Final integrated approval remains separate.

### 6. Verification and determinism

Implementation: `CollectionQuickfilters` composes ChipButton and receives one explicit option set, controlled query/selection, optional heading override, and an optional extra-control snippet rendered alongside the choices. Prepared-only uses that snippet without adding domain semantics to the shared molecule. Reset-all recovery belongs to the no-match list presentation rather than this control group. Action projection now lives in `src/lib/dnd5e2014/runtimeActionRows.ts`; the old route module re-exports it for existing consumers, so domain retrieval does not depend on a route. `RuntimeActionsCard` and `Dnd5e2014DenseCollectionCard` retain mutable retrieval input across modal transitions and reset it only on character identity changes. Existing list seams accept already-filtered rows/counts and optional control snippets; absent inputs retain the prior inventory/supporting behavior. The obsolete compact spell-filter prop and Storybook control are removed rather than retained as an unused alternative.

Pure Vitest covers OR/AND logic, empty selections, effective missing values, pinned exclusion, counts, comparator ties, non-mutation, latest-state Pin operations, lifecycle cleanup, and persistence/import rejection. Use stable fixture IDs; filter/sort needs no clock, randomness, or pin-time metadata. Existing creation flows retain injected deterministic ID generators in tests.

Black-box Playwright covers phone previews, independent resets, Clear all, no-match, filtered detail return, mutation causing exclusion, Pin focus, reload/JSON round trips, source detachment/resync, and keyboard/coarse-pointer behavior. Reuse existing small-edit/source regressions. Run smoke gates before the proof; after rollout run build, Storybook build, coverage, cross-browser and Mobile Chrome checks, plus the serialized performance comparison because shared scroll surfaces change. Report cadence as automation evidence, not Firefox paint-quality proof. No dependencies are planned; any manifest change additionally triggers the dependency gates.

## Risks / Trade-offs

- Ten level choices and touch-size timing labels can dominate a phone card → evaluate the owner's preferred always-visible chip wrapping in the actual sheet before rollout; do not shrink touch targets or introduce horizontal overflow.
- Display sorting no longer reflects stored action order → explicit scope change, preserved canonical array, visible timing metadata, and predictable name-based ties; no category or timestamp sorting.
- Existing text-only no-match/preview assumptions can survive unnoticed → test facet-only zero results, short lists, and phone preview/detail return, not just desktop results.
- Pin and source lifecycle span several reducers → extend existing reconciliation paths and test removal through every relevant mutation boundary, not only the new control.
- Passive badges may suggest click-to-filter → use distinct pressed-control styling; only revisit badge shortcuts on evidence, captured in the backlog rather than silently widening this change.

## Migration Plan

1. Build/test additive optional action-pin support and shared controls provisionally; no default rollout before the proof gate.
2. After acceptance, propagate the approved controls and ordering to the real sheet and remove the development opt-in after all consumers are migrated.
3. Preserve existing current-v0 documents with absent pin state; do not rewrite arrays or store filter defaults. Reconcile documentation and specs at completion.
4. If the visual proof is rejected, revise the provisional shared presentation. If rollback is needed after action pins are saved, retain schema readability or use explicitly restored backups; do not claim an older strict parser can read the new optional key.

## Open Questions

The owner approved multi-select composition, global alphabetical pins, timing/name remainder order, Prepared-only, passive badges, lightweight timing headings, and always-visible shaded chips without selection summaries. No presentation decision blocks rollout; final integrated review still evaluates cumulative phone density and navigation coexistence. Approval does not add new facets or persistence.

Apply audit (2026-10-02) found conflicting absent-category defaults: Attack in the row projection and Effect in editing. The owner selected option B: preserve absence as explicitly unclassified, with no category badge and an unset Category editor until a value is chosen. Do not infer classification from the source, fill absent saved categories, or alter authored categories. Explicit creation defaults remain a separate authored draft choice; merely viewing or editing an existing record must not classify it.

Assumptions resolved for the first cut: selected options remain visible at zero results; controls remain reachable if records disappear; all matching sets use the same preview/browse pipeline; input state resets for another character but survives same-collection detail transitions; missing timing/level uses the existing visible defaults; unmarked preparation does not match Prepared-only. Verify these explicitly instead of hiding them in implementation.
