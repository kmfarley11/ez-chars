## Context

PRD v1 requires rights-classified rules references before the first external playtest. The repository already has an approved rules-resource policy and ADR, but BL-068 must turn their general classifications into source-specific, consumable evidence before BL-069 implements reference navigation or BL-071 implements a Shadowdark sheet.

The official D&D SRD landing page currently identifies SRD 5.2.1 as the latest 5.2 release and lists 5.2.0 as a prior release. Both SRD 5.1 and SRD 5.2.1 are available under CC BY 4.0 with artifact-specific attribution text. The Arcane Library's Shadowdark license FAQ states both that character-building apps fall outside its general third-party license and that general page/name references may be used as bibliographic citations. The Shadowdark quickstart and form therefore remain link-only under the project's conservative product-risk policy.

The owner intends to use human and coding-agent review of lawfully obtained local sources to draft helpful citations. That planning workflow is distinct from a public upload or ingestion feature. The durable boundary is the reviewed metadata committed to the repository, while an informational disclosure allows the owner to decide whether a remote agent's data controls are appropriate for direct source inspection.

## Goals / Non-Goals

**Goals:**

- Pin and self-host the exact official D&D SRD 5.1 and SRD 5.2.1 source artifacts, hashes, attribution instructions, classification, modification state, and base-path-safe local locations used by downstream work.
- Define a sparse topic-to-source bibliographic locator shape that remains useful without reconstructing a link-only document's expressive content or structure.
- Define an owner-authorized human/agent curation and audit process that commits only reviewed bibliographic metadata and independently authored descriptions.
- Confirm the conservative Shadowdark baseline and enumerate exact expansion gates.
- Refine the existing rules-resource ADR and policy so BL-069 and BL-071 can cite one coherent decision.

**Non-Goals:**

- Implement a source registry, locator schema, viewer, search UI, Shadowdark sheet, PDF adapter, OCR, embeddings, or user upload workflow.
- Bundle, excerpt, ingest, transform, or full-text index Shadowdark source material.
- Treat the project's product-risk policy as legal advice or claim that the Shadowdark third-party license authorizes this application.
- Add Cairn or another system without a separately approved evidence-based scope decision.

## Decisions

### 1. Adopt fixed D&D artifacts rather than a floating “latest” source

