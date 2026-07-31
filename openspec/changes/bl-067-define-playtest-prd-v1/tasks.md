## 1. Durable Vision and PRD v1

- [x] 1.1 Capture the author's primary product jobs, runtime-and-authorship north star, system-data direction, horizons, rights constraints, PDF interoperability desire, and vision-level priority queue in `docs/vision/author-desires.md`
- [x] 1.2 Link the author-desires artifact from `docs/vision/index.md` and `docs/index.md`
- [x] 1.3 Add an advisory `AGENTS.md` trigger to consult author desires during roadmap exploration and proposal refinement without making the decision filter an execution gate
- [x] 1.4 Draft `docs/vision/PRD-v1.md` as a target-state first-external-playtest contract that clearly distinguishes target behavior from the current 2014-only implementation
- [x] 1.5 Define the three-system playtest matrix for 2014 5e, one project-adopted current 2024 SRD release, and Shadowdark, including one representative player character and one intentionally sparse sidekick/NPC scenario per system while preserving an evidence-driven lite-mode option
- [x] 1.6 Define measurable playtest-readiness and product-v1.0 decision gates covering mobile table use, data safety, fast runtime access, flexible quick notes, backup/restore, resource finding, and critical-blocker reconciliation
- [x] 1.7 Define PRD v1 approval, playtest readiness, first external playtest/schema-v1 activation, findings reconciliation, and product v1.0 as separate milestones
- [x] 1.8 Update `docs/vision/index.md` and `docs/index.md` to index PRD v1 while preserving PRD v0 as historical context

## 2. Rights-Safe Reference Strategy

- [x] 2.1 Create a maintainer-facing rules-resource policy that defines redistributable, link-only, user-local, and unavailable classifications plus the evidence and attribution required for each, preferring self-hosting for verified redistributable PDFs
- [x] 2.2 Add a source register for the 2014 SRD, the single project-adopted current 2024 SRD release, and Shadowdark quickstart that records authoritative URL, exact version, rights evidence, self-host/link-only decision, attribution, and unresolved constraints
- [x] 2.3 Record the Shadowdark written-permission or qualified-review requirement as a blocking gate for its future implementation proposal, clarify that the result controls permitted source integration rather than silently removing Shadowdark, and define when a fourth CC-licensed playtest system would merit explicit consideration
- [x] 2.4 Create a lightweight ADR for the hybrid rights-classified resource strategy and link it from the docs index
- [x] 2.5 Define the first-playtest reference minimum as resource and curated-section search, lawful document navigation, and contextual editor locators; distinguish that navigation index from a normalized compendium and explicitly defer arbitrary ingestion, OCR, semantic search, and general-purpose rules APIs

## 3. Multi-System Architecture and Epic Decomposition

- [x] 3.1 Audit the current shared schema's required identity plus root features, inventory, notes, and annotations against 2024 and Shadowdark needs; distinguish lifecycle metadata from 5e-shaped persistence and evaluate a smaller core plus system-specific computed views
- [x] 3.2 Refine the existing sheet-architecture ADR for the now-concrete second-system trigger: extract only evidenced lifecycle and computed-view seams during 2024 work, treat 5e-family reuse as non-universal, and validate the boundary with Shadowdark
- [x] 3.3 Document that 2014 5e, 2024 5e, and Shadowdark retain explicit system identities, system-specific schemas, rules versions, projections, edit behavior, and layouts even when shared lifecycle infrastructure emerges
- [x] 3.4 Scan active, archived, and Git-history backlog identities, then allocate priority-neutral IDs for resource-rights/Shadowdark feasibility, reference navigation, core-boundary plus multi-system/2024 support, Shadowdark support, and cross-system playtest hardening
- [x] 3.5 Refine each new epic in `docs/backlog.md` using Purpose, Included behavior, Excluded behavior, Ambiguities, and Success, including its dependency gates and likely OpenSpec/ADR classification
- [x] 3.6 Keep `BL-064` as the Horizon A heuristic baseline for dense-collection discovery, focused row editing, and annotations before external playtesting, then reserve Horizon B for feedback-driven refinement without creating a universal list framework
- [x] 3.7 Sequence the candidate epics so rights feasibility and core/PDF evidence arrive early, reference navigation is proven against 2014, 2024 supplies second-system evidence, Shadowdark validates the boundary after its gate, and cross-system hardening closes the playtest program

## 4. Fillable-PDF Interoperability and Schema Evidence

- [x] 4.1 Inventory the canonical or publisher-provided editable character-sheet PDFs available for 2014 5e, the adopted 2024 rules release, and Shadowdark, recording form version, source rights, redistribution status, and stable field identifiers
- [x] 4.2 Produce a mapping matrix between each fillable form and proposed system data/computed views, identifying lossless fields, transformations, capacity limits, unsupported application data, and round-trip risks
- [x] 4.3 Keep validated system documents and JSON as the full-fidelity persistence boundary; document why external PDF layouts inform but do not dictate canonical schemas
- [x] 4.4 Revisit `BL-066` after the mapping audit, splitting or reprioritizing bounded fillable-PDF export/import slices and explicitly deciding which, if any, are first-playtest prerequisites
- [x] 4.5 Preserve image, scan, non-fillable PDF, OCR, and inference workflows as later separately specified capabilities with human review and non-destructive failure behavior

## 5. Active Scope and Compatibility Reconciliation

- [x] 5.1 Update `docs/active-goals.md` to distinguish the shipped 2014 baseline from the active three-system playtest target and to exclude systems and horizons beyond PRD v1
- [x] 5.2 Preserve the current-status inventory for implemented, partial, missing, and deferred work while adding links to PRD v1 and the author-desires horizon document
- [x] 5.3 Reconcile the pre-release warning and character-versioning language so PRD approval does not freeze schemas, the first external playtest activates durable v1 decisions after the core/PDF audits, and no general v0 migration is promised
- [x] 5.4 Verify that `docs/vision/system-design-notes.md`, PRD v0, PRD v1, active goals, the architecture ADR, the resource-policy ADR, and PDF-interoperability direction do not contradict one another about system priority, core-schema weight, registry timing, resource rights, or current behavior

## 6. Verification

- [x] 6.1 Run `openspec validate bl-067-define-playtest-prd-v1 --strict` and correct all artifact errors
- [x] 6.2 Run `git diff --check` and verify every new repository link is repo-relative and resolves to an existing or same-change target
- [x] 6.3 Review official source citations and ensure the repository distinguishes verified facts, project policy, unresolved permission, and non-legal product-risk guidance
- [x] 6.4 Perform a final cross-artifact review confirming that no application feature is represented as implemented and every future implementation epic has a bounded next workflow

## 7. Backlog Updates & Reconciliation

- [x] 7.1 Remove `BL-067` from the active priority queue and refined catalog, then add a brief timestamped completion entry to `Done Recently` while keeping that section bounded to the 3-5 most recent items
- [x] 7.2 Reconcile the `Next Recommended Sequence` heading and ordered targets around the newly allocated playtest epics, retained `BL-064`, and refined `BL-066`, marking permission-blocked or audit-dependent targets explicitly
- [x] 7.3 Confirm `docs/active-goals.md` names the next current delivery boundary and links to the approved PRD v1 rather than using the completed BL-067 planning item as an execution checklist

## Executor Recommendation

Use a complex planning model at high reasoning. The apply work is documentation-only but requires holistic product scoping, licensing-risk precision, architecture sequencing, backlog identity management, and cross-artifact reconciliation; Antigravity Pro/High is the preferred fit, with Codex Sol also suitable if the work remains tightly grounded in repository evidence.
