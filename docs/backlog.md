# Prioritized Backlog

This is the prioritized engineering backlog for ez-chars.

Use this file with:

- [../AGENTS.md](../AGENTS.md)
- [active-goals.md](active-goals.md)

Treat [active-goals.md](active-goals.md) as the boundary document defining product scope, and this file as the prioritized queue of candidate work.

## Backlog Triage & Refinement Workflow

We expect to ideate and triage backlog items through the following workflow:

1. **Ideation Sandbox (Unsorted Ideas)**: Dump rough thoughts, refactor ideas, or feature wishes directly into the `## Ideation Sandbox` at the bottom of this file. This provides a low-friction space for human and agent brainstorming.
2. **Refinement Sessions with AI**: Before implementing a sandbox item or new request, engage in a refinement session with an AI agent (e.g., in a chat thread or via the `/opsx-explore` thinking workflow / `openspec-explore` skill). The goal is to move from rough ideas to a structured backlog item.
3. **Structured Refinement Outputs**: Refinement sessions must output the following standardized fields to define new backlog items (transitioning away from the legacy Size, Scope, Slices, and DoD structure):
   - **Purpose:** What user problem are we solving?
   - **Included behavior:** What is the smallest useful capability?
   - **Excluded behavior:** What tempting features should remain out of scope?
   - **Ambiguities:** What decisions must be made before implementation?
   - **Success:** What observable scenarios would convince you it works?
