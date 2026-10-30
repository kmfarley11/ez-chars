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

**Preferred before playtest is not required before playtest.** The P1 group below makes owner-requested, time-permitting improvements visible without promoting them to P0 or blocking invitations. The owner may select or defer them as session scheduling becomes concrete; there is no commitment to exhaust that group before testing. Rehearse any selected changes in the final readiness pass. Other P1/P2 and sandbox items are not implicitly promoted by this scheduling preference.

## Current Priority Queues

These lightweight queues record priority membership only. Detailed definitions live once in the [refined backlog catalog](#refined-backlog-catalog).

### P0 — Product Prerequisites

- [`BL-071` — Deliver a minimal system-native Shadowdark sheet](#deliver-a-minimal-system-native-shadowdark-sheet)
- [`BL-072` — Harden the three-system external-playtest matrix](#harden-the-three-system-external-playtest-matrix)
- [`BL-081` — Prepare playtest feedback collection](#prepare-playtest-feedback-collection) _(final prerequisite before external invitations)_

### P1 — Priority Improvements

#### Preferred before the first playtest — time permitting

- [`BL-088` — Reduce read-first editing friction](#reduce-read-first-editing-friction)
- [`BL-087` — Bring contextual rules references into focused editing](#bring-contextual-rules-references-into-focused-editing)

#### Other priority improvements

- [`BL-066` — Prove bounded fillable-PDF interoperability](#prove-bounded-fillable-pdf-interoperability)
- [`BL-083` — Investigate scene-aware runtime guidance and focus](#investigate-scene-aware-runtime-guidance-and-focus) _(trigger-deferred and omitted from the recommended sequence until multi-system navigation evidence exists)_
- [`p1-010` — Add GitHub Actions for quality gates](#add-github-actions-for-quality-gates) _(trigger-deferred and omitted from the recommended sequence until CI needs justify it)_

### P2 — Future Feature Work

- [`BL-080` — Connect user-owned rules PDFs locally](#connect-user-owned-rules-pdfs-locally)
- [`BL-079` — Consolidate inline SVGs into a unified Icon atom](#consolidate-inline-svgs-into-a-unified-icon-atom)

## Next Recommended Sequence

_Goal: First External Playtest_

The queues above record strategic priority membership; this list records the dependency-aware action order and may omit blocked or trigger-deferred items.

1. `BL-071`: Add the minimal Shadowdark sheet and its system-owned navigation and collection behavior within the conservative baseline, using the completed BL-070 dispatch boundary
2. **Optional owner-selected improvement pass:** Consider `BL-088` first to refine shared editing affordances, then `BL-087` for contextual rules alongside editing. Either may be deferred without blocking playtest readiness or pulled forward now; neither technically requires Shadowdark. This is a scheduling opportunity, not another gate.
3. `BL-072`: Rehearse and harden the full three-system representative, sparse-GM, and saturated-sheet matrix after required interaction work and any selected optional improvements are present
4. `BL-081`: Finalize the survey questions and verify the voluntary in-app feedback path immediately before inviting external playtesters

Completed `BL-086` (2026-10-16) supplies shared production composition, isolated canonical examples, and explicit component ownership. Completed `BL-070` (2026-10-28) adds the authored 2024 sheet and explicit multi-system lifecycle using that foundation; no universal sheet contract is prescribed.

The completed `BL-064` proof established the inventory and spell baseline, `BL-074` established the focused list, field, form, dialog, layout, panel, and domain-orchestration seams, `BL-076` added proportionate density behavior for Runtime Actions and supporting collections without flattening their distinct interaction grammars, `BL-075` added a reusable player-facing pinning grammar while keeping identity, persistence, and system nuance domain-owned, `BL-073` established sheet-scale navigation, `BL-084` resolved core mobile viability, and `BL-077` established the three-tier read-first interaction language across runtime values, rich detail, and collections. Completed `BL-085` extended that baseline with label-targeted detail, independently saved field/note edits, and compact read-first spell slots. Completed `BL-078` adds shared collection quickfilters and persisted Runtime Action priority with system-owned semantics. Completed `BL-082` establishes the shared compact reader and text compatibility correction; completed `BL-070` supplies the boundary for the next system, `BL-071`. Later system changes must audit, adopt, adapt, or decline those patterns using system-native landmarks and categories rather than inheriting 2014 semantics. This ordering does not make arbitrary UI polish a prerequisite; it advances known physical-phone blockers and the remaining known P0 retrieval problems with existing representative proofs. `BL-066` remains an early P1, export-only interoperability proof gated by exact-template processing/output rights, not a first-playtest prerequisite; its bounded 2014 scope does not technically depend on `BL-070`. `BL-072` rehearses the resulting interaction and system matrix and gathers any evidence that could trigger the separate, P1 `BL-083` scene-aware investigation. `BL-081` remains the final readiness gate before external invitations.

## Refined Backlog Catalog

Each active refined item has one stable detailed definition in this catalog. Queue entries and the recommended sequence point here; reprioritization must not relocate or duplicate these definitions. When an item is completed and archived, remove its queue link and catalog definition, then retain only the bounded summary required by [Done Recently](#done-recently).

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

- The three-system form audit is complete in `docs/fillable-pdf-interoperability-audit.md`. The proposed [export-first change](../openspec/changes/bl-066-export-supported-character-pdf/proposal.md) targets the existing 2014 schema after exact-template processing/output rights are resolved. BL-070 is not a technical prerequisite for that bounded proof; coordinate mapping changes if system expansion lands first. This remains P1, not a first-playtest readiness gate or a replacement for BL-071 at the head of the P0 sequence.

Refinement outputs:

- **Purpose:** Make it easier to move between ez-chars and publisher-provided fillable sheets without allowing a lossy page layout to become canonical character storage.
- **Included behavior:**
  - Export one selected 2014 character into one exact user-selected official blank form, without bundling, automatic fetching, or retention. Resolve processing and filled-output permission first; user selection is not a rights workaround.
  - Keep original form fields editable; review Included / Continued / Not represented before download, with acknowledgment for omitted authored content or meaningful game information. Internal IDs and app-only presentation state receive a compact limitations disclosure rather than forcing acknowledgment. JSON remains the full-fidelity backup.
  - Preserve mapped overflow on readable, app-authored continuation pages, explicitly non-fillable, with clear originating-section references. Move overflowing prose in full and continue excess records intact without duplicate content; disclose that later PDF edits do not regenerate continuations. Reject output that cannot be faithfully rendered within documented, proof-measured limits instead of silently clipping or substituting text.
  - Keep the mapping system-specific and export all mapped data regardless of sheet filtering, density limits, or pinning. Unknown/revised templates and failed/cancelled export leave stored characters unchanged.
  - Require an actual sparse/saturated PDF proof, including edit/reopen, print, and phone download checks before app rollout. Defer 2024's opaque field map and Shadowdark's separate rights gate.
- **Excluded behavior:**
  - PDF import in this change; reviewed scalar import is captured separately in raw ideation below.
  - Bundled/fetched publisher forms, hidden embedded character backups, arbitrary user-upload processing, and server processing.
  - Treating PDF as the full-fidelity persistence or backup model.
  - Arbitrary, homebrew, scanned, image-only, or unrecognized PDF layouts; OCR and inferred extraction.
  - Pretending annotations, references, source links, unlimited collections, or stable IDs can round-trip when the form cannot represent them.
- **Ambiguities:**
  - What exact permission basis clears this bounded local filling/output workflow under the resource policy? This remains an execution prerequisite, not an assumption.
  - Which exact fields, glyphs, resource limits, and viewer combinations pass the real-output proof? Material coverage reductions require explicit reconciliation.
- **Success:**
  - A representative character exports to the exact supported form and remains usable in the project's declared PDF viewers, with every lossy field disclosed.
  - Export does not mutate or reduce the validated system document or JSON backup.
  - Sparse and saturated output remains useful and original fields remain editable; continuation pages and unsupported data have explicit, reviewed limits.
  - Automated fixtures detect field-map or template-signature drift.
- **Recommended workflow:** Full OpenSpec change because it adds durable PDF-export requirements and needs coordinated mapping, UI, privacy, and output-verification work. Record an ADR for the projection/dependency boundary. Named human PDF proof precedes rollout, followed by separate final integrated approval.

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
- **Production packaging regression guard (resolved 2026-10-30):** Both asset plugins now copy into the client bundle before SvelteKit adaptation. Final `build/` files match the adopted SRDs and PDF.js support sources; local-only documents remain excluded. All focused production-preview checks pass, including reader/search and both system routes. Retain [production routing and final-artifact checks](verification.md#static-deployment-routing) during release/toolchain verification: dev-server success alone previously hid missing deployment assets. Reopen if these checks fail or a deployed Rules reader cannot fetch its PDF/support files. Live GitHub Pages confirmation remains part of the next deployment smoke check, not a claim made by local preview.
- **Reader readiness watch (2026-10-23, BL-070 proof revision):** One Chromium smoke run timed out waiting for page-1 selectable text immediately after opening Rules in `tests/referenceReaderProof.smoke.spec.ts`; the same check passed on the unchanged rerun. This failed before any Close/Back assertion, so it is not evidence of the separate WebKit scroll-reset issue. If it recurs, capture the trace and reader/worker readiness under serial versus normal suite execution before attributing a cause or changing timeouts. Keep the assertion enabled.
- **Monitored reader scroll reset — owner-accepted deferral (2026-10-10):** One automated WebKit run jumped from sheet scroll 2972 to 0 after opening Classes references, navigating the sheet to Inventory, scrolling until the invoking button was offscreen, and pressing Home on the reader resize handle. Closure, URL, and restored focus were correct. The owner has not observed it manually and explicitly accepts moving on; no production fix is claimed. Subsequent unchanged repetitions and instrumented comparisons passed, including the full WebKit project. **Reopen investigation if the owner/player reports any reader-close jump or automation fails again.** Capture browser/OS, sheet/source, scroll context, and dismissal method (Close, drag, Home, Escape, or browser Back); distinguish an unwanted Close jump from intentional Back navigation. Start with `tests/referenceReaderProof.smoke.spec.ts` and the bounded `reader-scroll-diagnostic` attachment; compare focus, cancelled keydown, keyup, and reader removal at the first scroll divergence. The [BL-082 verification record](../openspec/changes/archive/2026-10-10-bl-082-refine-mobile-rules-reader/verify.md#intermittent-webkit-resize-dismissal-scroll-failure) preserves reproduction and evidence. Keep tests enabled without retries or weakened assertions; remove temporary logging only after a reproduced cause has appropriate regression coverage. This is non-blocking by explicit owner acceptance, not an audit exception or a declaration that future failures may be ignored.
- **Accepted temporary dependency-audit exception (2026-10-10):** The owner explicitly approved GHSA-vfj7-8cjw-p6xm only after the [reachability assessment](decisions/2026-10-10-bound-development-security-overrides.md#2026-10-10--advisory-reachability-and-proposed-temporary-exception). At that checkpoint, six high package findings came from this single unpatched braces advisory; full audit and `verify:all` visibly failed while production-only audit was clean. The October 27 reassessment below supersedes that audit result, not the accepted constraints. Current OpenSpec/deployment patterns are fixed and brace-free; review changed schema/CLI/deployment inputs before use and do not process untrusted patterns. This permits BL-082 closure with an exception, not a clean-audit claim. BL-072 owns reassessment **by 2026-11-09 or before external playtest, whichever comes first**, and earlier on patched releases, input/toolchain changes, observed exploitation, or new advisories. No automatic monitoring, blanket suppression, forced downgrade, or automatic renewal is authorized.
- **Dependency-tree hygiene (2026-10-10):** Clean lockfile installation also reproduces a pre-existing optional-peer mismatch: svelte-check's nested fdir 6.5.0 resolves root picomatch 2.3.2 although it requests 3.x/4.x. The staged baseline has the same placement. Targeted picomatch refresh did not repair it; broad deduplication proposed unrelated upgrades/downgrades and was not applied. Revisit with svelte-check/fdir dependency maintenance; do not introduce a runtime dependency solely to satisfy development-tree placement. Record diagnostics separately from the security advisory and functional check results.
- **Dependency reassessment (2026-10-27, BL-070):** The owner authorized security fixes and the compatibility-assessed Kit 3/Vite 8 migration after the October 24 findings. The refreshed full audit now reports zero; no suppression or new exception is used. The earlier braces finding is not currently reported, which is not proof of an upstream fix or authorization to broaden its historical exception. Keep its original November 9/pre-playtest reassessment and input constraints. See the [security decision refinement](decisions/2026-10-10-bound-development-security-overrides.md#2026-10-27--reviewed-security-maintenance-and-kit-3-migration) and [BL-070 verification record](../openspec/changes/archive/2026-10-28-bl-070-add-2024-system-boundary/verification-record.md) for current versions and actual gate outcomes. The existing picomatch optional-peer placement remains separately observable after the svelte-check upgrade.
- **Accepted bounded tooling exception (2026-10-28, BL-070):** The owner explicitly accepted the [deepmerge assessment and constraints](decisions/2026-10-10-bound-development-security-overrides.md#2026-10-28--deepmerge-assessment-and-proposed-exception). Full audit reports six low affected packages from one unpatched advisory (GHSA-gcqx-w48m-w2h4), superseding October 27's zero-finding checkpoint. Inspected usage is maintainer-controlled Svelte plugin configuration; no character-data/PDF path was found, and production-only audit is clean. This bounded review is not proof of safety. Reassess **by 2026-11-09 or before external playtest, whichever comes first**, and earlier on patches, upstream removal, changed inputs or observed failures. Keep audit/verify:all visibly failing; no public dev servers, untrusted configuration, suppression, forced downgrade or automatic renewal is authorized.
- **Automated WebKit startup watch (2026-10-28):** One final BL-070 cross-browser run timed out at the initial home `page.goto('/')` in `tests/referenceViewer.smoke.spec.ts`; the trace stayed at `about:blank` with no network entries, before any sheet/reader interaction. Three unchanged serialized file repetitions then passed (24 checks; three expected phone-only skips). Cause remains unconfirmed; this is distinct from reader-close scroll reset. If it recurs, retain the trace and inspect browser-process health, initial request/server availability and host contention before changing application logic or timeouts. No fix, retry or suppression was added.
- **Refreshed headless cadence (2026-10-28, BL-070):** Three serialized samples per engine yielded Chromium median 60.00 FPS / 0% over-33.3-ms intervals and Firefox 44.48 FPS / 20%, versus the preceding local report's 60.00/0% and 46.14/20%. Chromium's gate passed; Firefox remains comparative only and within its previously observed headless range. These numbers do not establish painted-frame correctness or close the physical Firefox/macOS issue.
- **Toolchain API maintenance trigger:** Kit 3 currently supports the existing shallow pushState/replaceState API; source imports use explicit Vite/TypeScript aliases rather than deprecated Kit alias configuration. Revisit a supported-API/subpath-import migration when upstream removes those navigation helpers or maintaining the parallel alias maps causes concrete drift. Preserve reader Close/Back, sandbox isolation and both edition routes; do not combine this with gameplay abstraction work.
- **Reader device-evidence gap (2026-10-09):** BL-082 rollout is owner-approved despite unavailable physical Android hardware. The owner reports positive iPhone 16 Pro Max review with latest-installed Safari, Firefox, and Chrome (previously reported iOS 26.6.2; numeric browser versions not captured). At the next available physical-device rehearsal, record actual Android/Chrome and iOS/browser versions; verify painted pages, selectable text, completed `armor` Find, result jumps, keyboard/landscape, and return to an unsaved note. Do not certify Android from the Mobile Chrome viewport project or claim an oldest supported version without evidence. Preserve required in-app reading/Find; fallback alone is not a pass. This is an explicitly accepted coverage gap, not a known unresolved Android defect.
- **Evidence already available (2026-09-26):** The serialized Playwright comparison produced two stable headless Chromium medians of approximately 60 FPS with no intervals over 33.3 ms, while headless Firefox produced medians of 43.18 and 44.92 FPS with 21.67% and 23.33% over-33.3-ms intervals. A same-machine headed comparison materially changed the result: after one cold sample in each engine (Chromium 40.91 FPS; Firefox 51.43 FPS), the next two samples reached approximately 60 FPS with no dropped-frame intervals in both engines. This supports treating the headless Firefox delta as automation-environment and refresh/compositor-scheduling evidence rather than a demonstrated end-user application regression. It does not close the owner-observed rapid-scroll black-region issue: `requestAnimationFrame` cadence cannot prove that Firefox painted or composited every presented frame correctly, and Playwright uses its patched Firefox build rather than branded release Firefox. Retain the compatibility notice and the headed macOS/non-macOS profile, Paint Flashing, screen-recording, and saturated-sheet comparison below until that separate rendering question is resolved.

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
    - BL-070's 2026-10-16 refinement keeps one canonical document that can grow from sparse to detailed. If owner rehearsal shows repeated overload or demand for a simpler presentation, evaluate a reversible compact/full view of that same data, not destructive simplification or a second format; coordinate with BL-083 only if scene-aware focus is implicated.
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
  - Include a bounded annotation question and facilitator observation prompt that distinguishes “I did not need a note” from “I could not find the right attachment point” and “I could not re-find a note later.” Use that evidence to evaluate whether field-level attachment is appropriately selective, too granular, or missing a character-level discovery path rather than assuming every field should accumulate notes.
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
  - Do players naturally attach notes to a small set of meaningful fields or records and later rediscover them, or does the current per-field model expose implausible destinations while failing to provide the retrieval path they expect?
  - Should playtest scope be limited to using the sheet for runtime reasons only? separate from a playtest that involves user-driven character creation? (seems like character creation may deserve its own dedicated playtest / survey? or we could combine and use the playtest as evidence for a character creation / level up wizard?)
- **Success:**
  - Before the first invitation, the owner has approved the question set and can follow the in-app action on desktop and phone to a live survey with no placeholder URL, broken navigation, or accidental loss of application state.
  - A keyboard, touch, or assistive-technology user can identify that the destination is external, open it, complete the voluntary survey, and understand what information will be sent.
  - A representative test response reaches the owner through the selected processor without exposing a client credential or transmitting character data, and failure or cancellation leaves the app usable.
  - The owner can export an anonymized snapshot and has a documented synthesis path that maps evidence to decisions and backlog destinations after the playtest.
- **Recommended workflow:** Resolve the external-link-versus-guided-submission ambiguity during refinement. Prefer a compact OpenSpec change and no ADR for the minimum external-form link because it adds a narrow durable feedback requirement with modest UI, configuration, accessibility, and browser-navigation work. If an in-app form submits through a new external service or introduces retention, secrets, abuse handling, or backend/serverless infrastructure, use a full OpenSpec change and add an ADR for the processor, transport, credential, privacy, and operational boundary. A proof-before-propagation checkpoint is unnecessary for a normal external link; an in-app guided form should prove one real success and one recoverable failure against a non-production test destination before the live endpoint is enabled.

### Bring contextual rules references into focused editing

ID: `BL-087`

- **Evidence and scheduling:** During owner proof rehearsal on 2026-10-25, section-level references were useful but insufficiently close to class editing: the owner wanted the relevant PDF details alongside the active editor. This is a preferred, lower-priority pre-playtest improvement, not a prerequisite or an expansion of the active BL-070 rollout. It promotes the dialog-relevant portion of the earlier catalog-derived guidance idea.
- **Purpose:** Let a player consult the correct system's rules while maintaining character data without losing their editing context.
- **Included behavior:**
  - Begin with class editing and one other representative target, such as equipment or a spell, using reviewed system/version-specific catalog locators. Expand mappings only where they genuinely help the task; do not add a reference button to every leaf.
  - Offer quiet, clearly identified system-provided guidance within focused Detail/editing. Keep it distinct from player-authored notes and character-record source links; reuse catalog ownership and existing rights-classified navigation.
  - Prove simultaneous PDF reading and editing where desktop space permits, and a deliberate, reversible reader/editor switch on narrow screens. Preserve unsaved input, independent save/cancel semantics, validation, targeted-field context, and predictable focus and Close/Back behavior.
  - Retain truthful external-link, unavailable, and stale-locator handling when in-app rendering is not supported. Missing guidance must never prevent manual editing.
- **Excluded behavior:** Persistently seeding references into ordinary character notes/exports; rules ingestion or a compendium; automatic class/build validation; user-owned PDF import (BL-080); arbitrary new document rights; a whole-sheet reflow/docking redesign; broad tutorial or first-use onboarding.
- **Ambiguities / recommended starting points:**
  - Which class and secondary-target locators are sufficiently precise for each supported system? Audit existing catalog coverage before promising per-class rules coverage; do not infer a licensed destination from a display name.
  - Can the existing reader and dialog coordinate safely within one editing workspace? Prefer coordinated desktop panes and a phone return path over competing modal layers; prove focus, draft retention, and usable minimum widths before choosing the layout.
  - Where should guidance live without adding clutter? Start with one compact target-level Rules action rather than repeated field-level actions; compare it in the actual sheet host, not only an isolated viewer.
- **Success:** From a class edit, open the appropriate rules location, read it, return to or continue the pending edit, and save/cancel without losing input or unexpectedly navigating the sheet. The same flow remains comprehensible on a phone and with keyboard navigation; user notes stay distinguishable and exports acquire no catalog-generated annotations.
- **Recommended workflow:** Full OpenSpec change: durable contextual-reference behavior changes plus interacting reader/dialog, focus, navigation, and draft boundaries merit coordinated proposal/design/tasks. Require a named human proof before broader target/system rollout. Amend the existing viewer/dialog ADR if the workspace or focus-ownership policy changes; merely reusing an established contract does not require a new ADR. Resolve catalog coverage and the workspace alternative during planning/proof before propagation.

### Reduce read-first editing friction

ID: `BL-088`

- **Evidence and scheduling:** During owner proof rehearsal on 2026-10-25, tier-1 pencil editing felt reasonable, but read-first editing felt clunky: the pencil was far from the value, and opening/targeting the wider dialog still added friction. Preferred before playtest if time permits; not a new readiness gate or automatic BL-070 scope addition.
- **Purpose:** Make changing one read-first value quick and obvious without turning dense sheets into walls of controls or making text selection awkward.
- **Included behavior:**
  - Audit both steps separately: sheet label/value entry into Detail, then activation of the selected leaf's editor. Improve the shared focused-editing components rather than adding per-system exceptions.
  - Start the proof with a compact visible pencil immediately adjacent to the value/label, comparing leading versus trailing placement where useful. Preserve ordinary text selection/copy and the accepted label-targeted Detail/highlight path.
  - Compare value-click activation only if it materially reduces friction; preserve a discoverable keyboard/touch equivalent. A pencil hover cursor may supplement an action, but must not be its only cue. Do not add a clipboard button unless the chosen proof demonstrates a real unmet copying need.
  - Preserve independent leaf validation/commit, dirty-work protection, notes access, read-only/derived distinctions, focus return, coarse-pointer targets, and stable read/edit geometry.
  - Reuse a small proof set: a short scalar, long/selectable text, and a collection-item Detail, then inspect the same controls in representative and saturated actual sheets on phone and desktop. Keep tier-1 controls as a regression comparison, not an assumed redesign target.
- **Excluded behavior:** Global edit modes; restoring long bulk forms; a wholesale tier-1/collection redesign; hidden-gesture-only editing; new clipboard infrastructure by default; changing domain validation, persistence, or annotation ownership; broad responsive-density or collection quick-action work.
- **Ambiguities / recommended starting points:**
  - Does an adjacent pencil resolve the distance problem, or does dialog entry remain the dominant cost? Measure owner task completion and perceived friction in the proof; do not assume a relocated icon alone solves both.
  - Should clicking the value edit, select text, or keep its current behavior? Prefer selectable text plus an adjacent explicit control first; evaluate alternatives on touch and keyboard before changing the contract.
  - If the dialog remains cumbersome, is a bounded in-place read-first editor justified? Capture that as a deliberate scope decision with its own proof before implementing; do not silently turn every read-first field into tier 1.
- **Success:** A user can identify and edit one intended field without hunting across the dialog, accidentally entering an unrelated editor, or losing selection/copy access. Sparse and saturated sheets remain compact; two system hosts inherit the same improvement through common components.
- **Recommended workflow:** Compact OpenSpec change for the bounded affordance refinement, with a named human proof before propagation: a durable interaction requirement is likely and coordinated tasks prevent proof/rollout drift. No ADR is expected for placement within existing contracts. If proof selects dialog bypass or changes save/focus ownership, expand to a full change and amend the relevant interaction ADR before that rollout. Coordinate with BL-087, but neither item requires completion of the other.

## Ideation Sandbox (Raw / Rough Ideas)

This content is a work in progress to dump rough thoughts, brainstorms, and refactor wishes before prioritizing or organizing them.

### Roughly Prioritized and Vaguely Refined

- Refine structured 2024 Hit Dice resources without expanding the sheet unnecessarily.
  - _Owner review (2026-10-26, BL-070)_: the current single text field is both schema and UI. A compact display is acceptable, but independently represented resource counts are desired. See the [coverage decision](decisions/2026-10-26-bound-2024-character-sheet-coverage.md).
  - _Direction_: explore optional per-denomination maximum/spent pools for multiclass characters with one compact read-first summary; maintain independent edits and explicit handling of old text/notes, without parsing arbitrary notation or adding rest automation.
  - _Trigger / next step_: refine before implementing resource tracking, preferably during owner rehearsal before playtest if needed. Use a compact OpenSpec change after settling pool identity and old-data handling; amend the schema ADR and prove single-/mixed-die cases before propagation. This is not a new P0 gate.
- Revisit accepted D&D sheet coverage gaps only on concrete need.
  - _2014 companion review (2026-10-26, BL-070)_: the bounded parity pass exposes authored save/skill bonuses, Expertise, Passive Perception, Inspiration, Player Name and subclass. The paired coverage ADR also records deferred 2014 XP, dedicated armor/weapon proficiency fields, portrait/symbol assets, separate appearance metrics and casting-class display. Reopen only when an owner/player workflow needs structured access beyond notes. Preserve existing 2014 total/remaining Hit Dice strings; consider this edition during future structured-pool refinement rather than treating it as the 2024 one-string model. A unified 2014 proficiency-level editor can be refined if separate flag editing proves confusing; do not silently normalize existing combinations or move leaf notes.
  - _XP_: add a manual experience field if an XP-based group requests it or a level-up/form-filling effort needs it. Its earlier absence was not deliberate, but the owner accepts deferral.
  - _Attunement_: use item annotations for now; consider a dedicated field if owner/player use cannot reliably find or maintain attuned items. Do not enforce rules limits automatically.
  - _Other deviations_: prose attack/spell metadata, text armor training and existing casting/shield context are accepted in the [coverage decision](decisions/2026-10-26-bound-2024-character-sheet-coverage.md), not an unapproved completeness expansion.

- **[Priority 3] evaluate a Svelte-compatible form library such as TanStack Form or Felte after the first field-binding proof surface lands; prefer reuse for draft state, validation display, dirty tracking, and array editor ergonomics if it keeps local source smaller than custom form infrastructure**
  - _Best Guess_: Evaluate if an external library handles card-wide value validation, dirty checking, and array/nested list mutations more concisely and safely than our custom `FieldDraft` implementation.
  - _Critical Question_: Will introducing a third-party form helper conflict with our "platform-native first" preference or cause unnecessary bundle size increases, given we only have local-first state storage?

### Raw Human Ideation, Unsorted

- Preserve a recoverable Runtime Action creation/resync draft when the host rejects a write.
  - _Evidence (BL-086, 2026-10-11)_: The canonical rejection sandbox exposes an existing callback mismatch: ordinary focused/collection edits return a save result, but RuntimeActionDialog creation and source resync use void callbacks. A rejected create can close without adding an action; resync reports failure only through the host diagnostic. All rejected writes leave the character unchanged.
  - _Direction_: Extend those existing commands with the same explicit success/failure contract as other edits, keeping the creation draft open and displaying a retryable error. Do not use the catalog refactor to redesign their interaction.
  - _Refinement trigger_: A real rejected create/resync is observed, or a persistence/host change introduces expected recoverable write failures. The current simulated rejection alone does not add a playtest prerequisite. Retain the sandbox limitation visibly until addressed.

- Reviewed scalar import from a supported fillable PDF after BL-066 export is proven.
  - _Direction_: Preview reliable mapped values and create a new validated character only; do not overwrite or match an existing character. Generate fresh identities through existing domain creation paths, with deterministic allocation in tests.
  - _Constraints_: No arbitrary/scanned forms, OCR, inferred prose-to-structured-data conversion, or claim of full-fidelity round-trip. Filled PDFs differ from the blank template hash, so import needs separately reviewed structural recognition and validation; filenames or a future manifest are not trusted identity. Recheck processing rights for import and preserve JSON as the canonical backup.
  - _Refinement trigger_: The supported export and mapping are accepted, and an actual user need for inbound PDF data warrants a separate proposal. Review reliable scalar coverage and a non-destructive preview before expanding to collections or additional systems. Keep this outside BL-066's current export-only scope and the P0 playtest gate.

- Explore additional collection facets and optional badge-to-filter shortcuts after BL-078.
  - _Context_: The 2026-10-02 owner refinement approved explicit Runtime Action timing and Spell level/Prepared-only controls while recognizing that category/source badges could invite similar retrieval. The first proof deliberately keeps row badges passive to avoid restoring per-row action clutter.
  - _Direction_: Reuse collection-owned metadata for labels and matching, without inferring facets from arbitrary badges. Consider category/source filters, explicit unprepared retrieval, or limited timing/level badge shortcuts only when they solve observed retrieval friction; consider other searchable collections individually rather than applying every facet everywhere.
  - _Constraints_: Preserve direct primary timing controls, composable text/filters, global matching pins, stable row/detail focus, touch targets, and system-owned semantics. Notes and provenance are not automatically filterable because they use badges. Do not add this as another playtest prerequisite without evidence.
  - _Refinement trigger_: Repeated owner/playtest attempts to filter via a badge, searches that approved facets cannot express, or a concrete later-system/collection need. Refine with a compact proof; use a compact OpenSpec change for a narrow settled retrieval addition, or a full change if multi-surface state or ownership expands. No new ADR is triggered merely by adding an option; amend the existing decision if the ownership or persistence boundary changes.

- Explore mobile section disclosure and collapsed-section discoverability near or during playtest.
  - _Owner evidence (2026-10-08)_: Phone navigation feels substantially better, but consuming the sheet with everything expanded remains overwhelming. The existing headings and icons feel solid; it is uncertain whether they communicate enough about the fields hidden inside a collapsed section.
  - _Explore_: Compare today's independently expanded sections with optional auto-collapse of non-active sections, including a single-expanded-section mode and a way to retain companion sections. Consider concise section subtitles naming contained fields. Define what counts as activation before tying collapse to navigation; do not assume scrolling should change expansion state.
  - _Trade-off to test_: Less visible content may improve scanning while making information harder to discover or compare. In particular, assess whether Runtime Actions' Add/source navigation is sufficient when moving to contributing features, spells, or inventory, or whether players need those sections visible simultaneously. Check for jarring context loss during navigation, editing, and return journeys.
  - _Constraints_: This is an undecided interaction hypothesis, not approval for a mandatory accordion or new collapsed defaults. Preserve the current default-expanded baseline until a human-reviewed proof supports a change; any focused mode should remain explicit, reversible, and compatible with accessible navigation. Keep this distinct from the spacing/layout-density exploration below and coordinate with [BL-083](#investigate-scene-aware-runtime-guidance-and-focus) only where scene-aware behavior is actually implicated.
  - _Timing / refinement trigger_: Revisit in the owner rehearsal immediately before playtest or during early playtest feedback; it is not an additional P0 release prerequisite and need not wait for BL-083's multi-system trigger. Observe section discovery and companion-section use before selecting a pattern, then use a representative in-sheet phone proof to compare alternatives.
  - _Execution recommendation_: Backlog capture only now. Explore before implementation; a selected auto-collapse/navigation policy would likely modify durable sheet-navigation requirements and merits a full OpenSpec change with proof before rollout. No ADR is triggered yet; reassess if the accepted direction changes durable navigation or preference-persistence policy.

- Explore responsive sheet density from narrow phones to wide desktop windows.
  - _Evidence (2026-10-02, BL-085 final review)_: The owner finds large vertical gaps around ability/skill checkboxes on the narrowest layout, despite comfortable desktop spacing; on 2K/4K displays, ability and spell-slot columns feel unnecessarily far apart. These are separate density concerns, not evidence that touch targets should shrink. The current shared field grid adds an 8px row gap while clickable labels grow to at least 44px on coarse pointers or widths below 768px; ability/slot compositions stop at three columns. Actual available CSS/container width and browser zoom matter, not physical display resolution alone.
  - _Explore_: Measure label hit areas separately from inter-row gaps, nested panel padding, and text wrapping. Compare tighter non-interactive spacing on phones, container-aware column counts/minimum track widths, and bounded content widths or additional columns on roomy layouts. Use real Abilities/Skills, slots, currency, and mixed prose/collections at sparse and saturated data sizes, with navigation expanded/minified and Rules open/closed. Keep the BL-085 selective centered-stat presentation independently reversible; alignment is not a density solution.
  - _Constraints_: Preserve the 44px touch-owner policy, non-overlapping targets, visible labels/focus, reading/tab order, default-expanded content, text zoom, stable read/edit geometry, and system-native grouping. Do not solve whitespace by adding undisclosed activation, hiding fields, or spreading global breakpoint overrides through the route.
  - _Priority / refinement trigger_: Deferred polish, not a new P0 prerequisite. Refine when the owner requests a dedicated viewport review or playtest evidence shows excessive scrolling/scanning; promote any actual clipping or unreachable-control defect separately as a blocker.
  - _Execution recommendation_: Refine the viewport/region scope, then use a full OpenSpec change if coordinating responsive behavior across these shared layouts, with an in-sheet desktop/phone proof before propagation. That work likely modifies durable sheet-layout requirements and benefits from design/task sequencing. No ADR is triggered yet unless it changes the existing layout or touch-policy decision; a subsequently isolated gap-only CSS correction can remain direct/ad hoc with no spec delta.

- Explore a user-selected light/dark/system mode for each theme.
  - _Evidence_: During BL-085 proof approval, the owner noticed that system dark mode gives checkboxes unexpectedly different coloration from light mode. This is a visual exploration request, not a confirmed browser defect.
  - _Direction_: Compare explicit light/dark choices with following the device preference; refine whether the preference is remembered per theme or globally. Include native checkbox/input color-scheme and accent consistency, readable contrast, and keyboard focus in the proof.
  - _Priority / trigger_: Lower-priority optional polish, not a playtest prerequisite. Refine when the owner requests it (possibly before or during playtest), or when playtest feedback demonstrates a theme-mode usability problem. Preserve system-following behavior and accessibility while evaluating alternatives.

- Revisit batch collection organization only when more-than-pinning needs are demonstrated.
  - _Why_: The `BL-077` Organize Collection proof produced a clean add/remove/reorder interaction, but adopting it across collections now would add a competing collection-level action, partially duplicate established Pin/Unpin priority, and prematurely assume that general, class-owned, source-owned, and minimal records share lifecycle and ordering rules.
  - _Current direction_: Preserve the working interaction in `Concepts / Deferred Collection Organizer / Deferred Batch Organization` as Storybook-only design evidence (relocated by BL-086 to `src/lib/storybook/concepts/`). For the BL-077 rollout, use first-class record-level Pin/Unpin for priority, direct collection-level Add for creation, and focused eligible Remove for one record. Keep the reusable batch pin manager dormant rather than exposing a competing action. Do not add generic reorder or Organize Collection production UI.
  - _Explore_: If triggered, compare the preserved batch organizer and dormant batch pin manager with domain-specific multi-select removal, batch creation, canonical-order editing, and repeated record-level priority changes. Resolve ownership-specific removal, generated/source-owned records, destructive recovery, keyboard/touch ordering, and whether any domain actually needs canonical manual reorder beyond pinning.
  - _Constraints_: Do not conflate player priority with canonical order, expose system-owned records to unsupported deletion, reintroduce rich-record or annotation bulk editing, or scale one 5e collection's structure into a cross-system contract.
  - _Refinement trigger_: Promote only if owner or external-playtest evidence shows repeated multi-record add/remove/reorder work that direct Add, focused Remove, and individual Pin/Unpin actions make materially slow or confusing, or before a specific domain requires authored canonical ordering that pinning cannot represent.

- Explore cross-record note review only if record-scoped discovery stops scaling.
  - _Why_: `BL-077` deliberately uses quiet per-record note counts plus focused detail instead of a collection-wide `Annotated Items` surface. The proof showed that the overview duplicated navigation without displaying the note content and made its count ambiguous between annotated records and total notes.
  - _Current direction_: Keep annotation review attached to the record that gives it context. Do not retain collection-wide annotation editing or add a read-only overview for the first rollout.
  - _Explore_: If evidence triggers follow-up, compare a genuine cross-record note reader, filtered collection view, and note search that expose useful note context rather than merely listing record names. Use consistent `note` vocabulary and navigate back to the owning record without creating a second editing model.
  - _Constraints_: Preserve record identity, provenance, collection query/scroll context, keyboard and phone usability, and the atomic focused Edit boundary. Record lifecycle and priority actions must not absorb note editing.
  - _Refinement trigger_: Promote only if owner or external-playtest evidence shows that users accumulate enough notes that per-record indicators and focused detail make cross-record review materially slow or undiscoverable.

- Explore whether `Quick Reference` remains a distinct Runtime landmark or becomes part of top-level character information after the navigation baseline has real use evidence.
  - _Why_: Armor Class, Hit Points, Speed, and similar frequently consulted values may feel like an at-a-glance identity summary rather than a separate retrieval destination. Folding them into Overview could shorten the landmark rail, but it could also mix relatively stable character identity with mutable table-time state and make a valuable direct jump less precise.
  - _Current direction_: Preserve the existing distinct, default-expanded `Quick Reference` region through `BL-073`; changing the landmark and sheet organization during icon review would exceed its approved bounded split. Use the navigation proof and first playtest to observe whether users deliberately jump there, confuse it with Meta / Top-level Info, or expect those values to remain visible alongside identity.
  - _Explore_: Compare the current Runtime landmark, a compact persistent identity/runtime summary, and a merged Overview composition; determine whether the right answer varies by game system rather than becoming a universal sheet rule. Coordinate with `BL-083` only if evidence calls for scene-aware or persistent computed summaries.
  - _Constraints_: Keep canonical values single-owned, preserve default-expanded access and responsive density, avoid turning Overview into another oversized mixed-purpose panel, and do not generalize 2014 information architecture across systems.
  - _Refinement trigger_: Promote only if owner or external-playtest evidence shows that Quick Reference is rarely used as a destination, is consistently mistaken for top-level information, or that separating it materially worsens at-a-glance play.

- Explore exact-match highlighting in the app-controlled PDF viewer after page-level Find has playtest evidence.
  - _Owner feedback (2026-10-04, BL-082 proof)_: The improved reader was reported solid with no bugs detected; the owner requested highlights in both PDF content and contextual results. Agreed split: add preview highlighting within BL-082, retain in-PDF highlighting here for separately planned text-layer/resize/remount integration. Preview highlighting does not complete this follow-up.
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

- Revisit duplicate closed-reader history entries only if they cause observed navigation friction.
  - _Accepted baseline (2026-10-09)_: The owner accepts BL-082's in-place Close: dismissing Rules preserves the current sheet section and scroll position, while browser Back retains invocation-context navigation. Opening adds a history entry; explicit Close replaces it with a closed entry. Repeated open/Close without sheet movement can therefore accumulate same-location closed entries, making some Back presses appear to do nothing. See the [viewer navigation decision](decisions/2026-08-30-control-self-hosted-pdf-navigation.md) for rationale.
  - _Latent trigger_: Revisit only when the owner or a player reports annoyance, confusion, or repeated apparently ineffective Back presses attributable to this sequence. Record the opening location, any sheet jumps/manual scrolling, open/Close repetitions, browser/device, and expected versus observed Back/Forward behavior. This is not a P0 prerequisite or automatically scheduled cleanup; without that evidence, retain the accepted behavior.
  - _Candidate investigation_: Compare keeping the baseline with conditionally consuming the reader entry on Close only when the original sheet context, scroll position, and history ownership remain safely unchanged. URL equality alone is insufficient. This is an option to evaluate, not an approved implementation; avoid Back-then-restore races or private router-history indexes merely to tidy the stack.
  - _Constraints_: Close and resize-to-close must not undo independent sheet navigation or scrolling, focus restoration must not pull an offscreen invoker into view, and browser Back must still dismiss an open sheet-invoked reader. Preserve direct-locator behavior, drafts, and normal closed-sheet navigation; do not couple this to reader resume-position persistence.
  - _Execution recommendation_: Capture only now; investigate after the trigger. A settled narrow history-policy revision would likely merit a compact OpenSpec change with regression coverage and a human navigation proof, plus an amendment to the existing viewer ADR rather than a new decision record. Reassess scope if shared navigation ownership must change.

- Explore resuming document reading after closing and reopening the Rules reader.
  - _Owner evidence (2026-10-07, BL-082 proof)_: Navigate to a later PDF page, close Rules, then reopen it; the general entry resets to page 1. The owner asked whether reference navigation and Find state should persist in local storage.
  - _Owner-approved follow-up direction (2026-10-08)_: Start with lightweight per-document/version session state for the last page and query; general Rules entry resumes it, while explicit contextual references always take precedence. The owner accepts keeping this backlogged rather than adding persistence during BL-082. Release PDF workers/rendered pages on close, and do not persist extracted text, result lists, or an index. Restoring a query must not present stale results as a completed search.
  - _Longer-lived option_: Consider a small validated local preference for the last page across visits; decide separately whether remembering search text is wanted. Keep this out of character data and exports, handle unavailable storage and document-version changes safely, and do not conflate it with authored source pins or `BL-080` PDF-byte storage.
  - _Refinement trigger_: Before implementation, refine session/reload lifetime, query rerun behavior, and document-wide versus character-specific ownership; longer-lived persistence is a separate option. The current BL-082 reset-on-close contract remains until the follow-up is promoted and its behavior specified.

- Explore a reflowing desktop sheet/reference split workspace after playtest evidence.
  - _Related bounded work_: BL-087 addresses rules access alongside a focused editor; it does not promote this broader whole-sheet reflow/docking exploration.
  - _Why_: The `BL-069` overlay now supports bounded width adjustment, but it still covers part of the character sheet instead of letting the sheet and reference share a coordinated workspace. Simultaneous comparison may be valuable for rules-heavy edits, especially on wide displays.
  - _Current direction_: Keep the resizable non-modal overlay for the first playtest. Later compare an app-shell split that reflows the sheet, dock/undock behavior, a movable divider, and whether a remembered allocation is worth the state complexity. Reuse the accessible horizontal-resize contract where it fits without assuming that viewer-local widths define whole-app layout.
  - _Constraints_: Preserve phone full-screen navigation, sheet and draft state, browser Back/Close behavior, readable minimum widths, keyboard and coarse-pointer operation, and a simple default for users who never resize. Do not persist a layout in character data or let either pane become unreachable.
  - _Refinement trigger_: Promote only if owner or external-playtest use shows repeated need to read the sheet and rules document simultaneously, or if the fixed overlay still obstructs core desktop work after bounded resizing.

- Explore catalog-derived sheet guidance if contextual References remain insufficiently discoverable.
  - _Refined dialog slice (2026-10-25)_: BL-087 now owns system-provided references within focused editing and reader/editor coexistence. This remaining sandbox concerns first-use, empty-sheet, and tutorial discoverability outside that scope; do not duplicate the dialog work here.
  - _Why_: `BL-069` will place focused References actions near character/class, equipment, and spell content, but a newly created character may still leave a player unsure that relevant SRD guidance exists or what a particular action will open. Persistently seeding the same locators as annotations on every character would duplicate global catalog knowledge, pollute exports, and create unclear refresh/removal semantics when the catalog changes.
  - _Current direction_: First test `BL-069` on a newly created empty character. If its contextual actions are not self-explanatory, prefer version-aware, non-persisted hints projected from the resource catalog near the relevant sheet sections. Reserve authored example annotations for an explicitly identified tutorial or sample character rather than ordinary character factory defaults.
  - _Explore_: Compare clearer References labels or nearby source summaries, quiet first-use cues, catalog-derived section hints, and one or two tutorial/sample-character examples. Determine whether guidance should appear only on empty sections, until first use, or whenever a relevant locator exists.
  - _Constraints_: Keep system/catalog guidance distinct from editable user annotations; do not clone catalog locators into character storage or JSON exports; preserve catalog ownership of source identity, version, and locator health; do not introduce re-seeding, synchronization, or deletion semantics unless a later persisted-guidance proposal explicitly justifies them.
  - _Refinement trigger_: Promote only if the `BL-069` owner review or external playtest shows that users miss the Class, Equipment, or Spell References action, cannot predict its destination, or need more guidance than its label and local context provide.

- Explore desktop collection scroll ownership and Misc. Notes as a possible next dense consumer.
  - _Why_: Bounded inline lists control sheet height, but mouse-wheel input over a still-scrollable collection can interrupt top-to-bottom sheet scanning. The saturated fixture also demonstrates that Misc. Notes & Scratchpad can grow beyond the short/simple case even though `BL-064` intentionally limited its first rollout to equipment and spells.
  - _Current direction_: Keep normal scroll chaining at collection boundaries as the narrow `BL-064` mitigation. Do not adopt collapse-by-default yet: hiding collection contents may trade scroll friction for weaker at-a-glance runtime access. Leave Misc. Notes on its current singular focused structured-card path until a dedicated proof confirms that searchable identity-owned rows improve it.
  - _Explore_: Compare bounded inline scrolling, an explicit expand state, focused browsing on every viewport, compact/collapsed previews, and wheel delegation where technically reliable. For notes, evaluate title/body search, stable row Detail and note indicators, record-scoped editing/removal, note-kind context, empty behavior, ordering, and whether the complete collection should use the proven dense-list boundary.
  - _Constraints_: Preserve full item reachability, authored order, stable IDs, annotations, keyboard/touch access, source navigation, and sheet landmarks. Avoid scroll-jacking scripts and do not force every non-target collection into the dense pattern.
  - _Refinement trigger_: Use the ownership seam established by completed `BL-074`, then promote a separate observable-behavior proposal before first external playtest if owner rehearsal still finds desktop scanning disruptive or scratchpad saturation likely.

- Explore responsive collection-row quick actions and optional gestures after the focused-detail baseline has real use evidence.
  - _Related bounded work_: BL-088 owns immediate read-first field edit-affordance refinement. It does not promote this broader domain-command, context-menu, or gesture exploration.
  - _Why_: `BL-077` replaces ordinary row Edit/Notes menus with adjacent first-class Detail and Pin/Unpin controls while retaining explicitly labeled menus only for genuinely distinct commands such as Runtime Action source navigation and resync. Other frequently used domain commands may eventually merit one-step access on larger screens or optional mobile acceleration, but adding them prematurely could overwhelm dense rows.
  - _Current direction_: Keep visible Detail plus state-sensitive Pin/Unpin as the canonical repeatable-record path, focused detail as the value/annotation path, and source-specific menus only where their command family is distinct. Treat additional shortcuts, platform context-menu enhancements, and optional gestures as future exploration; do not make right-click, long-press, or another hidden gesture the only path for any command.
  - _Explore_: Inventory which remaining domain commands merit selectively surfaced desktop actions or mobile acceleration; compare direct quick actions, platform context-menu enhancement, and optional gestures; evaluate responsive command priority, discoverability, touch density, tab-order cost, and whether the accepted BL-077 Detail/Pin grammar is already sufficient.
  - _Constraints_: Every gesture has an equivalent visible/menu command; destructive actions require confirmation or a recoverable undo path; responsive shortcuts must not create an excessive tab order or make the same command appear ambiguously in multiple places; a shared command presentation must not imply shared domain mutations.
  - _Refinement trigger_: Revisit in Horizon B after the row-level Pin/Unpin and dense-collection baseline have been used on touch, pointer, and keyboard workflows, or earlier if owner rehearsal shows that individual priority changes materially obstruct frequent reprioritization and justify restoring a batch surface.
- Explore discoverability cues for globally pinned spells after playtest evidence.
  - _Why_: Completed `BL-075` moves each pinned spell into one global tier and renders it only once. A player who forgets that they pinned a spell may browse its former level group or alphabetical position and incorrectly conclude that it is missing.
  - _Current direction_: Keep the accepted once-only global tier, visible level/preparation context, and one cross-level search workflow. Do not duplicate actionable spell rows solely as a precaution because duplicate counts, focus destinations, search results, and row actions would become ambiguous.
  - _Explore_: If evidence warrants it, compare a lightweight per-level notice such as “2 pinned spells shown above,” a jump-to-pinned-spells link, and other non-duplicating wayfinding cues. Check whether search and the visible pinned tier already resolve the confusion before adding another control or label.
  - _Constraints_: Preserve one actionable row per spell, one spell-search workflow, accurate counts, stable focus restoration, compact phone previews, and visible spell-level/preparation context. Do not introduce a second search bar or silently return pinned spells to their former groups.
  - _Refinement trigger_: Promote this into a refined backlog item only if repeated owner or external-playtest evidence shows that players overlook pinned spells while browsing their expected level groups, or if another spell-navigation change needs to resolve the same wayfinding problem.
- Explore source-backed runtime actions as source content plus explicit player overrides rather than fully materialized snapshots.
  - _Why_: Under the current snapshot contract, ordinary edits change the same `name` and `notes` fields that explicit resync later replaces, so resync can erase intentional player detail even though the action remains linked.
  - _Playtest decision (2026-07-25)_: Retain snapshot-and-explicit-resync semantics for the multi-source expansion, with a required overwrite warning before resync. An override-aware persisted model remains a future refactor.
  - _BL-070 decision (2026-10-23)_: The owner selected bounded 2024 source-assisted snapshots with explicit overwrite warnings and detach-on-delete, alongside custom actions. This sandbox owns richer inherit/override/refresh semantics, not the included snapshot workflow. Refine if owner/player rehearsal reveals repeated loss of useful player-customized copied text or avoidance of refresh because the warning is too coarse; preserve independent action notes and timing in the meantime.
  - _Explore_: Separate source-derived base values from player overrides; per-field modes such as inherit, replace, or append; a resync review that lets the user choose which base or effective fields may be replaced; and a deliberately shallow link that computes effective display content without weakening offline ownership.
  - _Constraints_: Never discard player-authored content silently, preserve deterministic data evolution and source-deletion fallback, keep current 5e behavior usable offline, and avoid a generic cross-system override framework until concrete spell/feature cases justify one.
  - _Open questions_: Which fields are source-owned, how normal editing creates or clears an override, whether annotations are always action-owned, how source deletion materializes the effective action, and whether the persisted model stores base values, override operations, or both.
  - _Refinement trigger_: Revisit after inventory, spell, and feature snapshots have broader playtest evidence, or before a schema change that needs per-field source provenance.
- Explore optional system-native default action assistance.
  - _Why_: BL-070's 2026-10-16 refinement distinguishes actions created from existing character-owned records from common rules actions a player may otherwise need to transcribe. Neither a manual baseline nor source templating automatically supplies those defaults.
  - _Current direction_: Offer a small, explicitly accepted starting set only if it saves repeated work; retain manual/custom actions and editable player-owned records. System timing, source/version, and eligibility remain domain-owned, not universal core assumptions.
  - _Constraints_: No silent population, compulsory rules engine, or normalized compendium. Do not conflate this with BL-070's current source-assistance decision or automatically copy 2014 terminology/mechanics into 2024.
  - _Refinement trigger_: Owner/playtest users repeatedly recreate the same rules actions or cannot find a commonly needed action despite the approved collection controls; choose a bounded candidate set and proof before prioritization.
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

- `2026-10-28` completed `BL-070`: delivered the owner-approved authored 2024 sheet, minimal system lifecycle/dispatch, protected rejected-data recovery and mixed JSON workflows, shared interaction/navigation/source-detail controls, and paired official-sheet coverage decisions. Archived six capability deltas and verified the major toolchain maintenance; the bounded deepmerge audit exception, browser watches and device gaps remain explicitly owned by BL-072.

- `2026-10-16` completed `BL-086`: reorganized shared UI and system-owned compositions, delivered isolated production-backed Bryltin/Zindra/Saturated Pages and generic Tier 1/2/3 sandboxes, retired superseded proofs with mapped evidence, and documented naming, ownership, reuse, and contributor navigation. Final approval and archival preserve accepted verification limitations and backlog-owned follow-ups.

- `2026-10-10` completed `BL-082`: shipped the owner-approved compact rules reader, shared Find/Outline/page tools, highlighted collapsible results, stream-text compatibility correction, and independent desktop sheet scrolling with in-place Close. Archived verification preserves the accepted physical Android gap, monitored WebKit scroll reset, and narrowly approved development advisory exception; BL-072 owns the follow-ups and security recheck deadline.

- `2026-10-03` completed `BL-078`: shipped owner-approved shared quickfilter chips composing Runtime Action timing and Spell level/Prepared state with text, independent resets and no-match recovery, filtered phone previews, and persisted action pins with stable identity/source lifecycle; archived proof, integrated review, and passing cross-browser/performance evidence
- `2026-10-02` completed `BL-085`: shipped owner-approved label-targeted read-first Detail with independent field/note Save/Cancel, dirty-navigation protection, full candidate validation, stable collection identity and focus, compact read-first spell slots, and shared selective stat alignment; removed redundant detail chevrons, retained explicit creation/removal and specialized source workflows, and archived the production-backed proof and verification evidence
