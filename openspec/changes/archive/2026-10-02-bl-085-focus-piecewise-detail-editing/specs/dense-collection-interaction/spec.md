## MODIFIED Requirements

### Requirement: Dense sheet collections expose a consistent interaction grammar

The 2014 character sheet SHALL present Weapons, Armor & Shields, Other Gear, Spells, Runtime Actions, and Supporting Collections (Features, Traits, Languages, Tools) with clear collection names, total or filtered counts, semantic list and row structure, predictable collection actions, and explicit empty and no-match states. Runtime Actions SHALL use a five-item simple-list limit because their information-rich rows consume more space, while compact Supporting Collections SHALL use a seven-item simple-list limit. Collections that exceed their applicable limit SHALL expose bounded or focused presentation and search controls. Each pinnable equipment, spell, or Supporting Collection record SHALL provide a state-sensitive, first-class Pin/Unpin action adjacent to its explicit focused-detail target rather than requiring the user to discover priority inside an overflow menu or duplicate the same operation in a collection-level batch manager. Once focused detail provides Edit and annotation/reference access, ordinary record rows SHALL NOT retain duplicate Edit or Notes/References overflow accelerators; domain-specific source commands MAY retain an overflow menu when they remain outside focused authored-detail editing. Supporting Collections SHALL retain compact bullet rows and explicit Add and focused-detail paths when applicable rather than adopting either the complete equipment/spell menu grammar or a generic batch organizer.

#### Scenario: Viewing a populated target collection (Equipment, Spells)

- **WHEN** an equipment or spell collection contains one or more records
- **THEN** the sheet SHALL identify the collection and its relevant count
- **AND** each record SHALL be exposed as one distinct list item with adjacent explicit focused-detail and state-sensitive Pin or Unpin actions
- **AND** activating Pin or Unpin SHALL update priority immediately and preserve a useful focus destination when the record moves
- **AND** the record SHALL NOT retain duplicate Edit or Notes/References overflow accelerators once focused detail exposes those actions
- **AND** the collection SHALL NOT require a separate batch Pin manager for the same priority operation

#### Scenario: Viewing a populated Runtime Actions collection

- **WHEN** the Runtime Actions collection contains one or more records
- **THEN** the sheet SHALL identify the collection and its relevant count
- **AND** eligible custom and source-linked records SHALL use the unified read-first detail and editing workflow for action-owned fields and annotations
- **AND** the specialized Add Action workflow SHALL continue to support source selection or custom creation without becoming a generic bulk editor
- **AND** the collection SHALL retain its source-specific row commands and independently authored ordering without being forced into generic target-collection priority management

#### Scenario: Using a source-linked Runtime Action command

- **WHEN** a user invokes View Source or Resync for a source-linked Runtime Action
- **THEN** the system SHALL preserve that command as distinct from focused authored-and-annotation editing
- **AND** it SHALL preserve the existing source ownership and resynchronization semantics

#### Scenario: Viewing a populated supporting collection

- **WHEN** a supporting collection (e.g. Features, Traits) contains one or more records
- **THEN** the collection SHALL retain its compact bullet-list presentation with a quiet marker when pinned
- **AND** each record SHALL expose adjacent explicit focused-detail and state-sensitive Pin or Unpin actions without adopting the detailed Runtime Action or equipment/spell row-menu treatment
- **AND** the collection SHALL expose Add when the collection supports user-authored records
- **AND** it SHALL NOT duplicate the record-level Pin or Unpin operation in a collection-level batch manager

#### Scenario: Viewing an empty target collection

- **WHEN** a target collection contains no records
- **THEN** the sheet SHALL present an explicit empty state and retain every collection-level action that remains meaningful for an empty collection

#### Scenario: Viewing spellcasting summary and spells

- **WHEN** a character has spellcasting summary data, spell slots, and spell records
- **THEN** the sheet SHALL present ability, save DC, and attack bonus in a compact full-width Spellcasting group
- **AND** it SHALL present Spell Slots as a discrete full-width group on the next row before the searchable spell collection
- **AND** every first- through ninth-level slot SHALL appear once as a compact `used / max` pair, defaulting to `0 / 0` when that level is not yet stored
- **AND** each Used and Max label SHALL open its level's read-first detail with the selected field highlighted and independently saved field and note edits, without a redundant Spell Slots group-detail action
- **AND** it SHALL NOT duplicate the same slot usage outside its compact per-level presentation

#### Scenario: Adding a previously absent spell-slot level

- **WHEN** a user edits a `0 / 0` slot level through its targeted read-first detail and explicitly saves a nonzero Used or Max value
- **THEN** that level SHALL become part of the character's persisted spell-slot data
- **AND** untouched `0 / 0` defaults SHALL NOT require persisted placeholder records

#### Scenario: Viewing a character without spells or spell slots

- **WHEN** a character has no spell records and no nonzero spell-slot levels
- **THEN** the Spells section SHALL start expanded
- **AND** spellcasting, spell-slot, and spell-list setup controls SHALL remain reachable without requiring the user to discover a collapsed empty section

#### Scenario: Viewing Runtime Actions within the simple-list limit

- **WHEN** the Runtime Actions collection contains 5 or fewer items
- **THEN** it SHALL be presented as a simple list without search controls or bounded scrolling
- **AND** it SHALL retain the shared heading, semantic, and action-placement baseline

#### Scenario: Viewing Runtime Actions above the simple-list limit

- **WHEN** the Runtime Actions collection contains 6 or more items
- **THEN** it SHALL activate a bounded height container or focused view and expose a search bar

#### Scenario: Viewing a supporting collection within the simple-list limit

- **WHEN** a Supporting Collection contains 7 or fewer items
- **THEN** it SHALL be presented as a simple list without search controls or bounded scrolling
- **AND** it SHALL retain the shared heading, semantic, and action-placement baseline

#### Scenario: Viewing a supporting collection above the simple-list limit

- **WHEN** a Supporting Collection contains 8 or more items
- **THEN** it SHALL activate a bounded height container or focused view and expose a search bar
- **AND** record-level Pin or Unpin SHALL remain available in the applicable presentation

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

#### Scenario: Opening a record by name without duplicate entry

- **WHEN** a collection record's visible name opens its focused detail
- **THEN** the row SHALL omit a duplicate detail button
- **AND** eligible Pin, Add, and specialized source commands SHALL remain distinct
- **AND** returning from detail SHALL restore focus to the name or a stable browsing destination if the record no longer matches

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
