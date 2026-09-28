# 2026-09-12 Use Three-Tier Read-First Sheet Interactions

**Status:** Approved
**Author:** Codex
**Date:** 2026-09-12
**Last reviewed:** 2026-09-28
**Latest refinement:** [BL-085](../../openspec/changes/bl-085-focus-piecewise-detail-editing/design.md) proof approval replaces existing-target whole-record drafts with independent explicit field/note saves; rollout is in progress.

## Context & Problem Statement

The 2014 character sheet exposes several independently reasonable editing patterns: persistent inline controls, separate Edit and Notes dialogs, dense-row menus, and collection-wide forms. Together they make it difficult to predict whether an action will read, edit, annotate, or reorganize content. The ambiguity is most costly on phones, where collection dialogs can hand off into more dialogs and broad forms lose the context that prompted an edit.

The product needs one understandable interaction language without turning the character sheet into a generic form or flattening system-specific records into a universal payload.

## Decision Drivers

- Keep frequently changed play state fast without making unrelated content look editable.
- Keep the normal sheet readable, selectable, and useful as a character overview.
- Let authored information and its annotations Save or Cancel as one target-owned draft.
- Separate singular record editing from collection structure.
- Preserve stable identities, provenance, source ownership, validation, and unrelated data.
- Preserve useful browse context and avoid nested phone dialogs.
- Avoid a premature cross-system record or reducer abstraction while only one system is implemented.

## Considered Options

1. **Global View/Edit mode**
   - Offers one obvious switch, but makes interaction depend on hidden global state, exposes controls across unrelated sections, and conflicts with rapid runtime changes.
2. **General section-wide editing**
   - Bounds the form more narrowly, but still combines unrelated records and annotations and preserves much of the current bulk-form ambiguity.
3. **Read-first three-tier interaction**
   - Keeps explicitly classified runtime state inline, opens rich targets into focused detail and editing, and keeps collection browsing, priority, and record lifecycle distinct. It introduces another navigation depth, so discoverability, Back behavior, and responsive presentation require proof.

## Decision Outcome

**BL-085 supersession (2026-09-27):** The target-wide draft in item 2 below records the original BL-077 decision. The approved replacement uses independent explicit field/note saves inside readable Detail, with dirty-navigation protection and latest-state validation. Creation remains one coherent draft. See the refinement below; this does not claim every consumer has already migrated.

Adopt the read-first three-tier model validated by the BL-077 human proof:

1. **Runtime state** uses deliberately classified, geometrically stable inline controls.
2. **Rich detail** opens through an explicit target into a read-first surface. Edit creates one local draft containing authored information and annotations; one Save validates and commits the whole target, while Cancel discards it.
3. **Collections** remain scan-first. Individual records use focused detail; established Pin/Unpin owns player priority, direct Add creates one record, and eligible Remove remains associated with the selected record and requires confirmation or a recoverable undo path. Generic collection organization and reordering are deferred.

The shared layer may coordinate view/edit/back/focus state and presentation, but each domain retains its own data adapter and candidate validation. Pin/Unpin is promoted beside the detail target for repeatable pinnable records, remains an immediate accessible toggle, and preserves focus when priority reordering moves a record. The batch pin manager remains reusable internally but is not exposed by the rollout because it duplicates this promoted action; later playtest evidence may justify restoring it. Singular fields do not receive a pin merely for visual consistency. Source navigation, resynchronization, and other justified quick commands also remain distinct rather than being forced through the focused draft.

Compact field and record metadata sits inline with the applicable title when space permits, with descriptive or state badges first and the quiet note count last; supporting value/detail follows, action controls remain separate, and collections do not repeat notes as an aggregate badge. Compact Edit, Confirm, Cancel, Detail, Pin/Unpin, and Add actions share one base-button-backed icon grammar, while consequential Remove remains labeled in focused detail. This narrow button vocabulary does not establish a universal icon registry. Once an ordinary record's detail target owns authored editing, annotations, and references, its duplicate Edit and Notes/References overflow menu is removed. Domain-specific menus remain available where commands such as View Source or Resync are not authored-detail actions. Same-list priority movement uses the approved brief transform-only animation and becomes instantaneous under reduced motion. Prepared remains available in scan and focused Edit through one canonical mutation path.

