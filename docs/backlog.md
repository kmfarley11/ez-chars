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

- [`BL-077` — Unify focused detail, editing, and annotations](#unify-focused-detail-editing-and-annotations)
- [`BL-078` — Add quickfilters to collection views](#add-quickfilters-to-collection-views)
- [`BL-082` — Refine mobile rules-reader navigation](#refine-mobile-rules-reader-navigation)
- [`BL-070` — Establish the multi-system boundary and 2024 D&D sheet](#establish-the-multi-system-boundary-and-2024-dd-sheet)
- [`BL-071` — Deliver a minimal system-native Shadowdark sheet](#deliver-a-minimal-system-native-shadowdark-sheet)
- [`BL-072` — Harden the three-system external-playtest matrix](#harden-the-three-system-external-playtest-matrix)
- [`BL-081` — Prepare playtest feedback collection](#prepare-playtest-feedback-collection) _(final prerequisite before external invitations)_

### P1 — Priority Improvements

- [`BL-066` — Prove bounded fillable-PDF interoperability](#prove-bounded-fillable-pdf-interoperability)
- [`BL-083` — Investigate scene-aware runtime guidance and focus](#investigate-scene-aware-runtime-guidance-and-focus) _(trigger-deferred and omitted from the recommended sequence until multi-system navigation evidence exists)_
- [`p1-010` — Add GitHub Actions for quality gates](#add-github-actions-for-quality-gates) _(trigger-deferred and omitted from the recommended sequence until CI needs justify it)_

### P2 — Future Feature Work

- [`BL-080` — Connect user-owned rules PDFs locally](#connect-user-owned-rules-pdfs-locally)
- [`BL-079` — Consolidate inline SVGs into a unified Icon atom](#consolidate-inline-svgs-into-a-unified-icon-atom)

## Next Recommended Sequence

_Goal: First External Playtest_

The queues above record strategic priority membership; this list records the dependency-aware action order and may omit blocked or trigger-deferred items.

1. `BL-077`: Unify focused detail, editing, and annotations into a read-first interaction language across runtime scalars, rich entities, and collections before collection quickfilters or later sheets multiply the interaction surface
2. `BL-078`: Prove collection-scale quickfilters on Runtime Actions and Spells before later sheets multiply comparable dense-list review
3. `BL-082`: Refine the shared mobile rules-reader controls and resolve the physical-iPhone PDF/viewer blockers before later systems adopt that presentation
4. `BL-070`: Establish the smallest multi-system lifecycle/computed-view boundary, add the minimal 2024 D&D sheet, and supply its system-owned navigation and collection behavior
5. `BL-071`: Add the minimal Shadowdark sheet and its system-owned navigation and collection behavior within the conservative baseline after `BL-070` supplies the dispatch boundary
6. `BL-072`: Rehearse and harden the full three-system representative, sparse-GM, and saturated-sheet matrix after required interaction work is present
7. `BL-081`: Finalize the survey questions and verify the voluntary in-app feedback path immediately before inviting external playtesters

The completed `BL-064` proof established the inventory and spell baseline, `BL-074` established the focused list, field, form, dialog, layout, panel, and domain-orchestration seams, `BL-076` added proportionate density behavior for Runtime Actions and supporting collections without flattening their distinct interaction grammars, `BL-075` added a reusable player-facing pinning grammar while keeping identity, persistence, and system nuance domain-owned, `BL-073` established sheet-scale navigation, and `BL-084` resolved core mobile viability across the home character list, popover disclosure lifecycle, and mobile input typography. Accepted collection previews now reflect deliberate user priority before owner rehearsal and external handoff. Physical-phone rehearsal during `BL-073` demonstrated that separate inline-morphing controls and card bulk-edit dialogs remain fundamentally clunky on mobile (`BL-077`). Addressing `BL-077` establishes a 3-tier read-first interaction language before collection quickfilters (`BL-078`), rules-reader refinement (`BL-082`), and multi-system expansion (`BL-070`, `BL-071`) multiply the human-review surface. Later system changes must audit, adopt, adapt, or decline those patterns using system-native landmarks and categories rather than inheriting 2014 semantics. This ordering does not make arbitrary UI polish a prerequisite; it advances known physical-phone blockers and the remaining known P0 retrieval problems with existing representative proofs. `BL-066` remains an early P1, export-first interoperability proof after `BL-070` stabilizes a target schema and template-delivery rights, not a first-playtest prerequisite. `BL-072` rehearses the resulting interaction and system matrix and gathers any evidence that could trigger the separate, P1 `BL-083` scene-aware investigation. `BL-081` remains the final readiness gate before external invitations.

## Refined Backlog Catalog

Each active refined item has one stable detailed definition in this catalog. Queue entries and the recommended sequence point here; reprioritization must not relocate or duplicate these definitions. When an item is completed and archived, remove its queue link and catalog definition, then retain only the bounded summary required by [Done Recently](#done-recently).

### Unify focused detail, editing, and annotations

ID:

- `BL-077`

Sequencing context:

- Promoted to #1 P0 following the completion of `BL-084`. Rehearsal and physical-iPhone playtesting during `BL-073` supplied the evidence trigger: the existing inline-morphing controls and card bulk-edit dialogs are materially clunky and obstructive on mobile. Addressing this before introducing collection quickfilters (`BL-078`) or additional game systems (`BL-070`, `BL-071`) prevents multiplying a compromised interaction language. Completed `BL-084` repaired the home list, menu disclosure lifecycle, and WebKit input typography, while this item owns the deeper View/Edit/Annotations interaction model and atomic-save workflow.

Refinement outputs:

- **Purpose:** Replace the fragmented inline-edit and bulk-dialog interactions with a cohesive, read-first interaction language across fields and collections, allowing users to review authored detail, provenance, and annotations together and edit them intentionally without mobile UX friction.
- **Included behavior:**
  - Evaluate the leading **3-tier read-first interaction hypothesis** against global or section-local editing models before broad propagation:
    1. **Tier 1 (Runtime scalars):** In-place compact controls (e.g. current HP, spell slot toggles, death saves) remain a firm constraint for rapid tapping during play without modal overhead.
    2. **Tier 2 (Rich entities / annotated fields):** Read-first presentation on the sheet; tapping opens a focused detail drawer/modal presenting complete description, calculations, provenance, and annotations, with an explicit Edit action to modify authored detail and annotations atomically.
    3. **Tier 3 (Collections):** Dense on-sheet browsing optimized for scanning and reference, with dedicated manage/add workflows and focused item detail sheets.
  - Define one focused Edit path for an individual field or record that can modify its authored value/detail and create, change, or remove its annotations while preserving provenance, references, stable identity, validation, and focus return.
  - Allow individually editable fields and collection records to share View/Edit semantics without sharing one universal item-shaped projection or dialog body. Domain adapters supply the appropriate draft and translate an accepted save into validated patches or typed intents.
  - Treat one singular Edit submission as one intentional save: authored and annotation changes either validate and commit together or leave the target unchanged. Preserve existing local-first persistence and unrelated character data.
  - Require a 4-fixture proof-before-propagation gate in Storybook comparing the leading 3-tier read-first model against global and section-local edit alternatives across: (1) runtime scalar, (2) annotated field, (3) dense collection row, and (4) bulk-management workflow. Stop at an owner review checkpoint before broad sheet propagation.
  - Verify touch, keyboard, pointer, modal dismissal, cancel-without-save, validation failure, annotation add/edit/remove, stable identity, and focus restoration for representative consumers.
- **Excluded behavior:**
  - Forcing every runtime scalar into a detail dialog or removing efficient in-place combat counters.
  - Creating a universal cross-system field/record schema, generic domain reducer, or monolithic form engine.
  - Changing annotation storage shapes, record identities, source/resync semantics, or character schemas solely to support the interaction redesign.
  - Disabling pinch zoom, setting restrictive viewport meta, or relying on browser sniffing.
- **Ambiguities:**
  - How does the leading 3-tier read-first hypothesis compare against global or section-local edit modes in actual playtesting ergonomics?
  - Which current quiet primitive fields have enough hidden annotations, references, or long-form detail to justify a Tier 2 detail view versus remaining a Tier 1 runtime scalar?
  - Should the Tier 2 detail modal/drawer visually present value/detail and annotations as adjacent sections, progressive disclosures, or tabbed views on phone-sized screens while retaining one atomic save?
  - How does bulk editing interact with per-row annotations without ballooning the bulk form, and does collection row editing retain separate annotation management or promote an in-place per-row annotation workflow?
  - When annotations are removed inside a singular Edit draft, what confirmation or undo treatment is proportionate without treating ordinary draft cancellation as persisted deletion?
- **Success:**
  - Users can intuitively predict where tapping leads across runtime values, rich fields/entities, and collections under the owner-approved model without modal fatigue or accidental edit mode triggering.
  - View consistently exposes relevant annotations and references; singular Edit can change authored detail and annotations atomically without losing identity, provenance, or unrelated data.
  - Rapid combat interactions (HP, spell slots) remain fast and modal-free.
  - The 4-fixture proof is reviewed and approved by the owner before rolling out across the full 2014 sheet and future systems.
- **Recommended workflow:** Full OpenSpec change with a 4-fixture proof-before-propagation checkpoint (`bl-077-unify-detail-editing-annotations`). Durable spec deltas expected for character-sheet editing and dense collection interaction.

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

### Refine mobile rules-reader navigation

ID:

- `BL-082`

Sequencing context:

- Treat the `BL-069` default-collapsed, visibly named `Outline & find` control and its self-hosted, external, unavailable, sheet-level, and annotation-entry states as sufficient representative evidence for the focused mobile proof. Run this P0 refinement after `BL-084`, `BL-077`, and `BL-078` and before `BL-070`; later system changes verify the accepted shared reader presentation against their actual source states instead of gating its design. Physical-iPhone `BL-073` review added a PDF rendering blocker, resource-overlay defect, and Find/scroll-discoverability evidence to this scope. `BL-072` still owns final cross-system hardening. This directly supports the mobile-first, runtime-access, contextual-guidance, and saturation principles in `docs/vision/author-desires.md`; no product-horizon tension is identified.

Refinement outputs:

- **Purpose:** Make phone-sized rules lookup preserve as much readable document space as practical while keeping page movement, outline, Find, fallback, and dismissal understandable and consistently recoverable.
- **Included behavior:**
  - Reproduce and resolve the physical-iPhone self-hosted PDF failure reported as `Page 1: undefined is not a function (near '...value of readableStream...')`, including a clear non-destructive fallback if the supported Safari/PDF.js combination cannot render the document in-app.
  - Correct the phone resource-reference presentation so opening or resizing the right-side viewer does not unexpectedly white out, displace, or expose a misleading sliver of the underlying sheet; preserve an obvious close/minify path and the intended mobile reading surface.
  - Review the phone reader's global page toolbar, document-navigation disclosure, source context, and dismissal controls as one responsive control system across the supported self-hosted source presentations.
  - Make Find the primary mobile document-navigation action or otherwise place it immediately discoverable, and provide an evident visual scroll affordance whenever the Outline/Find region contains additional off-screen controls or results.
  - Compare a compact persistent toolbar, explicit toolbar disclosure, scroll-aware auto-hide, and selectively sticky controls; any hidden controls must have an obvious one-step recovery path and must not depend on gesture-only discovery.
  - Decide which controls must remain continuously visible, which may collapse together, and whether page input, Previous/Next, browser fallback, outline, and Find should share one disclosure or retain distinct homes.
  - Preserve the `BL-069` default-collapsed mobile navigation baseline until a physical-phone proof demonstrates a clearer replacement; reuse existing buttons, disclosures, icons, focus contracts, and touch-target policy where their behavior fits.
  - Prove the selected behavior on representative small and large phones, portrait and landscape where supported, long continuous PDF scrolling, keyboard/screen-reader navigation, coarse-pointer input, and both sheet-level and annotation-dialog reference entry.
  - Use one existing viewer Storybook sandbox as the smallest visual proof and record human interaction bullets in the change-local `verify.md`; add repeatable outcomes to Playwright rather than Storybook `play` functions.
- **Excluded behavior:**
  - Replacing PDF.js, changing resource rights or locator contracts, adding a full-text index, highlighting Find matches, connecting user-local PDFs, or redesigning the desktop sheet/reference workspace.
  - Hiding essential navigation with no visible recovery control, gesture-only access, browser-sniffed layouts, or persisting toolbar state as character data.
  - Optimizing each rules system with unrelated phone controls before evidence shows that the shared reader presentation cannot serve it.
- **Ambiguities:**
  - Is the physical-iPhone page-render failure caused by the selected PDF.js build, a Safari API/version gap, worker delivery, stream handling, or another app integration boundary, and which iOS/Safari versions belong to the playtest support floor?
  - On phones, should the resource viewer fully replace the sheet workspace, intentionally overlay it, or retain any visible sheet context without producing the observed whiteout/push-over artifact?
  - Should the page toolbar remain compact and sticky, collapse behind one clearly named control, or auto-hide only during downward document scrolling and immediately return on upward scroll or focus?
  - Which action is the strongest mobile anchor: page position, outline/Find, Close/Back, or a combined document-tools disclosure?
  - Should expanded navigation temporarily replace the document region, overlay it, or remain a bounded stacked region once the default is collapsed?
  - Can the same responsive composition serve both the full-screen sheet viewer and the smaller annotation-dialog viewer without obscuring draft-return context?
- **Success:**
  - The self-hosted SRD renders on the supported physical-iPhone Safari floor without the reported `readableStream` page error, or the app detects the unsupported path and offers a plainly explained browser fallback without trapping the user.
  - Opening, minifying, resizing where applicable, and closing a phone reference never leaves a blank overlay, unintended sheet displacement, unreachable control, or ambiguous partial state.
  - Opening a reference on each supported phone size initially prioritizes readable PDF content while leaving the presence and recovery of outline/Find and page controls obvious.
  - A user can continuously scroll, jump to a known page, find text without first hunting through a hidden region, recognize when the navigation region itself can scroll, open a curated section, use browser fallback, and dismiss/return without losing context.
  - No control auto-hides while focused, no essential action becomes gesture-only, every direct-touch control meets the coarse-pointer policy, and no document-level horizontal overflow appears.
  - Owner review approves one consistent responsive control grammar before the final three-system matrix rehearsal.
- **Recommended workflow:** Full OpenSpec change with a small pre-propagation mobile proof because this is likely to modify durable responsive reference-navigation requirements and combines unresolved toolbar visibility, scroll behavior, focus, touch, and nested-viewer trade-offs. The scope benefits from explicit proposal, design, tasks, and a human checkpoint. No new ADR is currently triggered; refine the existing app-controlled PDF-navigation ADR only if the chosen solution changes its durable presentation or lifecycle boundary.

### Connect user-owned rules PDFs locally

ID:

- `BL-080`

Sequencing context:

- Defer until `BL-069` establishes and playtests the resource catalog, source identity, locator integrity, and in-app viewer. This is a P2 product expansion rather than a first-external-playtest prerequisite and is intentionally omitted from the Next Recommended Sequence until a supported user-owned source and privacy/rights review are selected.

Refinement outputs:

- **Purpose:** Let a user connect a lawfully possessed rules PDF on their own device so known references can open inside the established viewer without ez-chars distributing, uploading, syncing, or granting access to that document.
- **Included behavior:**
  - Add a user-local source connection workflow for an explicitly supported registered source and edition, using plain language such as `Connect your PDF`, `Connected on this device`, and `Reconnect your copy` rather than implying a server upload.
  - Show `Requires your copy · not connected` before activation, then offer a just-in-time connection action plus a proactive Manage Local Sources path; once connected, reuse the `BL-069` in-app viewer and locator experience.
  - Read only a file the user deliberately selects, keep its bytes on the current device/browser profile, and state accurately whether the source is session-only or remembered locally. Never include source bytes in character persistence, JSON backup/export, telemetry, or network requests.
  - Verify the selected document against the supported source/edition before enabling curated exact-page locators. A mismatch must not inherit another edition's page map silently; retain source guidance and a safe reconnect or limited-view path.
  - Make remembering a source explicit and optional, use a storage boundary suitable for PDF-sized blobs rather than `localStorage`, report quota/persistence/eviction limitations, and recover through a non-destructive Reconnect flow when bytes or permissions disappear.
  - Let the user inspect connected source identity, local-only status, storage use where available, and remove/forget the document without affecting characters, annotations, locators, or other sources.
  - Re-review rights, privacy, security, untrusted-PDF handling, supported-browser behavior, and local-storage lifecycle before public implementation.
- **Excluded behavior:**
  - Server upload or processing, cloud or cross-device sync, sharing a connected source, bundling or redistributing protected content, bypassing authentication or DRM, vendor-account integration, or implying ownership verification beyond the selected file/source match.
  - Arbitrary unknown-document ingestion, user-authored locator-map tooling, OCR, semantic processing, generated excerpts, normalized compendium records, or a persistent cross-document full-text index.
  - Storing document bytes inside character schema data, localStorage, application exports, committed fixtures, source control, logs, screenshots, or agent-visible processing artifacts.
  - Treating a filename, display title, purchase assertion, or user possession alone as sufficient proof that a curated locator map matches the selected edition.
- **Ambiguities:**
  - Which one supported user-owned source/edition supplies the first lawful proof, and what stable evidence may the public app retain to verify that edition without redistributing protected expression?
  - When a PDF is valid but does not match the known edition, should the baseline permit unlocated session viewing or reject it until a supported locator map exists?
  - Should the first cross-browser persistence proof copy bytes into origin-private storage, retain a permissioned file handle where supported, or offer remembered copying only with a session-only fallback?
  - What size, quota, persistence-request, private-browsing, eviction, and device-change language is understandable enough that `remembered locally` does not promise durable backup?
  - Which encrypted, malformed, scripted, or otherwise unsupported PDFs must be rejected before the viewer processes them?
- **Success:**
  - A user with the supported edition can connect it without network transmission, open a known reference at the verified locator, close/reopen the app according to the selected persistence mode, and understand that availability is device/browser-local.
  - A different or changed edition never receives an incorrect exact-page locator silently, and reconnecting or removing a source leaves character data and annotations unchanged.
  - Browser quota, permission loss, storage eviction, private browsing, invalid files, and viewer failures produce clear non-destructive recovery paths.
  - No connected PDF bytes or extracted source content enter application exports, source control, server requests, logs, or another user's/browser's storage.
- **Recommended workflow:** Full OpenSpec change after `BL-069` because this adds durable source-connection behavior plus substantial local file identity, PDF security, privacy, quota, persistence, eviction, removal, and cross-browser architecture. An ADR is triggered for the selected device-storage/file-handle boundary and its privacy/retention guarantees; qualified rights review may be a separate gate depending on the first proof source.

### Establish the multi-system boundary and 2024 D&D sheet

ID:

- `BL-070`

Sequencing context:

- Begin after the completed core/PDF audits, the completed `BL-074` 2014 component-boundary refactor, and the `BL-073`, `BL-084`, `BL-077`, `BL-078`, and `BL-082` interaction-foundation proofs. It supplies the dispatch boundary required by Shadowdark and must verify, adapt, or deliberately decline the accepted navigation, mobile-foundation, quickfilter, and reader behaviors for the 2024 presentation without treating 2014 semantics as universal.

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

- Depends on `BL-070` for the minimum dispatch/computed-view boundary and on `BL-068` to confirm the conservative locator contract; it does not depend on the owner seeking permission for broader source use. Verify, adapt, or deliberately decline the accepted `BL-073`, `BL-084`, `BL-077`, `BL-078`, and `BL-082` interaction patterns using Shadowdark-native landmarks, categories, and source behavior.

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

- Execute after `BL-064`, `BL-069`, `BL-084`, `BL-070`, and `BL-071` deliver their proofs. This item closes readiness gaps; it must not become an umbrella for missing product epics.

Refinement outputs:

- **Purpose:** Turn three independently implemented system proofs into one reliable external-playtest build and make the durable compatibility decision deliberately.
- **Included behavior:**
  - Build deterministic fixtures for all six PRD scenarios plus a saturated fixture or stress overlay for each system, and exercise creation/opening, runtime access, focused edits, quick notes, dense collections, annotations, contextual references, reload, JSON export, and isolated restore.
  - Rehearse at the representative mobile and desktop viewports; verify keyboard order, touch targets/exceptions, focus/modal context, scrolling, assistive semantics, and no document-level mobile overflow.
  - Resolve cross-system import/export, invalid-data recovery, mixed-system list/search, system labeling, and source-unavailable behavior.
  - Record performance and accessibility evidence for the supported browser matrix.
  - Reproduce the owner-observed rapid-scroll black-region artifact in headed Firefox on macOS and at least one non-macOS Firefox environment, compare an equivalent saturated sheet without the persistent Rules control, and use a Firefox profile plus screen recording to distinguish application paint pressure from a browser/platform rendering defect.
  - Decide whether Firefox on macOS belongs in the initial supported browser-platform matrix, then retain, revise, or remove the temporary pre-release compatibility notice and fallback-browser recommendation according to that evidence.
  - Immediately before external handoff, decide each system's durable schema identifier and whether the final 2014 v0 receives one bounded transition; update fixtures, warnings, migration tests, and recovery documentation.
  - Run owner solo-play rehearsals, record findings, and identify the external feedback topics that `BL-081` will turn into the final checklist, survey questions, and collection path.
  - Audit the intentionally representative locator sets from the three system proofs against the actual playtest tasks, then add or correct only the high-value curated rules landmarks needed for class or character setup, runtime play, equipment, spells or system equivalents, and recurring table lookup. Keep the review bounded to document navigation rather than pursuing exhaustive compendium coverage.
  - Ask whether contextual references, empty states, focused editing, and transparent aids provided enough guidance or whether a bounded creation workflow should be promoted.
  - Record whether combat prominence obscures exploration, roleplay, or other system-native scene information and whether the `BL-073` landmark baseline remains sufficient; use that evidence to decide whether to promote `BL-083`.
  - After external sessions, synthesize survey and qualitative evidence with response count, limitations, decisions, and backlog destinations before a product-v1.0 decision.
- **Excluded behavior:**
  - Adding another system, a builder, a compendium, cloud storage, OCR, or broad automation to improve the milestone cosmetically.
  - Declaring product v1.0 solely because automated checks or owner rehearsals pass.
- **Ambiguities:**
  - Which performance budgets and supported browser versions are appropriate once all three real sheets exist?
  - Is the rapid-scroll black-region artifact specific to Firefox on macOS, reproducible in Firefox elsewhere, or evidence of application paint pressure shared by other browser/platform combinations?
  - Does any sparse-GM scenario justify a lite mode before external handoff, or should that remain a playtest question?
  - After the `BL-073` navigation baseline and `BL-078` quickfilters exist, does saturation evidence still justify whole-sheet search, tabs, or another retrieval aid before handoff?
  - Which curated rules landmarks are necessary for each playtest scenario, and which lower-value sections should remain reachable through document outline or Find instead of becoming maintained application metadata?
  - Which optional final-v0 migration, if any, is worth supporting for the owner/test fixtures?
- **Success:**
  - All PRD readiness gates, six owner-run scenarios, and three saturation fixtures pass with no critical blocker.
  - Each external-playtest schema/version promise and recovery path is explicit and tested.
  - Remaining findings have owners and backlog destinations, and external sessions can begin without relying on undocumented setup.
  - The supported browser-platform matrix and any retained compatibility notice accurately reflect headed cross-platform evidence, including the Firefox/macOS rapid-scroll observation, without attributing an unverified root cause to the browser.
  - Each playtest system's curated locator set has an owner-reviewed coverage rationale, verified source/version destinations, and no known high-frequency lookup gap in the rehearsed scenarios.
- **Recommended workflow:** Full OpenSpec change because it crosses systems, persistence compatibility, accessibility, and release-readiness behavior. Add an ADR only if the compatibility or supported-platform decisions materially change existing approved doctrine.

### Investigate scene-aware runtime guidance and focus

ID:

- `BL-083`

Sequencing context:

- Split from `BL-073` and keep P1, trigger-deferred, and outside the next recommended sequence. Revisit only after `BL-070`, `BL-071`, and owner or external rehearsal show what friction remains with the minimum viable navigation baseline across materially different systems.

Refinement outputs:

- **Purpose:** Determine whether navigation alone is insufficient and whether system-native scene cues, summaries, emphasis, filters, or focused views would keep relevant character information close without flattening game identity or making overlapping information disappear.
- **Included behavior:**
  - Compare the accepted `BL-073` landmark baseline with observed retrieval and orientation problems on the 2014, 2024, and Shadowdark sheets.
  - Preserve combat as legitimately prominent where the system warrants it while evaluating faster access to exploration, roleplay, travel, downtime, or other system-native concerns.
  - Compare small scene-relevant summaries or cues, temporary emphasis, explicit filters, and an optional focused view only where evidence shows ordinary navigation is insufficient.
  - Evaluate whether a compact persistent identity summary or another computed projection improves orientation without relocating canonical fields merely to reclaim space.
  - Keep categories and projections system-native; do not force every game into 5e's combat, exploration, and roleplay framing or generalize action-economy records into a universal runtime container.
  - Require any focus or emphasis to be explicit, reversible, accessible, and compatible with search results, quick notes, urgent state, and continued access to the full sheet.
- **Excluded behavior:**
  - Automatically inferring the current scene, synchronizing a mode from a GM tool, or changing modes without explicit user action.
  - A universal scene taxonomy, universal sheet renderer, or persisted scene state before evidence demonstrates a shared need.
  - Hiding information by default, requiring a selected scene before the sheet is usable, or making combat and non-combat regions consume equal space by policy.
  - Reopening the accepted landmark navigation solely to make scene behavior possible.
- **Ambiguities:**
  - What measurable friction remains after `BL-073`, and is it missing synthesis, content organization, density, or merely unfamiliarity with the navigation surface?
  - Are lightweight system-native cues sufficient, or does any system benefit from an explicit filter or focused view?
  - Which information legitimately belongs to more than one scene, and which identity details must remain continuously visible?
  - If a focused view proves useful, should it remain ephemeral, persist only for the session, or ever become a character preference?
  - Is the correct outcome to add no scene-aware behavior at all?
- **Success:**
  - Evidence distinguishes navigation from missing scene-relevant synthesis, organization, and density problems across at least two materially different systems.
  - The investigation either closes with no new feature or yields one bounded behavioral direction that preserves system-native vocabulary and full access to character information.
  - Any proposed focus, filter, or emphasis is demonstrably more useful than the landmark baseline, explicit and reversible, and compatible with phone, keyboard, touch, and assistive-technology use.
- **Recommended workflow:** Begin with OpenSpec Explore only after the evidence trigger. Use a full OpenSpec change if the evidence supports new observable scene-aware behavior; no durable specification delta or ADR is justified before that direction exists. An ADR is warranted only if the result establishes a durable cross-system scene ownership, persistence, or projection contract.

### Add quickfilters to collection views

ID:

- `BL-078`

Sequencing context:

- Run after `BL-073` and before `BL-082`, `BL-070`, and `BL-071`. The completed `BL-076` surface already bounds and searches items including timing and category text, but it still presents discrete groupings (like action timings or spell levels) as one visually homogeneous result stream. Prove the collection-scale interaction against the representative 2014 Runtime Actions and Spells surfaces before later systems multiply comparable dense-list review, while leaving their categories and adoption decisions system-owned. Resolve that explicit navigation gap without reopening the accepted density or source-action work.

Refinement outputs:

- **Purpose:** Help players quickly distinguish and reach relevant categories in collection views (e.g. Runtime Actions by action-economy timing, Spells by level) without requiring them to remember that the general text search happens to index those labels.
- **Included behavior:**
  - Establish a generic UI pattern for quickfilters in collection views.
  - Implement explicit, quickly resettable way to narrow or organize Runtime Actions by Action, Bonus Action, Reaction, Free, and Other while retaining an All state.
  - Implement a similar quickfilter for Spells by Spell Level (Cantrip, Level 1-9) while retaining an All state.
  - Compose quickfilters with the existing text search as one understandable workflow rather than adding separate search bars; when both are active, results satisfy both constraints.
  - Preserve visible result counts, explicit no-match behavior, and a one-step return to the complete collection.
  - Keep quickfilter state ephemeral and non-destructive; it does not reclassify items, change canonical order, or persist a selected filter without separate evidence.
  - Preserve the completed Add/Edit/Notes, source navigation, resync, bounded desktop, focused phone, query-context, focus-restoration, touch, keyboard, and assistive-technology behavior.
  - Add stateful component and black-box coverage for quickfilters, mixed quickfilter plus text search, reset, no-match, phone-focused, and keyboard/touch paths.
- **Excluded behavior:**
  - Adding multiple category-specific search boxes, requiring separate saved lists or cards for each category, or duplicating one item into multiple homes.
  - Automatically inferring or rewriting an item's classification, adding a new taxonomy, or generalizing 5e categories into a cross-system contract.
  - Adding category, source, scene, or rules-derived facets without evidence that the quickfilter control is insufficient.
  - Folding quickfilters into the generic pinning rollout owned by `BL-075`; their independently authored priority and semantics remain separate.
- **Ambiguities:**
  - Should the baseline be a compact platform-native single-choice control, a small set of toggle-like timing controls, grouped timing headings, or a filter-plus-group combination?
  - Should explicit timing navigation appear whenever more than one timing is present, only above the five-item density threshold, or always for any populated Runtime Actions collection?
  - Does the All view remain one authored-order stream, or do timing headings improve scanning enough to justify grouped presentation even before a filter is selected?
- **Success:**
  - A player can show only bonus actions or reactions through an evident named control without typing timing terminology into search.
  - Timing and text narrowing compose predictably, never mutate character data, and always provide a clear route back to all actions.
  - Existing Runtime Action commands and responsive/focus behavior remain complete across touch, pointer, keyboard, and assistive-technology paths.
- **Recommended workflow:** Compact OpenSpec change after resolving the filter-versus-grouping ambiguity because this adds a narrow durable interaction requirement on one established collection surface. No ADR is triggered unless implementation establishes a broader cross-system action-navigation contract. If grouped presentation remains a live candidate, use a named isolated Runtime Actions Storybook comparison and owner checkpoint before route propagation; a settled compact timing filter does not otherwise need a mid-apply proof gate.

### Prepare playtest feedback collection

ID:

- `BL-081`

Sequencing context:

- Execute after every other P0 implementation and owner-readiness rehearsal. This is the final prerequisite before external playtest invitations: it turns the questions exposed by `BL-072` and the PRD gates into a discoverable, verified feedback path without delaying earlier product work on a form integration.

Refinement outputs:

- **Purpose:** Give external playtesters one clear, voluntary, low-friction way to report what worked, what obstructed play, and what should change, while giving the owner responses that can be compared and synthesized after sessions.
- **Included behavior:**
  - Draft the short survey collaboratively with the owner, map each question to a playtest task, PRD gate, or explicit learning goal, and obtain owner approval of the final wording before invitations are sent.
  - Establish a minimum baseline of one clearly named in-app feedback action that opens an owner-controlled external survey, such as a manually created Google Form, with truthful external-destination language and no automatic character-data transmission.
  - Keep the destination configurable or otherwise straightforward to replace before release; a missing or placeholder destination must not ship as a dead feedback action.
  - Decide where the action remains discoverable during playtest use, such as the pre-release notice, application navigation, or an equivalent persistent help/about location, and verify the chosen placement on desktop and phone with keyboard and touch.
  - Include concise participant context, task-success, usability, confidence, failure, accessibility/device, and open-comment prompts only where each answer will inform a product decision; keep optional identifying or follow-up information visibly optional.
  - Provide a facilitator-facing checklist for qualitative observations that do not fit the participant survey, including interrupted tasks, workarounds, confusion, and requests made aloud during a session.
  - Record how the owner will export and preserve an anonymized response snapshot, then synthesize response count, limitations, themes, decisions, and backlog destinations after the playtest without committing raw identifiers.
  - Evaluate an in-app guided form as an optional higher-cost path. If selected, disclose the external recipient before submission, provide understandable success/failure/retry behavior, and ensure the client contains no reusable email, API, or service credential.
- **Excluded behavior:**
  - Mandatory survey completion, behavioral analytics, session replay, automatic telemetry, automatic screenshots, character exports, or hidden collection of character, browser, device, account, or contact data.
  - Building a general support inbox, CRM, account system, custom survey platform, or broad feedback dashboard solely for the first playtest.
  - Shipping client-side email credentials or implying that an in-app form remains local when it transmits responses to Google, an email service, a serverless endpoint, or another processor.
  - Requiring completed survey responses or post-playtest synthesis before invitations can be sent; readiness means the questions, destination, disclosure, placement, and submission path are prepared and verified.
- **Ambiguities:**
  - Which learning goals and questions are essential, which are facilitator observations, and what completion time is short enough for participants after a session?
  - Is the minimum external Google Form link sufficient, or does the first playtest benefit enough from an in-app guided flow to justify third-party submission, error handling, abuse prevention, privacy disclosure, and operational ownership?
  - Where should the feedback action live so it remains easy to find without competing with character-sheet runtime controls or becoming permanent product chrome?
  - Should responses be anonymous by default, and should optional contact permission or follow-up scheduling be collected in the same instrument or separately?
  - Which external processor and account owns the form and response retention, and what disclosure or deletion language is proportionate for the selected questions and tester group?
- **Success:**
  - Before the first invitation, the owner has approved the question set and can follow the in-app action on desktop and phone to a live survey with no placeholder URL, broken navigation, or accidental loss of application state.
  - A keyboard, touch, or assistive-technology user can identify that the destination is external, open it, complete the voluntary survey, and understand what information will be sent.
  - A representative test response reaches the owner through the selected processor without exposing a client credential or transmitting character data, and failure or cancellation leaves the app usable.
  - The owner can export an anonymized snapshot and has a documented synthesis path that maps evidence to decisions and backlog destinations after the playtest.
- **Recommended workflow:** Resolve the external-link-versus-guided-submission ambiguity during refinement. Prefer a compact OpenSpec change and no ADR for the minimum external-form link because it adds a narrow durable feedback requirement with modest UI, configuration, accessibility, and browser-navigation work. If an in-app form submits through a new external service or introduces retention, secrets, abuse handling, or backend/serverless infrastructure, use a full OpenSpec change and add an ADR for the processor, transport, credential, privacy, and operational boundary. A proof-before-propagation checkpoint is unnecessary for a normal external link; an in-app guided form should prove one real success and one recoverable failure against a non-production test destination before the live endpoint is enabled.

## Ideation Sandbox (Raw / Rough Ideas)

This content is a work in progress to dump rough thoughts, brainstorms, and refactor wishes before prioritizing or organizing them.

### Roughly Prioritized and Vaguely Refined

- **[Priority 3] evaluate a Svelte-compatible form library such as TanStack Form or Felte after the first field-binding proof surface lands; prefer reuse for draft state, validation display, dirty tracking, and array editor ergonomics if it keeps local source smaller than custom form infrastructure**
  - _Best Guess_: Evaluate if an external library handles card-wide value validation, dirty checking, and array/nested list mutations more concisely and safely than our custom `FieldDraft` implementation.
  - _Critical Question_: Will introducing a third-party form helper conflict with our "platform-native first" preference or cause unnecessary bundle size increases, given we only have local-first state storage?

### Raw Human Ideation, Unsorted

- Explore whether `Quick Reference` remains a distinct Runtime landmark or becomes part of top-level character information after the navigation baseline has real use evidence.
  - _Why_: Armor Class, Hit Points, Speed, and similar frequently consulted values may feel like an at-a-glance identity summary rather than a separate retrieval destination. Folding them into Overview could shorten the landmark rail, but it could also mix relatively stable character identity with mutable table-time state and make a valuable direct jump less precise.
  - _Current direction_: Preserve the existing distinct, default-expanded `Quick Reference` region through `BL-073`; changing the landmark and sheet organization during icon review would exceed its approved bounded split. Use the navigation proof and first playtest to observe whether users deliberately jump there, confuse it with Meta / Top-level Info, or expect those values to remain visible alongside identity.
  - _Explore_: Compare the current Runtime landmark, a compact persistent identity/runtime summary, and a merged Overview composition; determine whether the right answer varies by game system rather than becoming a universal sheet rule. Coordinate with `BL-083` only if evidence calls for scene-aware or persistent computed summaries.
  - _Constraints_: Keep canonical values single-owned, preserve default-expanded access and responsive density, avoid turning Overview into another oversized mixed-purpose panel, and do not generalize 2014 information architecture across systems.
  - _Refinement trigger_: Promote only if owner or external-playtest evidence shows that Quick Reference is rarely used as a destination, is consistently mistaken for top-level information, or that separating it materially worsens at-a-glance play.

- Explore exact-match highlighting in the app-controlled PDF viewer after page-level Find has playtest evidence.
  - _Why_: `BL-069` Find reports matching pages, occurrence counts, and previews, then navigates to the selected page. A user may still spend time locating the phrase on a dense page, especially on a phone.
  - _Current direction_: Keep page-level Find as the first-playtest baseline. If evidence triggers follow-up, start with one active match highlighted on the selected rendered page and prefer PDF.js find/highlighter integration over bespoke text-span rewriting; expand to previous/next occurrence navigation or multiple visible highlights only if the bounded proof remains usable.
  - _Explore_: Compare one active highlight, all matches on the current page, previous/next occurrence controls, result counts, and automatic match scrolling. Verify behavior across PDF text spans, normalized whitespace, line breaks, hyphenation, ligatures, Unicode, zoom, nearby-page remounting, and nested viewer scrolling.
  - _Constraints_: Remain document-scoped and ephemeral; do not create a persistent or cross-document source-text index. Preserve selectable text, screen-reader behavior, visible focus, page and zoom performance, browser fallback, and compatibility with a later `BL-080` user-local source. Avoid a naive matcher that silently misses common PDF text layouts.
  - _Refinement trigger_: Promote only if owner or external-playtest review repeatedly finds exact phrases difficult to locate after selecting a Find result, or if another viewer-navigation change needs occurrence-level wayfinding. Treat a current-page active-match proof as medium effort; require a separately planned broader viewer integration for browser-grade find behavior.

- Explore viewer-side navigation for references authored on the active character.
  - _Why_: A character annotation can point into the currently open rules document, but the viewer navigation currently exposes only application-curated sections and the publisher's PDF outline. When several character fields cite the same source, a user may benefit from seeing where that document is used on this character while they read it.
  - _Current direction_: Keep `BL-069` navigation document-owned for the first playtest. If evidence supports a reverse view, add a distinct disclosure such as `From this character` rather than mixing mutable annotations into `Curated sections` or `PDF outline`; include only references for the active character and open resource, and keep annotation editing in its existing focused workflow.
  - _Explore_: Compare page-jump-only entries with entries that can also return to the originating sheet field; deduplicate repeated page references without hiding distinct authored context; determine how unsaved annotation drafts, stale locators, deleted fields, and references without exact pages should appear.
  - _Constraints_: Do not persist a second reverse index, mutate annotations from the document outline, expose another character's content, or couple the generic PDF parser to character schema shapes. Preserve source identity/version checks, stable focus and Back behavior, phone density, and the distinction between application-curated navigation and user-authored references.
  - _Refinement trigger_: Promote only if owner or external-playtest use shows repeated need to rediscover character-authored citations while inside a source, or if `BL-077` focused reference editing needs a document-side return path.

- Explore viewer-authored pins/bookmarks as source-aware character annotations.
  - _Why_: During ordinary play, a user may discover a useful rule while browsing or using document Find and want to retain that exact location without the application normalizing the rule into a compendium record. Turning the location into user-authored reference metadata aligns with ez-chars' role as an annotation facilitator.
  - _Current direction_: Offer a viewer action such as `Save reference` or `Pin this location` that captures the verified source identity/version and current supported locator, then lets the user add a short label or note. Reuse the existing annotation model and reference resolver where practical instead of creating a second document-bookmark system.
  - _Explore_: Decide whether a saved location belongs to the active character, a particular character field, a character-level references collection, or a device-wide source library; compare immediate save with a small annotation step; determine how users list, search, rename, unpin, and return to saved locations; and test how this composes with a future `From this character` viewer section and `BL-080` user-local sources.
  - _Constraints_: Do not persist source text or generated excerpts, treat a bookmark as canonical rules data, overload collection-priority Pin/Unpin semantics, or accept an unverified source/version locator silently. Link-only sources may retain lawful user-authored locators but cannot be processed in-app unless a later rights-approved user-local connection exists. Preserve character export clarity, stale-locator feedback, mobile density, keyboard/touch access, and user control over deletion.
  - _Refinement trigger_: Revisit after the first external playtest if users repeatedly rediscover the same rules locations, create scratchpad links as a workaround, or ask to retain a location discovered through viewer Find. Coordinate with `BL-077`, the `From this character` exploration, and `BL-080` before choosing persistence ownership.

- Explore a reflowing desktop sheet/reference split workspace after playtest evidence.
  - _Why_: The `BL-069` overlay now supports bounded width adjustment, but it still covers part of the character sheet instead of letting the sheet and reference share a coordinated workspace. Simultaneous comparison may be valuable for rules-heavy edits, especially on wide displays.
  - _Current direction_: Keep the resizable non-modal overlay for the first playtest. Later compare an app-shell split that reflows the sheet, dock/undock behavior, a movable divider, and whether a remembered allocation is worth the state complexity. Reuse the accessible horizontal-resize contract where it fits without assuming that viewer-local widths define whole-app layout.
  - _Constraints_: Preserve phone full-screen navigation, sheet and draft state, browser Back/Close behavior, readable minimum widths, keyboard and coarse-pointer operation, and a simple default for users who never resize. Do not persist a layout in character data or let either pane become unreachable.
  - _Refinement trigger_: Promote only if owner or external-playtest use shows repeated need to read the sheet and rules document simultaneously, or if the fixed overlay still obstructs core desktop work after bounded resizing.

- Explore catalog-derived sheet guidance if contextual References remain insufficiently discoverable.
  - _Why_: `BL-069` will place focused References actions near character/class, equipment, and spell content, but a newly created character may still leave a player unsure that relevant SRD guidance exists or what a particular action will open. Persistently seeding the same locators as annotations on every character would duplicate global catalog knowledge, pollute exports, and create unclear refresh/removal semantics when the catalog changes.
  - _Current direction_: First test `BL-069` on a newly created empty character. If its contextual actions are not self-explanatory, prefer version-aware, non-persisted hints projected from the resource catalog near the relevant sheet sections. Reserve authored example annotations for an explicitly identified tutorial or sample character rather than ordinary character factory defaults.
  - _Explore_: Compare clearer References labels or nearby source summaries, quiet first-use cues, catalog-derived section hints, and one or two tutorial/sample-character examples. Determine whether guidance should appear only on empty sections, until first use, or whenever a relevant locator exists.
  - _Constraints_: Keep system/catalog guidance distinct from editable user annotations; do not clone catalog locators into character storage or JSON exports; preserve catalog ownership of source identity, version, and locator health; do not introduce re-seeding, synchronization, or deletion semantics unless a later persisted-guidance proposal explicitly justifies them.
  - _Refinement trigger_: Promote only if the `BL-069` owner review or external playtest shows that users miss the Class, Equipment, or Spell References action, cannot predict its destination, or need more guidance than its label and local context provide.

- Explore desktop collection scroll ownership and Misc. Notes as a possible next dense consumer.
  - _Why_: Bounded inline lists control sheet height, but mouse-wheel input over a still-scrollable collection can interrupt top-to-bottom sheet scanning. The saturated fixture also demonstrates that Misc. Notes & Scratchpad can grow beyond the short/simple case even though `BL-064` intentionally limited its first rollout to equipment and spells.
  - _Current direction_: Keep normal scroll chaining at collection boundaries as the narrow `BL-064` mitigation. Do not adopt collapse-by-default yet: hiding collection contents may trade scroll friction for weaker at-a-glance runtime access. Leave Misc. Notes on its existing bulk path until a focused proof confirms that searchable identity-owned rows improve it.
  - _Explore_: Compare bounded inline scrolling, an explicit expand state, focused browsing on every viewport, compact/collapsed previews, and wheel delegation where technically reliable. For notes, evaluate title/body search, stable row Edit/Notes actions, note-kind context, empty behavior, ordering, and whether the complete collection should use the proven dense-list boundary.
  - _Constraints_: Preserve full item reachability, authored order, stable IDs, annotations, keyboard/touch access, source navigation, and sheet landmarks. Avoid scroll-jacking scripts and do not force every non-target collection into the dense pattern.
  - _Refinement trigger_: Use the ownership seam established by completed `BL-074`, then promote a separate observable-behavior proposal before first external playtest if owner rehearsal still finds desktop scanning disruptive or scratchpad saturation likely.

- Explore responsive collection-row quick actions and optional gestures after the submenu baseline has real use evidence.
  - _Why_: A consistent submenu scales safely across dense rows, but frequently used commands such as focused Edit may eventually merit one-step access on larger screens or optional mobile acceleration. Completed `BL-075` established Pin/Unpin in equipment and spell row menus while retaining collection-level Manage Pins for batches and quiet supporting bullets for density.
  - _Current direction_: Keep the complete, discoverable submenu as the canonical path where identity-owned row actions already exist. Treat always-visible shortcuts, platform context-menu enhancements, and optional gestures as the future exploration; do not make right-click, long-press, or another hidden gesture the only path for any command.
  - _Explore_: Inventory which existing submenu commands merit selectively surfaced desktop actions or mobile acceleration; compare direct quick actions, platform context-menu enhancement, and optional gestures; evaluate responsive command priority, discoverability, touch density, and whether BL-077's focused View/Edit/Notes language supplies useful evidence.
  - _Constraints_: Every gesture has an equivalent visible/menu command; destructive actions require confirmation or a recoverable undo path; responsive shortcuts must not create an excessive tab order or make the same command appear ambiguously in multiple places; a shared command presentation must not imply shared domain mutations.
  - _Refinement trigger_: Revisit in Horizon B after Manage Pins and the dense-collection baseline have been used on touch, pointer, and keyboard workflows, or earlier if owner rehearsal shows that collection-level pin management materially obstructs frequent reprioritization.
- Explore discoverability cues for globally pinned spells after playtest evidence.
  - _Why_: Completed `BL-075` moves each pinned spell into one global tier and renders it only once. A player who forgets that they pinned a spell may browse its former level group or alphabetical position and incorrectly conclude that it is missing.
  - _Current direction_: Keep the accepted once-only global tier, visible level/preparation context, and one cross-level search workflow. Do not duplicate actionable spell rows solely as a precaution because duplicate counts, focus destinations, search results, and row actions would become ambiguous.
  - _Explore_: If evidence warrants it, compare a lightweight per-level notice such as “2 pinned spells shown above,” a jump-to-pinned-spells link, and other non-duplicating wayfinding cues. Check whether search and the visible pinned tier already resolve the confusion before adding another control or label.
  - _Constraints_: Preserve one actionable row per spell, one spell-search workflow, accurate counts, stable focus restoration, compact phone previews, and visible spell-level/preparation context. Do not introduce a second search bar or silently return pinned spells to their former groups.
  - _Refinement trigger_: Promote this into a refined backlog item only if repeated owner or external-playtest evidence shows that players overlook pinned spells while browsing their expected level groups, or if another spell-navigation change needs to resolve the same wayfinding problem.
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

### Consolidate inline SVGs into a unified Icon atom

ID:

- `BL-079`

Purpose:

- The codebase currently houses several custom SVG icons (e.g. `OpenCloseToggleButton` arrows/hamburgers, `IconPin`, `IconBullet`) duplicated as inline templates or standalone atoms. Consolidating these into a single `<Icon variant="pin" />` atom will centralize common SVG attributes (`xmlns`, `viewBox`, accessibility tags) and ensure structural consistency across the design system.

Included:

- Create a central `Icon` atom with an explicit variant enum/type for all existing icons.
- Port existing SVGs (like hamburger, chevron, kebab, pin, bullet) to use the new unified atom.
- Update references in `OpenCloseToggleButton`, `GridContentActionMenu`, `IconPrefixedListItem`, etc.
- Update Storybook atom stories.

Excluded:

- Altering the visual design or color mapping logic; this is an internal structural refactor only.
- Modifying complex application-specific illustrations (if any exist) that don't fit the 1em/24px icon square pattern.

Ambiguities:

- Should `GitButton` and `HomeButton` rely on the generic icon atom, or stay independent due to their specialized shapes/responsibilities?

Success:

- Existing standalone icon atoms and inline icon templates are removed, and the single `Icon` atom is used in their place with zero visual regression in Storybook.

## Done Recently

- `2026-09-12` completed `BL-084`: hardened core mobile viability across the application: integrated a responsive character list (`hidden md:block` semantic table on desktop vs `block md:hidden` `ul > li > article` card list on mobile) with human-readable summary projections; established a centralized popover close seam resetting disclosure triggers immediately upon command selection; enforced a 16px mobile input typography baseline to prevent involuntary iOS Safari focus zoom while preserving user pinch-to-zoom; verified with cross-browser Playwright smoke tests and physical iPhone review
- `2026-09-12` completed `BL-073`: added system-owned landmark navigation to the 2014 sheet with an expanded outline and compact icon rail, responsive phone access, collapsed-destination recovery, accessible focus, deduplicated fragment history, Rules-viewer coexistence, independent Abilities/Proficiencies and Features/Traits panels, and owner-approved hierarchy/icon treatment
- `2026-09-07` completed `BL-069`: delivered rights-classified reference navigation with an app-controlled PDF.js viewer, sticky Rules action, multi-source resource discovery, and contextual sheet integration for class, equipment, and spells; added Playwright coverage and verified browser/mobile behavior
- `2026-08-29` completed `BL-075`: added stable Pin/Unpin priority for 2014 inventory, spells, Features, Traits, Languages, and Tools; introduced durable Language/Tool identities and validated character-owned Pin state; preserved collection-specific interaction grammar, deterministic priority-first ordering, reload and JSON round trips, accessible batch management, and immediate equipment/spell row commands while leaving Runtime Actions independent
- `2026-08-23` completed `BL-076`: added searchable, responsive density handling for Runtime Actions and supporting Features, Traits, Languages, and Tools; adopted five-item and seven-item simple-list limits respectively while preserving domain-specific actions, compact bullet presentation, source workflows, query context, focus restoration, and cross-browser saturated coverage
