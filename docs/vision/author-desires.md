# Author Desires and Product Horizons

This document records the product author's durable intent for ez-chars. It is a long-term compass and prioritization aid, not the active implementation scope or a claim about current behavior.

For current work, use [active goals](../active-goals.md), the [backlog](../backlog.md), and the approved OpenSpec change for the selected slice. When those documents make a deliberate short-term trade-off, this document should explain the destination without overriding the nearer contract.

## Product Thesis

ez-chars should be a free, lightweight, mobile-friendly place to store, use, and annotate tabletop role-playing character data. It should occupy the space between a static character-sheet PDF and a full virtual tabletop:

- more useful and accessible during play than a form-fillable PDF;
- less prescriptive, automated, and operationally heavy than a VTT or commercial character builder;
- close to the free rules references that help a user understand or fill out the data in front of them;
- respectful of user ownership, copyright, and the differences between game systems.

The product is not primarily trying to teach a game or adjudicate whether a character is legal. It should make character information easy to maintain, easy to find at the table, and easy to connect to relevant rules material.

## Primary Jobs

### 1. Help friends maintain player characters

The author wants to give friends a free tool that works well on a phone and supports the author's own expert guidance. A user should be able to record only what they know, return later, and consult an appropriate free resource while editing without being forced through a complete character builder.

### 2. Help a GM manage sidekicks and NPCs

The author wants quick access to multiple sidekick and NPC records, especially compact runtime statistics and notes. The first proof does not require a dedicated stat-block mode: a sparse character sheet that remains useful when many fields are omitted can validate this job before a specialized workflow is justified.

## North-Star Experience

The basic premise of ez-chars is fast access to runtime information combined with low-friction human authorship. Character data is necessarily complicated; managing it does not need to feel complicated.

The application should help a user shape, find, and annotate their information without forcing every thought into one prescribed field size or workflow. System-native structure may improve organization and guidance, but it should augment the user's work rather than make the user conform to the tool.

## Durable Experience Principles

- [ ] **Runtime first—the north star:** the information needed during a turn or scene is visible immediately or one interaction away, and quick notes never require leaving the flow of play.
- [ ] **Mobile first:** core viewing, editing, note-taking, navigation, and reference lookup work comfortably on a phone.
- [ ] **Sparse by design:** optional or unknown information may remain absent without making the sheet look broken or blocking useful work.
- [ ] **Human authorship stays first-class:** users can enter, amend, and annotate information in their own words.
- [ ] **Guidance is contextual and optional:** relevant free references appear near editing and viewing tasks without becoming a mandatory wizard.
- [ ] **Local-first ownership:** users can use the public baseline without an account and can export their character data.
- [ ] **System-native shapes:** each rules system may model and present its own concepts; shared infrastructure must not force 5e structure onto other games. Prefer a small cross-system envelope plus computed system views over making generic persisted fields the lowest common denominator.
- [ ] **Progressive assistance:** manual entry and bibliographic references come before compendium-backed suggestions, automation, or character building.
- [ ] **Rights-aware by construction:** prefer self-hosting and useful indexing when a verified license or permission allows it; otherwise use the narrowest appropriate reference mode. A free price alone is not evidence of redistribution or processing rights.
- [ ] **One product, bounded horizons:** future capabilities should fit a coherent character-data companion, but they do not need to be built simultaneously.

## System Data and Computed Views

The desired long-term direction is to keep the persisted cross-system contract as small as practical. Stable document identity, system selection, and versioning may be genuinely shared; inventory, features, notes, identity details, and other gameplay concepts should not remain in a core schema merely because 5e uses them.

System-specific code should be able to expose computed fields or views for shared application needs such as character-list labels, summaries, search, runtime navigation, import/export mapping, or future integrations. Those projections can share presentation contracts without becoming the canonical persisted data or forcing every system to store the same fields.

The current core-versus-system schema is implementation evidence, not a permanent commitment. It should be audited against 2024 5e and Shadowdark before the first durable schema versions are frozen. Reusable annotations, references, and other primitives may remain shared types without requiring every character document to persist them at the same root locations.

## First External Playtest Target

The next PRD should define a first external playtest rather than promise the entire long-term product. The product remains pre-release while that target is being built.

The playtest target should include:

- D&D 5e 2014, based on the SRD 5.1 rules line;
- D&D 5e 2024, based on one current project-adopted release from the SRD 5.2 line; the app need not support multiple 2024 SRD releases simultaneously;
- Shadowdark, subject to the rights and permission gate below;
- one clearly selectable, system-specific sheet experience for each target system;
- player-character use in all three systems;
- a sparse-data scenario in all three systems that first tests whether the regular sheet is practical for a sidekick or NPC; a focused lite/stat-block mode remains acceptable if evidence shows it is needed;
- fast access to runtime information and quick, flexible user-authored notes as the primary playtest experience;
- system-appropriate organization of identity, core statistics, actions, inventory, features or abilities, and other essential play data;
- full-fidelity local persistence and JSON backup/restore across the supported systems, with editable-PDF interoperability treated as an early complementary format rather than the canonical store;
- phone-sized, keyboard, touch, and assistive-technology usability;
- a resource library that can find relevant free rules documents and their indexed sections, then navigate the user to the source, preferring stable self-hosted copies when licensing permits;
- contextual resource links while editing important sections such as spells, equipment, or system equivalents.

