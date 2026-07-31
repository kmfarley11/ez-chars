## Context

PRD v0 gave ez-chars a productive starting point: a local-first Svelte application, a substantial D&D 5e 2014 sheet, explicit runtime-versus-organizational presentation, annotations, JSON backup, and a pre-playtest schema policy. The implementation and active goals are intentionally 2014-only, while the long-term vision includes many systems, character building, richer rules sources, NPC support, and eventual integration with another GM tool.

That gap is now the largest planning risk. Treating all long-term desires as the next milestone would multiply schemas, sheets, document processing, automation, and legal uncertainty at once. Leaving the milestone implicit would let individually reasonable changes accumulate without demonstrating the two primary product jobs: helping friends maintain player characters and helping the author manage sidekicks or NPCs.

The existing architecture also reached its deliberate generalization trigger. The sheet-architecture ADR deferred a system registry until a second concrete system supplied evidence. The target now includes two additional systems, but the current repository still has one system-specific route, factory, parser, serializer, and sheet projection. This planning change must identify the future seams without implementing them or freezing a universal sheet API.

The current shared character schema is not yet minimal: it requires a common identity record and places optional features, inventory, notes, and annotations at shared root locations in addition to opaque system data. Those shapes are useful to the implemented 2014 sheet, but they may turn 5e concepts into requirements for unrelated systems. The second-system work should therefore audit the persisted core itself, not merely add dispatch around it. System-specific computed views may be a better way to supply shared list labels, summaries, search records, and interoperability projections.

The repository also treats its typed local document and JSON envelope as the full-fidelity data boundary while an official 5e PDF workflow remains deferred. Fillable character-sheet PDFs can provide valuable evidence about stable system concepts and useful interchange, but their finite fields and varying form conventions can also discard annotations, extended collections, provenance, or other application data. They should inform the schemas before v1 freezes without becoming the only canonical store.

Rules-resource rights differ materially:

- the D&D SRD 5.1 and 5.2 lines are available under CC BY 4.0 with version-specific attribution;
- Shadowdark's quickstart is free to obtain, but the official third-party-license FAQ says character-building apps are outside that license and distinguishes permitted bibliographic references from reprinting broader rules content.

The public product therefore cannot equate free access with permission to bundle, index, excerpt, or transform a source. This is a product-risk boundary rather than legal advice.

## Goals / Non-Goals

**Goals:**

- Establish one unambiguous document hierarchy for author intent, target product requirements, active delivery scope, prioritized epics, and executable change tasks.
- Define the first external playtest around 2014 5e, 2024 5e, and Shadowdark without requiring all long-term capabilities.
- Preserve both primary product jobs in testable playtest scenarios while avoiding a premature dedicated NPC model.
- Separate PRD approval, playtest readiness, schema-v1 activation, external playtesting, and product-v1.0 release.
- Define a rights-safe minimum resource experience and a hard feasibility gate for uncertain sources.
- Prefer stable self-hosted PDFs and derived navigation indexes when verified source rights allow them.
- Recommend a staged multi-system architecture based on concrete system implementations.
- Audit whether the persisted cross-system core should shrink in favor of system-owned data and computed shared views.
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
- **link-only**, when access is available but bundling or processing rights are absent or unclear;
- **user-local**, reserved for a separately reviewed future on-device workflow;
- **unavailable to the public product**, when appropriate rights are absent.

The first-playtest reference capability will be document-oriented. Its minimum useful behavior is to search resource titles and curated section metadata, identify a relevant result such as spells or equipment, and navigate to the corresponding document location or lawful external source. Contextual links may expose that same locator from an editor. Full rules records, cross-document semantic search, OCR, and arbitrary ingestion are not required.

A searchable navigation index is not the same product boundary as a normalized rules compendium. The former stores source identity, section labels, topics, pages, anchors, and other locators; the latter stores queryable rules entities and their structured content. The navigation index is required for the playtest. A normalized compendium remains a separate expansion even if licensed materials eventually make it feasible.

