## Context

PRD v0 gave ez-chars a productive starting point: a local-first Svelte application, a substantial D&D 5e 2014 sheet, explicit runtime-versus-organizational presentation, annotations, JSON backup, and a pre-playtest schema policy. The implementation and active goals are intentionally 2014-only, while the long-term vision includes many systems, character building, richer rules sources, NPC support, and eventual integration with another GM tool.

That gap is now the largest planning risk. Treating all long-term desires as the next milestone would multiply schemas, sheets, document processing, automation, and legal uncertainty at once. Leaving the milestone implicit would let individually reasonable changes accumulate without demonstrating the two primary product jobs: helping friends maintain player characters and helping the author manage sidekicks or NPCs.

The existing architecture also reached its deliberate generalization trigger. The sheet-architecture ADR deferred a system registry until a second concrete system supplied evidence. The target now includes two additional systems, but the current repository still has one system-specific route, factory, parser, serializer, and sheet projection. This planning change must identify the future seams without implementing them or freezing a universal sheet API.

The current shared character schema is not yet minimal: it requires a common identity record and places optional features, inventory, notes, and annotations at shared root locations in addition to opaque system data. Those shapes are useful to the implemented 2014 sheet, but they may turn 5e concepts into requirements for unrelated systems. The second-system work should therefore audit the persisted core itself, not merely add dispatch around it. System-specific computed views may be a better way to supply shared list labels, summaries, search records, and interoperability projections.

The repository also treats its typed local document and JSON envelope as the full-fidelity data boundary while an official 5e PDF workflow remains deferred. Fillable character-sheet PDFs can provide valuable evidence about stable system concepts and useful interchange, but their finite fields and varying form conventions can also discard annotations, extended collections, provenance, or other application data. They should inform the schemas before v1 freezes without becoming the only canonical store.

Rules-resource rights differ materially:

- the D&D SRD 5.1 and 5.2 lines are available under CC BY 4.0 with version-specific attribution;
- Shadowdark's quickstart is free to obtain, but the official third-party-license FAQ says character-building apps are outside that license and distinguishes permitted bibliographic references from reprinting broader rules content.

The public product therefore cannot equate free access with permission to bundle, ingest or full-text index, excerpt, or transform a source. Conservative bibliographic indexing remains available under the source-specific policy. This is a product-risk boundary rather than legal advice.

## Goals / Non-Goals

**Goals:**

- Establish one unambiguous document hierarchy for author intent, target product requirements, active delivery scope, prioritized epics, and executable change tasks.
- Define the first external playtest around 2014 5e, 2024 5e, and Shadowdark without requiring all long-term capabilities.
- Preserve both primary product jobs in testable playtest scenarios while avoiding a premature dedicated NPC model.
- Separate PRD approval, playtest readiness, schema-v1 activation, external playtesting, and product-v1.0 release.
- Define a rights-safe minimum resource experience and explicit expansion gates for uncertain source uses.
- Prefer stable self-hosted PDFs and derived navigation indexes when verified source rights allow them.
- Recommend a staged multi-system architecture based on concrete system implementations.
- Audit whether the persisted cross-system core should shrink in favor of system-owned data and computed shared views.
- Preserve a familiar accessible interaction language across system-native sheets without predefining a universal renderer.
- Test both sparse and campaign-saturated data before external handoff.
- Evaluate fillable-PDF mappings early enough to influence, but not dictate, durable schema decisions.
- Produce separately refinable, dependency-ordered backlog epics rather than one umbrella implementation change.

**Non-Goals:**

- Implementing a new system, route, schema, registry, PDF viewer, search engine, or reference UI.
- Changing current persisted character shapes, storage envelopes, exports, or migration behavior.
- Implementing fillable-PDF import/export, image ingestion, or OCR in this documentation change.
- Designing a complete character builder or dedicated NPC/stat-block schema.
- Selecting a PDF rendering or indexing dependency before the resource-navigation epic measures its actual needs.
- Granting legal approval or inferring redistribution rights from a zero-price download.
- Replacing the existing legacy design documents merely to increase OpenSpec coverage.

## Decisions

### 1. Give each planning document one job

The repository will use this hierarchy:

