## ADDED Requirements

### Requirement: Planning artifacts have distinct authority
The repository SHALL distinguish durable author intent, target-state product requirements, current implementation scope, prioritized candidate work, and active execution tasks in separate documented artifacts.

#### Scenario: Contributor determines current behavior
- **WHEN** a contributor needs to know what the application currently supports
- **THEN** the planning documentation SHALL direct them to the current implementation boundary rather than treating the long-term vision or target PRD as shipped behavior

#### Scenario: Contributor evaluates a future idea
- **WHEN** a contributor needs to determine whether a future idea fits the product direction
- **THEN** they SHALL be able to compare the idea against durable author desires and product horizons before promoting it into active scope

#### Scenario: Advisory vision filter is imperfectly satisfied
- **WHEN** the human owner intentionally approves work that does not satisfy every author-desires decision prompt
- **THEN** the approved active scope SHALL remain executable because the vision filter informs discussion rather than acting as an automatic gate

### Requirement: PRD v1 defines a bounded first external playtest
The target PRD SHALL define a first external playtest that includes D&D 5e 2014, D&D 5e 2024, and Shadowdark while excluding character building, compendium serving, cloud accounts, and other later-horizon capabilities from the minimum milestone.

#### Scenario: Player-character matrix is reviewed
- **WHEN** maintainers evaluate whether the target playtest scope covers player use
- **THEN** the PRD SHALL define a representative player-character viewing, editing, runtime-reference, quick-note, persistence, and backup scenario for each required system

#### Scenario: GM-managed sparse records are reviewed
- **WHEN** maintainers evaluate whether the target playtest scope covers sidekick and NPC use
- **THEN** the PRD SHALL test a sparse-data scenario for each required system as the default hypothesis while preserving a focused lite or stat-block mode as an evidence-driven option

#### Scenario: Campaign growth is rehearsed before handoff
- **WHEN** maintainers evaluate whether a system sheet is ready for external play
- **THEN** the PRD SHALL require a saturated fixture or stress overlay that exercises campaign-scale collections, modifiers, annotations, and notes without preselecting search, outlines, tabs, or another remedy before evidence demonstrates the need

#### Scenario: 2024 rules source is selected
- **WHEN** the playtest defines D&D 5e 2024 support
- **THEN** it SHALL identify one project-adopted current SRD 5.2 release and SHALL NOT require simultaneous support for earlier 2024 SRD releases

### Requirement: Playtest sheets permit partial data
The target PRD SHALL require each playtest sheet to remain useful when optional or unknown character information is absent.

#### Scenario: User records an incomplete character
- **WHEN** a user records only the information needed for current play
- **THEN** the target experience SHALL keep runtime review, editing, and note-taking usable without forcing unrelated fields to be completed

#### Scenario: User needs guidance for one unfamiliar section
- **WHEN** a user knows one value to enter but is unfamiliar with the rest of that sheet section
- **THEN** the target experience SHALL provide a reasonable entry point, communicate that unrelated data may remain absent, and expose configured authoritative guidance without forcing a complete creation workflow

#### Scenario: User maintains a saturated character
- **WHEN** a character accumulates large collections, modifiers, annotations, and authored notes
- **THEN** the target experience SHALL retain understandable visual and navigation anchors, practical focused editing, and a reasonably clear home for authored information

### Requirement: Runtime access and flexible authorship are the north star
The target PRD SHALL prioritize rapid access to runtime information and low-friction, user-authored notes without requiring all information to fit rigidly sized or exhaustively completed fields.

#### Scenario: User needs to record table information quickly
- **WHEN** a user needs to find, change, or annotate character information during play
- **THEN** the target experience SHALL keep the relevant runtime data and quick authoring path immediately available without forcing a broader workflow

#### Scenario: Current play is not combat
- **WHEN** the current scene centers on exploration, roleplay, or another system-relevant activity
- **THEN** the target experience SHALL keep applicable character information and flexible notes accessible without treating combat data as the only runtime priority

