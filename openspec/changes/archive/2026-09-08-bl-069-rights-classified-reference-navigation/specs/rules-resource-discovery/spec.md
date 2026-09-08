## ADDED Requirements

### Requirement: Rules resources and locators have stable classified identities

The system SHALL register every discoverable rules resource and curated locator with stable identity, source and rules-version context, rights delivery classification, access guidance, and an authoritative destination appropriate to that classification.

#### Scenario: Self-hosted resource is registered

- **WHEN** a redistributable resource is available from an adopted self-hosted artifact
- **THEN** its record SHALL identify the exact adopted source/version, included availability, attribution, and supported internal locator type

#### Scenario: Link-only resource is registered

- **WHEN** a resource is classified as link-only
- **THEN** its record SHALL identify the authoritative external destination and whether the user must obtain or own the source
- **AND** it SHALL NOT represent the source document as included in the application

#### Scenario: Multiple sources map the same topic

- **WHEN** more than one registered source provides a locator for the same project-owned topic
- **THEN** each source and locator SHALL retain independent identity, version, ownership guidance, and destination

### Requirement: Resource discovery is bounded to registered metadata

The system SHALL allow users to search registered resource titles, source versions, project-owned topics, curated section labels, and independently authored descriptions without requiring or exposing a full-text source index.

#### Scenario: Query matches a curated section

- **WHEN** a user enters a query matching a registered topic or curated section label
- **THEN** the system SHALL return the corresponding resource and locator with enough source/version and section context to distinguish it

#### Scenario: Query has no matches

- **WHEN** a non-empty resource query matches no registered metadata
- **THEN** the system SHALL present an explicit no-match result and a one-step way to clear or revise the query

#### Scenario: Resource catalog is empty

- **WHEN** no resources are registered for the selected system or context
- **THEN** the system SHALL present a distinct empty state rather than a no-match or loading failure

#### Scenario: Query phrase occurs only in source text

- **WHEN** a query is absent from registered metadata but occurs inside a source document
- **THEN** resource discovery SHALL NOT claim a catalog match
- **AND** the user MAY use find within that document after opening a supported source

### Requirement: Preferred free discovery remains simple while alternatives stay reachable

The system SHALL present an explicitly preferred verified self-hosted source as the primary result for a topic and SHALL place additional lawful source choices behind a clearly named secondary disclosure.

#### Scenario: Preferred self-hosted source is available

- **WHEN** a topic resolves to an available preferred self-hosted source
- **THEN** the result SHALL present one primary internal Open action with useful source/version and locator context
- **AND** it SHALL NOT burden that action with irrelevant ownership or not-included warnings

#### Scenario: Alternate sources exist

- **WHEN** a topic has one or more additional registered sources
- **THEN** the primary result SHALL expose the count and availability of those choices through an `Other sources` action
- **AND** the alternatives SHALL remain distinguishable by source/version, inclusion, and ownership guidance

#### Scenario: Link-only result is inspected

- **WHEN** a discoverable result refers to a link-only source
- **THEN** the result SHALL state before activation that the source is not included and whether the user must obtain or own it
- **AND** its primary destination SHALL be visibly external

### Requirement: Resource provenance and locator health remain visible and fail closed

The system SHALL expose adopted source/version and attribution information and SHALL prevent an unverified source or stale locator from masquerading as a valid exact destination.

#### Scenario: User inspects source details

- **WHEN** a user opens details for a registered source
- **THEN** the system SHALL present its source/version identity, publisher, classification, attribution or notice path, and current availability guidance

#### Scenario: Exact locator is stale

- **WHEN** a registered locator is known not to match its adopted source/version
- **THEN** the system SHALL label the exact locator as needing review and disable the exact-location action
- **AND** it MAY retain a lawful general document or source-details action without silently remapping the locator
- **AND** a retained general-document action for an available self-hosted source SHALL remain in the in-app viewer without applying the stale exact location
- **AND** a retained action for a link-only source SHALL remain visibly external

#### Scenario: Source is unavailable

- **WHEN** a registered source cannot currently be opened
- **THEN** the system SHALL retain the bibliographic citation and explain its unavailable state
- **AND** it SHALL NOT substitute an unregistered mirror or alternate source automatically