| Artifact | Question it answers | Authority |
| --- | --- | --- |
| `docs/vision/author-desires.md` | Where does the author ultimately want the product to go? | Durable intent and horizon filter; not active scope |
| `docs/vision/PRD-v1.md` | What target experience earns the first external playtest and later v1.0 consideration? | Approved target-state product contract |
| `docs/active-goals.md` | What is currently implemented, actively in scope, partial, missing, and deferred? | Current implementation boundary |
| `docs/backlog.md` | Which independently refinable work is next? | Priority and sequencing |
| `openspec/changes/<change>/` | Why, what, how, and which tasks deliver one approved slice? | Active execution source |

PRD v1 must label target behavior as target behavior. It must not make the application appear to support three systems before the corresponding epics are complete.

Alternative considered: replace active goals with PRD v1. Rejected because a target-state PRD and current-state execution boundary answer different questions; combining them increases agent confusion during a multi-epic milestone.

### 2. Treat PRD v1, schema v1, and product v1.0 as separate milestones

The milestone sequence will be:

```
PRD v1 approved
      |
      v
playtest epics implemented and verified
      |
      v
playtest-ready review
      |
      v
first external playtest begins
  (supported system schemas enter durable v1 compatibility)
      |
      v
findings reconciled across all three systems
      |
      v
product v1.0 release decision
```

Approving PRD v1 does not exit pre-release. The actual first external playtest is the compatibility boundary defined by the existing schema-versioning ADR. Immediately before that boundary, each supported system must have an explicit decision about whether its final experimental v0 shape receives a one-time v0-to-v1 migration. There is no general promise to preserve older experimental v0 records.

Alternative considered: call the first external playtest product v1.0. Rejected because playtesting is intended to find product-level gaps across three systems; the release label should follow reconciliation rather than precede it.

### 3. Test both product jobs without creating an NPC product mode

The playtest matrix will require:

- a representative player character in each of the three systems;
- a sidekick or NPC record in each system using intentionally sparse data;
- rapid switching, runtime review, and quick note entry for the GM scenario;
- no requirement that irrelevant or unknown player-character fields be filled.

This tests whether the current character-document idea serves both jobs. Sparse use is the preferred first hypothesis, not a prohibition: a dedicated compact stat-block presentation or lite schema may be promoted earlier if schema/PDF analysis or heuristic evaluation exposes concrete friction before external playtesting.

Alternative considered: require separate PC and NPC schemas before playtesting. Rejected as the default because the distinction is not yet supported by interaction evidence and would triple schema and layout decisions before the core job is tested. The roadmap nevertheless preserves that option rather than requiring one sheet to fit every use case.

### 4. Use a rights-classified hybrid resource model

Every planned resource will be classified as:

- **redistributable**, with verified license or permission and recorded attribution;
- **link-only**, when bundling or full-text processing rights are absent or unclear, whether the source is free or user-owned paid material;
- **user-local**, reserved for a separately reviewed future on-device workflow;
- **unavailable to the public product**, when appropriate rights are absent.

The first-playtest reference capability will be document-oriented. Its minimum useful behavior is to search resource titles and curated section metadata, identify a relevant result such as spells or equipment, and navigate to the corresponding document location or lawful external source. Contextual links may expose that same locator from an editor. Full rules records, cross-document semantic search, OCR, and arbitrary ingestion are not required.

A searchable navigation index is not the same product boundary as a normalized rules compendium. The former stores source and edition identity, independently authored descriptions, section labels, topics, pages, anchors, acquisition URLs, and other locators; the latter stores queryable rules entities and their structured content. The navigation index is required for the playtest. It may contain more than one source map for a system/topic—for example a free quickstart and a user-owned core book—without supplying the paid material. A normalized compendium remains a separate expansion even if licensed materials eventually make it feasible.

For redistributable material, self-hosting is the preferred default because it stabilizes URLs, keeps references close to the application, and can improve offline access. The resource-navigation epic may also evaluate derived indexes or in-app text search within the verified license. For link-only material, the plan must remain at conservative bibliographic metadata, external navigation, and independently authored descriptions. It must not reproduce source expression, substantial tables of contents, tables, stat blocks, excerpts, or full text. The design must not promise identical implementation mechanics across rights classes.

The D&D SRD 5.1 and 5.2 PDFs are CC BY 4.0 materials. That license permits sharing copies with attribution, so the project may self-host a selected PDF while keeping it clearly marked as third-party CC material. Inclusion does not change the license of the separately authored application or repository as a whole; the source PDF keeps its own license and notices.

