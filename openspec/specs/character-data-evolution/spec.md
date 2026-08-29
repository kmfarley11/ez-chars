# Character Data Evolution

## Purpose

Define how current character documents validate and serialize through the pre-playtest compatibility epoch while preserving meaningful absence and establishing the source-identity and future-version boundaries required for safe evolution.

## Requirements

### Requirement: Linkable source identities are stable

The current 5e character representation SHALL require every inventory item, spell, feature reference, language, and tool to have a stable non-empty identity. Inventory identities SHALL be unique within the inventory collection, spell identities SHALL be unique within the spell collection, feature identities SHALL be unique across general and nested feature collections, and language and tool identities SHALL each be unique within their own collection. Identity SHALL remain stable through renaming, alphabetical presentation, Pin changes, supported bulk editing, persistence, and JSON backup/restore.

#### Scenario: Complete source and priority-target identities are accepted

- **WHEN** a current character gives every inventory item, spell, class feature, subclass feature, ancestry trait, background feature, language, and tool a non-empty identity
- **AND** those identities are unique within their required namespaces
- **THEN** current-character validation SHALL preserve those identities unchanged

#### Scenario: Missing or colliding identities are rejected

- **WHEN** current character data omits a required inventory, spell, feature, language, or tool identity or contains a collision in any required identity namespace
- **THEN** validation SHALL reject the character without inventing, repairing, removing, or merging records

#### Scenario: Renaming a language or tool

- **WHEN** a user renames an existing language or tool through a supported edit
- **THEN** that record SHALL retain its stable identity, annotations, source context, and Pin state
- **AND** unrelated records SHALL remain unchanged

### Requirement: Current priority state is validated and identity-owned

The current D&D 5e 2014 character representation SHALL associate Pin state only with valid stable identities in an eligible collection. Missing priority state SHALL mean that an entry is unpinned. Invalid, duplicate, cross-collection, or dangling priority identities SHALL be rejected rather than guessed, repaired, or silently removed during current-version validation.

#### Scenario: Valid current priority state is loaded

- **WHEN** a current character associates Pin state only with stable identities that exist in their declared eligible collections
- **THEN** validation SHALL preserve that state unchanged
- **AND** every eligible identity without associated priority state SHALL remain valid and be interpreted as unpinned

#### Scenario: Invalid current priority state is loaded

- **WHEN** current-version character data contains a duplicate, dangling, ambiguous, or cross-collection priority identity
- **THEN** validation SHALL reject the character without guessing a target or rewriting the source data

#### Scenario: Current priority state round-trips

- **WHEN** a valid current character with pinned entries is saved, exported, imported, or hydrated repeatedly
- **THEN** its Pin state and stable target identities SHALL remain semantically equivalent without duplication or reassignment

### Requirement: Current runtime-action source references resolve locally

The current character representation SHALL accept a runtime-action source link only when its kind and identity resolve to exactly one eligible character-owned record.

#### Scenario: Current source link resolves

- **WHEN** a current character contains an item-, spell-, or feature-linked runtime action
- **THEN** that source identity SHALL resolve to exactly one eligible record of the declared kind on the same character

#### Scenario: Invalid current source link is imported

- **WHEN** current-version character data contains a source link that is missing, ambiguous, or ineligible
- **THEN** validation SHALL reject that current character data without guessing a target

### Requirement: Supported character data hydrates to one current model

The system SHALL validate D&D 5e 2014 character data against the current pre-playtest v0 representation before exposing it to application features and SHALL reject data outside that compatibility epoch without rewriting it.

#### Scenario: Current v0 character is loaded

- **WHEN** a character declares the current pre-playtest v0 schema version and satisfies its strict shape
- **THEN** the system SHALL hydrate it without changing its semantic content

#### Scenario: Earlier experimental character is loaded

- **WHEN** a local or imported character declares an experimental schema identifier that predates the current v0 baseline
- **THEN** the system SHALL reject it as outdated without attempting a compatibility migration
- **AND** the source data SHALL NOT be overwritten

#### Scenario: Future character version is encountered

- **WHEN** a character declares an unsupported future schema version
- **THEN** the system SHALL reject it without guessing a migration or overwriting the source data

### Requirement: Current serialization is versioned and repeatable

The system SHALL save and export only current validated v0 character data, and hydrating serialized current data MUST be idempotent.

#### Scenario: Current character is saved

- **WHEN** a valid current character is persisted or exported
- **THEN** the saved character SHALL declare `dnd5e-2014.schema.v0` and use only current canonical properties

#### Scenario: Current character round-trips

- **WHEN** a current character is exported and imported without user edits
- **THEN** its semantic character data SHALL remain equivalent after the round trip

#### Scenario: Current hydration is repeated

- **WHEN** current serialized character data is hydrated more than once
- **THEN** subsequent hydration SHALL not duplicate or rewrite records

### Requirement: Structural defaults do not erase meaningful absence

The current 5e character representation SHALL provide stable empty collections and semantic groups where emptiness is valid while retaining absence for capabilities the character does not possess.

#### Scenario: Empty universal groups are available

- **WHEN** a valid 5e character has no inventory, notes, actions, currency, roleplay text, languages, or tools
- **THEN** application features SHALL receive valid empty values for those groups without reconstructing missing parents

#### Scenario: Optional capability is absent

- **WHEN** a valid 5e character does not possess an optional capability such as spellcasting
- **THEN** the current model SHALL preserve that meaningful absence until an explicit edit creates the capability
