## MODIFIED Requirements

### Requirement: Supported character data hydrates to one current model

The system SHALL validate each supported character against its own current pre-playtest representation before exposing it to application features. D&D 5e 2014 and D&D 5e 2024 SHALL have distinct system and character-layout identities. Unsupported systems, earlier incompatible experimental shapes, and unsupported future versions SHALL be rejected without guessing or rewriting their source data. No automatic migration from earlier experimental 2014 v0 shapes is promised.

#### Scenario: Current v0 character is loaded

- **WHEN** a character declares its supported system's current pre-playtest v0 schema version and satisfies its strict shape
- **THEN** the system SHALL hydrate it without changing its semantic content

#### Scenario: Earlier experimental character is loaded

- **WHEN** a local or imported character declares an experimental schema identifier that predates the current v0 baseline
- **THEN** the system SHALL reject it as outdated without attempting a compatibility migration
- **AND** the source data SHALL NOT be overwritten

#### Scenario: Earlier shape uses the same unstable v0 identifier

- **WHEN** a previously saved 2014 character uses the v0 identifier but no longer satisfies its rebased strict shape
- **THEN** it SHALL be rejected non-destructively rather than partially repaired or treated as a different system

#### Scenario: Future character version is encountered

- **WHEN** a character declares an unsupported future schema version
- **THEN** the system SHALL reject it without guessing a migration or overwriting the source data

#### Scenario: Unknown system or mismatched version is encountered

- **WHEN** a document declares an unsupported system or another system's character-schema version
- **THEN** it SHALL NOT be accepted as a generic playable character or coerced into either supported D&D edition

### Requirement: Current serialization is versioned and repeatable

The system SHALL save and export only current validated character data for each supported system, and hydrating serialized current data MUST be idempotent. Rules-release identity and character-layout identity SHALL remain distinct.

#### Scenario: Current character is saved

- **WHEN** a valid current character is persisted or exported
- **THEN** the saved character SHALL declare its system's current schema version, using `dnd5e-2014.schema.v0` for 2014 or `dnd5e-2024.schema.v0` for 2024
- **AND** it SHALL retain the selected rules release and only current canonical properties

#### Scenario: Current character round-trips

- **WHEN** a current character is exported and imported without user edits
- **THEN** its semantic character data, stable identities, annotations, priority, relationships, ordering, meaningful absence, and timestamps SHALL remain equivalent after the round trip

#### Scenario: Current hydration is repeated

- **WHEN** current serialized character data is hydrated more than once
- **THEN** subsequent hydration SHALL not duplicate or rewrite records

#### Scenario: Stored or outgoing characters repeat an identity

- **WHEN** a stored collection, persistence attempt, or export contains repeated document identities, including across editions
- **THEN** the application SHALL reject the collection rather than persist or export ambiguous records
- **AND** rejected stored bytes SHALL remain recoverable and a rejected write SHALL leave existing storage untouched

### Requirement: Structural defaults do not erase meaningful absence

Supported character representations SHALL provide stable empty collections and semantic groups where their system permits emptiness while retaining absence for optional capabilities and unknown optional facts. Shared application operations SHALL NOT require every system to contain identical identity, class, feature, inventory, or notes structures. The existing required 2014 structural defaults SHALL remain supported; 2024 sparse records SHALL NOT require fabricated gameplay values.

#### Scenario: Empty universal groups are available

- **WHEN** a valid 2014 character has no inventory, notes, actions, currency, roleplay text, languages, or tools
- **THEN** application features SHALL receive valid empty values for those groups without reconstructing missing parents

#### Scenario: Optional capability is absent

- **WHEN** a valid supported character does not possess an optional capability such as spellcasting
- **THEN** the current model SHALL preserve that meaningful absence until an explicit edit creates the capability

#### Scenario: A sparse 2024 character omits unknown facts

- **WHEN** a 2024 character omits its class, ability scores, or other optional facts
- **THEN** hydration, summary, editing of known values, and backup SHALL work without inventing those facts

## ADDED Requirements

### Requirement: Rejected local data remains recoverable until explicit reset

When stored characters cannot be loaded, the application SHALL preserve the untouched stored source, explain the compatibility problem, offer an original-data download, and require explicit confirmation before resetting that data. Ordinary demo interactions, edits, creation, deletion, or import attempts SHALL NOT overwrite the rejected source. Downloading original data SHALL NOT promise that it is a valid current backup or that it can be restored automatically. The pre-release preservation disclaimer SHALL remain visible.

#### Scenario: Interacting after a rejected load

- **WHEN** stored data is rejected and the user subsequently inspects or edits temporary example characters
- **THEN** the original stored source SHALL remain unchanged through repeated interactions and reload
- **AND** any temporary state SHALL be clearly distinguished from persisted recovery

#### Scenario: Downloading the original data

- **WHEN** the user requests an original-data download from recovery
- **THEN** the application SHALL download the unnormalized stored source without transmitting it to a service
- **AND** the download SHALL NOT dismiss recovery, clear storage, or substitute example characters

#### Scenario: Resetting rejected storage

- **WHEN** the user explicitly confirms reset
- **THEN** the application SHALL replace rejected data with a valid baseline and resume ordinary persistence only after successful completion
- **AND** cancellation or storage failure SHALL leave recovery active without claiming a successful reset

#### Scenario: A mixed stored collection contains an unsupported entry

- **WHEN** any entry prevents the stored character collection from validating
- **THEN** the original collection SHALL remain recoverable as a whole rather than silently persisting only the supported entries

### Requirement: Inventory classification is explicit and identity-preserving

Each supported D&D system SHALL own its inventory classifications and derive equipment presentation from the explicit authored classification rather than display-name substrings or hidden user-tag conventions. Every inventory record SHALL retain stable identity, and correcting its classification SHALL preserve notes, inventory-wide Pin state, and valid source relationships.

#### Scenario: Renaming other gear

- **WHEN** a user renames an Other Gear item to a name containing a weapon or armor term
- **THEN** the item SHALL remain Other Gear with the same identity and notes

#### Scenario: Deliberately changing category

- **WHEN** the user changes an item's category through focused editing
- **THEN** it SHALL appear in the corresponding equipment group without being recreated
- **AND** its Pin state and any supported source links SHALL remain attached to that item