Alternative considered: bundle every free PDF for a uniform offline experience. Rejected because price does not determine redistribution or processing rights. Link-only for every source was also rejected because it would unnecessarily discard the offline and indexing rights available for CC-licensed SRDs.

### 5. Make Shadowdark a required target with a conservative external-source baseline

Shadowdark remains a required first-playtest system because its different rules shape is valuable product and architecture evidence. The official publisher FAQ says character-building apps are outside the third-party license, but also expressly permits general page and name references as bibliographic citations. The public baseline may therefore proceed as a system-native container for user-authored data plus authoritative acquisition links and conservative page/name locators. It must not claim official status or rely on the third-party license as character-builder authorization.

Written permission or qualified review remains an expansion gate before bundling, redistributing, excerpting, full-text ingest/indexing, official-form interoperability, restricted branding/assets, or other behavior beyond that baseline. The owner does not plan to seek permission merely to host the PDFs, so the roadmap must not make that request a prerequisite for the bounded sheet and locator experience.

The owner may use a lawfully obtained local PDF with a locally controlled tool or agent to draft locator candidates. Source bytes must remain under the owner's control; only human-reviewed bibliographic facts and independently authored locator descriptions may enter the repository. Source bytes, extracted text, embeddings, copied tables, and excerpts do not. Sending the source to a third-party service requires separate terms, privacy, and rights review. This is conservative product-risk guidance, not a legal conclusion.

If that constraint makes the reference playtest materially weaker, PRD v1 may consider adding a fourth CC-licensed system for resource-integration evidence. That is an explicit scope decision, not an automatic substitute for Shadowdark and not a prerequisite merely because the systems have different licenses.

### 6. Audit and stage the multi-system boundary through concrete systems

The implementation roadmap should not begin with a universal renderer or speculative adapter. It should first inventory which current shared fields are truly lifecycle metadata and which are 5e-shaped conveniences. The leading direction is a small persisted envelope plus system-owned data, with system-specific computed views serving shared application needs. Shared annotations, references, and similar primitives may remain reusable types without forcing identical root placement.

The recommended sequence is:

1. Use the existing 2014 system as the baseline.
2. Compare the 2014 document, a proposed 2024 document, Shadowdark requirements, and their computed list/summary needs before approving the next persisted core.
3. Add 2024 5e and extract only the lifecycle seams required to select, create, parse, serialize, display, and navigate to a concrete system sheet.
4. Support one project-adopted current SRD 5.2 release at a time. Pin the exact source document for stable attribution and page locators, but do not maintain simultaneous historical 2024 rules variants.
5. Keep 2014 and 2024 schemas explicit. Reuse within a 5e family module where evidence supports it, but do not label that reuse system-neutral.
6. Add Shadowdark within the conservative source baseline after the shared lifecycle boundary exists, and use it to validate or revise that boundary.
7. Keep sheet projections, edit intents, layouts, required groups, and system-native data inside their respective system features until a repeated contract is demonstrated.

A likely minimal shared catalog will eventually describe stable system identity, user-facing label, factory, hydration/serialization boundary, sheet destination, and computed character-list summary. The exact persisted envelope, TypeScript signatures, component loading strategy, computed-view contracts, and route shape belong to the implementation proposal that introduces the second system.

System-native composition does not mean three unrelated page monoliths. `BL-070` must audit the existing grid/card, binding, annotation, focused-edit, dialog, navigation, and responsive primitives and reuse or adapt them where their interaction contracts fit. The rough 5e, Shadowdark, and Cairn Excalidraw files are non-normative evidence of runtime priorities and visual anchors; the system epics must review them before starting fresh. A focused atom/molecule/organism and route-composition audit is now justified by the second sheet, but a repository-wide hierarchy or universal rendering-description schema remains premature.

Alternative considered: preserve the current generic root identity/features/inventory/notes contract and only add dispatch. Rejected as the unexamined default because it may make 5e's data organization a cross-system persistence requirement. Duplicating all routes and dispatch forever was also rejected because creation, storage, import/export, and navigation need an authoritative system discriminator. A fully dynamic schema/layout registry remains rejected because three target systems do not imply that their internal sheets share one rendering contract.

