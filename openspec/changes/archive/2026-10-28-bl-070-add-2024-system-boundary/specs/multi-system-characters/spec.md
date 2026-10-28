## ADDED Requirements

### Requirement: Creation explicitly selects a supported rules system

The application SHALL offer distinct D&D 5e 2014 and D&D 5e 2024 creation choices and create a character belonging to the selected system and adopted rules release. System identity SHALL remain visible in the character list and sheet. Selecting a system SHALL NOT convert or alter another character.

#### Scenario: Creating a 2024 character

- **WHEN** a user selects the 2024 creation choice
- **THEN** the new character belongs to the adopted SRD 5.2.1 rules release and opens in the 2024 sheet
- **AND** existing 2014 characters remain unchanged

#### Scenario: Creating a 2014 character

- **WHEN** a user selects the 2014 creation choice
- **THEN** the character retains the current 2014 identity and supported sheet behavior rather than inheriting 2024 defaults

### Requirement: Sheet access respects the stored system identity

Opening a supported character SHALL select its own system sheet. An incorrect-system, missing-character, or unsupported-character request SHALL provide a non-mutating recovery path instead of rendering that character through another system's editor.

#### Scenario: Opening from a mixed list

- **WHEN** a user opens either edition from a list containing both
- **THEN** the corresponding sheet and edition label are displayed with that character's data

#### Scenario: Following a wrong-edition sheet link

- **WHEN** a valid 2024 character is requested through a 2014 sheet destination or vice versa
- **THEN** the application explains the mismatch and offers the correct sheet
- **AND** no wrong-edition editor is exposed and the document is unchanged

#### Scenario: Following a missing character link

- **WHEN** a sheet destination has no matching local character
- **THEN** the application provides a clear return-to-list path without substituting an editable unrelated character

### Requirement: Shared lifecycle preserves system-owned character meaning

Supported systems SHALL share creation, listing, persistence, and backup workflows without requiring identical gameplay fields or layouts. Editing, annotating, prioritizing, or deleting one character SHALL NOT mutate another character, its system selection, or shared example originals. Existing supported 2014 interactions SHALL remain available after its pre-playtest data rebase.

#### Scenario: Independent edits across editions

- **WHEN** a user changes a 2024 character, then opens and reloads a 2014 character
- **THEN** the 2024 change is retained on that character and the 2014 character remains unchanged

#### Scenario: Missing optional character concepts

- **WHEN** a valid supported character lacks classes, inventory, spellcasting, or other optional gameplay information
- **THEN** shared list, open, and backup operations remain usable without manufacturing those facts

#### Scenario: Retaining 2014 workflows

- **WHEN** a user edits a current rebased 2014 character
- **THEN** its accepted focused editing, notes, pins, quickfilters, source-linked actions, landmarks, and reference interactions remain available with their existing meanings

#### Scenario: Authoring 2014 runtime and identity facts

- **WHEN** a 2014 user records save or skill bonuses, skill expertise, passive perception, inspiration, player name or subclass
- **THEN** these facts SHALL be reachable through focused editing and survive storage and supported backup/restore
- **AND** changing proficiency or expertise SHALL NOT recalculate authored bonuses or overwrite unrelated notes
- **AND** Inspiration SHALL retain its 2014 label without applying 2024 rules effects