### Requirement: Shared persistence does not impose one system's shape
The planning documentation SHALL audit the current shared character schema before durable multi-system versions freeze and SHALL distinguish genuinely shared document lifecycle metadata from system-native persisted data.

#### Scenario: Second-system schema is proposed
- **WHEN** 2024 5e introduces a second concrete system document
- **THEN** the proposal SHALL evaluate whether common root identity, feature, inventory, note, and annotation fields should remain persisted requirements or become system-owned data exposed through computed views

#### Scenario: Shared application view needs common fields
- **WHEN** the home list, search, navigation, export, or an integration needs a common character representation
- **THEN** the design SHALL allow a system-specific computed projection instead of requiring the underlying systems to persist identical gameplay fields

#### Scenario: System sheets need a familiar experience
- **WHEN** more than one concrete system presents compatible viewing, editing, annotation, dialog, or navigation behavior
- **THEN** the design SHALL evaluate reusable accessible presentation primitives while allowing system-native composition and SHALL NOT require a universal persisted schema or rendering-description language

### Requirement: Reference scope is document-oriented and contextual
The target PRD SHALL require a user to find a relevant registered rules resource or indexed section, navigate to its lawful source, and access relevant resource guidance from supported editing contexts without requiring structured compendium records. The first proof SHALL include a free source, while the planning model SHALL allow future locators for user-owned sources without supplying access to them.

#### Scenario: User looks for a basic rules section
- **WHEN** a user searches for a supported topic such as spells or equipment
- **THEN** the target experience SHALL identify a relevant resource or indexed section and provide navigation to the applicable document location or external source

#### Scenario: User edits a referenced section
- **WHEN** a user edits a sheet section with configured rules guidance
- **THEN** the target experience SHALL make the relevant resource locator available without requiring the user to follow it or complete a guided workflow

#### Scenario: Navigation index is reviewed against compendium scope
- **WHEN** planning stores document titles, topics, section labels, pages, anchors, or other locators for search
- **THEN** it SHALL treat that bounded navigation index as part of the playtest reference capability rather than as a general-purpose normalized rules compendium

#### Scenario: One topic appears in multiple sources
- **WHEN** a free quickstart, SRD, prior edition, or user-owned book locates the same topic differently
- **THEN** the planning model SHALL allow distinct source identities and locator maps without reproducing protected source content or implying that paid material is included

### Requirement: Resource use follows an explicit rights classification
The planning documentation SHALL classify each rules resource as redistributable, link-only, user-local, or unavailable to the public product before specifying how the application hosts, processes, indexes, or links it.

#### Scenario: Free material has unclear redistribution rights
- **WHEN** a rules document is free to access but the project lacks verified redistribution or processing rights
- **THEN** planning SHALL treat the resource as link-only, MAY retain conservative bibliographic page/name/chapter/topic locators, and SHALL NOT assume it may be bundled, ingested, indexed from its full text, or excerpted

#### Scenario: User owns a paid source
- **WHEN** a source requires purchase and the project lacks redistribution rights
- **THEN** planning MAY provide conservative bibliographic locators and an authoritative acquisition link while clearly stating that the source is not included

#### Scenario: Openly licensed material is used
- **WHEN** a resource has a verified open license or direct permission
- **THEN** planning SHALL record the permitted use, exact adopted source version, and required attribution and SHALL prefer self-hosting when it improves stable navigation, proximity, or offline access

#### Scenario: CC BY PDF is included with the application
- **WHEN** the project self-hosts an SRD PDF licensed under CC BY 4.0
- **THEN** the source SHALL remain clearly identified as separately licensed third-party material with its required attribution, license notice, and modification status without representing the entire application as CC BY

