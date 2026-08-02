# dense-collection-interaction Specification

## Purpose

Keep saturated on-sheet collections responsive, searchable, completely reachable, and accessible without allowing long equipment or spell lists to overwhelm at-a-glance character-sheet use.

## Requirements

### Requirement: Dense sheet collections expose a consistent interaction grammar

The 2014 character sheet SHALL present Weapons, Armor & Shields, Other Gear, and Spells with clear collection names, total or filtered counts, semantic list and row structure, predictable collection actions, and explicit empty and no-match states. Other on-sheet collections SHALL retain consistent headings, semantics, and action placement without being required to expose density controls that their size or content does not justify.

#### Scenario: Viewing a populated target collection

- **WHEN** a target collection contains one or more records
- **THEN** the sheet SHALL identify the collection and its relevant count
- **AND** each record SHALL be exposed as one distinct list item with its complete actions associated with that item

#### Scenario: Viewing an empty target collection

- **WHEN** a target collection contains no records
- **THEN** the sheet SHALL present an explicit empty state and retain the available collection-level actions

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

#### Scenario: Viewing a short non-target collection

- **WHEN** a short collection such as Traits, Features, languages, tools, runtime actions, or miscellaneous notes does not need focused browsing
- **THEN** it SHALL retain the shared heading, semantic, and action-placement baseline without being forced to expose search or bounded scrolling

### Requirement: Dense collection search is deterministic and scope-appropriate

The sheet SHALL provide case-insensitive text search over primary record labels and useful authored detail for each target collection. Equipment search SHALL remain scoped to the active Weapons, Armor & Shields, or Other Gear collection, while spell search SHALL span the character's logical spell collection across displayed levels and retain cantrip or level and preparation context.

#### Scenario: Searching one equipment group

- **WHEN** a user searches within Other Gear
- **THEN** matching Other Gear records SHALL be shown in their existing authored order
- **AND** Weapons and Armor & Shields SHALL NOT be introduced into that result set

#### Scenario: Searching spells across levels

- **WHEN** a user searches for text that matches spells at more than one level
- **THEN** every matching spell SHALL be discoverable through the same spell-search workflow
- **AND** each result SHALL identify itself as a Spell and display its cantrip or spell-level context plus prepared state when recorded

#### Scenario: Search has no matches

- **WHEN** the active query matches no record in its collection scope
- **THEN** the sheet SHALL present a no-match state, a zero-result count, and an evident way to clear or revise the query

#### Scenario: Search changes the visible subset

- **WHEN** a query filters a target collection
- **THEN** matching records SHALL retain their relative authored order
- **AND** filtering SHALL NOT mutate canonical character data or imply a new saved ordering

### Requirement: Phone-sized collection cards preserve at-a-glance priority

On a phone-sized sheet, each target collection card SHALL show at most the first five authored records as compact previews and SHALL provide access to the complete collection. Each preview SHALL present its primary name and, when useful authored detail exists, a single-line `Name: detail` summary whose detail is visually secondary and italicized without removing the complete text from assistive technology.

#### Scenario: Phone collection has five or fewer records

- **WHEN** a phone-sized collection contains no more than five records
- **THEN** every record SHALL appear in authored order within the compact card without a remaining-item announcement

#### Scenario: Phone collection has more than five records

- **WHEN** a phone-sized collection contains more than five records
- **THEN** only its first five authored records SHALL appear in the compact preview
- **AND** the complete collection SHALL remain reachable through an explicitly named action that includes the exact total item count

#### Scenario: Preview detail exceeds the card width

- **WHEN** a compact preview summary is wider than its available row
- **THEN** the visible summary SHALL truncate on one line with an ellipsis rather than expanding or overflowing the card
- **AND** assistive technology SHALL retain access to the complete record label and detail

### Requirement: Focused and bounded collection browsing has one scroll owner

Target collections SHALL avoid unbounded sheet growth by using bounded browsing on larger screens and a full-height focused presentation on phone-sized screens. The focused presentation SHALL keep collection identity, result count, search, and close navigation available while the collection content scrolls through one explicit scroll region.