#### Preserved core-audit evidence

The current `src/schema/zod/core.ts` requires shared `meta`, `system`, and 5e-shaped `identity` data; optional root `features`, `inventory`, `notes`, and annotations; and opaque `systemData`. It also defines reusable annotation, reference, feature, item, and note primitives. Reusable types and mandatory root placement are separate decisions.

The three-system audit reached these conclusions:

| Current concept | Direction for `BL-070` |
| --- | --- |
| Document ID, character-data version, system ID | Strong shared lifecycle and dispatch candidates |
| Created/updated timestamps | Likely shared lifecycle metadata; exact requiredness remains open |
| Rules/source version | Shared lifecycle concept whose values and meaning remain system-owned |
| Root identity | Keep system-owned; expose a computed list label/summary |
| Root features, inventory, and notes | Do not require as universal roots; let systems opt into reusable record primitives |
| Root annotations/references | Share vocabulary where helpful without requiring identical storage locations |
| Opaque `systemData` under the current core | Directionally system-owned, but the surrounding core is heavier and more 5e-shaped than the target |

Shared consumers currently assume more than lifecycle metadata: storage parses the generic core before dispatch, and the home list reads 5e-shaped identity/class data. The first computed views should instead cover a character-list summary, sheet destination, backup/recovery description, and contextual reference topics. Future Dungeons and Dashboards or global runtime summaries remain deferred until a concrete consumer defines their contract.

`BL-070` must resolve the smallest pre-dispatch envelope, authoritative creation/parse/serialize/list/navigation vocabulary, non-destructive unknown-system/version behavior, the final 2014 v0 disposition, opt-in shared primitives, explicitly 5e-family helpers, and focused dispatch/backup/isolation tests. It must not define a universal field registry or shared edit-intent/rendering API in advance.

### 7. Keep typed character data canonical and audit fillable PDFs early

The application's validated system document remains the full-fidelity source of truth. JSON remains the lossless backup and transport representation of that document. Fillable PDFs are valuable interoperability adapters and schema evidence, but they must not become the canonical persistence model because their fields, capacities, identifiers, and supported concepts vary and may not represent application annotations or extended records.

Before first durable schema versions freeze, the roadmap will inventory the available canonical or publisher-provided editable PDFs for all three systems and document:

- form ownership, version, license, and whether redistribution is permitted;
- stable field names and field-value encodings;
- mappings to proposed system data and computed views;
- data that can round-trip, data that requires transformation, and data that would be lost;
- whether export, import, or both are reliable enough for the first playtest.

That audit should guide schema vocabulary and expose missing concepts without requiring internal data to mimic a page layout. The existing `BL-066` should be revisited: its fillable-PDF feasibility and mapping work may move earlier, while actual multi-system import/export can be sliced and prioritized from the findings. Image/scanned-sheet import, OCR, and unverified extraction remain later horizons that require human review and substantially different error handling.

Alternative considered: use editable PDFs as the stable persistence boundary. Rejected because a document optimized for printing is a lossy, externally versioned UI contract rather than an extensible store for all application-owned data.

If evidence after durable v1 promises begin calls for a fundamental schema reset, that decision immediately triggers a recovery/interchange review before users are asked to cross it. Editable-PDF export/import should be prioritized where exact forms, field maps, viewers, and rights make it viable, but it remains one lossy escape path alongside canonical JSON and explicit migration/recovery—not a reason to weaken schema durability.

### 8. Decompose the playtest program into independent epics

BL-067 will produce refined backlog items rather than implementation tasks for the following candidate epics:

1. **Resource provenance and Shadowdark baseline:** confirm source-specific evidence, official SRD artifacts, conservative Shadowdark locators, and the expansion gates.
2. **Dense collection discovery (`BL-064`):** address already-observed 2014 collection editing and whole-sheet saturation before multiplying similar surfaces.
3. **Reference resource navigation:** prove self-hosted and multi-source link-only discovery, indexed-section search, navigation, and contextual editor links against the existing 2014 sheet.
4. **Core-schema audit, multi-system foundation, and 2024 5e:** test a smaller persisted core plus computed views while introducing the minimum dispatch boundary and a minimal 2024 sheet.
5. **Fillable-PDF mapping and bounded interoperability:** audit all three systems before schema freeze, refine `BL-066`, and implement only the playtest-critical adapters justified by the findings.
6. **Shadowdark minimal sheet:** implement its system-native sparse sheet and permitted references, then reconcile the shared boundary.
7. **Cross-system playtest hardening:** validate import/export, accessibility, mobile use, saturated sheets, sparse GM records, quick notes, resource finding, and external-feedback capture across the matrix; prepare compatibility decisions.
8. **Scene-aware runtime guidance and navigation (`BL-073`):** after saturated-sheet and multi-system evidence exists, investigate system-native cues, summaries, landmarks, emphasis, or explicit focus without generalizing action-economy records, presuming a universal pillar taxonomy, or hiding sections by default.

