## Purpose

Define behavior-preserving requirements and testable scenarios for refactoring character sheet pages and extracting layout projections, metadata, and JSON patch translations into clean modules.

## Requirements

### Requirement: Preserve the 5e sheet experience during internal decomposition

The system MUST preserve the currently supported D&D 5e 2014 sheet rendering, editing, annotation, and persistence behavior while projection and patch responsibilities are reorganized internally.

#### Scenario: Existing character information remains available

- **WHEN** a user opens a supported 5e 2014 character after the refactor
- **THEN** the sheet MUST continue to present the same supported overview, runtime, ability, proficiency, feature, spell, inventory, background, roleplay, and notes information derived from that character

#### Scenario: Virtual collection edits preserve canonical character data

- **WHEN** a user edits a card backed by a virtual spell, action, proficiency, feature, inventory, currency, or organizational-note path
- **THEN** the saved character MUST reflect the edit in its canonical schema-backed location while preserving unrelated records and existing identities

#### Scenario: Field values and annotations continue to persist

- **WHEN** a user saves a supported field value or annotation and later reloads the character
- **THEN** the sheet MUST display the saved value or annotation through the existing local-first persistence behavior

#### Scenario: Invalid character selection behavior remains unchanged

- **WHEN** the 5e route receives a missing or unknown character identifier
- **THEN** the route MUST continue to show its existing user-facing missing-character state without mutating stored characters