The source register will adopt the two official artifacts cataloged in [Third-Party Notices](../../../THIRD_PARTY_NOTICES.md#included-assets):

- the official CC release of SRD 5.1 for the 2014 rules line; and
- the official SRD 5.2.1 PDF for the 2024 rules line.

Each record will include the authoritative landing page and artifact URL, verified file hash, license evidence, required attribution instruction, page basis, local file path, and modification statement. The static-asset plugin will copy only publishable `docs/ext` content, serve it beneath the configured application base path, and explicitly exclude `docs/ext/local-only/` in development and production. Downstream work will copy the exact attribution from the adopted PDF's legal page rather than reconstruct it from memory.

The official local artifact will be the sole bundled 2014 rules PDF, and both the current application link and newly created in-document references will target it.

The public-handoff check is a provenance check, not an automatic “latest version” upgrade. If Wizards publishes a later release, maintainers will explicitly decide whether its value justifies remapping locators, revisiting schema assumptions, and changing the adopted rules version. SRD 5.2.1 remains usable under its independent CC license if the project retains it.

Alternative considered: always follow the newest SRD 5.2.x URL. Rejected because silent source changes would destabilize page locators, fixtures, attribution, and system identity.

### 2. Make locator records sparse citations, not a document model

A registered source owns provenance and availability metadata. A locator candidate supplies only the fields needed to answer “where should the user look?” Conceptually, the reviewed records may contain:

```text
source identity
project-owned task topic
short cited name or section label
printed page and optional PDF-page offset or stable anchor
short independently authored purpose
review status
```

The first Shadowdark set will be deliberately sparse and task-oriented. The owner-approved local copy of the _Shadowdark RPG Player Quickstart Guide_ was reviewed on 2026-08-01. The reviewed artifact is 68 PDF pages with SHA-256 `25b1a35120dc1ca2ac5518add82c919daa8accfb141d5042cb5c02ce8848d7cb`. Its printed page labels and one-based PDF page numbers align, so a browser-style `page=N` destination uses the printed page number while a zero-based PDF index is `N - 1`.

The initial candidate set is intentionally limited to three broad source headings:

| Project-owned task topic | Cited source heading | Printed page | One-based PDF page | Zero-based PDF index | Independently authored purpose              |
| ------------------------ | -------------------- | -----------: | -----------------: | -------------------: | ------------------------------------------- |
| Character creation       | Characters           |           11 |                 11 |                   10 | Start creating or reviewing a character.    |
| Equipment                | Gear                 |           32 |                 32 |                   31 | Find the general equipment listing.         |
| Game rules               | Gameplay             |           39 |                 39 |                   38 | Begin reviewing the rules used during play. |

These are broad chapter/listing anchors comparable to selective contents-page citations. Core resolution, combat/actions, class/talent guidance, spellcasting, or narrower entries can be considered later only when a concrete contextual-navigation task needs them. A topic taxonomy belongs to ez-chars; it does not reproduce the source's table of contents.

The review rejects copied rules prose, mechanics summaries derived from the source, tables, examples, stat blocks, exhaustive heading sequences, extracted keyword indexes, embeddings, and any locator collection whose density or ordering effectively reconstructs expressive source structure.

Alternative considered: mirror the full table of contents to maximize discovery. Rejected because it is unnecessary for the first-playtest tasks and weakens the distinction between bibliographic navigation and source reproduction.

### 3. Audit the committed output rather than requiring every drafting tool to be offline

The owner may direct a human or coding agent to inspect a lawfully obtained local source. When an agent cannot verify the client's provider transmission, retention, or training controls, it gives one concise disclosure before direct inspection. The owner may then confirm their settings and authorization; that confirmation applies to the scoped task and need not be repeated.

Temporary source copies, extracted text, screenshots, transcripts, and candidate scratch files remain ignored and uncommitted. Human review checks the final locator set against an allowlist:

1. exact registered source identity and reviewed version/hash;
2. project-owned topic plus page/name citation fields only;
3. independently authored descriptions rather than copied or close-paraphrased source expression;
4. printed-page/PDF-index basis and destination verified against the reviewed copy;
5. reviewer, review date, unresolved constraints, and source-drift procedure recorded.

Sanitized bibliographic metadata can be passed to agents without repeating the remote-model warning. This is a maintainer workflow only; it creates no right or product mechanism for arbitrary user uploads.

Alternative considered: require a network-disabled local model for all review. Rejected as unnecessary owner friction once disclosure and explicit authorization make the processing context a conscious human decision.

### 4. Keep Shadowdark public behavior inside a citation-only baseline

The approved baseline consists of:

- a system-native character sheet containing user-authored values;
- an authoritative acquisition or information link for the source;
- sparse general page/name citations represented by reviewed locator records; and
- clear source-not-included and non-official presentation.

Public presentation will use the factual source title _Shadowdark RPG Player Quickstart Guide_, identify The Arcane Library as the publisher/source, link to its authoritative acquisition page, and state “Source not included” and “Unofficial; not affiliated with The Arcane Library.” It will not display the compatibility logo, claim publication under the Shadowdark RPG Third-Party License, or otherwise imply publisher authorization. Under this bounded presentation, qualified review is not a prerequisite to BL-071; it becomes a gate if final wording uses compatibility branding or goes beyond factual identification, an acquisition link, and the approved bibliographic citations.

Written permission or qualified review remains a gate before bundling or redistributing the quickstart or form, excerpting or reproducing rules content, full-text or semantic processing, official-form import/export, restricted logo/trade-dress use, or materially broader app behavior based on protected source material. The repository will not present the baseline as being published under or authorized by the Shadowdark third-party license.

Alternative considered: seek special permission before any Shadowdark work. Rejected because the publisher expressly describes general page/name references as bibliographic citations, allowing a useful conservative baseline while broader behavior remains gated.

### 5. Do not add a fourth system without a demonstrated evidence gap

Shadowdark remains the non-5e architecture and product test even with link-only references. Cairn v1 or another clearly licensed system enters PRD v1 only if the conservative baseline prevents a required resource-navigation or multi-system hypothesis from being tested and the owner approves that scope expansion separately.

### 6. Refine existing doctrine and hand later implementation to bounded follow-ups

The apply work will update `docs/rules-resource-policy.md`, its source register, `docs/decisions/2026-07-31-classify-rules-resources-by-rights.md`, `AGENTS.md`, the static-asset boundary, local SRD navigation, third-party notices, and the BL-068 backlog definition. It will not create a second ADR.

BL-069 will later define and implement registered source/locator data, discovery, contextual navigation, attribution presentation, and drift tests against the already self-hosted D&D artifacts. BL-071 will implement only the Shadowdark sheet behavior supported by the confirmed baseline. BL-066 retains the separately gated PDF-interoperability work.

## Apply Findings

Primary-source verification on 2026-08-01 confirmed the initial source and citation boundaries. The later owner-directed self-hosting clarification expanded the apply scope and observable requirements; that expansion is reconciled in the proposal, delta specification, design, and tasks:

- the official English SRD 5.1 CC PDF and SRD 5.2.1 PDF match the page counts and checksums in [Third-Party Notices](../../../THIRD_PARTY_NOTICES.md#included-assets), and the official landing page identifies SRD 5.2.1's publication date as 2025-05-01;
- both official SRDs use aligned printed labels and one-based PDF page numbers in the reviewed artifacts, matching the Shadowdark quickstart convention;
- the owner-supplied Shadowdark artifact remains under the scoped ignored `docs/ext/local-only/` boundary, with no source bytes or processing output tracked by Git.

The maintainer policy now carries the exact D&D attribution statements, local paths, modification rules, source-unavailable behavior, and bounded BL-069/BL-071 handoff. Owner review expanded the apply scope to include both official source binaries, local-link migration, and exclusion of local-only assets from serving/build output. No second ADR, dependency, character-data migration, custom PDF viewer, or resource-discovery UI was required.

Verification confirmed the affected Svelte diagnostics, ESLint rules, unit tests, Chromium browser suite, Storybook interactions, strict OpenSpec validation, and production build. The production copies match the adopted hashes and omit `docs/ext/local-only/`. The aggregate `npm run verify:smoke` command remains stopped by pre-existing Prettier findings in six untouched planning/archive Markdown files; affected files pass Prettier, and every later smoke constituent was run independently.

## Risks / Trade-offs

- **[Risk] Sparse metadata becomes an accidental source reconstruction.** → Begin with task-oriented citations, audit every field, and reject exhaustive hierarchy, copied prose, or mechanically descriptive output.
- **[Risk] “Agent runs locally” is mistaken for known provider handling.** → Require one disclosure when controls are unknown, then let the owner explicitly authorize the scoped review without repeated blocking warnings.
- **[Risk] Source pages or artifacts drift.** → Pin exact artifacts and hashes, record printed/PDF page bases, and make updates deliberate adoption events with locator re-verification.
- **[Risk] Product documentation overstates legal certainty.** → Describe this as a conservative product-risk boundary, retain explicit unresolved constraints, and use permission or qualified review for expansion.
- **[Trade-off] SRD 5.2.1 may stop being the newest release.** → Prefer stable tested identity and locators; evaluate upgrades explicitly rather than making “latest” a hidden compatibility contract.

## Migration Plan

This is a source-baseline, static-asset, and documentation change with no character-data migration.

1. Verify authoritative source pages, exact artifacts, hashes, and attribution instructions.
2. Include the two verified official D&D PDFs, document them locally, and migrate current 2014 links to the official artifact.
3. Exclude the local-only source boundary from development serving and production output.
4. Reconcile the rules-resource policy, source register, rights ADR, agent disclosure, backlog wording, and reviewed Shadowdark locator baseline.
5. Run strict OpenSpec, application, link, and production-build verification.
6. After post-apply owner review and explicit approval, archive BL-068 and advance the backlog to BL-064.

Rollback consists of reverting the documentation, official source assets, local-link change, and static-asset exclusion together. No persisted character data changes in this slice.

## Open Questions

No questions block this planning change. BL-069 still owns the final locator-data representation and source-unavailable UX, while BL-071 must recheck its actual public wording against the citation-only boundary before shipping.