The apply phase for BL-067 allocated durable backlog IDs after checking current and historical IDs. Each implementation epic will receive its own OpenSpec proposal. The sequence may place source-provenance work in parallel with `BL-064`; Shadowdark may proceed within the conservative baseline but cannot silently expand beyond it.

Alternative considered: one change implementing all three systems and resources. Rejected because it would conceal architectural fallout, make partial validation difficult, and force unrelated legal and UI decisions into one review.

### 9. Revisit existing ADRs rather than inventing parallel doctrine

The planning apply phase will:

- refine the existing sheet-architecture ADR now that its second-system trigger is concrete;
- reconcile the shared-core decision with the preferred minimal envelope and computed-view direction before implementing another system;
- create a lightweight ADR for the rights-classified resource strategy because it is a durable architectural and product-risk trade-off;
- preserve the existing character-versioning ADR and link PRD milestone terms to it rather than restating migration mechanics inconsistently.

### 10. Apply outcomes on 2026-07-31

The documentation apply resolved the planning questions as follows:

- `docs/vision/PRD-v1.md` defines six rehearsable scenarios plus three saturation overlays, measured runtime/note/reference/mobile/data-safety gates, and separate PRD approval, readiness, external-handoff/schema activation, findings reconciliation, and product-v1.0 milestones.
- `docs/rules-resource-policy.md` plus the rights-classification ADR adopt self-hosting for verified redistributable sources and useful conservative locators otherwise. The register records official SRD 5.1 and SRD 5.2.1 planning artifacts as CC BY self-hosting candidates; `BL-069` will replace the bookmarked 5.1 derivative, and the current 5.2.x release will be rechecked before public handoff. Shadowdark may proceed within the external-link/page-name baseline and requires permission or qualified review only for expanded source use.
- The core-audit evidence now lives in this design and identifies document/system lifecycle metadata as the leading shared persistence candidate, directs shared consumers toward computed character-list, navigation, recovery, and reference-topic views, and distinguishes reusable interaction primitives from a universal renderer. It deliberately leaves exact envelope and dispatch signatures to `BL-070`.
- `docs/fillable-pdf-interoperability-audit.md` found materially lossy forms, an opaque 411-field 2024 form, and no verified redistribution grant for the sheet templates themselves. JSON remains canonical; no PDF adapter is a first-playtest readiness prerequisite. `BL-066` becomes an early P1 export-first proof after a target schema and template-delivery basis settle.
- Git history and active/archived artifacts showed no prior use of `BL-068` through `BL-073`. The apply allocated `BL-068` to rights/Shadowdark feasibility, `BL-069` to reference navigation, `BL-070` to the multi-system/2024 boundary, `BL-071` to Shadowdark, `BL-072` to cross-system hardening, and `BL-073` to the trigger-deferred scene-aware guidance/navigation investigation. Retained `BL-064` owns the Horizon A dense-collection/focused-row/annotation baseline.

The unresolved questions below are intentionally delegated to their bounded implementation epics rather than blocking this planning change.

### 11. Reconcile directional survey evidence on 2026-08-01

The owner supplied two local survey exports: a four-response tooling survey and a seven-response play-preference survey, collected from 2024-10-20 through 2025-03-08. The committed [anonymous synthesis](../../../docs/vision/evidence/2026-08-01-pre-playtest-surveys.md) records aggregate distributions, question themes, limitations, and implications without usernames, exact response timestamps, or attributable quotations. The raw PDFs and CSVs remain ignored local material.

