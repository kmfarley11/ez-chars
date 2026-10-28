## Context

**Closure maintenance, 2026-10-27:** after final sheet approval, the owner authorized dependency remediation, including the compatibility-assessed Kit 3 migration. The [security decision refinement](../../../../docs/decisions/2026-10-10-bound-development-security-overrides.md#2026-10-27--reviewed-security-maintenance-and-kit-3-migration) records the toolchain, retained history semantics, explicit aliases and asset boundary. This supersedes the original no-dependency-change expectation, not the approved character behavior. Remove the obsolete rollout banner from the production Page; keep authored-value guidance in the catalog host and preserve the application's pre-release/recovery/platform warnings.

**Rollout approval, 2026-10-24:** Gate 3.1 is approved. The owner explicitly asks for minimal layout/interaction differences: equivalent 2024 fields belong in the same relative sections and groupings as 2014, with edition-native labels and genuine mechanical differences kept local. The partial proof is not the final layout. Use paired production Pages to verify this during rollout; no automatic rewriting of 2014 layouts.

The proposed [change](proposal.md) builds on BL-086's production-backed composition and the current [author intent](../../../../docs/vision/author-desires.md), [PRD](../../../../docs/vision/PRD-v1.md), and [component maintenance guide](../../../../docs/component-maintenance.md). The 2014 sheet is the accepted interaction/layout baseline, not a disposable prototype. Older sketches are advisory comparison material, not a reason to reopen settled design.

The 2026-10-16 static audit found these concrete seams:

| Current consumer                                               | Evidence and planned disposition                                                                                                                                                                                         |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/schema/zod/core.ts`                                       | Requires 5e-shaped identity plus root gameplay collections; replace the mandatory core with lifecycle metadata and system-owned payloads.                                                                                |
| `src/schema/storedCharacters.ts`                               | Unknown systems can pass a generic fallback; replace with explicit supported-system validation and recoverable rejection.                                                                                                |
| `src/routes/characterSummary.ts` and home route                | Read identity/classes and route every record to 2014; consume system-provided summaries/destinations.                                                                                                                    |
| `src/lib/storage/store.ts`                                     | Failed-load protection skips only the first subscription write; later demo edits can overwrite rejected storage. Establish an enduring recovery write barrier. This is a static finding, not yet a browser reproduction. |
| 2014 route and `src/lib/resources/sheetReferenceNavigation.ts` | Route casts and reference navigation assume `/charsheets/5e`; retain a concrete 2014 host with guards and parameterize shared navigation with the actual sheet destination.                                              |
| `src/lib/systems/dnd5e-2014/inventory.ts`                      | Classification uses tags and name substrings; move both D&D systems to explicit system-owned classification.                                                                                                             |
| `src/lib/ui` and 2014 `pages/character-sheet.svelte`           | Presentation/interaction primitives are reusable; whole-sheet projections, edits, landmarks, and catalog selection are still system-owned.                                                                               |

The [previous core audit](../2026-08-01-bl-067-define-playtest-prd-v1/design.md) established the smaller-envelope direction. This change supplies concrete second-system evidence rather than a speculative universal renderer.

## Goals / Non-Goals

**Goals:** Implement explicit two-system lifecycle and recovery, preserve the accepted 2014 experience, deliver the bounded sparse-friendly 2024 surface, reuse honest common interactions, and prove the boundary before broader propagation.

**Non-goals:** As listed in the proposal. In particular, no automatic 2014-to-2024 character conversion, comprehensive rules calculator, new global rendering schema, or second persisted format for lite characters. Schema rebasing is not Git rebasing and does not modify Git history.

## Decisions

### 1. A small envelope and concrete system dispatch

Use a common document envelope with `meta` (opaque ID, character-schema version, created/updated timestamps), `system` (system ID and adopted rules release), and `systemData` (validated by the selected system). Move gameplay identity, inventory, features, notes, character annotations, and existing provenance into the owning system payload; retain their content rather than discarding it during fixture updates. Reuse vocabulary/types without requiring common gameplay roots.

Start with explicit `dnd5e-2014` and `dnd5e-2024` registrations. A minimal header read chooses a known parser; header validity alone never establishes character validity. Accepted documents form a typed supported-system union; unknown payloads remain raw recovery inputs, not a permissive third runtime character type.

The audit should settle the concrete signatures for only these real consumers before broad propagation:

| Operation           | Responsibility                                                                                                                               |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Create              | Build one system's valid sparse/default document with injectable IDs/time.                                                                   |
| Hydrate / serialize | Validate one current system shape and report invalid, unsupported-system, or unsupported-version outcomes without guessing.                  |
| Summarize           | Supply display name, edition label, and optional system summary; shared code formats lifecycle dates. No new home-list search is introduced. |
| Destination         | Return the correct sheet destination for a validated document.                                                                               |
| Reference context   | Select the edition's registered resource/topic context, independent of editing/persistence.                                                  |

Prefer an explicit typed dispatch module over a plugin loader or generic adapter class. Keep system schemas and validation browser-framework-independent. Registry consumer types must not require classes, ancestry, a combat block, or inventory. Common list summary is a display projection, not another persisted copy of character facts. Keep IDs globally scoped as today: Merge New skips an existing document ID even when an incoming record claims a different system; never reinterpret the existing record.

Retain `/charsheets/5e` for existing 2014 links and use a distinct explicit 2024 route. Incorrect-system route requests show a safe explanation and the correct-sheet action before rendering anything editable; they do not cast, convert, or mutate the character. Use the selected route's path in reference/history helpers, preserving existing Close versus Back behavior.

**Alternative rejected:** Keep the current generic parser and add one more sheet route. That preserves wrong-system acceptance and duplicates dispatch assumptions. Exact helper names remain implementation discretion, not an extension API promise.

### 2. Rebase the experimental shape; keep recovery non-destructive

Retain `dnd5e-2014.schema.v0` as an explicitly mutable pre-playtest epoch; introduce `dnd5e-2024.schema.v0`. Neither starts durable v1 promises. Keep rules release distinct from schema version: 2014 retains its existing source release; 2024 pins SRD 5.2.1 rather than silently following a newer release. Storage/export wrapper versions need not change merely because their validated character payload changes.

Earlier 2014 v0 shapes may fail strict validation; no migration chain for past experiments is required. Update canonical repository fixtures explicitly, preserving IDs, authored values, notes, pins, sources, and relationships. Track the old-to-new path mapping for field notes, JSON Patch targets, source navigation, and all 2014 adapters; layout movement is not permission to reset their semantics.

Recovery is a storage-owner state, not a one-time skipped write:

1. Failed loading retains the original stored string unchanged; successful loading is the only normal transition into persisted editing.
2. A recovery view explains the mismatch, offers **Download original data**, and offers an explicitly confirmed reset. Download returns the untouched source string with an accurate recovery filename/type, not a normalized valid-export claim.
3. Demo inspection may remain available, but is clearly temporary. Ordinary edits, creation, deletion, and imports cannot overwrite the rejected storage while recovery is unresolved. Import application is disabled until reset; do not introduce partial salvage in this slice.
4. Reset deliberately replaces rejected data with a valid baseline and re-enables persistence only after the storage operation succeeds. Failure leaves recovery active and original data recoverable. Cancelling reset or downloading alone changes nothing.

Keep the pre-release disclaimer. Add targeted explanatory recovery text rather than relying on that disclaimer as consent to overwrite. Keep all recovery handling local; no upload/logging of character payloads. Unit and browser tests must cover a second and later mutation, not just initial load. General multi-tab write coordination is not added here; do not use cross-tab claims in the proof.

**Alternative rejected:** Silent fallback-and-save or automatic best-effort repair. Both can make a breaking update appear successful while destroying the only original. A broad historical migration framework is unnecessary under the accepted v0 policy.

### 3. Opt-in item primitives, explicit domain classification

The evidenced shared item identity primitive is stable ID plus authored name. Optional note/reference helpers may be shared; quantity, weight/unit, value, equipment state, and other mechanics are composed by system schemas. A record's name is never its primary key. Do not require every game to have a root inventory or a 5e equipment taxonomy.

For these two D&D systems, store an explicit item category such as weapon, armor/shield, or other gear in the system-owned item record. Compute displayed groups from that field. The editor's creation context supplies a default category; focused Detail allows deliberate correction. Renames and user tags cannot move an item. Reclassification retains identity, notes, inventory-wide priority, and valid action links; collection-specific focus/navigation updates with the new group. Audit current built-in fixtures once and assign explicit categories, preserving their accepted intended placement rather than keeping runtime keyword inference.

Any common D&D item schema/composition goes in an explicitly 5e-family location only after comparing both consumers. It is not a universal core contract. Preserving arbitrary user tags does not mean retaining hidden tags as category authority.

### 4. Familiar vocabulary without mechanical duplication

Use the [official conversion guide](https://media.dndbeyond.com/compendium-images/srd/guide/converting-to-srd-5.2.1.pdf) as a comparison checklist, and the adopted SRD as rules authority. Separate three cases in a small apply-time reuse/terminology map:

| Difference                                     | Treatment                                                                                                                              |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Same interaction, different label              | One shared component with system-supplied accessible/visible labels. No parallel components just to rename fields.                     |
| Same visual arrangement, different data source | Shared arrangement with typed system adapters; no duplicated draft/save implementation.                                                |
| Different meaning or mechanics                 | Keep system-owned validation, authored data, references, and contextual explanation; sharing a control does not imply identical rules. |

Use familiar edition terminology, not a new app-only lexicon: 2024 Species, Origin/background, Feats, armor training, and Heroic Inspiration remain recognizable. Existing 2014 labels and semantics remain accepted; do not globally rename them for 2024. Avoid permanently doubled headings such as Race / Species everywhere. Concise secondary help is appropriate only where the proof shows a real comprehension issue. Preserve user-authored text verbatim.

The guide distinguishes naming changes from rules changes; Heroic Inspiration and revised action terminology illustrate why blindly relabeling a 2014 rules implementation would be unsafe. No rule effects are executed by this sheet. See the [verification record](verification-record.md#source-inspection-record) for the scoped source inspection and limits; this is not permission to ingest other local books or bundle character-sheet art/templates.

### 5. Bounded 2024 coverage, with meaningful absence

The proof schema is provisional, not the final delivery boundary. Before broad region rollout, task 4.0 hardens the full authored coverage below: explicit types/ranges, meaningful absence, stable record identities, applicable note/pin/reference integrity, and deterministic invalid-input and storage/JSON round-trip contracts. Factories, fixtures and adapters evolve with that schema. Initial 2024 schema hardening is included in BL-070; a complete character-builder rules engine and an immutable v1 compatibility promise are not.

One 2024 document can start sparse and gain detail without changing system identity or entering a second data format. Structural collections may be empty; unknown scalar facts remain absent, not fabricated zeros, standard ability scores, or a compulsory class. Record names are required when creating named items/actions; unknown character names use the existing display fallback.

| Region                | Baseline supported authored content                                                                                                          | Interaction                                                                                                      |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Identity/origin       | Name; optional species, background, class/level/subclass entries, appearance and roleplay                                                    | Compact label-targeted Detail; adding class information is voluntary.                                            |
| Runtime/reference     | Current/max/temp HP, AC, movement, initiative, Hit Dice, death saves, conditions, Heroic Inspiration; size/passive perception where provided | Existing edit-first versus read-first patterns; low-frequency context stays compact.                             |
| Checks/proficiencies  | Six optional ability scores/modifier context, saves, skills, proficiency bonus, languages/tools, armor/weapon training                       | Focused independent edits; no forced proficiency completion.                                                     |
| Capabilities          | Named authored actions with timing/detail, species/class features, feats (including Origin context), weapon mastery notes where applicable   | Shared readable rows, focused edits/notes, direct Add/eligible Remove, pins; no builder or prerequisites engine. |
| Equipment             | Explicit categories, quantities, equipped state, optional details, currency                                                                  | Existing collection and runtime-value grammar.                                                                   |
| Optional spellcasting | Casting ability/bonus/DC, spells with levels/preparation/detail, slots used/max                                                              | Compact read-first summaries and independent edits, level/Prepared filters.                                      |
| Notes                 | Fast freeform notes plus selective field/record notes                                                                                        | Preserve the PRD's at-most-two-activation quick-note entry.                                                      |

Numeric validation protects representation and referential integrity, not character legality. Keep the application's existing explainable calculated context/manual-override posture where reused; do not add a rules engine or make unknown operands look like valid zero totals. Slot level/preparation data is authored, not inferred from class progression. A mastery entry records user-authored information and reference context rather than applying weapon effects.

Runtime Actions start the proof with authored rows, timing filters, pins, and focused notes. This is a minimum proof surface, not a permanent manual-only product decision. Preserve 2014's linked-source creation/resync unchanged and do not advertise that behavior for 2024 until it exists.

#### Selected action-source extension (2026-10-23)

The owner's 2026-10-16 concern is that runtime value depends on connecting actions to character data: both repeated manual transcription and opaque automatic derivation can be poor fits. Compare the working manual 2024 proof with the existing 2014 source-assisted workflow before approving broad rollout.

The [existing action-templating decision](../../../../docs/decisions/2026-07-19-runtime-action-templating-architecture.md) already supplies a middle path: a player chooses a character-owned item, spell, or feature; an editable action snapshot is seeded; later source edits do not silently change it; confirmed resync replaces only source-owned fields; deleting the source detaches rather than deletes the action. Multiple actions can refer to one source. This is local assistance, not a compendium or a rules engine. Its limitation matters: confirmed resync can still replace deliberately edited source-owned text; an override-aware model is not already implemented.

The owner selected option A, bounded source assistance, after approving the visual pass. Extend the pre-gate proof with inventory sources first; spell and feature/feat sources follow only as their authored regions land. The extended proof still requires approval before broad rollout.

Persist an optional atomic source reference on each 2024 action: kind plus character-local record ID. Initially accept only `item`; extend the strict union and resolver with the delivered spell/feature collections during rollout, not unused variants now. Validate references at the full-character boundary, including import. Resolve sources again on creation/refresh; reject stale choices rather than saving a dangling link. Seed Name and Description into an editable draft; creation keeps the reviewed text, even if the source has changed meanwhile. Refresh uses the source's current Name/Description, including clearing absent description, and preserves all other action fields and field notes. Remove an inventory source and detach all referencing actions atomically before candidate validation. Renaming/reclassification never identifies or detaches a source.

Reuse DialogShell, bounded collection browsing, scalar/form controls and SmallEdit's action confirmation/error handling. The existing 2014 picker/form is tightly bound to its category/target/feature semantics and has a void save callback; do not import it into 2024 or silently alter its contract. The 2024 wrapper owns source eligibility and draft seeding, not new primitive input or dialog markup. Present read-only source provenance in Detail and refresh with an explicit warning that player edits can be replaced; richer override merging remains deferred. Extend the shared operation confirmation label only as needed so a refresh is never mislabeled as removal.

Keep stable action and source-record identities, separate system-owned action mutation from source projection, and avoid assumptions that an action is permanently unlinked. Do not add unused source fields, an override framework, an asynchronous facade, or a universal action API for hypothetical future consumers. These boundaries leave room for a source workflow without promising a migration-free extension. Automatic default rules actions and richer per-field inherit/override/refresh behavior remain separately backlogged.

### 6. Reuse below system orchestration; prove before broad extraction

Reuse the actual `src/lib/ui` controls, SmallEditScope/Dialog workflow, field/group views, collection rows, quickfilter chips, menus, panels, and PDF reader. The new sheet lives under `src/lib/systems/dnd5e-2024`; new/moved files use kebab-case. Keep concrete system edit intents/projections/validation local. A `dnd5e` family module is justified only by demonstrably matching 2014/2024 consumers; do not create an all-editions component with numerous edition flags.

BL-086's shared production composition remains the route/story source of truth. Reuse the same pattern for the 2024 Page and isolated host; retain generic Tier 1/2/3 stories and existing 2014 canonical examples. Prefer a small 2024 representative Page plus sparse and saturated data states over duplicating each primitive's behavioral stories. Label pre-rollout sections and unavailable commands visibly so reviewers can distinguish missing scope from a bug.

Proof feedback (2026-10-23): the 2024 overview/reference groups use the existing compact FieldGroupView presentation via GridContentCard's `inlineFieldControls={false}`, inside a shared PanelSurface. Editing metadata must not accidentally establish a different edition-specific visual grammar: label-targeted Detail remains editable; runtime HP still uses inline primitive controls. Read-first note counts follow values, including in the retained boxed primitive variant. NoticeBanner owns its shared spacing and explicit tone border; app and proof hosts do not duplicate that treatment.

Reference navigation/history mechanisms can share a host boundary, while landmark labels, target resolution, resource selection, and locators stay edition-owned. Build a 2024 catalog from the already adopted source, review exact page targets against that artifact, and reuse attribution in [THIRD_PARTY_NOTICES.md](../../../../THIRD_PARTY_NOTICES.md). The 2024 source is already hosted; neither sheet needs a new viewer. Preserve intentional user references to other editions while ensuring automatic preferred/contextual selection never silently falls back to 2014.

### 7. Proof gate and deterministic verification

**Named checkpoint: Multi-system lifecycle and 2024 sheet proof.** The initial envelope/lifecycle and visual proof is established. Following the owner's source-assisted choice, extend the same Representative/Sparse Pages with inventory-to-action creation, editable snapshot, explicit refresh/cancellation and detach-on-delete. Preserve the accepted visual revisions. Broad 2024 section rollout and wider 5e-family extraction wait for approval of this extension; source-scope selection alone is not approval of its UI.

Use [verify.md](verify.md) for concise current actions, app/story locations and pending decisions; keep detailed reproduction, dated results and inspection history in [verification-record.md](verification-record.md). Reuse one sandbox for keyboard, Save/Cancel, rejection, phone and desktop. No Storybook play functions. Use Node Vitest for parser/serializer/dispatch/summary/edit/category contracts and Playwright for actual storage, routing, reload, reader/history, and cross-system isolation. Catalog tests establish rendering/accessibility, not physical-device comfort or real persistence.

Inject ID allocation and clocks into factories/import helpers; use fixed seeds and timestamps in tests. Do not call random IDs/current time during projections or hydration. Current-model round trips preserve IDs, ordering, meaningful absence, notes, pins, source links, and timestamps; classification changes are explicit edits. Tests use existing memory storage and JSON Patch fixtures. Run browser suites in a quiet workspace, separately from builds/catalog checks, per [verification guidance](../../../../docs/verification.md).

After full rollout run the comprehensive gates, opt-in canonical catalog regression, and Firefox comparison. Existing BL-072 audit/platform limitations remain explicit; a known accepted advisory does not excuse new findings or justify calling a failing aggregate clean. No tooling or dependency change is planned; if needed, reconcile the design/ADR and complete dependency gates first.

## Risks / Trade-offs

### Apply audit — concrete consumers and path map (2026-10-16)

The baseline passes diagnostics/lint, 266 unit tests, 70 Chromium tests (5 project-specific skips), and 111 catalog checks. The sandbox could not bind the Vite port; rerunning browser checks with local-server permission passed. These are baseline results, not evidence for the new model.

Use an explicit supported-document union in `src/schema/storedCharacters.ts`; its parser/serializer remains the I/O authority. System factories retain typed options and accept injected ID/time providers. The implemented app dispatch supplies `createCharacterForSystem(systemId, dependencies?)`, the existing `toCharacterSummary(character)` (name, system label, optional summary), and `characterSheetPath(character)` (the literal route for a validated document). Reference context remains a system-owned catalog/locator selection passed into the shared reader host. These are concrete two-system consumers, not a plugin-registration API; never narrow an unvalidated document using only a cast.

| Existing data / consumer                                               | Rebase and ownership decision                                                                                                                                                                                              |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root `identity`, `features`, `inventory`, `notes`                      | Move under 2014 `systemData`; use 2024-owned definitions rather than inheriting required 2014 identity fields.                                                                                                             |
| Root `annotations` versus existing `systemData.annotations`            | Preserve the root array as `systemData.characterAnnotations`; retain `systemData.annotations` as the existing field-annotation tree. They are distinct owners, not mergeable containers.                                   |
| `system.source` and `system.annotations`                               | Retain as system-owned `systemData.provenance` content; the shared `system` header keeps ID/rules release only.                                                                                                            |
| Canonical JSON Patch/bind paths                                        | Move old gameplay roots under `systemData`; do not prefix existing system paths twice. Update projections, decoders, small-edit adapters, and `toSystemDataAnnotationPath` together.                                       |
| Virtual paths such as `__inventory`, `__features`, `__scratchpadNotes` | Remain feature-local UI intents, not persisted roots; reducers resolve them to the new canonical paths.                                                                                                                    |
| Source references and pins                                             | Keep record IDs and their namespaces unchanged. Reclassify fixtures explicitly; source lookup, removal, and pin reconciliation resolve the moved collections.                                                              |
| Canonical example hosts                                                | Preserve `char-bryltin`, `char-zindra`, and `char-5e-2014-saturated`, plus maintained test fixtures. Compare content independently of expected envelope/category changes; isolated hosts continue cloning their baselines. |
| Shared field/Detail/collection controls                                | Adopt shared interaction components; keep projections, candidate validation, source eligibility, and persisted note paths system-owned. Existing 2014 session/picker behavior is not automatically a 2024 adapter.         |

Recovery is enforced in the application storage owner throughout the session. Temporary example edits remain possible but cannot clear the recovery state or write the rejected key. Import application is guarded separately; reset writes a validated clean baseline before clearing recovery, and must not remove the old key before a potentially failing write. Raw recovery downloads are plain source text, not current-schema exports.

The 2026-10-18 proof review identified that Create followed an in-memory mutation with full-document navigation, immediately discarding the temporary new record during recovery. The home creation menu is now disabled with an explanation and its handler is independently guarded until reset succeeds. Temporary example inspection/edits still work; the storage write barrier is unchanged. Cancelling or failing reset cannot re-enable creation.

#### Terminology and interaction disposition

| 2014 evidence                                  | 2024 presentation                                             | Reuse / domain boundary                                                                                                 |
| ---------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Accepted ancestry/race and background fields   | Species and Background within Origin                          | Reuse label-targeted Detail; store 2024 fields locally, with no global 2014 label rewrite.                              |
| Inspiration                                    | Heroic Inspiration                                            | Reuse a boolean control; descriptions/references belong to the edition, with no automatic effect.                       |
| Class/subclass and class feature collections   | Optional class/subclass, class/species features and Feats     | Reuse independent edits and collection rows; no class progression, origin-feat assignment, or legality engine.          |
| Armor/weapon proficiency information           | Armor/weapon training                                         | Reuse compact authored information and notes; no assumption that proficiency mechanics or terminology are identical.    |
| Weapon item detail                             | Explicit equipment category and optional mastery notes        | Reuse item interaction and categorization mechanics; mastery is authored 2024 context, not a derived attack effect.     |
| Spell rows, slot summaries, casting statistics | Authored spells/preparation, slots, casting statistics        | Reuse field/collection/filter controls, not class-dependent preparation or slot calculations.                           |
| Action timing, pins, name/detail               | Manual actions initially; source assistance under gate review | Reuse chips, rows, notes, and pin controls; labels, timing matching, source eligibility/resync remain system-owned.     |
| HP, notes, navigation and source reader        | Same interaction grammar and edition-owned content            | Adopt shared primitives and production-host isolation; adapt landmarks/catalog rather than copying an entire 2014 Page. |

This map uses the proposal's approved official-sheet/conversion-guide evidence, not additional private-book processing. Shared UI remains under `src/lib/ui`; unchanged 2014 organisms remain under their system root. New 2024 adapters own validation and mutation. Extract a 5e-family helper only after the second concrete consumer exists. Existing structured forms may still support specialized source creation; do not restore retired card-wide bulk editing as the default 2024 Detail experience.

- **Envelope movement touches many 2014 paths** → Inventory patch, annotation, source, fixture, and navigation consumers; establish 2014 parity before the human checkpoint and preserve all maintained example content.
- **Two related editions resemble universal evidence** → Keep gameplay types and rule meaning system-owned; BL-071 remains the non-5e test. No mock Shadowdark implementation is required to claim success here.
- **A thin sheet becomes unusably thin** → The coverage table is the delivered floor, not just the first proof. Review sparse, representative, and saturated actual sheets; targeted optional fields are not full builder parity.
- **Over-sharing conceals edition differences; copying multiplies maintenance** → Record adopt/adapt/keep-domain decisions with two concrete consumers, distinguish names from semantics, and review paired 2014/2024 examples.
- **Demo fallback hides incompatible user data** → Persistent write barrier, untouched original download, explicit reset, repeat-mutation/reload tests, and visible temporary-state guidance.
- **Published v0 update invalidates local records** → Existing disclaimer plus specific recovery; no claim that raw downloads guarantee future import. This is an explicitly approved pre-playtest trade-off.
- **Reference reuse changes history or opens the wrong source** → Exercise both real routes, stale/wrong-context locators, underlying sheet navigation, and reader Close/Back; do not infer those from catalog hosts.
- **Source inspection is mistaken for distribution permission** → Local official-sheet review informs concepts only; no templates, extracted form data dumps, or private paths are committed. Bundled source metadata stays centralized.

## Proof implementation evidence

### Approved rollout implementation — 2026-10-24

#### Owner layout refinement — 2026-10-24

Classes use the shared collection's compact presentation: borderless wrapping entries, inline metadata/note counts, and existing Add/Detail interactions. Full descriptions remain in Detail, and dense retrieval remains bounded. Class notes already use the record/leaf note contracts; row summaries now include both name-owned and other leaf notes so attached information is visible on return to the sheet. The 2026-10-25 refinement below supersedes the initial class pin controls.

Shared Quick Reference explicitly disables boxed inline field controls for Reference stats, retaining inline label/value Detail entry in both editions. FieldGroupView renders nested boolean leaves through the same read-only checkbox atom as standalone booleans. After the 2026-10-25 feedback, false and unset both appear empty; the optional value remains unchanged and accessibility names still distinguish absence. This supersedes the initial indeterminate appearance. This is display metadata, not a schema change or direct checkbox mutation on the sheet.

#### Owner parity refinement — 2026-10-25

Both editions now use compact Classes below a divider separating Name. Neither exposes class pinning; old 2024 class priority data remains valid but does not change display order. The 2014 adapter projects class rows into the shared list and delegates Add/Detail/notes/removal to its existing guarded class operations. Its positional class model remains unchanged; selecting a row focuses that class inside the existing group Detail rather than inventing record identities or duplicate mutations.

The initial paired proficiency/expertise indicators are superseded by the single-status refinement below. Detail remains the editing entry point. Runtime projections honor explicit requested field order so Current/Temporary HP and death saves precede Heroic Inspiration and Conditions. Keep Mira representative; the separate Mira-derived Saturated fixture provides density evidence without turning the baseline example into a stress case.

The initial native-tooltip wrapper adjustment did not resolve the owner's reported absence of tooltips; the exact browser cause is unconfirmed. Do not treat static title assertions as hover evidence. The owner explicitly brought the single-selector refinement into this rollout rather than deferring it. Rules reference: [2024 Expertise](https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary#Expertise).

#### Single proficiency status — owner-requested rollout refinement

Use the neutral shared StatusIndicator atom through FieldGroupView's `displayStatus` metadata. A compact visible key beside Prof. Bonus explains only P (proficient) and E (expertise, skills only). Empty states need no legend; unusual imported/previously authored combinations retain ! and their exact flags in Detail, without extra explanatory prose. The selector cannot create these custom combinations. The owner's 2026-10-25 copy refinement removes proficiency/expertise About disclosures, including custom-state explanations. Only a short inline hint beside each skill/save Bonus remains: it is manually entered and changing proficiency does not recalculate it. The shared Detail hint is optional, domain-supplied text; longer explanations elsewhere retain their existing disclosure. No rules meaning lives in the atom. Native titles are supplementary, not the only explanation; do not introduce a three-state cycling checkbox or a tiny extra edit button. The existing label opens Detail and highlights Proficiency.

The edition-owned editor adapts its two optional flags to one existing shared select control: Not recorded / None / Proficient / Expertise for skills, without Expertise for saving throws. A successful explicit selection validates and writes the pair once, preserving the manually authored bonus and all unrelated data. Guard the original complete pair (including false versus absent) and owner identity; an intervening pair change requires reopening Detail, even if its condensed label is unchanged. Update the guard after this editor's own successful save. Cancel/rejection retains the established shared behavior.

Unknown, partial and unusual imported combinations are never normalized by rendering. Show unusual combinations as Custom (preserved) and expose their exact flags in Detail; an unchanged save is a no-op. Explicitly selecting a normal level replaces only the flags. Not recorded clears both flags, while None records false/false. Existing Expertise-owned notes retain their original path in a notes-only Detail section; the primary Proficiency editor retains Proficient-owned notes. No schema migration, automatic bonus recalculation or universal proficiency model is introduced. Reuse the generic Read-first Detail story (neutral Access status/select example) and the existing production 2024 Pages for review.

Features and Feats share a presentation/search surface beside Traits and Weapon Mastery in a responsive three-column region. They retain separate stored collections and stable keys; type badges and the Add dialog's Record type choice preserve the distinction. Row commands resolve their actual owning collection, so pinning, notes, removal and source references are not redirected by the combined heading. Shared UI does not learn game-specific record types. No migration or rewrite of authored records is needed.

#### Delivered region implementation

The full authored coverage table is now implemented; the dated partial-proof descriptions below are historical. `fields-5e2024.ts` owns schema vocabulary/allowed note targets; edition-owned `sheet-fields.ts` supplies editable metadata and creation fields, `sheet-projections.ts` groups presentation, and the existing session validates each candidate before committing. Optional structures remain absent until authored. Ability modifiers/check bonuses are authored context, not a newly introduced calculation engine; all supplied values remain independently editable.

Equivalent content follows the 2014 region order and grouping: identity/classes, origin, appearance; live/reference panels; actions; abilities/proficiencies; features/traits plus edition-owned feats/masteries; spells/slots; currency/equipment; roleplay/notes. Empty paired groups explicitly bind their parent so label entry works before any leaf exists. Detail labels qualify save/skill fields to avoid indistinguishable editing controls. Unknown numeric/boolean facts are not seeded as zero/false simply to make a checkbox or pair render.

Quick Reference's neutral two-panel layout now lives in shared UI and serves both editions. Existing fields, paired-value rendering, collections, source dialogs, chips and navigation remain shared. 2024 creation and focused edits share field definitions, but mutation semantics remain edition-owned. Legacy bulk-edit workflows are not used for supported 2024 Detail; the structured creation dialog is retained. No new global registry or 5e-family abstraction was needed.

Source snapshots now cover actual inventory, spells and features/traits/feats/masteries. A feature source ID is unique across its eligible collections. Refresh owns only Name/Description; removal detaches links atomically while retaining action values, notes, timing and pins. Item reclassification keeps its identity and source destinations. New class/creation/spell locators are verified against the hosted PDF through an automated text-heading check. Representative, Sparse and Saturated catalog fixtures reuse the actual Page and isolated state host.

### Proof implementation boundary — 2026-10-17

- The actual 2024 route is `/charsheets/5e2024`. Its production composition and isolated Representative/Sparse Pages use the same system-owned edit session. The current proof intentionally contains only identity/origin, current/temp/max HP, AC, inventory, manual actions and quick notes. The broader coverage table remains post-gate work, not delivered functionality.
- `src/lib/navigation/` now owns the neutral landmark coordinator and host contract. Shared NavigablePanel/Region, SheetNavigation, SheetRulesShortcut and SheetReferenceController consume supplied landmarks/catalogs. `src/routes/sheet-navigation-host.ts` supplies application history; the shared history functions retain the active route, base path and character query. The existing 2014 wrappers preserve its domain defaults and test vocabulary. Neither shared UI nor the host selects a game system.
- `src/lib/storybook/canonical-sheet-state.ts` owns only cloned/resettable sandbox state. Each edition retains its own composition, projection, mutation, and validation. The new 2024 collection adapter composes GridContentList, SmallEditScope and CollectionQuickfilters; it does not copy their dialogs or draft machinery. No additional dependency, global renderer or speculative 5e-family schema was introduced.
- Preferred and contextual 2024 rules use the existing hosted SRD. General, origins, actions and equipment target pages 1, 83, 9 and 89, inspected against the adopted PDF; the final class/spell locator work remains in task 4.5. Catalog-backed annotation resolution is neutral and never rewrites an explicitly authored alternate source into the preferred edition.
- The 2024 proof's single Inventory collection shows explicit category badges and an independently editable Category. It demonstrates identity-preserving classification without pretending the final equipment-region arrangement has already passed review.

### Proof review corrections — 2026-10-18

- Authored annotations resolve against an explicit combined known-resource catalog, so a user-selected source ID/page can open either adopted SRD from either sheet without needing a redundant URL. The generic resolver still applies rights/availability classification; unknown and link-only sources are not promoted into included PDFs. Sheet Rules buttons, contextual locators and reference templates still use the edition-owned catalogs. A foreign automatic locator remains unavailable, not a fallback.
- The 2014 category adapter presents Weapons, Armor & Shields and Other Gear while mapping back to the unchanged persisted keys. The common field control does not acquire edition-specific knowledge.
- Recovery creation is guarded as described above. These corrections remain pre-gate revisions; they do not approve source-assisted actions or broad rollout.

### Action-source audit and recommendation — 2026-10-17

Historical task 2.7 audit. **The owner selected this recommendation on 2026-10-23; the extension above supersedes the pending-choice language below.** Implementation/proof approval is tracked separately in tasks and verify.md.

| Existing 2014 contract                                                 | Evidence and implication for a bounded 2024 extension                                                                                                                                                                                 |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Explicit searchable source choice or custom entry                      | The picker and Add-dialog flow operate on normalized local candidates. Search, selection, draft navigation, and confirmation can share presentation; source eligibility and candidate projection stay edition-owned.                  |
| Inventory, spells, general/class/subclass features and ancestry traits | `runtime-action-sources.ts` resolves character-owned IDs; background features are not eligible. Do not copy that ownership taxonomy into 2024 or treat names as identities.                                                           |
| Name plus source-owned text                                            | Inventory/spells own name and notes; general features use summary then description; class/subclass features and traits own only name. Timing, category/target, independent annotations, identity and pins are not replaced by resync. |
| Explicit refresh, never live propagation                               | `create-runtime-action` validates the chosen source at commit. `resync-runtime-action` resolves it again and replaces only owned text after confirmation. Source changes do not silently mutate the snapshot.                         |
| Deletion detaches the link                                             | Reconciliation preserves the action's authored snapshot, ID, notes and priority when its source disappears. Rename/reclassification changes navigation but not source identity.                                                       |
| No player override mask                                                | Editing a source-owned action name/description does not make it protected during later resync. Blank source text can clear such text. The overwrite warning is essential, not a claim that refresh merges intelligently.              |

**Recommendation: choose a bounded source-assisted extension before broad rollout.** The established explicit snapshot flow avoids repeated transcription without turning actions into rules-derived output. Eligible 2024 sources should be character-owned inventory, then the authored spell and feature/feat records that this change actually delivers. Seed only Name and the available authored Description; timing stays a player choice. Keep custom creation, independent action notes/pins, multiple actions per source, commit-time reference validation, deliberate refresh with a clear overwrite warning, and detach-on-delete. Do not infer damage, timing or eligibility from names, consult external providers, auto-populate standard actions, or introduce override masks.

If selected, revise proposal/specs/tasks before writing that code; extend the pre-gate proof first with one inventory-to-action example, including source edit, resync warning and deletion. Specify the remaining delivered source kinds for rollout rather than silently promising full 2014 parity. A narrower manual delivery remains valid if the owner prefers it, but must name the source-assistance follow-up and trigger in the backlog. Richer inherit/override behavior is already owned by the backlog's source-backed runtime-action exploration. The current 2024 schema deliberately has no unused source fields; the provisional v0 can extend after that explicit decision.

## Shared source Detail refinement — 2026-10-24

The owner could not discover refresh in the proof. Static inspection found Mira's named Quarterstaff action was unlinked and the new refresh action appeared below the fields. Link that maintained example explicitly without overwriting its authored snapshot; existing saved user records are not relinked by name.

`SmallEditModel.source` supplies a live label, source Detail factory and optional confirmed refresh operation. The shared `DetailSource` molecule groups the source name, View source and Refresh near the top. `SmallEditDialog` owns a single-dialog reading trail, scroll/focus restoration, and the existing save/discard/keep-editing guard. Back returns to the action; Close dismisses the dialog. Original record removal is not offered while visiting its source. Source edits remain independent until confirmed refresh.

Both system adapters consume this contract. 2014 resolves its existing item/spell/general-feature/class-feature/trait identities and reuses its resync intent; 2024 resolves inventory identities and its existing candidate commit. Eligibility, field ownership, validation and persistence never move into the shared component. Preserve 2014 row-menu source navigation/resync shortcuts. No universal source registry, game-specific UI switch, stacked dialog or history mutation is introduced. Existing canonical Page sandboxes cover this real integration rather than duplicating domain logic in a new proof.

## Migration Plan

1. Implement the recovery barrier before enabling the new shape; capture baseline 2014 evidence and current fixture identities/content.
2. Introduce the envelope and explicit system dispatch, rebase maintained 2014 data/adapters/tests, and reject incompatible existing data without transforming it.
3. Add the guarded 2024 route and narrow proof, obtain explicit approval, then deliver the full scoped regions and fixtures.
4. Run full verification and final human review before archive/public rollout. Update the existing architecture and character-versioning ADRs with the implemented boundary and the new approval; do not rewrite their historical rationale.
5. A code rollback does not promise to load newly written v0 shapes. Preserve raw originals/downloads, communicate incompatibility, and require deliberate reset if either binary rejects the other's data. Do not deploy/reset user storage as part of proposal or archive automation.

## Open Questions and Self-Resolved Decisions

### Final-review corrections — 2026-10-26

The subsequent owner-approved 2014 coverage pass exposes existing optional bonus, expertise, passive-perception, player-name and subclass data using the existing projection/SmallEdit contracts. Add only an optional combat Inspiration boolean; no default is persisted during rendering. Shared status display summarizes P/E while 2014's original flags remain independently editable, preserving note ownership and manual bonuses. The 2014 dense-list pin handler now consumes the same invoking-element callback as 2024. The coverage ADR distinguishes the editions: 2014 Hit Dice retains total/remaining strings; only 2024 currently has the single string.

The owner authorized class authored-order preservation, independent subclass badges when level is absent, and pin animation scoped to the invoking row's actual list. Shared row actions now optionally supply their trigger; no global duplicate-ID lookup selects the animation surface.

Storage parsing and outgoing serialization reject duplicate document IDs globally. Import review alone permits duplicate IDs so Merge New can retain its skip/report policy; Replace validates uniqueness before any store update, with visible recoverable feedback. This is an inherited safety gap corrected at the collection boundary, not an edition-specific rule.

The owner accepts the intentional paper-sheet deviations documented in the [coverage ADR](../../../../docs/decisions/2026-10-26-bound-2024-character-sheet-coverage.md). XP and attunement remain deferred, with annotations available for the latter. Hit Dice is currently one schema string and UI field; structured resource pools need the backlog-owned refinement rather than a silent string conversion here.

- **Resolved by owner:** Rebase pre-playtest v0 without a historical migration promise; preserve familiar interactions, edition-native vocabulary, and shared code where semantics match. Only official character sheets and SRD-named local PDFs are authorized for inspection.
- **Resolved by owner (2026-10-23):** Deliver bounded source-assisted snapshots alongside custom actions. Inventory is the extension proof; spells and features/feats join during rollout. The proof remains gated, and no override-aware merging or default rules actions are added.
- **Recommended baseline:** Sparse and rich records use one data format, with no compact-view toggle yet. Density is a proof decision, not a reason to invent a second canonical character format.
- **Execution audit, not a product blocker:** Settle exact typed dispatch signatures, retained provenance placement, and evidenced 5e-family extractions before propagation. Record changes here; do not freeze an extensibility API prematurely.
- **Human proof decisions:** Does sparse presentation remain useful without empty-section clutter, do edition labels feel natural, and do shared HP/Detail/collection/reference interactions retain the accepted density? Adjust before dependent rollout.
- **Deferred with backlog triggers:** Optional compact/full presentation of the same data; built-in/default rules-action assistance; richer source/player override semantics. Bounded 2024 source assistance is now included, not deferred. No other local rulebook inspection is assumed.
