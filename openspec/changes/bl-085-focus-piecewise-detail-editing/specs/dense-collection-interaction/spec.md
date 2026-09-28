## MODIFIED Requirements

### Requirement: Every target row has a complete focused action path

Each target collection record SHALL provide an explicit path to one focused read-first detail workflow with independently saved field and note edits. A compact submenu MAY expose accelerators into that same workflow. Collection-level Add, focused eligible removal, and immediate record-level Pin/Unpin SHALL remain distinct from authored-detail editing; a batch Pin manager or generic batch organizer SHALL NOT be required as an alternate editing or priority model.

#### Scenario: Keeping priority first-class for a pinnable record

- **WHEN** a repeatable collection record supports player-authored priority
- **THEN** its scan-first presentation SHALL expose state-sensitive Pin or Unpin directly beside its focused-detail target
- **AND** the priority command SHALL remain immediate rather than entering or changing a field or note draft

#### Scenario: Presenting a singular rich field

- **WHEN** a rich detail target represents singular character information rather than a repeatable collection record
- **THEN** the system SHALL NOT expose Pin or Unpin solely to make its controls resemble collection rows

#### Scenario: Editing one record from its focused detail

- **WHEN** a user edits and explicitly saves one eligible field, note, or genuinely coupled unit inside a record's detail
- **THEN** only the requested edit SHALL be committed to the selected record
- **AND** the record SHALL retain its stable identity and unrelated fields, notes, and records SHALL remain unchanged
- **AND** the workflow SHALL NOT require a record-wide outer Save

#### Scenario: Cancelling one record edit

- **WHEN** a user cancels the active small edit in a record's detail
- **THEN** only that unsaved edit SHALL be discarded
- **AND** the selected record's read-first detail SHALL remain open
- **AND** earlier explicitly saved edits SHALL remain committed

#### Scenario: Correcting a recorded spell level

- **WHEN** a user corrects a spell's recorded level from its focused detail
- **THEN** the system SHALL accept whole levels from 0 (cantrip) through 9 and reject invalid levels without mutation
- **AND** a valid save SHALL update the level presentation while preserving the spell's identity, notes, and priority
- **AND** the correction SHALL NOT require deleting and recreating the spell or represent an upcast

#### Scenario: Editing one record's annotations

- **WHEN** a user saves an individual note operation from a record's focused detail
- **THEN** the note SHALL remain associated with that selected record through the existing local persistence flow
- **AND** the row SHALL show a quiet persistent note indicator when notes exist
- **AND** other notes and authored values SHALL remain unchanged

#### Scenario: Distinguishing priority from record creation

- **WHEN** an eligible collection supports both player priority and user-authored creation
- **THEN** the system SHALL present Pin/Unpin on each record and Add at the collection boundary
- **AND** any eligible Remove action SHALL remain associated with the selected record rather than a universal collection organizer
- **AND** new-record Add SHALL retain one complete explicit creation commit

#### Scenario: Preserving identity and browse context during small edits

- **WHEN** a local save changes a record's name or other information affecting its visible order or search match
- **THEN** focused detail SHALL remain associated with that record's stable identity
- **AND** returning to the collection SHALL preserve the active query and restore a meaningful browsing/focus destination even if the record no longer matches

#### Scenario: Keeping specialized commands distinct

- **WHEN** a record provides source navigation, resynchronization, or another domain-specific command
- **THEN** the command SHALL retain its domain-owned behavior without being converted into generic field editing
- **AND** a command that leaves or replaces dirty edited content SHALL require explicit draft resolution first