For redistributable material, self-hosting is the preferred default because it stabilizes URLs, keeps references close to the application, and can improve offline access. The resource-navigation epic may also evaluate derived indexes or in-app text search within the verified license. For link-only material, the plan must remain at bibliographic metadata, external navigation, and other expressly permitted behavior. The design must not promise identical implementation mechanics across rights classes.

The D&D SRD 5.1 and 5.2 PDFs are CC BY 4.0 materials. That license permits sharing copies with attribution, so the project may self-host a selected PDF while keeping it clearly marked as third-party CC material. Inclusion does not change the license of the separately authored application or repository as a whole; the source PDF keeps its own license and notices.

Alternative considered: bundle every free PDF for a uniform offline experience. Rejected because price does not determine redistribution or processing rights. Link-only for every source was also rejected because it would unnecessarily discard the offline and indexing rights available for CC-licensed SRDs.

### 5. Make Shadowdark a required target with an explicit feasibility gate

Shadowdark remains a required first-playtest system because its different rules shape is valuable product and architecture evidence. Before a public Shadowdark implementation proposal is approved, the project must obtain written permission or qualified legal review for the exact character-sheet and reference behavior. Planning may continue, but implementation must not rely on the third-party license covering a character app.

If the gate cannot be fully cleared, the project must record the blocker and restrict implementation to the exact behavior cleared by review; it must not silently treat the free quickstart as permission or silently substitute another system. Shadowdark remains the desired sheet target. If review cannot clear any viable public sheet experience, the human owner must explicitly decide playtest timing or scope rather than letting licensing policy make that product decision implicitly.

The conservative planning baseline is user-authored character data plus bibliographic names, pages, and external links. Even that baseline should be included in the permission request so the public experience is reviewed as a whole. The permission result should determine how deeply Shadowdark sources can be hosted or indexed rather than automatically removing Shadowdark from the sheet target.

If that constraint makes the reference playtest materially weaker, PRD v1 may consider adding a fourth CC-licensed system for resource-integration evidence. That is an explicit scope decision, not an automatic substitute for Shadowdark and not a prerequisite merely because the systems have different licenses.

### 6. Audit and stage the multi-system boundary through concrete systems

The implementation roadmap should not begin with a universal renderer or speculative adapter. It should first inventory which current shared fields are truly lifecycle metadata and which are 5e-shaped conveniences. The leading direction is a small persisted envelope plus system-owned data, with system-specific computed views serving shared application needs. Shared annotations, references, and similar primitives may remain reusable types without forcing identical root placement.

The recommended sequence is:

1. Use the existing 2014 system as the baseline.
2. Compare the 2014 document, a proposed 2024 document, Shadowdark requirements, and their computed list/summary needs before approving the next persisted core.
3. Add 2024 5e and extract only the lifecycle seams required to select, create, parse, serialize, display, and navigate to a concrete system sheet.
4. Support one project-adopted current SRD 5.2 release at a time. Pin the exact source document for stable attribution and page locators, but do not maintain simultaneous historical 2024 rules variants.
5. Keep 2014 and 2024 schemas explicit. Reuse within a 5e family module where evidence supports it, but do not label that reuse system-neutral.
6. Add Shadowdark after its feasibility gate and use it to validate or revise the shared lifecycle boundary.
7. Keep sheet projections, edit intents, layouts, required groups, and system-native data inside their respective system features until a repeated contract is demonstrated.

A likely minimal shared catalog will eventually describe stable system identity, user-facing label, factory, hydration/serialization boundary, sheet destination, and computed character-list summary. The exact persisted envelope, TypeScript signatures, component loading strategy, computed-view contracts, and route shape belong to the implementation proposal that introduces the second system.

Alternative considered: preserve the current generic root identity/features/inventory/notes contract and only add dispatch. Rejected as the unexamined default because it may make 5e's data organization a cross-system persistence requirement. Duplicating all routes and dispatch forever was also rejected because creation, storage, import/export, and navigation need an authoritative system discriminator. A fully dynamic schema/layout registry remains rejected because three target systems do not imply that their internal sheets share one rendering contract.

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