The evidence confirms mobile-first maintenance, contextual guidance, trusted source navigation, sparse-to-saturated data, and flexible authorship across exploration, roleplay, and combat as useful first-playtest hypotheses. It also exposes a real tension between automatic calculations and understanding or controlling the underlying values. Progressive assistance should therefore remain optional and explainable when it arrives.

The evidence does not establish demand for the three selected systems: the sample is small, system interest was dispersed, and Shadowdark received no selections. The matrix remains an owner-directed product and architecture proof rather than a popularity claim. Likewise, interest in guided management does not by itself require a full creation wizard. Horizon A will test contextual references, informative empty states, focused maintenance, and transparent aids; external feedback will determine whether a bounded creation workflow moves forward in Horizon B.

Physical-dice preference and the adjacent interest in maps, music, imagery, and other session presentation do not expand this change. Dice remains a non-goal, while session-level presentation remains on the Dungeons and Dashboards side of the product boundary.

Broadening runtime beyond combat does not require equal visual weighting or a selected-pillar mode. Combat may remain the most prominent rules-dense surface. `BL-064` will first test non-destructive landmarks and whole-sheet navigation, while trigger-deferred `BL-073` preserves the later question of system-native scene cues, summaries, and explicit focus after saturated-sheet and multi-system evidence. Automatic scene inference, default hiding, a universal pillar taxonomy, and treating every scene concern as an action-economy record are not part of PRD v1.

## Risks / Trade-offs

- **[Risk] The three-system target still grows into three full-featured products.** -> Define a minimal system matrix in PRD v1, require sparse-friendly manual entry, and move system-native automation or builders into later epics.
- **[Risk] 2024 5e produces abstractions that look universal only because it resembles 2014.** -> Mark family reuse explicitly and require Shadowdark evidence before promoting sheet internals into shared contracts.
- **[Risk] The current core schema makes 5e-shaped identity, feature, inventory, and note fields permanent.** -> Audit persisted root requirements before the second system, shrink them where evidence permits, and use computed views for shared UI contracts.
- **[Risk] Shadowdark source use quietly grows beyond the conservative baseline.** -> Make the baseline and expansion gates explicit, keep source bytes/text out of the repository, and require reviewed evidence before broader use.
- **[Risk] Saturated sheets recreate the overload of paper sheets or VTTs.** -> Require repeatable saturated fixtures, focused row-edit evidence, and owner solo-play rehearsal before handoff; select search/outline/sticky/tab remedies only from observed failures.
- **[Risk] “Search the PDFs” is interpreted as a compendium or ingestion platform.** -> Specify the first proof as resource and curated-section discovery plus lawful document navigation; evaluate richer search separately per rights class.
- **[Risk] External PDF form fields become the canonical schema and discard richer data.** -> Keep validated system data and JSON canonical; use a pre-v1 mapping audit to guide vocabulary and isolate PDFs behind explicitly lossy or lossless adapters.
- **[Risk] A target-state PRD is mistaken for shipped behavior.** -> Maintain current/target labels in PRD v1 and keep `docs/active-goals.md` authoritative for current implementation.
- **[Risk] The vision priority queue drifts from the engineering backlog.** -> Treat the vision queue as dependencies and horizons only; give active work durable backlog IDs and reconcile both documents during BL-067.
- **[Trade-off] A sparse NPC proof may not feel like a polished stat block.** -> Accept the limited first proof in exchange for learning whether a dedicated mode is actually necessary.

## Migration Plan

This is a documentation-only change with no runtime deployment.

1. Preserve PRD v0 as historical context and add PRD v1 as a separate target-state artifact.
2. Update active goals to distinguish the current 2014 baseline from the first-playtest target program.
3. Refine the architecture and resource-policy ADRs.
4. Allocate and sequence independent backlog items for implementation.
5. After survey reconciliation and explicit owner approval, remove completed BL-067 from the active queue during archive while retaining a bounded completion record.

Rollback consists of reverting these documentation changes. No character data or application behavior is affected.

## Open Questions

- How conservative should the first Shadowdark topic/section descriptions be beyond the expressly permitted general page/name references, and which locally controlled workflow can draft them without exposing source bytes?
- During the reference-navigation epic, does browser/document-native text search satisfy the playtest need, or does licensed SRD material require an app-owned local text index after usability testing?
- Which fields, if any, remain genuinely universal in the persisted character core after 2024 and Shadowdark comparison, and which shared consumers should instead use computed system views?