#### Scenario: Browsing a dense collection on a larger screen

- **WHEN** a target collection exceeds its inline presentation boundary on a larger screen
- **THEN** the collection SHALL provide bounded scrolling or an equivalent focused view without making any record unreachable
- **AND** its search control SHALL remain usable for the complete collection scope
- **AND** lightweight visual overflow cues SHALL make additional off-screen content evident until the user reaches the applicable scroll boundary

#### Scenario: Opening a dense collection on a phone

- **WHEN** a user opens a target collection from its phone preview
- **THEN** a full-height focused presentation SHALL expose the complete collection with persistent collection identity, result count, search, and close navigation
- **AND** background sheet content SHALL NOT become a competing scroll owner while that presentation is modal
- **AND** lightweight visual overflow cues SHALL distinguish its scrollable content region from its persistent navigation

#### Scenario: Returning from a focused row task

- **WHEN** a user closes or completes a row edit or annotation task opened from a focused collection
- **THEN** the collection's active query and focused browsing context SHALL remain available
- **AND** keyboard focus SHALL return to the invoking row action or an equivalent stable destination when that row remains visible

### Requirement: Every target row has a complete focused action path

Each target collection record SHALL provide a compact submenu as the canonical complete path to focused singular-record editing and annotation. Bulk collection editing SHALL remain available as a separately named collection-level action rather than serving as the only way to change one record.

#### Scenario: Editing one record from its row

- **WHEN** a user invokes Edit from a target row submenu and saves valid changes
- **THEN** only the selected record SHALL receive those authored changes
- **AND** the record SHALL retain its stable identity and unrelated records SHALL remain unchanged

#### Scenario: Cancelling one record edit

- **WHEN** a user cancels a focused row edit
- **THEN** the selected record and the rest of the character SHALL remain unchanged

#### Scenario: Editing one record's annotations

- **WHEN** a user invokes Notes from a target row submenu and saves annotations
- **THEN** the annotations SHALL remain associated with that selected record through the existing local persistence flow
- **AND** the row SHALL show a quiet persistent annotation indicator when annotations exist

#### Scenario: Opening collection-level editing

- **WHEN** a user invokes the explicitly named bulk-edit action for a target collection
- **THEN** the existing collection editing workflow SHALL remain available without being confused with the selected row's Edit action

### Requirement: Dense collection controls remain accessible across input modes

Every target record and collection action SHALL remain discoverable and operable through touch, keyboard, pointer, and assistive technology. Search, menus, focused presentations, edit dialogs, and annotation dialogs SHALL follow the existing touch-target, logical keyboard-order, modal-focus, Escape-dismissal, and focus-restoration requirements.

#### Scenario: Traversing a filtered collection by keyboard

- **WHEN** a keyboard user enters a query and navigates the visible results
- **THEN** focus SHALL follow the visible reading order without entering filtered-out records or duplicate responsive controls
- **AND** every visible row's complete submenu path SHALL be operable without pointer-only or gesture-only behavior

#### Scenario: Closing a collection overlay

- **WHEN** a user dismisses a focused collection, edit dialog, annotation dialog, or row menu
- **THEN** the overlay SHALL close through its supported keyboard behavior
- **AND** focus SHALL return to the invoking control or an equivalent stable destination

### Requirement: Saturated sheets retain non-destructive navigation anchors

The saturated 2014 sheet SHALL retain understandable region and collection landmarks for combat and non-combat information while adding local collection discovery. Dense-collection behavior SHALL NOT require a selected scene or pillar, hide unrelated sheet regions, or duplicate authored records into competing homes.

#### Scenario: Navigating a saturated sheet

- **WHEN** a character contains large target collections plus representative features, traits, runtime actions, modifiers, proficiencies, annotations, and notes
- **THEN** the sheet SHALL retain distinguishable regions and collection headings
- **AND** the user SHALL be able to reach target collections and their complete records without activating a scene-specific display mode

#### Scenario: Opening the default examples without saved data

- **WHEN** the application loads its default character examples
- **THEN** one dedicated 2014 character SHALL contain saturated target and representative non-target collections for repeatable sheet-level review
