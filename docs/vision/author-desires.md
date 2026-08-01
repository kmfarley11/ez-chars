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

The basic premise of ez-chars is fast access to runtime information combined with low-friction human authorship. “Runtime” means the information relevant to the current scene across exploration, roleplay, or combat—not combat statistics alone. Character data is necessarily complicated; managing it does not need to feel complicated.

That broader definition does not require equal visual weight for every kind of play. Combat may remain especially prominent because it is often the most rules-dense and time-sensitive pillar. Scene-aware landmarks, outlines, or temporary emphasis should be tested before modes that hide information; any future focused view should remain explicit, reversible, and system-native rather than impose one universal pillar taxonomy.

The application should help a user shape, find, and annotate their information without forcing every thought into one prescribed field size or workflow. System-native structure may improve organization and guidance, but it should augment the user's work rather than make the user conform to the tool.

## Durable Experience Principles

- [ ] **Runtime first—the north star:** the information needed during a turn or scene is visible immediately or one interaction away, and quick notes never require leaving the flow of play.
- [ ] **Mobile first:** core viewing, editing, note-taking, navigation, and reference lookup work comfortably on a phone.
- [ ] **Sparse by design:** optional or unknown information may remain absent without making the sheet look broken or blocking useful work.
- [ ] **Saturation stays navigable:** campaign-scale collections, modifiers, and authored notes retain clear homes, visual anchors, and practical discovery rather than recreating paper-sheet or VTT overload.
- [ ] **Human authorship stays first-class:** users can enter, amend, and annotate information in their own words.
- [ ] **Guidance is contextual and optional:** relevant free references, understandable empty states, and focused prompts appear near editing and viewing tasks without becoming a mandatory wizard; the first playtest should test whether these lighter aids are sufficient.
- [ ] **Local-first ownership:** users can use the public baseline without an account and can export their character data.
- [ ] **System-native shapes:** each rules system may model and present its own concepts; shared infrastructure must not force 5e structure onto other games. Prefer a small cross-system envelope plus computed system views over making generic persisted fields the lowest common denominator.
- [ ] **A familiar interaction language:** system-native sheets should reuse accessible presentation and editing primitives where concepts fit, so cards, focused edits, annotations, navigation, and feedback feel related without forcing one universal rendering schema.
- [ ] **Progressive assistance:** manual entry and bibliographic references come before compendium-backed suggestions, automation, or character building. When computed aids are introduced, keep them optional and explainable and preserve access to the user-owned source values.
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
- Shadowdark, using user-authored data and the conservative external-source baseline below;
- one clearly selectable, system-specific sheet experience for each target system;
- player-character use in all three systems;
- a sparse-data scenario in all three systems that first tests whether the regular sheet is practical for a sidekick or NPC; a focused lite/stat-block mode remains acceptable if evidence shows it is needed;
- fast access to runtime information and quick, flexible user-authored notes as the primary playtest experience;
- system-appropriate organization of identity, core statistics, actions, inventory, features or abilities, and other essential play data;
- full-fidelity local persistence and JSON backup/restore across the supported systems, with editable-PDF interoperability treated as an early complementary format rather than the canonical store;
- phone-sized, keyboard, touch, and assistive-technology usability;
- a resource library that can find relevant free rules documents and their indexed sections, then navigate the user to the source, preferring stable self-hosted copies when licensing permits;
- contextual resource links while editing important sections such as spells, equipment, or system equivalents.
- conservative page/name/chapter locators for external free or user-owned paid sources when the project cannot host their content, including more than one source map for a system when editions or books place the same topic differently.

The minimum reference experience is document-oriented, not a normalized rules compendium. Searching resource titles and curated section metadata, jumping to a chapter or page, and using the selected document's own search affordance are sufficient first-playtest goals. A navigation index containing document metadata, topics, and locators is explicitly in scope; it does not become a compendium merely because it is searchable. Its long-term model should allow multiple sources for one system or topic—for example a free quickstart and a user-owned core rulebook—without implying that the app supplies the paid material. If usability or rights-permitted source processing later demonstrates that structured rules records are necessary, that should be proposed as a deliberate expansion.

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
2. **Link-only:** redistribution or processing rights are absent or unclear; the app may provide an authoritative acquisition link and conservative bibliographic locators for free or user-owned paid material but must not host or ingest the document.
3. **User-local:** a future user may point their own device at material they possess, provided the application can keep that material local and the workflow receives separate product and legal review.
4. **Unavailable to the public product:** premium, official, or third-party material for which the project lacks appropriate rights.