This proposal does not authorize a global sheet edit mode, a general section-wide edit mode, a universal record payload, or changed persistence semantics.

## Consequences

- The sheet should become calmer and more predictable in its default state.
- Frequent state requires an explicit classification audit; an omitted classification safely falls back to read-first behavior.
- Ordinary record Edit and Notes/References overflow accelerators are removed once focused detail owns those paths; domain-specific source commands may retain a menu.
- Note badges remain record-scoped and text-associated rather than becoming aggregate collection counts or action-cluster content.
- Existing collection-wide rich editing and annotation editing will be removed after equivalent focused and structural paths exist.
- A successful batch organizer concept remains available in Storybook as deferred evidence, but it is not part of the rollout unless later playtest evidence shows that pinning plus singular lifecycle actions is insufficient.
- Phone collection browse, detail, and edit must transition inside one logical surface with one scroll owner.
- A focused-detail presentation and navigation coordinator may be shared, while domain draft shapes and reducers remain explicit.
- The extra navigation depth makes target discoverability and focus/Back restoration first-class verification concerns.

## Refinements & Follow-Ups

### 2026-09-27 — Independent edits approved for rollout

The owner approved the production-backed BL-085 proof. A group remains a reading/navigation boundary, not a transaction boundary: one field or note is edited and explicitly saved at a time, earlier saves survive later cancellation, and indirect navigation resolves dirty work in the same logical surface. Latest-target domain adapters validate the complete candidate while preserving unrelated values and notes. New-record creation retains one final Add; ownership restrictions and specialized source workflows remain intact.

Underlined label buttons are the primary targeted entry: reveal and highlight the intended field without automatically editing. Existing group/record chevrons remain available; removing redundant chevrons was discussed but not selected. Compact read-first Used/Max slot pairs share the Score/Modifier renderer, superseding the spell-slot Tier 1 classification from September 20 without changing other runtime controls. This balances runtime density against an extra deliberate entry step accepted in the proof. A separate integrated-sheet approval remains required after rollout.

### 2026-09-18 — Five-fixture proof awaiting owner review

The isolated proof covers Current and Temporary HP beside read-first Maximum HP, annotated Background and Ancestry fields, Random rock within consistent Weapons, Armor & Shields, and Other Gear bullet-list collections, saturated Features, and saturated Spells. Owner review established that per-record note badges plus focused detail provide the useful annotation path and rejected a read-only Annotated Items overview. The latest proof revision also omits aggregate collection badges because they do not identify the relevant records, places compact semantic badges inline with titles with Notes last, aligns all three HP tiles, and uses one base-button-backed icon primitive for the approved compact action vocabulary. Equipment becomes searchable and bounded after five records, and successful Add closes back to its invoking control instead of forcing the new record's detail open; these refinements remain pending gate confirmation. Owner review also found the working Organize Collection interaction promising but premature to adopt or scale. It is preserved as an explicitly deferred Storybook-only concept while rollout retains first-class row-level Pin/Unpin, direct collection Add, and labeled focused eligible Remove. The proof promotes the pin toggle beside the detail control for repeatable records, intentionally excludes singular Maximum HP, Background, and Ancestry fields, and now removes the ordinary record `…` menu because detail owns Edit and annotation/reference access; that removal also remains pending confirmation. A short reduced-motion-aware same-list reorder animation remains under proof. The proof continues to expose Prepared both as a scan-row action and focused-edit field for judgment.

Before this ADR becomes Approved, the owner must decide or delegate:

