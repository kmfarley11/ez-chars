## ADDED Requirements

### Requirement: First-playtest rules sources use explicitly adopted artifacts

The planning documentation SHALL identify an authoritative, exact source artifact for each first-playtest D&D rules line and SHALL treat a source-version change as a deliberate adoption event rather than following a floating latest version.

#### Scenario: D&D first-playtest sources are registered

- **WHEN** maintainers prepare the D&D source records consumed by later reference work
- **THEN** they SHALL adopt the official CC release of SRD 5.1 for 2014 D&D and the official SRD 5.2.1 artifact for 2024 D&D
- **AND** each record SHALL identify its authoritative source, verified artifact hash, license evidence, attribution instruction, page basis, self-hosting decision, and modification status

#### Scenario: A later SRD release appears

- **WHEN** Wizards publishes a release newer than SRD 5.2.1 before public handoff
- **THEN** maintainers SHALL retain SRD 5.2.1 unless the owner explicitly approves an upgrade after considering locator, schema, fixture, attribution, and rules-version consequences

#### Scenario: Attribution is prepared for a bundled SRD

- **WHEN** the application self-hosts an adopted D&D SRD artifact
- **THEN** it SHALL reproduce the artifact's required attribution from its legal page, preserve the applicable license link, and identify any project modification without inventing additional publisher attribution

#### Scenario: Adopted D&D artifacts are published with the application

- **WHEN** the static application is built or served beneath its configured base path
- **THEN** the verified official SRD 5.1 and SRD 5.2.1 PDFs SHALL be available through project-local URLs
- **AND** repository documentation SHALL identify each local file, official source, verified hash, CC BY 4.0 license, exact attribution instruction, and modification status

#### Scenario: Existing 2014 SRD navigation is used

- **WHEN** a user follows the application's current full-SRD link or a newly created 2014 SRD reference
- **THEN** it SHALL target the official self-hosted SRD 5.1 PDF
- **AND** the link SHALL remain valid when the application is hosted under the GitHub Pages base path

#### Scenario: A local-only source exists beside publishable assets

- **WHEN** a maintainer serves or builds the application from a workspace containing ignored source material under the designated local-only boundary
- **THEN** that material SHALL NOT be served or copied into production output
- **AND** the approved self-hosted SRDs SHALL remain available

### Requirement: Link-only locator records remain sparse bibliographic citations

The planning documentation SHALL define link-only locator records as sparse mappings from project-owned task topics to reviewed source names and destinations, and SHALL NOT treat those records as a source-text, rules-entity, or document-structure model.

#### Scenario: Shadowdark locator candidate is accepted

- **WHEN** a reviewed Shadowdark citation identifies a useful character-sheet task destination
- **THEN** the committed record MAY contain source identity, a project-owned topic, a short cited name or section label, printed page, PDF-page offset or stable anchor, and a short independently authored purpose

#### Scenario: First Shadowdark locator set is prepared

- **WHEN** maintainers prepare the initial reviewed locator records
- **THEN** the set SHALL include only the broad character-creation, equipment, and game-rules destinations approved by the owner
- **AND** it SHALL cite the source headings “Characters,” “Gear,” and “Gameplay” rather than copying subordinate rules content or mirroring the complete contents hierarchy

#### Scenario: Candidate output reconstructs source expression

- **WHEN** candidate metadata contains copied rules prose, source-derived mechanics summaries, tables, examples, stat blocks, exhaustive heading sequences, extracted keyword indexes, embeddings, or another reconstruction of expressive source content or organization
- **THEN** the review SHALL reject that output from the public repository and locator baseline

#### Scenario: Shadowdark public baseline is proposed

- **WHEN** BL-069 or BL-071 consumes the confirmed Shadowdark source policy
- **THEN** public behavior SHALL remain limited to user-authored character data, authoritative acquisition links, sparse general page/name citations, and non-official source presentation unless written permission or qualified review approves the exact expansion

#### Scenario: Shadowdark source is identified publicly

- **WHEN** a later sheet or reference view identifies the adopted Shadowdark quickstart
- **THEN** it SHALL use factual source and publisher naming, provide an authoritative acquisition link, state that the source is not included, and make the project's unofficial status clear
- **AND** it SHALL NOT claim publication under the Shadowdark RPG Third-Party License, display restricted compatibility branding, or imply publisher affiliation without the required permission or qualified review

### Requirement: Owner-supplied locator curation produces audited sanitized output

The maintainer workflow SHALL permit owner-authorized human or agent review of a lawfully obtained local source while committing only human-reviewed bibliographic metadata and independently authored descriptions.

#### Scenario: Locator candidates are prepared from a local source

- **WHEN** the owner directs a human or coding agent to inspect a local source and draft citations
- **THEN** temporary source copies, extracted text, screenshots, transcripts, and scratch candidates SHALL remain outside the repository
- **AND** the durable output SHALL be limited to the approved bibliographic locator fields

#### Scenario: Candidate set receives human review

- **WHEN** locator candidates are ready to become repository data or documentation
- **THEN** a human reviewer SHALL verify the source version or hash, destination and page basis, independently authored wording, allowed field set, review date, unresolved constraints, and source-drift procedure

#### Scenario: User-local planning is compared with a product upload feature

- **WHEN** maintainers evaluate the approved source-curation workflow
- **THEN** they SHALL treat it as a maintainer planning process and SHALL NOT infer permission or scope for arbitrary public-product uploads, retained source processing, OCR, or semantic indexing

### Requirement: A fourth playtest system requires a demonstrated evidence gap

The roadmap SHALL retain Shadowdark as the required non-5e playtest system and SHALL NOT add or substitute Cairn or another system merely because Shadowdark sources remain link-only.

#### Scenario: Fourth system is considered

- **WHEN** the conservative Shadowdark baseline prevents a required first-playtest resource or architecture hypothesis from being tested
- **THEN** maintainers SHALL document the missing evidence and obtain an explicit owner-approved PRD scope amendment before adding another system

#### Scenario: Shadowdark baseline remains sufficient

- **WHEN** user-authored data and sparse bibliographic locators can exercise the required non-5e hypotheses
- **THEN** the first-playtest matrix SHALL remain limited to its approved three systems