Charging, accepting donations, or limiting a deployment to patrons does not itself grant content rights. A future private/table deployment or paid integration must be treated as a separate rights and architecture decision, not an automatic extension of the free public product.

The author would prefer to self-host every relevant PDF for which the project has verified that right. Link-only behavior is a compatibility path for other licenses, not the desired default for openly redistributable resources.

### Known source constraints as of 2026-07-31

- Wizards of the Coast publishes [SRD 5.1 and the SRD 5.2 line](https://www.dndbeyond.com/srd) under CC BY 4.0. That license permits sharing copies, so the project may self-host the licensed PDFs while preserving the applicable SRD's exact attribution, license notice, and modification status. The PDF remains identified as third-party CC BY material; including it does not require the separately authored application as a whole to use the same license.
- The Arcane Library offers the [Shadowdark Quickstart Set](https://www.thearcanelibrary.com/products/shadowdark-rpg-quickstart-set-pdf) free of charge, but free access alone does not establish redistribution rights.
- The official [Shadowdark third-party-license FAQ](https://www.thearcanelibrary.com/blogs/shadowdark-blog/faq-on-the-shadowdark-rpg-third-party-license) says that character-building apps are outside that license while general page-and-name references are allowed. The conservative product baseline is therefore a system-native sheet containing only user-authored data plus bibliographic/page/name locators and authoritative acquisition links. Written permission or qualified review becomes a gate before the project bundles, excerpts, ingests, transforms, or otherwise expands beyond that baseline; the project does not describe the baseline as an official or licensed Shadowdark character builder.

This policy is a product-risk boundary, not legal advice. A qualified professional remains the appropriate path if the owner needs legal certainty rather than a conservative implementation policy.

## Evidence and Feedback

The product should be shaped by three evidence loops rather than by implementation intuition alone:

1. anonymized pre-playtest survey evidence about new-player and GM friction;
2. owner-run solo-play rehearsals against sparse, representative, and saturated fixtures;
3. external sessions followed by a short survey and qualitative notes.

Surveys should remain external to the application unless collecting feedback becomes a product job of its own. Prefer reproducible, anonymized CSV exports for local analysis, with question wording, response count, distributions, free-text themes, and limitations recorded in a committed synthesis. Raw exports and direct identifiers should remain outside Git. Small samples guide priorities and hypotheses; they do not prove broad user behavior.

The [2026-08-01 pre-playtest survey synthesis](evidence/2026-08-01-pre-playtest-surveys.md) is the first evidence snapshot. It supports mobile-first maintenance, contextual guidance, authoritative resource navigation, sparse-to-saturated coverage, flexible authorship across all three play pillars, and optional rather than opaque automation. It does not establish market demand for the selected systems or justify a full builder, dice engine, VTT, or compendium in Horizon A.

The rough 5e, Shadowdark, and Cairn Excalidraw files are existing design evidence, not implementation contracts. System-sheet epics should explicitly audit their runtime priorities and visual anchors before discarding or adopting them.

## Product Horizons

### Horizon A — First external playtest

- [ ] Finalize and approve [PRD v1](PRD-v1.md) with current-versus-target status and measurable playtest gates after pre-playtest survey reconciliation and owner review.
- [ ] Confirm and document the conservative Shadowdark external-source baseline; seek permission or qualified review only if a later proposal expands into bundled, excerpted, ingested, transformed, or branded source use.
- [x] Audit the current generic core schema and record the preferred smaller-envelope, system-owned-data, computed-view, and shared-interaction direction in the active `BL-067` OpenSpec design; implementation remains part of the 2024/multi-system epic.
- [ ] Establish the smallest multi-system creation, loading, routing, persistence, and export boundary using concrete systems.
- [ ] Deliver minimal, sparse-friendly 2014, 2024, and Shadowdark sheets.
- [ ] Self-host verified redistributable rules PDFs and deliver the rights-classified resource library plus contextual reference path.
- [x] Complete the [editable-PDF field and rights audit](../fillable-pdf-interoperability-audit.md) for available publisher sheets: retain JSON as canonical, promote `BL-066` to an early P1 export-first proof, and do not make PDF interchange a first-playtest readiness prerequisite.
- [ ] Establish a heuristic-driven baseline for dense collection discovery, focused row editing, annotations, and whole-sheet navigation under saturation before external playtesting.
- [ ] Complete representative player-character, sparse GM sidekick/NPC, and saturated-sheet owner rehearsals on mobile.
- [x] Synthesize anonymized pre-playtest surveys and reconcile their directional findings into readiness priorities.
- [ ] Reconcile external survey and qualitative evidence after the playtest.
- [ ] If the conservative Shadowdark baseline materially constrains the intended resource evidence, explicitly decide whether adding a fourth CC-licensed system provides enough evidence to justify the extra scope; do not replace Shadowdark or expand the matrix automatically.
- [ ] Freeze the first durable character-data versions only when the external playtest actually begins.
- [ ] Reconcile playtest findings before calling the product v1.0.

### Horizon B — Better character maintenance

- [ ] Refine the Horizon A dense-collection, focused-row, and annotation baseline using real playtest evidence.
- [ ] Investigate scene-aware runtime guidance, navigation, or focus after saturated-sheet and multi-system evidence, preferring system-native cues, landmarks, and emphasis before hiding.
- [ ] Add more system-native inventory, spell, feature, and action assistance without removing manual entry.
- [ ] Decide whether a dedicated compact NPC/stat-block presentation is warranted.
- [ ] Improve rules-resource search and source-aware annotations where licenses permit it.
- [ ] Add lightweight guided creation for the highest-friction sections before attempting a complete builder; pre-playtest survey evidence makes this an early Horizon B candidate if Horizon A references and focused maintenance guidance prove insufficient.
- [ ] Implement broader fillable-PDF import/export for systems whose audited forms provide reliable mappings, while preserving richer internal data that the forms cannot represent.
- [ ] If post-v1 evidence calls for a fundamental schema reset, immediately prioritize a reviewed export/recovery bridge—including editable-PDF interoperability where viable—before asking users to cross it; retain JSON and explicit migrations as the lossless contract.

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

This is a vision-level dependency order, not a substitute for backlog IDs or an active OpenSpec task list. PRD v1 is approved, the core/PDF planning audits are complete, and the active delivery sequence is:

1. Confirm source classifications and the conservative Shadowdark baseline before product work depends on redistributed or processed material (`BL-068`).
2. Address the cross-cutting playtest enabler already evidenced by the 2014 sheet: dense collection discovery, focused row editing, annotations, and saturated-sheet navigation (`BL-064`).
3. Prove self-hosted/link-only resource discovery and contextual navigation against the existing 2014 sheet (`BL-069`).
4. Establish the minimum multi-system lifecycle/computed-view boundary and a 2024 5e sheet; support one deliberately adopted current SRD release, audit the existing rough designs, and treat 5e-family reuse as family evidence (`BL-070`).
5. Add the minimal Shadowdark sheet within the conservative source baseline and use its different shape to validate or revise the shared boundary (`BL-071`).
6. Harden mobile interaction, sparse NPC/sidekick use, saturated-sheet navigation, backup/restore, resource lookup, and compatibility decisions across the full matrix (`BL-072`).
7. Run the early P1 fillable-PDF export/import proofs after a target schema and template-delivery basis settle (`BL-066`); they complement but do not gate the first playtest.
8. Reconcile external evidence before promoting specialized builders, stat-block modes, normalized compendium behavior, more systems, image/OCR import, or connected services.

Scene-aware runtime guidance and navigation (`BL-073`) is a trigger-deferred Horizon B investigation after saturated-sheet and multi-system evidence. It should not delay this sequence unless owner rehearsal demonstrates that ordinary landmarks and system-native cues cannot support a core runtime scenario.

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

The pre-playtest surveys reinforce this split: character-sheet mobility, maintenance, and trusted rules navigation are direct ez-chars needs, while VTT positioning, maps, atmosphere, music, portraits, and session-presentation burden belong to the GM/session-tooling side of the boundary.
