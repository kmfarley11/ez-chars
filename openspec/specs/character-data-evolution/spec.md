# Character Data Evolution

## Purpose

TBD

## Requirements

### Requirement: Supported character data hydrates to one current model

The system SHALL convert supported D&D 5e 2014 character data into one current, validated character representation before exposing it to application features.

#### Scenario: Current character is loaded

- **WHEN** a character already uses the current supported schema version
- **THEN** the system SHALL validate and hydrate it without changing its semantic content

#### Scenario: Supported legacy character is loaded

- **WHEN** a character uses a recognized older or repository-supported legacy shape
- **THEN** the system SHALL migrate it sequentially into the current validated representation

#### Scenario: Future character version is encountered

- **WHEN** a character declares an unsupported future schema version
- **THEN** the system SHALL reject it without guessing a migration or overwriting the source data

### Requirement: Migration preserves authored character information

The system MUST preserve supported authored values, annotations, and unrelated records while replacing legacy storage conventions with canonical 5e domain properties.

#### Scenario: Legacy actions are migrated

- **WHEN** a legacy character stores actions through the supported action alias
- **THEN** those actions SHALL remain available through the canonical runtime action collection without alias drift

#### Scenario: Tagged currency is migrated

- **WHEN** a legacy character stores currency as recognized tagged inventory records
- **THEN** the represented denomination amounts and valid annotations SHALL move to canonical currency data while non-currency inventory remains unchanged

#### Scenario: Roleplay notes are migrated

- **WHEN** legacy notes use recognized roleplay titles
- **THEN** the matching roleplay content and valid annotations SHALL move to semantic roleplay fields while additional title collisions and general notes remain available

#### Scenario: Proficiency provenance is migrated

- **WHEN** legacy language or tool proficiencies are owned by ancestry or background records
- **THEN** the current representation SHALL retain each proficiency and its known provenance without requiring it to remain mutable through that source record

#### Scenario: Identity-addressable records are preserved

- **WHEN** an inventory item, general note, runtime action, feature, or annotation remains an identity-addressable record after migration
- **THEN** its existing identifier SHALL be preserved

### Requirement: Current serialization is versioned and repeatable

The system SHALL save and export only current validated character data, and hydrating serialized current data MUST be idempotent.

#### Scenario: Migrated character is saved

- **WHEN** a supported legacy character has been hydrated and persisted
- **THEN** the saved character SHALL declare the current schema version and use only current canonical properties

#### Scenario: Current character round-trips

- **WHEN** a current character is exported and imported without user edits
- **THEN** its semantic character data SHALL remain equivalent after the round trip

#### Scenario: Current hydration is repeated

- **WHEN** current serialized character data is hydrated more than once
- **THEN** subsequent hydration SHALL not duplicate records, currency, roleplay fields, or proficiencies

### Requirement: Structural defaults do not erase meaningful absence

The current 5e character representation SHALL provide stable empty collections and semantic groups where emptiness is valid while retaining absence for capabilities the character does not possess.

#### Scenario: Empty universal groups are available

- **WHEN** a valid 5e character has no inventory, notes, actions, currency, roleplay text, languages, or tools
- **THEN** application features SHALL receive valid empty values for those groups without reconstructing missing parents

#### Scenario: Optional capability is absent

- **WHEN** a valid 5e character does not possess an optional capability such as spellcasting
- **THEN** the current model SHALL preserve that meaningful absence until an explicit edit creates the capability
