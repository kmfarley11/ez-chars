## ADDED Requirements

### Requirement: Mixed-system backups preserve validated independent characters

JSON export and reviewed import SHALL support collections containing both current 2014 and current 2024 characters, preserving each character's system, rules release, schema version, authored information, record identities, notes, priority, and source relationships. Every character SHALL validate against its declared supported system before import can be applied. An invalid or unsupported entry SHALL reject the entire import without altering stored characters. Existing confirmation, cancellation, and focus behavior SHALL remain intact.

#### Scenario: Exporting and restoring both editions

- **WHEN** a user confirms export of a valid mixed-system collection and later confirms its import
- **THEN** each character SHALL remain semantically equivalent and open through its own system sheet

#### Scenario: Rejecting a partly supported backup

- **WHEN** an import contains valid characters alongside an unknown-system, incompatible-version, or invalid character
- **THEN** the review SHALL explain rejection and disable import application
- **AND** no supported subset SHALL be imported automatically and current local data SHALL remain unchanged

#### Scenario: Merging a duplicate identity across systems

- **WHEN** Merge New encounters an existing document identity, even if the incoming character declares another system
- **THEN** it SHALL skip that incoming character under the existing duplicate policy and report the skip
- **AND** it SHALL NOT convert or replace the existing character

#### Scenario: Import is attempted while rejected storage is unresolved

- **WHEN** the application is preserving rejected local data for recovery
- **THEN** import application SHALL remain disabled until the user explicitly resolves recovery through reset
- **AND** the untouched original-data download SHALL remain available

#### Scenario: A reviewed import repeats a character identity

- **WHEN** the imported list repeats a document identity, including across editions
- **THEN** Replace All SHALL reject it without changing local characters and explain that Merge New can skip duplicates
- **AND** Merge New SHALL retain its existing skip-and-report policy, producing only distinct identities
