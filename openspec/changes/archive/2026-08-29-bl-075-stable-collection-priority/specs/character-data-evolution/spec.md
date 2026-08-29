## ADDED Requirements

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

## MODIFIED Requirements

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