### Requirement: Shadowdark support stays within a conservative baseline unless expanded use is cleared
The roadmap SHALL permit a public Shadowdark sheet containing user-authored data plus authoritative acquisition links and conservative bibliographic page/name locators. It SHALL require written permission or qualified review before bundling, excerpting, full-text processing, official-form interoperability, restricted brand/assets, or other source behavior outside that baseline.

#### Scenario: Shadowdark implementation is proposed
- **WHEN** maintainers are ready to propose public Shadowdark application behavior
- **THEN** the change SHALL identify the conservative baseline it follows, avoid claiming official or character-builder authorization, and SHALL NOT rely on the quickstart's free price or the general third-party license for broader source use

#### Scenario: Broader Shadowdark source use is desired
- **WHEN** a proposal wants to bundle, excerpt, ingest, transform, interoperate with an official form, or use restricted branding/assets
- **THEN** maintainers SHALL record written permission or qualified review for that exact behavior or omit it without removing the conservative Shadowdark sheet from the playtest target

### Requirement: Fillable PDFs inform but do not define canonical persistence
The planning documentation SHALL keep validated system character data and its JSON representation as the full-fidelity persistence boundary while evaluating fillable character-sheet PDFs as early interoperability adapters and schema evidence.

#### Scenario: Durable schema versions are prepared
- **WHEN** maintainers prepare to freeze the first durable schema versions
- **THEN** they SHALL audit the available canonical or publisher-provided editable PDFs for all three target systems and document source rights, form versions, field mappings, transformations, and lossy gaps

#### Scenario: PDF implementation is prioritized
- **WHEN** the form audit identifies reliable import or export mappings
- **THEN** maintainers SHALL refine and reprioritize `BL-066` into bounded fillable-PDF slices and SHALL explicitly decide which slices are required before external playtesting

#### Scenario: Image or scanned sheet is provided
- **WHEN** a future source is an image, scan, or non-editable PDF requiring OCR or inference
- **THEN** planning SHALL treat it as a later capability with separate validation and human-review requirements rather than part of the first fillable-PDF contract

### Requirement: Product and compatibility milestones remain distinct
The planning documentation SHALL distinguish approval of PRD v1, playtest readiness, activation of durable character-schema v1 support, completion of external playtesting, and a product-v1.0 release decision.

#### Scenario: PRD v1 is approved
- **WHEN** the target PRD is approved before implementation epics are complete
- **THEN** the product SHALL remain documented as pre-release and current behavior SHALL remain described separately

#### Scenario: First external playtest begins
- **WHEN** external participants first receive the supported playtest build
- **THEN** each supported system SHALL have an explicit durable schema-version decision and any optional final-v0 migration SHALL be separately defined

#### Scenario: Product v1.0 is considered after external play
- **WHEN** maintainers reconcile external playtest evidence
- **THEN** they SHALL synthesize a short external survey and qualitative observations with response count, limitations, decisions, and backlog destinations before the owner makes the product-v1.0 decision

### Requirement: Playtest work is decomposed into separately executable epics
The roadmap SHALL decompose resource feasibility, Horizon A dense-collection usability, reference navigation, shared-core and multi-system evaluation, 2024 support, fillable-PDF interoperability, Shadowdark support, cross-system hardening, and evidence-gated scene-aware guidance/navigation into independently refinable backlog items and OpenSpec changes with explicit dependencies.

#### Scenario: Maintainer selects the next implementation slice
- **WHEN** an OpenSpec change has completed implementation, reconciliation, and verification
- **THEN** the backlog SHALL identify the next bounded epic and its prerequisites
- **AND** the change SHALL remain active until the owner reviews the resulting work and explicitly approves archival rather than treating completed apply tasks as automatic completion

#### Scenario: Shared system architecture is proposed
- **WHEN** the second concrete system introduces common creation, parsing, serialization, display, or navigation needs
- **THEN** its proposal SHALL extract only evidenced lifecycle and computed-view seams and SHALL keep system-native schema, projection, editing, and layout behavior feature-specific unless repeated evidence supports sharing