### 8. Decompose the playtest program into independent epics

BL-067 will produce refined backlog items rather than implementation tasks for the following candidate epics:

1. **Resource rights and Shadowdark feasibility:** approve the resource classification policy, record source-specific attribution, and resolve public Shadowdark permission.
2. **Dense collection discovery (`BL-064`):** address already-observed 2014 sheet scaling before multiplying similar surfaces.
3. **Reference resource navigation:** prove self-hosted and link-only resource discovery, indexed-section search, navigation, and contextual editor links against the existing 2014 sheet.
4. **Core-schema audit, multi-system foundation, and 2024 5e:** test a smaller persisted core plus computed views while introducing the minimum dispatch boundary and a minimal 2024 sheet.
5. **Fillable-PDF mapping and bounded interoperability:** audit all three systems before schema freeze, refine `BL-066`, and implement only the playtest-critical adapters justified by the findings.
6. **Shadowdark minimal sheet:** implement its system-native sparse sheet and permitted references, then reconcile the shared boundary.
7. **Cross-system playtest hardening:** validate import/export, accessibility, mobile use, dense collections, sparse GM records, quick notes, and resource finding across the matrix; prepare compatibility decisions.

The apply phase for BL-067 will allocate durable backlog IDs after checking current and historical IDs. Each implementation epic will receive its own OpenSpec proposal. The sequence may place the rights feasibility work in parallel with `BL-064`, but no Shadowdark implementation may pass its gate.

Alternative considered: one change implementing all three systems and resources. Rejected because it would conceal architectural fallout, make partial validation difficult, and force unrelated legal and UI decisions into one review.

### 9. Revisit existing ADRs rather than inventing parallel doctrine

The planning apply phase will:

- refine the existing sheet-architecture ADR now that its second-system trigger is concrete;
- reconcile the shared-core decision with the preferred minimal envelope and computed-view direction before implementing another system;
- create a lightweight ADR for the rights-classified resource strategy because it is a durable architectural and product-risk trade-off;
- preserve the existing character-versioning ADR and link PRD milestone terms to it rather than restating migration mechanics inconsistently.

## Risks / Trade-offs

- **[Risk] The three-system target still grows into three full-featured products.** -> Define a minimal system matrix in PRD v1, require sparse-friendly manual entry, and move system-native automation or builders into later epics.
- **[Risk] 2024 5e produces abstractions that look universal only because it resembles 2014.** -> Mark family reuse explicitly and require Shadowdark evidence before promoting sheet internals into shared contracts.
- **[Risk] The current core schema makes 5e-shaped identity, feature, inventory, and note fields permanent.** -> Audit persisted root requirements before the second system, shrink them where evidence permits, and use computed views for shared UI contracts.
- **[Risk] The Shadowdark gate blocks the stated playtest.** -> Run the permission/feasibility work first, keep its fallback decision explicit, and allow other independent epics to proceed without weakening the gate.
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
5. Remove completed BL-067 from the active queue during archive while retaining a bounded completion record.

Rollback consists of reverting these documentation changes. No character data or application behavior is affected.

## Open Questions

- Will The Arcane Library grant permission, or will qualified review identify a sufficiently conservative public Shadowdark sheet/reference scope?
- Which measurable exit thresholds should PRD v1 use for playtest readiness and the later product-v1.0 decision, beyond completion of the three-system scenario matrix and absence of critical data-loss or table-use blockers?
- During the reference-navigation epic, does browser/document-native text search satisfy the playtest need, or does licensed SRD material require an app-owned local text index after usability testing?
- Which fields, if any, remain genuinely universal in the persisted character core after 2024 and Shadowdark comparison, and which shared consumers should instead use computed system views?
- Which fillable-PDF import/export capabilities, if any, must ship before the first external playtest after the three-system form audit documents fidelity and rights?