The minimum reference experience is document-oriented, not a normalized rules compendium. Searching resource titles and curated section metadata, jumping to a chapter or page, and using the selected document's own search affordance are sufficient first-playtest goals. A navigation index containing document metadata, topics, and locators is explicitly in scope; it does not become a compendium merely because it is searchable. If usability or rights-permitted source processing later demonstrates that structured rules records are necessary, that should be proposed as a deliberate expansion.

## Explicit First-Playtest Non-Goals

- a complete character-creation wizard;
- rules validation, build optimization, or forced completion;
- a hosted account system, cloud sync, or collaborative editing;
- a VTT, encounter manager, initiative tracker, dice engine, or game-teaching curriculum;
- a general-purpose normalized rules compendium or public compendium API; a bounded document-navigation index remains in scope;
- server-side PDF ingestion, OCR, semantic indexing, or arbitrary user uploads;
- hosting premium or copyrighted content without documented permission;
- requiring a dedicated NPC/stat-block model before the sparse-sheet hypothesis is evaluated; an early focused mode remains available if concrete evidence justifies it;
- live integration with D&D Beyond, Dungeons and Dashboards, or another external product.

## Resource and Copyright Policy

The operational classifications, evidence checklist, and adopted/candidate source register live in the [rules-resource policy](../rules-resource-policy.md). The principles below preserve the author's intent.

Every resource should be classified before the application decides how to expose it:

1. **Redistributable:** the project has verified an open license or direct permission, records the required attribution, and may bundle or process the permitted material. Self-hosting is preferred when it improves URL stability, proximity, offline access, or page-level navigation.
2. **Link-only:** the material is free to access but redistribution or processing rights are absent or unclear; the app may provide a lawful external link and bibliographic locator but must not host or ingest the document.
3. **User-local:** a future user may point their own device at material they possess, provided the application can keep that material local and the workflow receives separate product and legal review.
4. **Unavailable to the public product:** premium, official, or third-party material for which the project lacks appropriate rights.

Charging, accepting donations, or limiting a deployment to patrons does not itself grant content rights. A future private/table deployment or paid integration must be treated as a separate rights and architecture decision, not an automatic extension of the free public product.

The author would prefer to self-host every relevant PDF for which the project has verified that right. Link-only behavior is a compatibility path for other licenses, not the desired default for openly redistributable resources.

### Known source constraints as of 2026-07-31