- Tier 1 control density;
- shared compact icon-button grammar and action alignment;
- first-class Pin/Unpin density and discoverability on repeatable records;
- focused-detail target discoverability and inline semantic metadata badges with Notes last;
- consistent equipment list composition, the five-item saturation boundary, and the direct Add-dismissal / focused eligible Remove boundary;
- removal of aggregate note badges and ordinary Edit/Notes overflow menus;
- whether priority-reorder motion should survive the proof;
- stacked authored/provenance/annotation/reference ordering;
- spell Prepared placement; and
- the responsive boundary for full-height focused detail.

The authoritative proof mapping and evidence live in [the archived BL-077 verification record](../../openspec/changes/archive/2026-09-26-bl-077-unify-detail-editing-annotations/verify.md).

### 2026-09-19 — Proof approved for rollout

The owner approved the complete revised proof. The rollout therefore adopts the three-tier model, compact runtime geometry, explicit detail targets, title-adjacent semantic badges with Notes last, first-class Pin/Unpin, successful Add dismissal and focus return, focused confirmed Remove, five-item equipment saturation, reduced-motion-aware same-list priority animation, stacked authored/provenance/annotation/reference detail, Prepared access in both scan and focused Edit through one canonical state, and a full-height phone workflow with no nested modal. Generic batch organization remains deferred Storybook evidence, and a universal icon registry remains intentionally out of scope.

### 2026-09-20 — Production-composition reconciliation

Integrated review exposed useful cases that the isolated proof did not show. Every visually bounded group containing non-runtime authored values now receives one group-level Detail target whose focused Edit reaches the complete group; all-runtime groups remain inline and avoid a redundant dialog. Reference Stats use the shared compact inline read-first grammar, with the more prominent stacked treatment retained as an explicit renderer variant. Runtime tiles fill their responsive tracks, and the standalone Proficiency Bonus field fills a centered bounded card rather than implying an accidental grid position.

Supporting and dense collections expose direct Add plus record-local Pin/Unpin and Detail. The batch pin manager remains dormant because exposing both priority paths added action density without adding capability. Trait Add is restored as ancestry-owned creation through the existing validated domain reducer; generic Trait removal remains unavailable because the persisted model does not distinguish independently removable authored traits from ancestry-owned content.

Treasure denominations are Tier 1 because they change frequently enough during play to justify direct editing. Follow-up review rejected both mixed classification and a bespoke group-wide control inside one spell-slot card: Used and Max now share one compact full-track Tier 1 level group while each value uses the familiar field-local runtime row and adjacent Edit/annotation actions. Saving either row still supplies the complete typed pair, and no redundant group Detail action appears. Empty annotation-capable leaves show only a compact Add annotation action until the user starts one, avoiding repeated `Annotations (0)` scaffolding while retaining the atomic target draft. Runtime Actions remain non-pinnable within BL-077 because authored order and persisted priority have not yet been reconciled; repeated owner feedback promotes both explicit action-economy quickfilters and Runtime Action Pin/Unpin into P0 `BL-078`. The broader idea of piecewise editable leaves inside read-first Detail is promising but may change the target-wide Save contract, so P0 `BL-085` owns that proof. Annotation attachment and rediscovery are explicit `BL-081` survey evidence rather than an assumption that every field should accumulate notes.

### 2026-09-21 — Shared-renderer architecture audit

The production-composition gate was approved after a final audit for system-specific UI leakage. Interaction tier is now explicit projection metadata rather than an inference from primitive type or `editAffordance`; missing tier continues to mean read-first. Shared classification helpers decide whether a field or an entirely runtime nested group receives inline treatment. Nested runtime groups compose the same primitive field renderer used elsewhere, including its draft, focus, validation, annotation, and compact-control behavior, while their thin group adapter only reconstructs the complete typed mutation required by compound domains such as spell slots. The 5e layer therefore owns field selection, semantic classification, ordering, and typed persistence adapters—not a separate runtime control implementation. The intentionally bespoke all-in-one Storybook comparison remains non-production evidence, and its simple runtime fixture now also delegates to the shared renderer.