4. **Triaging to the Backlog**: Assign the refined item a durable priority-neutral ID (e.g., `BL-065`), create its detailed definition once in the refined backlog catalog, and add a link to that definition in the appropriate P0/P1/P2 queue.
5. **Recommending an Execution Path**: End every exploration or refinement with an explicit recommendation, using [the repository change-classification and ADR thresholds](../AGENTS.md#change-classification--adr-triggers): direct/ad hoc implementation, an ADR-only update, a compact OpenSpec change, or a full OpenSpec change. State separately whether an ADR is triggered, whether a durable spec delta is likely, and whether the coding or architectural scope benefits from OpenSpec's proposal, design, and task artifacts. Include a short rationale and identify any unresolved decision that blocks implementation. Human-authored and agent-assisted direct coding follow the same classification.
6. **Executing the Chosen Path**: Fast-track work may proceed directly without an OpenSpec change. ADR-only work may create or update the decision record directly. For compact or full OpenSpec classifications, run `/opsx-propose` (or trigger the `/opsx:propose` workflow) to generate the planning artifacts (`proposal.md`, `design.md`, `specs/`, and `tasks.md`) within the change workspace, adding an ADR when separately triggered. The refined backlog item forms the input template for the proposal.
7. **Proof-Before-Propagation Gate**: During exploration and proposal, look for consequential interaction, visual, data-shape, generated-output, or developer-ergonomics decisions that can be tested through a small isolated proof before broad rollout. When human feedback could materially change later work, plan a pre-gate proof batch, a named unchecked human review/approval task, and a dependent rollout batch. Storybook coverage alone does not require a gate; the proof must expose a meaningful choice. Apply agents stop at the named gate and resume only after explicit approval.
8. **Post-Apply Human Gate**: Every OpenSpec change must end its apply checklist with a user review and explicit approval task. Agents may finish implementation and verification tasks, but must leave this gate unchecked, present the resulting scope, verification, and material fallout, and wait for approval before treating the change as done or archiving it. A request to start apply work or a passing test suite does not satisfy this gate.

### Backlog ID Rules

- Existing `p0-*`, `p1-*`, and `p2-*` IDs are grandfathered durable identifiers. Do not rename them merely because their priority changes.
- Assign new refined items the next unused priority-neutral `BL-NNN` identifier. Keep three zero-padded digits through `BL-999`; expand only when that capacity is actually exhausted.
- Treat the numeric suffix as identity, not ranking or execution order. Priority belongs in the P0/P1/P2 queue and the "Next recommended sequence."
- Before allocating an ID, scan current backlog entries and active or archived OpenSpec changes; consult Git history if the candidate may have been removed. Never reuse a completed, removed, or abandoned ID.
- Leave raw sandbox ideas unnumbered until they are refined and promoted. Do not create hierarchical variants such as `BL-065a`; implementation slices belong in OpenSpec tasks.
- Name the corresponding OpenSpec change `bl-NNN-short-slug`, preserving the backlog identity in lowercase kebab-case.

### Priority Classes

These are roadmap priorities, not permanent properties of an item:

- **P0 — Product prerequisite:** Work necessary to satisfy the current product goals and call the scoped product the product we intend to deliver. Active P0 work takes precedence over improvements and feature expansion.
- **P1 — Priority improvement:** High-value product, UX, developer-UX, reliability, or maintainability work that should generally be addressed before broadening the product with lower-priority features. The current product may remain usable without it.
- **P2 — Future feature work:** New or expanded product capability generally deferred until the relevant P0 prerequisites and selected P1 improvements are complete.

Priority may change as goals and evidence change. Reprioritize an item by moving only its ID link between the queues below; never rename its ID or cut and paste its detailed definition. Priority is also distinct from readiness: a blocked or trigger-deferred item may retain its strategic priority while being omitted from the next recommended sequence.

The owner may intentionally pull forward a P1, P2, or ad hoc task. Agents should surface dependency, scope, and resequencing consequences, but must not reject work solely because a higher-priority item exists.

## Current Priority Queues

These lightweight queues record priority membership only. Detailed definitions live once in the [refined backlog catalog](#refined-backlog-catalog).

### P0 — Product Prerequisites

- [`BL-074` — Clarify GridContent composition before multi-system reuse](#clarify-gridcontent-composition-before-multi-system-reuse)
- [`BL-076` — Scale runtime and supporting sheet collections](#scale-runtime-and-supporting-sheet-collections)
- [`BL-075` — Add stable manual collection ordering](#add-stable-manual-collection-ordering)
- [`BL-069` — Deliver rights-classified reference navigation](#deliver-rights-classified-reference-navigation)
- [`BL-070` — Establish the multi-system boundary and 2024 D&D sheet](#establish-the-multi-system-boundary-and-2024-dd-sheet)
- [`BL-071` — Deliver a minimal system-native Shadowdark sheet](#deliver-a-minimal-system-native-shadowdark-sheet)
- [`BL-072` — Harden the three-system external-playtest matrix](#harden-the-three-system-external-playtest-matrix)

### P1 — Priority Improvements

- [`BL-066` — Prove bounded fillable-PDF interoperability](#prove-bounded-fillable-pdf-interoperability)
- [`BL-073` — Investigate scene-aware runtime guidance and navigation](#investigate-scene-aware-runtime-guidance-and-navigation) _(saturated navigation evidence recorded; cross-system/criticality gate remains)_
- [`p1-010` — Add GitHub Actions for quality gates](#add-github-actions-for-quality-gates) _(trigger-deferred and omitted from the recommended sequence until CI needs justify it)_

### P2 — Future Feature Work

No active P2 items.

## Next Recommended Sequence

_Goal: First External Playtest_

The queues above record strategic priority membership; this list records the dependency-aware action order and may omit blocked or trigger-deferred items.

1. `BL-074`: Refactor the proven 2014 GridContent and panel composition boundaries before resource navigation and another system depend on them
2. `BL-076`: Bound and search saturated Runtime Actions, then establish proportionate density behavior for supporting Runtime collections
3. `BL-075`: Let users deliberately surface their most important inventory and spell entries before saturated-sheet owner rehearsal
4. `BL-069`: Prove multi-source resource discovery and contextual navigation against the 2014 sheet
5. `BL-070`: Establish the smallest multi-system lifecycle/computed-view boundary and add the minimal 2024 D&D sheet
6. `BL-071`: Add the minimal Shadowdark sheet within the conservative baseline after `BL-070` supplies the dispatch boundary
7. `BL-072`: Rehearse and harden the full three-system representative, sparse-GM, and saturated-sheet matrix

The completed `BL-064` proof established the inventory and spell baseline. `BL-076` remains a separate Horizon A change: Runtime Actions own source, navigation, resync, and creation behavior that needs an explicit proof after `BL-074` clarifies the reusable list seam. `BL-075` then keeps stable ordering separate so the accepted inventory and spell previews reflect deliberate user priority before owner rehearsal and external handoff. `BL-066` is an early P1, export-first interoperability proof after `BL-070` stabilizes a target schema and template-delivery rights. It is deliberately not a first-playtest readiness prerequisite. `BL-073` remains outside this sequence: saturated 2014 rehearsal now confirms navigation pressure, but cross-system scene vocabulary and the urgency of anything beyond a bounded outline still need evidence.

## Refined Backlog Catalog

Each active refined item has one stable detailed definition in this catalog. Queue entries and the recommended sequence point here; reprioritization must not relocate or duplicate these definitions. When an item is completed and archived, remove its queue link and catalog definition, then retain only the bounded summary required by [Done Recently](#done-recently).

### Clarify GridContent composition before multi-system reuse

ID:

- `BL-074`

Sequencing context:

- Execute immediately after `BL-064` supplies a concrete dense-list proof and before `BL-076`, `BL-069`, or `BL-070` add runtime-collection, contextual-resource, and second-system consumers. This is a bounded pre-adoption refactor, not a prerequisite for finishing the `BL-064` user behavior.

Refinement outputs:

- **Purpose:** Improve developer comprehension, Storybook isolation, and safe reuse of the current field/card rendering system before another feature family or game system depends on responsibilities that are presently concentrated in `GridContent` and `GridContainer`.
- **Included behavior:**
  - Inventory the actual 2014 consumers and document which responsibilities belong to primitive field rendering, list rendering, focused forms, annotations, card actions, dialog orchestration, responsive grid layout, panel styling, headings, collapse state, and nested elevation.
  - Use the completed `BL-064` list boundary plus existing primitive, annotation, runtime-action, and structured-edit consumers as concrete evidence; do not design from hypothetical systems alone.
  - Review the concrete 2014 dense-collection adapter evidence: selected-row and query ownership, source-navigation query reset, record-shaped form projection, identity-owned intent translation, the Spellcasting/Spell Slots/logical-list boundaries, and bounded-list scroll ownership. Decide which responsibilities stay domain-owned and which merit a smaller reusable seam without turning the adapter into a universal collection framework.
  - Treat the saturated Runtime Actions and supporting-collection findings as immediate downstream evidence: expose a seam that `BL-076` can evaluate without absorbing source navigation, resync, creation, or collection-specific density policy into a generic list component.
  - Explicitly evaluate the sandbox proposal to replace separate focused Edit and Notes commands with a read-oriented View path plus one Edit path that can modify authored detail and create, change, or remove annotations. Compare collection records with individually editable fields, keep bulk value editing and bulk annotation workflows separate unless contrary evidence emerges, and refine the idea into a bounded follow-up backlog item or close it with recorded rationale.
  - Separate only the component and projection contracts that materially reduce branching, special-case orchestration, or page-level boilerplate while preserving current 2014 behavior and typed patch ownership.
  - Decide whether responsive layout and bordered/collapsible panel responsibilities should remain in `GridContainer` or become focused layout and panel-shell components.
  - Give reusable molecules and organisms realistic, stateful Storybook coverage for representative display, editing, annotation, empty, error, dense, and responsive states; page-specific composition remains covered through black-box sheet tests rather than artificial stories.
  - Use a proof-before-propagation checkpoint: present the proposed component boundaries and Storybook evidence for owner review before migrating the remaining 2014 consumers.
  - Reconcile the field-rendering, field-binding, field-interaction, component-taxonomy, and maintainer guidance so names and ownership match the implemented contracts.
  - Leave the resulting boundaries ready for `BL-069` and the focused reuse audit in `BL-070` without claiming that 2014 components are automatically appropriate for 2024 or Shadowdark.
- **Excluded behavior:**
  - Implementing another game system, changing character schemas, or creating a universal TTRPG field registry, renderer, form engine, page template, or collection framework.
  - Redesigning visible character-sheet behavior merely to make component boundaries look cleaner; user-facing improvements require their own scoped requirement or evidence.
  - Implementing the View/Edit/annotation workflow redesign without a separately reviewed behavioral proposal; `BL-074` owns its evidence-based refinement, not its silent delivery.
  - Repository-wide renaming, file movement, or taxonomy churn without a concrete readability, testing, or reuse benefit.
  - Replacing existing platform-native dialogs, menus, or patch semantics where their current contract remains sound.
- **Ambiguities:**
  - Which current `GridContent` responsibilities remain cohesive after the list proof, and which deserve focused components or projection types?
  - Does a unified View/Edit flow belong only to identity-owned collection records, or can individually editable fields share it without forcing simple values into item-shaped detail screens?
  - Which annotation display and mutation responsibilities belong in read-only detail, focused editing, and the still-separate bulk workflows?
  - Does stable row identity belong in the general grid projection contract, a list-only contract, or domain adapters?
  - Is splitting `GridContainer` justified by current 2014 composition, or should that decision remain with the second-sheet audit after a smaller panel-shell extraction?
  - Which legacy field documents remain authoritative, which need reconciliation, and which can be marked historical without losing useful rationale?
- **Success:**
  - A maintainer can identify the owner of display, editing, annotation, list, dialog, layout, and persistence responsibilities without tracing one multi-purpose component or route branch.
  - Storybook exercises the reusable contracts with stateful and failure-oriented examples, and the owner approves the proof before route-wide migration.
  - Existing 2014 sheet behavior, accessibility, typed patches, persistence, and black-box flows remain verified.
  - The View/Edit/annotation sandbox idea is either refined into one explicitly sequenced behavioral backlog item with bounded consumers and success criteria or closed with durable rationale; resulting component seams do not accidentally preclude the selected direction.
  - `BL-069` and `BL-070` can consume or reject the resulting boundaries intentionally rather than copying page-specific conditions or treating a 2014 renderer as universal.
- **Recommended workflow:** Full OpenSpec change because this deliberately changes reusable component and developer API boundaries across several consumers. A durable specification delta is unlikely unless observable behavior changes. Refine the existing component-composition ADR if the result changes the approved atom/molecule/organism or layout ownership model; create no parallel ADR solely for file organization.

### Add stable manual collection ordering

ID:

- `BL-075`

Sequencing context:

- Execute after `BL-064` establishes the five-item preview and focused collection surfaces and after `BL-074` clarifies their reusable ownership. Complete it before continued saturated-sheet rehearsal and external handoff because at-a-glance priority is part of the intended first-playtest experience, not a finding the external playtest must first rediscover.

Refinement outputs:

- **Purpose:** Let users decide which collection entries are most important and preserve that authored order so compact previews and full focused views reflect user intent rather than incidental insertion history.
- **Included behavior:**
  - Support stable manual ordering within Weapons, Armor & Shields, Other Gear, and each spell level while preserving record identity, annotations, source links, and authored content.
  - Make ordering usable with pointer, touch, and baseline keyboard interaction through explicit controls or a dedicated reorder mode; drag or gestures may supplement but never replace the complete path.
  - Define clear behavior while search is active so filtered result position is not mistaken for canonical order; preserve the underlying order unless the user deliberately enters an ordering workflow.
  - Reflect committed order consistently in phone previews, focused collection views, persistence, JSON export/restore, and source navigation.
  - Add stateful Storybook evidence plus focused mutation, persistence, and browser coverage for first/middle/last moves and interrupted or cancelled ordering.
- **Excluded behavior:**
  - Alphabetical or rules-derived automatic sorting, relevance ranking, per-view alternate orderings, or synchronized multi-user ordering.
  - Moving records between equipment groups, changing spell level through reordering, or reclassifying an item as a side effect of position.
  - Requiring every short collection to adopt ordering before concrete use demonstrates value.
- **Ambiguities:**
  - Should the baseline expose Move to top plus Move up/down commands, a dedicated reorder mode, drag-and-drop with equivalent controls, or another compact combination? USER MANUAL ENTRY: perhaps we should consider a "promote"/"favorite" function. Where we un-opinionatedly sort by name alphabetically by default, but otherwise give the user the ability to indicate priority/favoritism for certain objects to be weighed higher than the default sort.
  - Should reorder controls be unavailable while filtered, or should the UI provide an explicit transition back to canonical-order mode?
  - Which non-target collection is the next credible consumer after inventory and spells?
  - Should Runtime Actions join this ordering scope after `BL-076` defines its compact surface, or retain an independently authored priority model because its source and action-economy semantics differ?
- **Success:**
  - Users can deliberately reorder target entries across touch, pointer, and keyboard paths without losing identity or content.
  - The first five preview entries reliably match the first five authored entries after reload and export/restore.
  - Search never silently mutates canonical order, and cross-group or cross-level movement cannot occur accidentally.
- **Recommended workflow:** Full OpenSpec change because this adds observable collection behavior, ordered-list mutation semantics, stable-identity requirements, and accessibility design. Add or refine an ADR only if implementation establishes a durable cross-system ordering contract rather than a 2014 collection behavior.

### Scale runtime and supporting sheet collections

ID:

- `BL-076`

Sequencing context:

- Execute after `BL-074` clarifies the proven list, panel, form, and page-orchestration seams. Complete it before continued saturated-sheet rehearsal and external handoff because the dedicated saturated 2014 fixture now demonstrates that Runtime Actions can dominate the primary play surface and supporting collections can create avoidable height and alignment pressure.

Refinement outputs:

- **Purpose:** Keep saturated Runtime information quickly scannable without flattening specialized Runtime Action behavior into a generic list or forcing search and competing scroll regions onto every supporting collection.
- **Included behavior:**
  - Give Runtime Actions a searchable, count-bearing dense presentation that preserves its action timing/category/source context, annotation state, source navigation, explicit resync warning, source-deletion fallback, and custom/source-backed creation paths.
  - Use a ten-record compact Runtime Action cap before the complete collection path rather than inheriting the five-record inventory/spell preview cap; preserve authored order until a separately approved ordering behavior applies.
  - Reuse the accepted dense-list presentation and focused browsing pieces only where their contracts fit. Keep Runtime Action orchestration and mutations in the existing domain-owned card/adapter rather than teaching the presentation component about sources or resync.
  - Evaluate Proficiency Languages, Proficiency Tools, Features, and Traits as supporting collections with a consistent visual height grammar and a proportionate vertical bound, compact preview, or explicit focused expansion. Default to no search unless realistic saturation demonstrates that scrolling or focused browsing is insufficient.
  - Explicitly test desktop wheel ownership against the existing nested-scroll concern; prefer one obvious scroll owner or explicit focused browsing over adding several small inline scroll traps merely to equalize card height.
  - Preserve complete touch, keyboard, pointer, and assistive access to every record and command, with stateful Storybook proof plus saturated desktop and phone black-box coverage.
  - Stop at a mid-apply owner gate after the Runtime Action and supporting-collection presentation proof, before propagating it through the sheet.
- **Excluded behavior:**
  - Changing Runtime Action schema, snapshot/resync semantics, source-provider behavior, override modeling, action creation content, or the action-economy taxonomy.
  - Adding a whole-sheet outline, scene/pillar mode, sticky navigation, or hidden-region behavior; the saturated navigation finding belongs to `BL-073`.
  - Automatically applying search, the ten-item cap, or identical commands to every short list solely for visual uniformity.
  - Solving manual priority/order controls, which remain in `BL-075` unless that change is explicitly refined after the Runtime Action surface is approved.
  - Reopening the general component taxonomy or creating a universal collection renderer after `BL-074` has selected bounded ownership seams.
- **Ambiguities:**
  - Which Runtime Action text should search cover beyond name—authored notes, source name, timing, category, or selected effective content?
  - Should the ten-record compact cap apply identically on desktop and phone, or should desktop use a focused-view affordance that avoids nested scrolling while phone uses the established preview/dialog pattern?
  - Which supporting collection first exceeds a simple bounded display in realistic 2014 use, and at what evidence-based threshold should search become available?
  - Can supporting collections share one visual-height and overflow treatment without forcing languages, tools, features, and traits into one mutation or row-action model?
  - Should Runtime Actions become a subsequent `BL-075` ordering consumer, or should explicit favorites/promotion be evaluated as a more appropriate at-a-glance priority mechanism?
- **Success:**
  - Ten or fewer Runtime Actions remain visible at a glance, larger sets are searchable and completely reachable, and specialized source/resync/create behavior remains understandable and verified.
  - Proficiencies, Features, and Traits no longer create unexplained card-height mismatches or unbounded sheet growth, while simple cases remain lightweight.
  - Desktop and phone users can move through the sheet without accidental scroll traps and can operate every collection path through touch, keyboard, pointer, and assistive technology.
  - Storybook and black-box saturated evidence distinguish reusable presentation from Runtime Action domain orchestration, and the owner explicitly approves the proof before route-wide propagation.
- **Recommended workflow:** Full OpenSpec change because this adds observable Runtime Action search/browse behavior and responsive density decisions across several supporting collections. Use a mid-apply Storybook owner gate. Refine an ADR only if the work changes the durable component-ownership decision from `BL-074`; no ADR is needed merely for a 2014-specific preview cap.

### Add GitHub Actions for quality gates and release orchestration

ID:

- `p1-010`

Refinement outputs:

- **Purpose:** Provide a cloud-backed CI verification safety net specifically for release milestones, avoiding redundant compute waste on routine daily commits, while providing a local script to orchestrate release tagging and CI triggering.
- **Included behavior:**
  - Create a `.github/workflows/verify.yml` workflow file.
  - Trigger the CI workflow ONLY on specific release branch prefixes (e.g., `release/*`) or explicit git tags (e.g., `v*`).
  - The workflow executes `npm run check`, `npm run lint`, and `npm run test` in sequence.
  - Add an `npm run release` script to `package.json` that facilitates standard versioning, tagging, and branch creation to seamlessly trigger the CI pipeline.
- **Excluded behavior:**
  - Running CI on every push to `main` or arbitrary feature branches.
  - Automated CD deployment steps (we continue to use local `npm run deploy` to GitHub Pages when ready).
- **Ambiguities:**
  - What versioning/tagging scheme should `npm run release` follow? (e.g. semantic versioning, standard-version)
  - Does the release script push the tag automatically, or just create it locally for manual push?
- **Success:**
  - Pushing routine commits to `main` does not trigger CI.
  - Running `npm run release` creates a tagged release commit/branch.
  - Pushing that release tag/branch triggers the GitHub Action which correctly runs the quality gates in the cloud.

### Prove bounded fillable-PDF interoperability

ID:

- `BL-066`

Sequencing context:

- The three-system form audit is complete in `docs/fillable-pdf-interoperability-audit.md`. Start an export-first proof after `BL-070` stabilizes one target schema and the exact template-delivery rights are resolved. This is an early P1 improvement, not a first-playtest readiness gate.

Refinement outputs:

- **Purpose:** Make it easier to move between ez-chars and publisher-provided fillable sheets without allowing a lossy page layout to become canonical character storage.
- **Included behavior:**
  - Resolve whether each exact supported template may be bundled/fetched or must be selected by the user, then pin the adapter to a reviewed artifact signature.
  - Prove export first against one exact form, with a visible fidelity/omission statement, overflow behavior, common-viewer checks, and canonical JSON unchanged.
  - Follow with a reviewed, non-destructive scalar import proof only if the form supplies a reliable map; unknown or changed forms fail without altering local data.
  - Keep mappings system-specific and allocate deterministic test identities for imported records that do not carry stable IDs.
  - Treat the 2014 form as the simplest initial semantic map; defer 2024's opaque 411-field map until manually verified and Shadowdark until the expansion gate covers exact form interoperability.
- **Excluded behavior:**
  - Treating PDF as the full-fidelity persistence or backup model.
  - Arbitrary, homebrew, scanned, image-only, or unrecognized PDF layouts; OCR and inferred extraction.
  - Pretending annotations, references, source links, unlimited collections, or stable IDs can round-trip when the form cannot represent them.
- **Ambiguities:**
  - What permission basis covers template delivery and filled-derivative output for the first target?
  - Should first export overflow be rejected, summarized, clipped with warning, or written to a separately designed continuation page?
  - Does import create a new reviewed character only, or can a later workflow compare against an existing export manifest?
- **Success:**
  - A representative character exports to the exact supported form and remains usable in the project's declared PDF viewers, with every lossy field disclosed.
  - Export does not mutate or reduce the validated system document or JSON backup.
  - Any import presents mapped values for review and rejects an unsupported artifact non-destructively.
  - Automated fixtures detect field-map or template-signature drift.
- **Recommended workflow:** Full OpenSpec change because it introduces observable import/export behavior, external-format compatibility, and non-destructive failure requirements. Add or refine an ADR if template delivery, manifest identity, or PDF-library adoption creates a durable architecture/dependency decision.

### Deliver rights-classified reference navigation

ID:

- `BL-069`

Sequencing context:

- Prove the document-navigation contract after `BL-074` clarifies the implemented 2014 component boundaries, using the source evidence and conservative Shadowdark baseline established by archived `BL-068`. Reuse the proof for later systems without prebuilding a compendium.

Refinement outputs:

- **Purpose:** Help a user find the free or user-owned rules document or section relevant to the character information they are viewing or editing, especially on a phone, without implying that the app supplies paid or link-only content.
- **Included behavior:**
  - Register self-hosted or link-only resources through versioned metadata with system/rules identity, source/edition identity, topics, curated section labels, page/anchor/URL locators, attribution, availability/ownership guidance, and authoritative acquisition links.
  - Permit multiple source records and locator maps for one system/topic, while requiring only the free 2014 SRD source in the first proof.
  - Consume the official SRD 5.1 PDF, notices, and verified hash adopted by `BL-068`, then establish its official page-locator map.
  - Provide searchable resource and curated-section discovery with explicit empty, no-match, unavailable, and changed-source states.
  - Navigate to the lawful document location and preserve an in-progress sheet edit when the user follows and returns from a contextual locator.
  - Prove contextual links from at least character creation/class, equipment, and spells on the 2014 sheet.
  - Evaluate an in-app PDF dialog/panel versus a focused external/native viewer using phone, keyboard, focus, deep-link, and browser PDF-support evidence.
  - Cover locator integrity and representative mobile navigation with deterministic tests.
- **Excluded behavior:**
  - Normalized spell, item, class, or rules records; a public compendium API; arbitrary full-text ingestion; semantic search; OCR; or user document uploads.
  - Assuming every browser can search or deep-link a PDF identically without a tested fallback.
- **Ambiguities:**
  - Should the first self-hosted PDF open in an in-app panel/dialog, a dedicated app route, or the browser viewer?
  - Is curated title/topic/section search plus document-native search sufficient for the playtest, or does the licensed 2014 SRD need a bounded app-owned text index?
  - How should the UI communicate link-only, user-owned/not-included, offline-unavailable, alternate-source, and stale-locator states without burdening the free-first path?
- **Success:**
  - A mobile tester finds each configured 2014 topic within the PRD gate and lands at the intended lawful location without losing draft work.
  - Resource version/attribution is visible, broken or unavailable sources fail clearly, and locator tests detect source drift.
  - Stored metadata remains a document-navigation index rather than an accidental normalized compendium.
  - The data model can represent a future paid-book locator alongside a free source without storing protected source text or granting access to the book.
- **Recommended workflow:** Full OpenSpec change because it introduces new user behavior, persisted/configured source metadata, and unresolved viewer/search choices. Add an ADR for the durable resource-viewer/indexing boundary selected during design.

### Establish the multi-system boundary and 2024 D&D sheet

ID:

- `BL-070`

Sequencing context:

- Begin after the completed core/PDF audits, `BL-074` clarifies the 2014 component boundaries, and preferably after the 2014 reference proof identifies contextual-topic needs. It supplies the dispatch boundary required by Shadowdark.

Refinement outputs:

- **Purpose:** Add a genuinely distinct 2024 D&D character experience while shrinking shared persistence to evidenced lifecycle needs instead of making the current 2014 shape universal.
- **Included behavior:**
  - Define explicit 2014 and 2024 system identities, rules versions, schemas, factories, hydration/serialization, sheet destinations, and fixtures.
  - Introduce the smallest authoritative creation/dispatch boundary plus computed character-list, recovery, and contextual-reference summaries required by both systems.
  - Audit and, if approved, rebase the unstable 2014 v0 core boundary before external testing; reject unknown systems and unsupported versions non-destructively.
  - Deliver the minimal sparse-friendly 2024 sheet required by PRD v1: identity/origin, runtime state and defenses, actions or abilities, equipment, features/mastery, optional spellcasting, and flexible quick notes.
  - Keep system-specific projections, edit intents, layouts, required groups, and migrations feature-local; label any shared 5e-family helper as non-universal.
  - Audit the rough 5e design and validate the component boundaries produced by `BL-074` against the concrete 2024 sheet; reuse or adapt them where the interaction contract fits and document intentional system-specific presentation.
  - Perform a focused atom/molecule/organism and route-composition audit now that a second sheet is concrete, without requiring a repo-wide taxonomy rewrite or universal page template.
  - Preserve JSON backup/restore and list/search behavior across mixed-system records.
- **Excluded behavior:**
  - Simultaneous support for older 2024 SRD releases, a complete character builder, automatic rules validation, or full 2014 feature parity where the playtest matrix does not require it.
  - A universal rendering schema, dynamic field registry, generic edit-intent model, or registry facade beyond the concrete lifecycle/computed-view consumers.
  - Shadowdark implementation or treating two 5e variants as proof of universal TTRPG structure.
- **Ambiguities:**
  - What exact minimum envelope and dispatch signatures survive the core audit in implementation?
  - Does the final 2014 v0 receive a one-time rebase here, and what recovery/export warning accompanies the reset?
  - Which portions of the current generic Item/inventory envelope genuinely belong in shared core, and should equipment categories remain system-owned computed views rather than persisted shared structure or implicit tag/name conventions?
  - Which 2024-native fields are necessary for the representative PC and sparse-GM scenarios without recreating a full sheet?
  - Which visual and edit components repeat honestly across the two 5e systems?
  - Which rough-design runtime priorities and visual anchors survive mobile, accessibility, and saturation evidence?
- **Success:**
  - Mixed 2014/2024 characters create, list, open, persist, export, and restore through authoritative system dispatch.
  - The 2024 scenarios are usable on mobile and unmistakably use 2024 identity/rules semantics.
  - Shared consumers no longer require root ancestry, alignment, class, feature, inventory, or note fields from every system.
  - No 2024 design choice is represented as a universal TTRPG contract before Shadowdark evidence.
- **Recommended workflow:** Full OpenSpec change plus ADR refinement because this changes schema/persistence evolution, public system dispatch, and the architecture boundary. Reconcile the existing sheet-architecture and character-versioning ADRs rather than creating parallel doctrine unless a separate decision emerges.

### Deliver a minimal system-native Shadowdark sheet

ID:

- `BL-071`

Sequencing context:

- Depends on `BL-070` for the minimum dispatch/computed-view boundary and on `BL-068` to confirm the conservative locator contract; it does not depend on the owner seeking permission for broader source use.

Refinement outputs:

- **Purpose:** Prove that ez-chars can serve a compact non-5e system without inheriting D&D persistence or sheet assumptions.
- **Included behavior:**
  - Define an explicit Shadowdark system/rules identity, validated schema, factory, hydration/serialization, list summary, sheet destination, and contextual-reference topics.
  - Deliver the PRD's sparse-friendly core: identity, ability values, HP/armor class, attacks or capabilities, talents/spells where applicable, gear/currency, progression, and flexible quick notes.
  - Support both the representative crawler and intentionally sparse hireling/companion/NPC scenario.
  - Audit the rough Shadowdark design before finalizing runtime priorities, visual anchors, and responsive grouping.
  - Stay within user-authored data, authoritative acquisition links, and conservative bibliographic page/name locators confirmed by `BL-068`; exclude self-hosting, excerpts, full-text ingest, official-form interoperability, and restricted branding unless a later gate clears them.
  - Review the 2024-era shared lifecycle/computed-view seams and either validate, narrow, or revise them with tests.
- **Excluded behavior:**
  - A full Shadowdark character builder, automated random generation, rules legality, reproduced premium content, or source behavior outside the conservative baseline.
  - Forcing Shadowdark talents/spells, gear, identity, or annotations into 5e root collections for reuse.
- **Ambiguities:**
  - Which fields from the official form and quickstart are necessary for table use versus useful later detail?
  - Does the sparse regular sheet satisfy the GM job, or does evidence justify a focused lite presentation?
  - Which shared 5e-family components can be reused without carrying D&D labels or assumptions?
- **Success:**
  - Both Shadowdark scenarios create, persist, restore, and remain practical at phone width with deliberately omitted data.
  - The sheet exposes only conservative external locators, does not reproduce source expression, and does not claim unsupported licensing or official status.
  - Architectural fallout from the first non-5e system is reconciled into schemas, computed views, tests, and ADRs before hardening.
- **Recommended workflow:** Full OpenSpec change because it adds a new system, schema, persistence behavior, sheet, and rights-constrained reference experience. Refine existing architecture/rights ADRs when implementation evidence changes them; add a new ADR only for a distinct durable trade-off.

### Harden the three-system external-playtest matrix

ID:

- `BL-072`

Sequencing context:

- Execute after `BL-064`, `BL-069`, `BL-070`, and `BL-071` deliver their proofs. This item closes readiness gaps; it must not become an umbrella for missing product epics.

Refinement outputs:

- **Purpose:** Turn three independently implemented system proofs into one reliable external-playtest build and make the durable compatibility decision deliberately.
- **Included behavior:**
  - Build deterministic fixtures for all six PRD scenarios plus a saturated fixture or stress overlay for each system, and exercise creation/opening, runtime access, focused edits, quick notes, dense collections, annotations, contextual references, reload, JSON export, and isolated restore.
  - Rehearse at the representative mobile and desktop viewports; verify keyboard order, touch targets/exceptions, focus/modal context, scrolling, assistive semantics, and no document-level mobile overflow.
  - Resolve cross-system import/export, invalid-data recovery, mixed-system list/search, system labeling, and source-unavailable behavior.
  - Record performance and accessibility evidence for the supported browser matrix.
  - Immediately before external handoff, decide each system's durable schema identifier and whether the final 2014 v0 receives one bounded transition; update fixtures, warnings, migration tests, and recovery documentation.
  - Run owner solo-play rehearsals, record findings, and prepare an external feedback checklist plus short external survey mapped to the PRD gates.
  - Ask whether contextual references, empty states, focused editing, and transparent aids provided enough guidance or whether a bounded creation workflow should be promoted.
  - Record whether combat prominence obscures exploration, roleplay, or other system-native scene information and whether ordinary landmarks and system-native cues are sufficient before promoting `BL-073`.
  - After external sessions, synthesize survey and qualitative evidence with response count, limitations, decisions, and backlog destinations before a product-v1.0 decision.
- **Excluded behavior:**
  - Adding another system, a builder, a compendium, cloud storage, OCR, or broad automation to improve the milestone cosmetically.
  - Declaring product v1.0 solely because automated checks or owner rehearsals pass.
- **Ambiguities:**
  - Which performance budgets and supported browser versions are appropriate once all three real sheets exist?
  - Does any sparse-GM scenario justify a lite mode before external handoff, or should that remain a playtest question?
  - Does saturation evidence require a collection search, whole-sheet search, outline, sticky landmarks, tabs, or another navigation aid before handoff?
  - Which optional final-v0 migration, if any, is worth supporting for the owner/test fixtures?
- **Success:**
  - All PRD readiness gates, six owner-run scenarios, and three saturation fixtures pass with no critical blocker.
  - Each external-playtest schema/version promise and recovery path is explicit and tested.
  - Remaining findings have owners and backlog destinations, and external sessions can begin without relying on undocumented setup.
- **Recommended workflow:** Full OpenSpec change because it crosses systems, persistence compatibility, accessibility, and release-readiness behavior. Add an ADR only if the compatibility or supported-platform decisions materially change existing approved doctrine.

### Investigate scene-aware runtime guidance and navigation

ID:

- `BL-073`

Sequencing context:

- Treat this as a trigger-deferred Horizon B design investigation. The BL-064 saturated 2014 rehearsal has now supplied direct navigation-pressure evidence: the owner found an outline or jump-navigation surface increasingly valuable as containers accumulated. Keep cross-system scene vocabulary and any focus/hiding mode deferred until at least one non-2014 sheet exists; a bounded 2014 outline proof may be promoted earlier if `BL-076` still leaves ordinary landmarks too slow for core runtime use.

Refinement outputs:

- **Purpose:** Determine whether scene-aware guidance, navigation, or focus can keep the most relevant character information close at hand without making overlapping information disappear or turning a character sheet into a collection of surprising modes.
- **Included behavior:**
  - Preserve combat as a legitimately prominent, rules-dense runtime surface while evaluating faster access to exploration, roleplay, travel, downtime, or other system-native scene concerns.
  - Use saturated-sheet, owner-rehearsal, and cross-system evidence to compare a persistent outline, grouped landmarks, jump navigation, small scene-relevant summaries or cues, temporary emphasis, explicit filters, and an optional focused view.
  - Evaluate which system-native identity and orientation details deserve a compact persistent header, which belong in runtime or organizational regions, and whether a computed summary is preferable to relocating canonical fields merely to reclaim sheet space.
  - Evaluate runtime-action-like convenience for non-combat concerns through system-native projections or guidance; do not assume exploration, roleplay, travel, or downtime should use action-economy records.
  - Prefer non-destructive navigation and emphasis before evaluating hiding. If hiding remains a candidate, require an obvious active-state indicator, a one-step reset, continued access to all content, and no silent mutation of character data.
  - Keep scene categories system-native; do not require every game to use 5e's combat/exploration/roleplay framing.
  - Evaluate phone and desktop behavior, keyboard order, focus movement, assistive semantics, and the interaction with whole-sheet search or dense collection discovery.
- **Excluded behavior:**
  - Automatically inferring the current scene, synchronizing a mode from a GM tool, or changing modes without an explicit user action.
  - Generalizing the existing runtime-action data model into a universal container for every scene or pillar.
  - Making combat and non-combat sections consume equal space by policy, hiding information by default, or requiring a selected pillar before the sheet is usable.
  - Moving name, progression, ancestry or origin, background, alignment, and appearance wholesale into Runtime without first distinguishing persistent orientation from scene-relevant information.
  - Defining a universal scene taxonomy, universal sheet renderer, or persisted scene state before concrete systems demonstrate a shared need.
- **Ambiguities:**
  - Do landmarks and an outline solve the retrieval problem without a scene mode?
  - On the saturated 2014 sheet, is a persistent outline, compact jump menu, sticky section navigation, or another non-destructive landmark treatment the smallest useful response?
  - Is the observed problem navigation, missing scene-relevant synthesis, or both?
  - Which categories belong to each supported system, and which information legitimately appears in more than one category?
  - Which identity details must remain visible while regions are collapsed, and which can remain one interaction away without weakening character orientation?
  - If a focused view is useful, should its selection be ephemeral, remembered per character, or remembered only for the current session?
  - How should search results, quick notes, and urgent state remain visible when a focus is active?
- **Success:**
  - Evidence distinguishes navigation, missing scene-relevant guidance, content organization, and density problems.
  - The recommended design preserves combat prominence where useful while improving access to non-combat information.
  - Any proposed focus or hiding behavior is explicit, reversible, accessible, and demonstrably better than a simpler outline or landmark treatment.
  - The result either closes the investigation with no scene mode or yields one bounded behavioral proposal grounded in at least two system sheets.
- **Recommended workflow:** Begin with OpenSpec Explore after the evidence trigger, then use a full OpenSpec change if observable navigation or focus behavior is proposed. An ADR is warranted only if the result establishes a durable cross-system scene/navigation contract; a 2014-only outline proof does not trigger one by itself.

## Ideation Sandbox (Raw / Rough Ideas)

This content is a work in progress to dump rough thoughts, brainstorms, and refactor wishes before prioritizing or organizing them.

### Roughly Prioritized and Vaguely Refined

- **[Priority 3] evaluate a Svelte-compatible form library such as TanStack Form or Felte after the first field-binding proof surface lands; prefer reuse for draft state, validation display, dirty tracking, and array editor ergonomics if it keeps local source smaller than custom form infrastructure**
  - _Best Guess_: Evaluate if an external library handles card-wide value validation, dirty checking, and array/nested list mutations more concisely and safely than our custom `FieldDraft` implementation.
  - _Critical Question_: Will introducing a third-party form helper conflict with our "platform-native first" preference or cause unnecessary bundle size increases, given we only have local-first state storage?

### Raw Human Ideation, Unsorted

- Explore desktop collection scroll ownership and Misc. Notes as a possible next dense consumer.
  - _Why_: Bounded inline lists control sheet height, but mouse-wheel input over a still-scrollable collection can interrupt top-to-bottom sheet scanning. The saturated fixture also demonstrates that Misc. Notes & Scratchpad can grow beyond the short/simple case even though `BL-064` intentionally limited its first rollout to equipment and spells.
  - _Current direction_: Keep normal scroll chaining at collection boundaries as the narrow `BL-064` mitigation. Do not adopt collapse-by-default yet: hiding collection contents may trade scroll friction for weaker at-a-glance runtime access. Leave Misc. Notes on its existing bulk path until a focused proof confirms that searchable identity-owned rows improve it.
  - _Explore_: Compare bounded inline scrolling, an explicit expand state, focused browsing on every viewport, compact/collapsed previews, and wheel delegation where technically reliable. For notes, evaluate title/body search, stable row Edit/Notes actions, note-kind context, empty behavior, ordering, and whether the complete collection should use the proven dense-list boundary.
  - _Constraints_: Preserve full item reachability, authored order, stable IDs, annotations, keyboard/touch access, source navigation, and sheet landmarks. Avoid scroll-jacking scripts and do not force every non-target collection into the dense pattern.
  - _Refinement trigger_: Use `BL-074`'s component proof to identify the honest ownership seam, then promote a separate observable-behavior proposal before first external playtest if owner rehearsal still finds desktop scanning disruptive or scratchpad saturation likely.

- Explore unifying focused detail viewing and annotation editing behind View and Edit paths.
  - _Why_: Once an identity-owned collection row has a focused surface, separate Edit and Notes commands may fragment one record's authored content. A read-oriented View could present complete raw detail plus annotation context, while Edit could modify the record and create, change, or remove its annotations in one coherent draft.
  - _Current direction_: Keep Bulk Edit and bulk annotation workflows separate. Do not change the accepted `BL-064` Edit/Notes baseline before the broader field and form ownership review establishes whether unification is genuinely clearer.
  - _Explore_: Whether the pattern applies only to collection items or also to individually editable fields; the minimum read-only detail surface; annotation creation/removal inside an item draft; validation and cancel semantics; destructive confirmation; focus return; and whether simple fields should bypass View entirely.
  - _Constraints_: Preserve stable record identity, typed patch and validated mutation ownership, annotation provenance/references, keyboard and touch access, and independent bulk workflows. Do not force every primitive field into an item-shaped dialog or turn `BL-074`'s component refactor into an unapproved visible redesign.
  - _Refinement trigger_: `BL-074` must explicitly evaluate this idea against concrete 2014 collection and field consumers, then refine it into a separately sequenced behavioral backlog item or close it with recorded rationale.
- Explore responsive collection-row quick actions and optional gestures after the submenu baseline has real use evidence.
  - _Why_: A consistent submenu scales safely across dense rows, but frequently used commands such as focused Edit may eventually merit one-step access on larger screens or optional mobile acceleration.
  - _Current direction_: Keep the complete, discoverable submenu as the canonical path. Consider selectively surfaced desktop actions, mobile compression, or optional gestures only as progressive enhancements after `BL-064` and playtest evidence identify genuinely frequent commands.
  - _Constraints_: Every gesture has an equivalent visible/menu command; destructive actions require confirmation or a recoverable undo path; responsive shortcuts must not create an excessive tab order or make the same command appear ambiguously in multiple places.
  - _Refinement trigger_: Revisit in Horizon B after the dense-collection baseline has been used on touch, pointer, and keyboard workflows.
- Explore source-backed runtime actions as source content plus explicit player overrides rather than fully materialized snapshots.
  - _Why_: Under the current snapshot contract, ordinary edits change the same `name` and `notes` fields that explicit resync later replaces, so resync can erase intentional player detail even though the action remains linked.
  - _Playtest decision (2026-07-25)_: Retain snapshot-and-explicit-resync semantics for the multi-source expansion, with a required overwrite warning before resync. An override-aware persisted model remains a future refactor.
  - _Explore_: Separate source-derived base values from player overrides; per-field modes such as inherit, replace, or append; a resync review that lets the user choose which base or effective fields may be replaced; and a deliberately shallow link that computes effective display content without weakening offline ownership.
  - _Constraints_: Never discard player-authored content silently, preserve deterministic data evolution and source-deletion fallback, keep current 5e behavior usable offline, and avoid a generic cross-system override framework until concrete spell/feature cases justify one.
  - _Open questions_: Which fields are source-owned, how normal editing creates or clears an override, whether annotations are always action-owned, how source deletion materializes the effective action, and whether the persisted model stores base values, override operations, or both.
  - _Refinement trigger_: Revisit after inventory, spell, and feature snapshots have broader playtest evidence, or before a schema change that needs per-field source provenance.
- Explore retrospectively linking an existing custom runtime action to an on-sheet source.
  - _Why_: Quick custom entry is useful when the player knows the action before organizing its source record, but requiring deletion and recreation later would discard action identity and authored detail.
  - _Current direction_: Attaching a source should preserve the existing action snapshot by default. Explicit resync remains the operation that replaces source-owned fields, with its normal overwrite warning.
  - _Explore_: A source-selection command on custom actions; whether linking should offer an optional reviewed "Use source text now" choice; how field differences are previewed; and whether changing an existing link belongs in the same interaction.
  - _Constraints_: Preserve action identity and authored fields, validate the source at commit time, never link directly to external-provider records, and do not blur linking with silent resync.
  - _Refinement trigger_: Revisit after the completed multi-source picker and source-specific resync behavior have playtest evidence.
- Reconcile canonical feature storage and explicit feature provenance before external compendium integration.
  - _Why_: General features have richer top-level records while ancestry, background, class, and subclass features currently live as nested lightweight references. The completed source expansion projects the selected collections coherently, but long-term provider enrichment and provenance-aware editing need a deliberate canonical model.
  - _Current direction_: Keep Traits visually separate, present general/manual plus class/subclass entries through Features, preserve current storage locations, and derive available source context from those locations.
  - _Explore_: Canonical feature content versus feature grants/references; explicit manual, ancestry, background, class, subclass, and external-provider provenance; duplicate grants; source deletion; and migration from existing top-level and nested records.
  - _Constraints_: Preserve stable identities and annotations, avoid duplicating editable content across canonical records and grants, retain offline ownership, and do not add provider-specific fields to generic core records prematurely.
  - _Refinement trigger_: Refine before background features become action sources or before an external compendium begins adding or enriching character-owned features.

## Done Recently

- `2026-08-02` completed `BL-064`: added searchable, responsive dense collection workflows for Weapons, Armor & Shields, Other Gear, and Spells; introduced focused row editing and notes, mobile previews and full-height browsing, sparse spell-slot setup, and a saturated 2014 fixture; recorded Runtime/supporting collection and whole-sheet navigation follow-ups
- `2026-08-01` completed `BL-068`: adopted and self-hosted official SRD 5.1 and SRD 5.2.1 with centralized public notices, base-path-safe navigation, and a protected local-only review boundary; fixed the sparse Shadowdark citation baseline, expansion gates, and audited human/agent source-review workflow for downstream resource and sheet work
- `2026-08-01` completed `BL-067`: approved PRD v1 and the first-external-playtest roadmap for 2014 D&D, one adopted current 2024 D&D SRD release, and Shadowdark; established rights-classified reference, multi-system/core, PDF-interoperability, compatibility, survey-evidence, and scene-aware-navigation boundaries as separately refinable work
- `2026-07-31` completed `p1-020`: established explicit 44-by-44 CSS-pixel coarse-pointer targets and bounded exceptions across the home-to-sheet flow, corrected keyboard-accessible character opening and responsive control order, and added durable Mobile Chrome geometry, label-activation, modal-context, and cross-browser evidence
- `2026-07-30` completed `p1-027`: replaced JavaScript ResizeObserver grid measurement with native CSS Container Queries, maintaining layout fidelity while eliminating overhead
