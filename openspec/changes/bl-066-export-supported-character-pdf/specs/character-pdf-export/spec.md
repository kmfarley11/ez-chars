## ADDED Requirements

### Requirement: Explicitly supported local template

The system SHALL export a selected 2014 character using one identified, reviewed blank fillable form selected by the user on their device. Support SHALL require an established permission basis for the intended processing and output. The system MUST identify the supported form and its authoritative acquisition location, MUST NOT automatically fetch or retain it, and MUST reject unrecognized, changed, or unreadable templates without changing character data.

#### Scenario: Supported blank selected

- **WHEN** the user selects the supported blank form for a 2014 character
- **THEN** the system recognizes it and offers generation using that character
- **AND** the file and character content are processed locally without transmission to a server

#### Scenario: Unknown or already-filled form selected

- **WHEN** the selected file is not the supported blank artifact, including a revised or previously filled copy
- **THEN** the system explains the unsupported-template state and how to obtain the supported blank
- **AND** it does not produce a misleading export or alter stored characters

### Requirement: Deterministic and honest character coverage

The export SHALL represent supported character values without inventing authored facts or recalculating them through a different rules model. Coverage SHALL include supported identity and class information, core statistics, abilities and proficiencies, equipment and currency, character prose, and spellcasting information. Data without a reliable representation MUST be explicitly identified as not represented. Transient sheet search, quickfilters, collapsed regions, density limits, and pin state MUST NOT remove mapped content from the export.

#### Scenario: Export while the sheet is filtered

- **WHEN** a character's collections contain more mapped entries than currently visible in the sheet
- **THEN** export considers every mapped entry, including hidden and unpinned entries
- **AND** repeated exports of unchanged data retain the same logical coverage and ordering

#### Scenario: Unsupported character information

- **WHEN** a character contains information the supported form and continuation policy do not represent
- **THEN** the review identifies that omission rather than implying full-fidelity coverage
- **AND** the original information remains intact in character storage and JSON backup

### Requirement: Readable continuation instead of silent loss

The system SHALL preserve mapped content that exceeds the supported form's capacity on clearly identified continuation pages, maintaining its association with the originating section. Overflowing prose SHALL move in full to the continuation, leaving a reference rather than a duplicate or partial editable copy in the original field. Collection records SHALL appear once, with records that exceed original-row capacity continued intact. Repeated headings, identifying labels, and cross-references SHALL NOT be treated as duplicate record content. The system MUST NOT silently clip, summarize away, or render content at an unreadable size. The review SHALL explain that continuation pages are non-fillable snapshots and later PDF edits do not regenerate them. When faithful generation exceeds supported resource or text-rendering limits, the system MUST explain the failure rather than download incomplete output.

#### Scenario: Collection or prose exceeds form capacity

- **WHEN** mapped equipment, spells, or prose exceeds the corresponding form capacity
- **THEN** readable continuation content preserves the full mapped information
- **AND** the original section identifies where its continuation can be found
- **AND** the review identifies which sections continue

#### Scenario: Content cannot be safely rendered

- **WHEN** unsupported text or resource limits prevent faithful generation
- **THEN** the user receives an actionable explanation and no incomplete PDF is presented as successful
- **AND** the character remains unchanged

#### Scenario: Overflow has one content location

- **WHEN** prose or a collection exceeds the original form's capacity
- **THEN** overflowing prose appears in full on continuation pages with only a reference in its original field
- **AND** each collection record appears either in the original rows or in the continuation, without duplicating its content across both
- **AND** the review explains that editing original form fields later does not update continuation content

### Requirement: Reviewed download distinct from backup

Before download, the system SHALL show what is included, continued, and not represented for the selected character, and SHALL require acknowledgment of material omissions: omitted non-empty player-authored content or meaningful game information. Internal record IDs, pin order, and other app-only presentation state SHALL be covered by a compact standard limitations disclosure and MUST NOT alone require an omission acknowledgment. Empty optional values and content preserved on readable continuations MUST NOT be classified as omitted content. The system SHALL explain that PDF is not a lossless backup and does not support re-import in this workflow. The downloaded content MUST correspond to the snapshot and coverage the user reviewed. Existing JSON backup behavior MUST remain unchanged.

#### Scenario: Export with material omissions

- **WHEN** generation succeeds with material omissions
- **THEN** the user can inspect the coverage report and is directed to JSON for lossless backup
- **AND** download requires acknowledgment of those omissions

#### Scenario: Reviewed snapshot changes

- **WHEN** the export's source snapshot or selected template changes after review
- **THEN** any replacement output requires fresh review and any applicable omission acknowledgment
- **AND** the system never downloads an unreviewed replacement under the old approval

#### Scenario: Only app metadata is unrepresented

- **WHEN** export represents all non-empty player-authored content and meaningful game information but excludes internal IDs or app-only presentation state
- **THEN** the review explains those standard limitations without requiring a material-omission acknowledgment

#### Scenario: Authored notes are omitted

- **WHEN** export cannot represent a character's non-empty authored notes or reference information
- **THEN** the review identifies that content as a material omission requiring acknowledgment before download

### Requirement: Editable supported form output

The generated PDF SHALL preserve editability of the original supported form fields and display their populated values when reopened in the declared supported viewer set. Its print output SHALL visibly include populated values and readable continuation content. The system MUST NOT claim that continuation pages or PDF edits can round-trip into the character.

#### Scenario: Reopen and edit exported PDF

- **WHEN** a user opens a successfully exported PDF in a declared supported editing viewer
- **THEN** the original form's populated fields remain editable
- **AND** saving and reopening the PDF retains those edits without affecting the app's character

#### Scenario: Print exported PDF

- **WHEN** a user prints a generated PDF through a declared supported viewer
- **THEN** populated form values and any continuation pages remain visible and legible

### Requirement: Non-destructive accessible export lifecycle

The export workflow SHALL provide observable progress, recoverable errors, keyboard-operable review and download controls, and return focus to its initiating control when dismissed. Selection, generation, cancellation, errors, and download MUST NOT change persisted character data. Cancellation MUST prevent a pending operation from later initiating a download. Files and generated output MUST NOT be retained by the app beyond the active workflow.

#### Scenario: Cancel pending generation

- **WHEN** the user cancels while generation is pending
- **THEN** the workflow dismisses without changing characters or initiating a later download
- **AND** focus returns to the initiating control

#### Scenario: Generation fails

- **WHEN** PDF generation fails
- **THEN** the user sees an understandable error and can retry selection or cancel
- **AND** normal character use and JSON export remain available
