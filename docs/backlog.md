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

- [`BL-067` — Define the first external-playtest PRD and roadmap](#define-the-first-external-playtest-prd-and-roadmap)
- [`BL-068` — Confirm source rights and the Shadowdark baseline](#confirm-source-rights-and-the-shadowdark-baseline)
- [`BL-064` — Scale dense collection rendering and discovery](#scale-dense-collection-rendering-and-discovery)
- [`BL-069` — Deliver rights-classified reference navigation](#deliver-rights-classified-reference-navigation)
- [`BL-070` — Establish the multi-system boundary and 2024 D&D sheet](#establish-the-multi-system-boundary-and-2024-dd-sheet)
- [`BL-071` — Deliver a minimal system-native Shadowdark sheet](#deliver-a-minimal-system-native-shadowdark-sheet)
- [`BL-072` — Harden the three-system external-playtest matrix](#harden-the-three-system-external-playtest-matrix)

### P1 — Priority Improvements

- [`BL-066` — Prove bounded fillable-PDF interoperability](#prove-bounded-fillable-pdf-interoperability)
- [`p1-010` — Add GitHub Actions for quality gates](#add-github-actions-for-quality-gates) _(trigger-deferred and omitted from the recommended sequence until CI needs justify it)_

### P2 — Future Feature Work

No active P2 items.

## Next Recommended Sequence

_Goal: First External Playtest_

The queues above record strategic priority membership; this list records the dependency-aware action order and may omit blocked or trigger-deferred items.

1. `BL-067`: Finish the pre-playtest survey synthesis and final owner review before archival
2. `BL-068`: Confirm source classifications, official SRD artifacts, and the conservative Shadowdark baseline
3. `BL-064`: Establish the dense-collection, focused-row, annotation, and saturated-sheet navigation baseline evidenced by the 2014 sheet
4. `BL-069`: Prove multi-source resource discovery and contextual navigation against the 2014 sheet
5. `BL-070`: Establish the smallest multi-system lifecycle/computed-view boundary and add the minimal 2024 D&D sheet
6. `BL-071`: Add the minimal Shadowdark sheet within the conservative baseline after `BL-070` supplies the dispatch boundary
7. `BL-072`: Rehearse and harden the full three-system representative, sparse-GM, and saturated-sheet matrix

`BL-066` is an early P1, export-first interoperability proof after `BL-070` stabilizes a target schema and template-delivery rights. It is deliberately not a first-playtest readiness prerequisite.

## Refined Backlog Catalog

Each active refined item has one stable detailed definition in this catalog. Queue entries and the recommended sequence point here; reprioritization must not relocate or duplicate these definitions. When an item is completed and archived, remove its queue link and catalog definition, then retain only the bounded summary required by [Done Recently](#done-recently).

### Define the first external-playtest PRD and roadmap

ID:

- `BL-067`

Sequencing context:

- The OpenSpec change is active and most planning artifacts are drafted. Keep this item active until the owner reviews the remaining evidence and explicitly requests archival.

Refinement outputs:

- **Purpose:** Bound the product milestone between the implemented 2014 baseline and the broader author vision, then decompose it into independently executable epics.
- **Included behavior:**
  - Maintain PRD v1, author desires, active goals, architecture/resource policy, and the first-playtest backlog as coherent but separately authoritative artifacts.
  - Define 2014 D&D, one adopted current 2024 SRD release, and Shadowdark representative-player, sparse-GM, and saturated-sheet readiness evidence.
  - Preserve the core/PDF/source audits inside durable OpenSpec or ADR context instead of floating analysis documents.
  - Process anonymized pre-playtest survey exports and reconcile their bounded findings against vision, readiness priorities, and implementation epics.
- **Excluded behavior:**
  - Implementing the sheet, resource, PDF, or multi-system epics in this planning change.
  - Treating small survey samples as statistically representative or embedding a survey system in the product.
- **Ambiguities:**
  - What do the owner's anonymized pre-playtest surveys add to or challenge in the drafted priorities?
  - Does final review approve PRD v1 as written, or require another owner-directed refinement before archive?
- **Success:**
  - The owner can distinguish current behavior, the external-playtest contract, long-term intent, and dependency-ordered implementation work.
  - Survey findings and limitations are traceable to any resulting priority change.
  - The active OpenSpec change validates strictly and is archived only after explicit owner approval.
- **Recommended workflow:** Continue the existing full OpenSpec change. Its remaining work is planning/evidence reconciliation, not application implementation; no additional ADR is triggered unless the evidence changes a durable decision.

### Scale dense collection rendering and discovery

ID:

- `BL-064`

Sequencing context:

- Explore soon after the source-expansion slice because large weapon, gear, spell, and feature collections already make sheet cards unwieldy, and additional source types will increase that pressure.

Refinement outputs:

- **Purpose:** Establish a practical first-playtest baseline for finding, reviewing, editing, annotating, and navigating a saturated 2014 character without allowing one collection or repeated control pattern to dominate the sheet.
- **Included behavior:**
  - Audit the whole 2014 sheet with representative large weapon, gear, spell, feature, runtime-action, modifier, annotation, and notes data before choosing one focused proof surface.
  - Evaluate responsive bounded presentation, local scrolling, search, lightweight filtering, result counts, and explicit empty/no-match states.
  - Preserve complete keyboard, touch, and screen-reader access to every item; bounded presentation must not make content undiscoverable.
  - Search primary labels plus useful authored details where that behavior is predictable for the selected collection.
  - Use realistic cluttered Storybook fixtures and main-flow browser coverage to test large collections on desktop and phone-sized viewports.
  - Reuse the inventory picker’s filtering concepts only where a second concrete collection demonstrates the same contract; do not force collection rendering through the source-picker API.
  - On the selected proof surface, evaluate one explicit focused-row edit and annotation path that remains discoverable without placing permanent controls on every dense row.
  - Correct a bulk-only editing path when the proof shows that editing one item is needlessly cumbersome; retain bulk editing as an explicit collection-level option rather than the only row path.
  - Evaluate whether existing visual anchors remain sufficient under saturation or whether local collection search, whole-sheet search, an outline, sticky summaries, tabs, or focused expansion deserves a bounded follow-up.
  - Record a heuristic baseline for persistent versus revealed row actions, annotation-presence indicators, and equivalent mouse, keyboard, and touch entry points; leave feedback-driven standardization to Horizon B.
  - Build on the completed `p1-020` touch-target and keyboard baseline when evaluating nested scrolling and row controls.
  - Recheck the previously observed macOS Firefox scroll jank with the repeatable saturated fixture and profiling workflow; open browser-specific optimization only if the evidence implicates application code.
- **Excluded behavior:**
  - Reworking every collection-row edit/annotation affordance in one slice or requiring all consumers to adopt the proof unchanged; broader standardization remains evidence-driven.
  - Making hover, right-click, or long-press the only path to row actions.
  - Remote search, fuzzy ranking, indexing, virtualization, or a universal list framework without measured need.
  - Applying one arbitrary fixed height to every collection regardless of density or viewport.
- **Ambiguities:**
  - Which collection should prove the pattern first: weapons/gear, spell lists, or another demonstrably dense surface?
  - On phone-sized screens, should large collections use contained scrolling, progressive disclosure, or an expanded focused view to avoid awkward nested scrolling?
  - Which filters beyond text search are genuinely useful for each concrete collection?
  - Should the proof use one compact row menu, a focused dialog, an expanded row, or another explicit affordance, and when should an annotation indicator remain persistent?
  - Do navigation failures call for collection-local discovery, a whole-sheet search/outline, changed grouping, sticky landmarks, or a combination—and which remedy is justified before external handoff?
- **Success:**
  - A saturated 2014 character remains easy to scan and navigate without excessive page growth or ambiguous duplicate homes for authored information.
  - Every item remains reachable by keyboard, touch, and assistive technology.
  - Search and filtering behavior is deterministic, responsive, and scoped to proven collection needs.
  - The proof collection offers an understandable focused edit and annotation path without overwhelming scanning or keyboard order.
  - macOS Firefox either behaves acceptably under the repeatable saturated fixture or produces actionable profiling evidence and a bounded follow-up.
  - Horizon A heuristics and unresolved playtest questions are documented for feedback-driven refinement rather than hidden in component APIs.
  - Any reusable boundary is extracted from at least two compatible consumers rather than anticipated similarity.

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

### Confirm source rights and the Shadowdark baseline

ID:

- `BL-068`

Sequencing context:

- Execute before resource implementation. Shadowdark sheet planning may assume the conservative user-authored/external-locator baseline, but no broader source or form behavior may be inferred.

Refinement outputs:

- **Purpose:** Turn the resource policy into source-specific evidence, confirm the conservative Shadowdark public baseline, and identify the exact behaviors that still require permission or qualified review.
- **Included behavior:**
  - Verify the publisher's page/name-reference statement and document the conservative Shadowdark baseline: user-authored sheet data, official acquisition links, and bibliographic locators without bundled or reproduced source content.
  - Record which expansions still require written permission or qualified review, including bundling, excerpting, full-text processing, official-form interoperability, and restricted brand/assets.
  - Define the privacy- and terms-bounded local workflow for using an owner-supplied source to draft locator candidates while committing only human-reviewed bibliographic metadata.
  - Verify and adopt the official D&D SRD 5.1 artifact and the current SRD 5.2.x planning artifact, hashes, attribution text, modification status, self-hosting basis, and release-time recheck rule.
  - Record the owner's decision that `BL-069` replaces the bookmarked SRD 5.1 derivative with the official PDF and official page map.
  - Decide whether Cairn v1 adds essential fourth-system evidence only if a concrete gap remains; do not silently expand or substitute the matrix.
- **Excluded behavior:**
  - Implementing a resource viewer, Shadowdark sheet, compendium, PDF adapter, or fourth system.
  - Treating project documentation as legal advice.
- **Ambiguities:**
  - How much independently authored topic/section metadata remains conservative enough for the first Shadowdark locator map without copying expressive structure?
  - Which locally controlled tooling may inspect an owner-supplied source without uploading it to a third party, and how is the reviewed output audited?
  - Which exact SRD 5.2.x release and attribution requirements are current at public handoff?
- **Success:**
  - Every first-playtest source has an authoritative version, hash where applicable, rights evidence, approved exposure modes, attribution instruction, and unresolved constraints.
  - A future Shadowdark proposal can cite a documented conservative baseline and explicit expansion gates; neither free price nor a general third-party license is used as permission for broader behavior.
  - Any fourth-system decision is deliberate, justified, and separately backlogged.
- **Recommended workflow:** Full OpenSpec change because the outcome controls public source behavior, provenance, and the boundary between locator metadata and source processing. Refine the existing rights-classification ADR rather than create parallel doctrine.

### Deliver rights-classified reference navigation

ID:

- `BL-069`

Sequencing context:

- Prove the document-navigation contract against the implemented 2014 sheet after `BL-068` verifies its adopted source. Reuse the proof for later systems without prebuilding a compendium.

Refinement outputs:

- **Purpose:** Help a user find the free or user-owned rules document or section relevant to the character information they are viewing or editing, especially on a phone, without implying that the app supplies paid or link-only content.
- **Included behavior:**
  - Register self-hosted or link-only resources through versioned metadata with system/rules identity, source/edition identity, topics, curated section labels, page/anchor/URL locators, attribution, availability/ownership guidance, and authoritative acquisition links.
  - Permit multiple source records and locator maps for one system/topic, while requiring only the free 2014 SRD source in the first proof.
  - Replace the repository's bookmarked SRD 5.1 derivative with the official PDF, notices, verified hash, and official page-locator basis.
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

- Begin after the completed core/PDF audits and preferably after the 2014 reference proof identifies contextual-topic needs. It supplies the dispatch boundary required by Shadowdark.

Refinement outputs:

- **Purpose:** Add a genuinely distinct 2024 D&D character experience while shrinking shared persistence to evidenced lifecycle needs instead of making the current 2014 shape universal.
- **Included behavior:**
  - Define explicit 2014 and 2024 system identities, rules versions, schemas, factories, hydration/serialization, sheet destinations, and fixtures.
  - Introduce the smallest authoritative creation/dispatch boundary plus computed character-list, recovery, and contextual-reference summaries required by both systems.
  - Audit and, if approved, rebase the unstable 2014 v0 core boundary before external testing; reject unknown systems and unsupported versions non-destructively.
  - Deliver the minimal sparse-friendly 2024 sheet required by PRD v1: identity/origin, runtime state and defenses, actions or abilities, equipment, features/mastery, optional spellcasting, and flexible quick notes.
  - Keep system-specific projections, edit intents, layouts, required groups, and migrations feature-local; label any shared 5e-family helper as non-universal.
  - Audit the rough 5e design and the existing grid/card, field-binding, annotation, focused-edit, dialog, and navigation primitives; reuse or adapt them where the interaction contract fits and document intentional system-specific presentation.
  - Perform a focused atom/molecule/organism and route-composition audit now that a second sheet is concrete, without requiring a repo-wide taxonomy rewrite or universal page template.
  - Preserve JSON backup/restore and list/search behavior across mixed-system records.
- **Excluded behavior:**
  - Simultaneous support for older 2024 SRD releases, a complete character builder, automatic rules validation, or full 2014 feature parity where the playtest matrix does not require it.
  - A universal rendering schema, dynamic field registry, generic edit-intent model, or registry facade beyond the concrete lifecycle/computed-view consumers.
  - Shadowdark implementation or treating two 5e variants as proof of universal TTRPG structure.
- **Ambiguities:**
  - What exact minimum envelope and dispatch signatures survive the core audit in implementation?
  - Does the final 2014 v0 receive a one-time rebase here, and what recovery/export warning accompanies the reset?
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

## Ideation Sandbox (Raw / Rough Ideas)

This content is a work in progress to dump rough thoughts, brainstorms, and refactor wishes before prioritizing or organizing them.

### Roughly Prioritized and Vaguely Refined

- **[Priority 3] evaluate a Svelte-compatible form library such as TanStack Form or Felte after the first field-binding proof surface lands; prefer reuse for draft state, validation display, dirty tracking, and array editor ergonomics if it keeps local source smaller than custom form infrastructure**
  - _Best Guess_: Evaluate if an external library handles card-wide value validation, dirty checking, and array/nested list mutations more concisely and safely than our custom `FieldDraft` implementation.
  - _Critical Question_: Will introducing a third-party form helper conflict with our "platform-native first" preference or cause unnecessary bundle size increases, given we only have local-first state storage?

### Raw Human Ideation, Unsorted

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

- `2026-07-31` completed `p1-020`: established explicit 44-by-44 CSS-pixel coarse-pointer targets and bounded exceptions across the home-to-sheet flow, corrected keyboard-accessible character opening and responsive control order, and added durable Mobile Chrome geometry, label-activation, modal-context, and cross-browser evidence
- `2026-07-30` completed `p1-027`: replaced JavaScript ResizeObserver grid measurement with native CSS Container Queries, maintaining layout fidelity while eliminating overhead
- `2026-07-26` completed `BL-063`: moved character import review and confirmation into a focused dialog flow, removing inline home-page clutter while preserving Merge New and Replace All semantics
- `2026-07-26` completed `p1-061`: rebased 5e characters to the strict pre-playtest `dnd5e-2014.schema.v0` layout and expanded the guided runtime-action workflow across inventory, spells, Features, Traits, and custom entry with stable source identity, source-pronounced runtime rows, navigation, confirmed source-owned resync, deletion fallback, and mixed-source automated coverage
