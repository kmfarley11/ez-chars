## ADDED Requirements

### Requirement: Collection browsing, priority, and record lifecycle remain distinct

The system SHALL keep scan-first collection browsing, singular-record detail, record lifecycle, and player-authored priority understandable as distinct concerns. An explicit collection-level Add action SHALL create one record using the minimum required authored information, while eligible removal SHALL remain associated with the selected record. Later authored and annotation changes SHALL use that record's focused detail workflow. Pin/Unpin and Manage Pins SHALL remain the baseline for player-authored priority; the system SHALL NOT require a generic collection organizer or reorder workflow.

#### Scenario: Opening one record from a collection

- **WHEN** a user activates a record's explicit detail target from a compact, bounded, or focused collection
- **THEN** the system SHALL open the selected record's read-first focused detail
- **AND** it SHALL preserve the collection's active query and browsing context

#### Scenario: Creating one record

- **WHEN** a user invokes Add for a collection
- **THEN** the system SHALL collect only the authored information required to create one record
- **AND** existing records and their annotations SHALL NOT become part of the same editing surface

#### Scenario: Creating records from neighboring collection groups

- **WHEN** neighboring equipment or supporting collection groups allow user-authored records
- **THEN** each group SHALL expose the same understandable collection-level Add grammar
- **AND** populated groups SHALL present their records through the same semantic list and record-action grammar

#### Scenario: Removing one eligible record

- **WHEN** a user removes an eligible user-owned record from that record's focused workflow
- **THEN** the system SHALL require explicit confirmation or offer a recoverable undo path before the removal becomes final
- **AND** only the selected record SHALL be removed
- **AND** records whose system or source ownership forbids removal SHALL NOT inherit a generic removal action

#### Scenario: Discovering notes in a collection

- **WHEN** a collection record contains one or more annotations
- **THEN** its scan-first presentation SHALL expose a quiet note indicator with that record's own text rather than in the action cluster
- **AND** where the presentation distinguishes a field or record label from its value or supporting content, it SHALL order the label or title, then the note indicator, then that value or supporting content
- **AND** the record's focused detail SHALL expose the annotations in that record's context
- **AND** collection browsing or record lifecycle actions SHALL NOT introduce an aggregate collection-note badge or a separate collection-wide annotation overview or editing surface

#### Scenario: Opening a supporting-collection record

- **WHEN** a user activates an item in a compact Supporting Collection
- **THEN** the item SHALL have a focused detail path without requiring the complete equipment-or-spell row-action menu

## MODIFIED Requirements

### Requirement: Dense sheet collections expose a consistent interaction grammar

The 2014 character sheet SHALL present Weapons, Armor & Shields, Other Gear, Spells, Runtime Actions, and Supporting Collections (Features, Traits, Languages, Tools) with clear collection names, total or filtered counts, semantic list and row structure, predictable collection actions, and explicit empty and no-match states. Runtime Actions SHALL use a five-item simple-list limit because their information-rich rows consume more space, while compact Supporting Collections SHALL use a seven-item simple-list limit. Collections that exceed their applicable limit SHALL expose bounded or focused presentation and search controls. Eligible equipment, spell, and Supporting Collections SHALL expose collection-level Manage Pins while preserving their collection-specific editing grammar. Each pinnable record SHALL provide a state-sensitive, first-class Pin/Unpin action adjacent to its explicit focused-detail target rather than requiring the user to discover priority inside an overflow menu. Once focused detail provides Edit and annotation/reference access, ordinary record rows SHALL NOT retain duplicate Edit or Notes/References overflow accelerators; domain-specific source commands MAY retain an overflow menu when they remain outside focused authored-detail editing. Supporting Collections SHALL retain compact bullet rows and explicit Add and focused-detail paths when applicable rather than adopting either the complete equipment/spell menu grammar or a generic batch organizer.

#### Scenario: Viewing a populated target collection (Equipment, Spells)

- **WHEN** an equipment or spell collection contains one or more records
- **THEN** the sheet SHALL identify the collection and its relevant count
- **AND** each record SHALL be exposed as one distinct list item with adjacent explicit focused-detail and state-sensitive Pin or Unpin actions
- **AND** activating Pin or Unpin SHALL update priority immediately and preserve a useful focus destination when the record moves
- **AND** the record SHALL NOT retain duplicate Edit or Notes/References overflow accelerators once focused detail exposes those actions
- **AND** the collection SHALL expose a separately named Manage Pins action

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
- **AND** the collection SHALL expose separately named Add and Manage Pins actions when applicable

#### Scenario: Viewing an empty target collection

- **WHEN** a target collection contains no records
- **THEN** the sheet SHALL present an explicit empty state and retain every collection-level action that remains meaningful for an empty collection

#### Scenario: Viewing spellcasting summary and spells

- **WHEN** a character has spellcasting summary data, spell slots, and spell records
- **THEN** the sheet SHALL present ability, save DC, and attack bonus in a compact full-width Spellcasting group
- **AND** it SHALL present Spell Slots as a discrete full-width group on the next row before the searchable spell collection
- **AND** every first- through ninth-level slot SHALL appear once as an editable `used / max` pair, defaulting to `0 / 0` when that level is not yet stored
- **AND** it SHALL NOT repeat the same slot usage as a separate `Used` field or level-specific slot card