- Wizards of the Coast publishes [SRD 5.1 and the SRD 5.2 line](https://www.dndbeyond.com/srd) under CC BY 4.0. That license permits sharing copies, so the project may self-host the licensed PDFs while preserving the applicable SRD's exact attribution, license notice, and modification status. The PDF remains identified as third-party CC BY material; including it does not require the separately authored application as a whole to use the same license.
- The Arcane Library offers the [Shadowdark Quickstart Set](https://www.thearcanelibrary.com/products/shadowdark-rpg-quickstart-set-pdf) free of charge, but free access alone does not establish redistribution rights.
- The official [Shadowdark third-party-license FAQ](https://www.thearcanelibrary.com/blogs/shadowdark-blog/faq-on-the-shadowdark-rpg-third-party-license) says that character-building apps are outside that license while general page-and-name references are allowed. Before public Shadowdark support is implemented or described as licensed, the project should obtain written permission or qualified legal review for the exact sheet and reference experience. Until then, plans should assume only user-authored data and conservative bibliographic/external-link behavior.

This policy is a product-risk boundary, not legal advice.

## Product Horizons

### Horizon A — First external playtest

- [x] Approve [PRD v1](PRD-v1.md) with current-versus-target status and measurable playtest gates.
- [ ] Resolve the Shadowdark permission/licensing path.
- [x] Audit the current generic core schema and record the preferred smaller-envelope, system-owned-data, and computed-view direction in the [multi-system core audit](../multi-system-core-audit.md); implementation remains part of the 2024/multi-system epic.
- [ ] Establish the smallest multi-system creation, loading, routing, persistence, and export boundary using concrete systems.
- [ ] Deliver minimal, sparse-friendly 2014, 2024, and Shadowdark sheets.
- [ ] Self-host verified redistributable rules PDFs and deliver the rights-classified resource library plus contextual reference path.
- [x] Complete the [editable-PDF field and rights audit](../fillable-pdf-interoperability-audit.md) for available publisher sheets: retain JSON as canonical, promote `BL-066` to an early P1 export-first proof, and do not make PDF interchange a first-playtest readiness prerequisite.
- [ ] Establish a heuristic-driven baseline for dense collection discovery, focused row editing, and annotations before external playtesting.
- [ ] Complete representative player-character and GM sidekick/NPC playtest scenarios on mobile.
- [ ] If Shadowdark permissions materially constrain the intended resource experience, explicitly decide whether adding a fourth CC-licensed system provides enough evidence to justify the extra scope; do not replace Shadowdark or expand the matrix automatically.
- [ ] Freeze the first durable character-data versions only when the external playtest actually begins.
- [ ] Reconcile playtest findings before calling the product v1.0.

### Horizon B — Better character maintenance

- [ ] Refine the Horizon A dense-collection, focused-row, and annotation baseline using real playtest evidence.
- [ ] Add more system-native inventory, spell, feature, and action assistance without removing manual entry.
- [ ] Decide whether a dedicated compact NPC/stat-block presentation is warranted.
- [ ] Improve rules-resource search and source-aware annotations where licenses permit it.
- [ ] Add lightweight guided creation for the highest-friction sections before attempting a complete builder.
- [ ] Implement broader fillable-PDF import/export for systems whose audited forms provide reliable mappings, while preserving richer internal data that the forms cannot represent.

### Horizon C — Character building and broader system support

- [ ] Build an optional, resumable character-creation workflow after direct sheet editing is stable.
- [ ] Consider Cairn v1 and v2, Nimble 5e, Free5e, and other systems with accessible rules sources.
- [ ] Use a substantially different system, such as Call of Cthulhu or Daggerheart, to test whether the architecture remains genuinely system-neutral only when its rights and product fit are clear.
- [ ] Evaluate structured compendium integrations and external APIs as optional accelerators rather than prerequisites for sheet use.
- [ ] Expand character-sheet interchange to images, scans, OCR, and human-reviewed extraction only after fillable-PDF workflows are reliable.

### Horizon D — Connected and private deployments

- [ ] Define a stable, permissioned interoperability contract with Dungeons and Dashboards for player characters, sidekicks, and NPCs.
- [ ] Explore optional synchronization or accounts while preserving local-first use and export.
- [ ] Explore user-local document processing or a private table deployment for lawfully acquired material.
- [ ] Consider patron, donor, or paid capabilities only where they are operationally sustainable and separately licensed.

## Strategic Priority Queue

This is a vision-level dependency order, not a substitute for backlog IDs or an active OpenSpec task list. PRD approval plus the core/PDF planning audits are complete; the active delivery sequence is:

1. Resolve resource rights and the Shadowdark feasibility gate before product work depends on redistributed or processed Shadowdark material (`BL-068`).
2. Address the cross-cutting playtest enabler already evidenced by the 2014 sheet: a heuristic baseline for dense collection discovery, focused row editing, and annotations (`BL-064`).
3. Prove self-hosted/link-only resource discovery and contextual navigation against the existing 2014 sheet (`BL-069`).
4. Establish the minimum multi-system lifecycle/computed-view boundary and a 2024 5e sheet; support one deliberately adopted current SRD release and treat 5e-family reuse as family evidence (`BL-070`).
5. Add the minimal Shadowdark sheet after its rights gate and use its different shape to validate or revise the shared boundary (`BL-071`).
6. Harden mobile interaction, sparse NPC/sidekick use, backup/restore, resource lookup, and compatibility decisions across the full matrix (`BL-072`).
7. Run the early P1 fillable-PDF export/import proofs after a target schema and template-delivery basis settle (`BL-066`); they complement but do not gate the first playtest.
8. Reconcile external evidence before promoting specialized builders, stat-block modes, normalized compendium behavior, more systems, image/OCR import, or connected services.

## Decision Filter for Future Work

These are advisory prompts for exploration and prioritization, not automatic gates. The author may intentionally override them, and an approved OpenSpec change should not be reopened merely because every answer is imperfect. Before promoting a new feature, ask:

- Which product job and horizon does it serve?
- Does it improve table use, character maintenance, or rights-safe reference access?
- Can the user still proceed with partial information and manual text?
- Is the mobile interaction clear and accessible?
- Does it preserve local ownership and exportability?
- Are content rights and attribution explicit?
- Is a proposed abstraction supported by at least two concrete systems or workflows?
- Does it belong in ez-chars, Dungeons and Dashboards, or an integration boundary between them?
- What evidence would let us stop, defer, or simplify it?

## Relationship to Dungeons and Dashboards

The desired ownership boundary is:

- **ez-chars:** persistent player-character, sidekick, and NPC data; character-centered runtime views; character annotations; and character-relevant rules locators.
- **Dungeons and Dashboards:** GM-session tooling such as searchable or rollable source tables, pinned runtime-session material, and in-session dashboard composition.
- **Future integration:** intentionally versioned character summaries, stable identifiers, and references rather than a shared database or merged application.

Dungeons and Dashboards is currently even earlier in development than ez-chars, so ez-chars should not take a near-term dependency on its data model. This boundary is enough until duplicated data or a concrete integration scenario appears; at that point, both repositories should record a coordinated interoperability decision.
