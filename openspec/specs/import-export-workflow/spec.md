# import-export-workflow Specification

## Purpose

Define the focused, validated dialog workflows for importing and exporting character backups without accidental local-data mutation.

## Requirements

### Requirement: Import file selection triggers OS picker

The system SHALL immediately invoke the operating system file picker when the user clicks the "Import Characters" action.

#### Scenario: User clicks import

- **WHEN** a user clicks "Import Characters"
- **THEN** the system file picker opens

### Requirement: Import review dialog

The system SHALL immediately display the import review dialog in a "reading" state after a file is selected, before parsing completes. Once parsing finishes, the dialog MUST present the count of valid characters, distinct validation status, choices for "Merge New" or "Replace All", and a "Cancel" action. It MUST explain duplicate skipping for Merge New and warn about the destructive effect of Replace All.

#### Scenario: File read pending

- **WHEN** a user selects a file and the system is reading its contents
- **THEN** the import review dialog appears showing a reading/progress state and the apply choices are disabled

#### Scenario: Valid character file selected

- **WHEN** a user selects a valid character export JSON
- **THEN** the import review dialog appears showing the character count, a duplicate-skipping explanation for Merge New, and a destructive warning for Replace All

#### Scenario: Invalid JSON file selected

- **WHEN** a user selects an invalid or unparseable JSON file
- **THEN** the import review dialog appears showing a distinct invalid JSON error and the apply choices are disabled

#### Scenario: Unsupported format selected

- **WHEN** a user selects a file that is valid JSON but not a supported character export
- **THEN** the import review dialog appears showing a distinct unsupported data error and the apply choices are disabled

#### Scenario: Cancellation without mutation

- **WHEN** a user clicks Cancel or dismisses the dialog
- **THEN** the dialog closes, local character data remains completely unchanged, and focus is restored to the "Import Characters" trigger

### Requirement: Import success proclamation

The system SHALL present the success status of the import action within the dialog upon completion.

#### Scenario: Merge New applied successfully

- **WHEN** the user clicks "Merge New" in the review dialog
- **THEN** the characters are imported and the dialog transitions to a success message showing the number of imported items

#### Scenario: Replace All applied successfully

- **WHEN** the user clicks "Replace All" in the review dialog
- **THEN** the existing characters are deleted, the new characters are imported, and the dialog transitions to a success message showing the number of imported items

#### Scenario: Success dialog dismissal

- **WHEN** the user dismisses the success dialog
- **THEN** the dialog closes and focus is restored to the "Import Characters" trigger

### Requirement: Export confirmation dialog

The system SHALL prompt the user with a confirmation dialog before generating an export file.

#### Scenario: User initiates export

- **WHEN** the user clicks "Export Characters"
- **THEN** a confirmation dialog appears asking to confirm the export of X characters

#### Scenario: Export confirmed

- **WHEN** the user confirms the export in the dialog
- **THEN** the dialog closes and the browser's standard download behavior is invoked with the serialized JSON payload

#### Scenario: Export cancelled

- **WHEN** the user clicks Cancel or dismisses the export dialog
- **THEN** the dialog closes, no file is downloaded, and focus is restored to the "Export Characters" trigger

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