#### Scenario: Adding a previously absent spell-slot level

- **WHEN** a user edits a `0 / 0` slot level and saves a nonzero used or maximum value
- **THEN** that level SHALL become part of the character's persisted spell-slot data
- **AND** untouched `0 / 0` defaults SHALL NOT require persisted placeholder records

#### Scenario: Viewing a character without spells or spell slots

- **WHEN** a character has no spell records and no nonzero spell-slot levels
- **THEN** the Spells section SHALL start collapsed
- **AND** the user SHALL be able to expand it to reach spellcasting, spell-slot, and spell-list setup controls

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
- **AND** it SHALL retain the shared heading, semantic, action-placement, and Manage Pins baseline

#### Scenario: Viewing a supporting collection above the simple-list limit

- **WHEN** a Supporting Collection contains 8 or more items
- **THEN** it SHALL activate a bounded height container or focused view and expose a search bar
- **AND** Manage Pins SHALL remain available in the applicable presentation

### Requirement: Focused and bounded collection browsing has one scroll owner

Dense collections SHALL avoid unbounded sheet growth by using bounded browsing or focused presentation on larger screens and a full-height focused presentation on phone-sized screens. For Runtime Actions with 6 or more items and Supporting Collections with 8 or more items on a larger screen, the presentation SHALL keep collection identity, result count, and search available while the collection content scrolls through one explicit scroll owner, and SHALL provide Close navigation only when the selected presentation is focused/modal. A phone-focused collection SHALL transition among browse, record detail, and record editing within one logical focused workflow rather than stacking another modal over it.

#### Scenario: Browsing a dense collection on a larger screen

- **WHEN** a collection exceeds its applicable simple-list limit on a larger screen
- **THEN** the collection SHALL provide bounded scrolling or a focused view without making any record unreachable
- **AND** its search control SHALL remain usable for the complete collection scope
- **AND** the inline region SHALL visibly communicate its independent scroll boundary and preserve normal sheet-scroll chaining when the collection reaches either boundary

#### Scenario: Full collection content exceeds the available width

- **WHEN** a record label or authored detail is wider than a bounded or focused collection view, including content without natural word-break opportunities
- **THEN** the complete content SHALL wrap within the available width
- **AND** the collection SHALL NOT introduce a horizontal scroll owner

#### Scenario: Opening a dense collection on a phone

- **WHEN** a user opens an affected dense collection from its phone preview
- **THEN** a full-height focused presentation SHALL expose the complete collection with persistent collection identity, result count, search, and close navigation
- **AND** background sheet content SHALL NOT become a competing scroll owner while that presentation is modal
- **AND** lightweight visual overflow cues SHALL distinguish its scrollable content region from its persistent navigation

#### Scenario: Opening record detail from a phone-focused collection

- **WHEN** a user opens record detail or editing while browsing a phone-focused collection
- **THEN** the current focused workflow SHALL transition to that logical level without opening a second modal over the collection
- **AND** Back SHALL restore the collection query and browsing context without requiring the collection to reload

#### Scenario: Returning from a focused row or card task

- **WHEN** a user closes or completes a row edit, annotation task, or record-lifecycle task opened from a focused collection
- **THEN** the collection's active query and focused browsing context SHALL remain available
- **AND** keyboard focus SHALL return to the invoking action or an equivalent stable destination when that action remains visible

### Requirement: Every target row has a complete focused action path

Each target collection record SHALL provide an explicit path to one focused read-first detail and editing workflow. A compact submenu MAY expose accelerators into that same workflow. Collection-level Add, focused eligible removal, and Manage Pins SHALL remain distinct from authored-detail editing; a generic batch organizer SHALL NOT be required as an alternate editing or priority model.

#### Scenario: Keeping priority first-class for a pinnable record

- **WHEN** a repeatable collection record supports player-authored priority
- **THEN** its scan-first presentation SHALL expose state-sensitive Pin or Unpin directly beside its focused-detail target
- **AND** the priority command SHALL remain immediate rather than entering or changing the authored-and-annotation draft

#### Scenario: Presenting a singular rich field

- **WHEN** a rich detail target represents singular character information rather than a repeatable collection record
- **THEN** the system SHALL NOT expose Pin or Unpin solely to make its controls resemble collection rows

#### Scenario: Editing one record from its focused detail

- **WHEN** a user invokes Edit for one target record and saves valid authored and annotation changes
- **THEN** only the selected record SHALL receive those changes
- **AND** the record SHALL retain its stable identity and unrelated records SHALL remain unchanged

#### Scenario: Cancelling one record edit

- **WHEN** a user cancels a focused record edit
- **THEN** the selected record and the rest of the character SHALL remain unchanged
- **AND** the selected record's read-first detail SHALL remain open

#### Scenario: Editing one record's annotations

- **WHEN** a user changes annotations within one record's focused editing session and saves
- **THEN** the annotations SHALL remain associated with that selected record through the existing local persistence flow
- **AND** the row SHALL show a quiet persistent annotation indicator when annotations exist

#### Scenario: Distinguishing priority from record lifecycle

- **WHEN** an eligible collection exposes both Manage Pins and Add
- **THEN** the system SHALL present them as separately named priority and record-creation actions
- **AND** any eligible Remove action SHALL remain associated with the selected record rather than a universal collection organizer
