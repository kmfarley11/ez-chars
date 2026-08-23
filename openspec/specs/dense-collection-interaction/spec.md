# dense-collection-interaction Specification

## Purpose

Keep saturated on-sheet collections responsive, searchable, completely reachable, and accessible without allowing long equipment, spell, Runtime Action, or supporting-information lists to overwhelm at-a-glance character-sheet use.

## Requirements

### Requirement: Dense sheet collections expose a consistent interaction grammar

The 2014 character sheet SHALL present Weapons, Armor & Shields, Other Gear, Spells, Runtime Actions, and Supporting Collections (Features, Traits, Languages, Tools) with clear collection names, total or filtered counts, semantic list and row structure, predictable collection actions, and explicit empty and no-match states. Runtime Actions SHALL use a five-item simple-list limit because their information-rich rows consume more space, while compact Supporting Collections SHALL use a seven-item simple-list limit. Collections that exceed their applicable limit SHALL expose bounded or focused presentation and search controls. Supporting collections SHALL explicitly retain their existing card-level structured Edit/Notes action grammar rather than adopting the identity-owned row-action grammar of target collections.

#### Scenario: Viewing a populated target collection (Equipment, Spells)

- **WHEN** an equipment or spell collection contains one or more records
- **THEN** the sheet SHALL identify the collection and its relevant count
- **AND** each record SHALL be exposed as one distinct list item with its complete actions associated with that item

#### Scenario: Viewing a populated Runtime Actions collection

- **WHEN** the Runtime Actions collection contains one or more records
- **THEN** the sheet SHALL identify the collection and its relevant count
- **AND** the collection SHALL retain its card-level Add/Edit/Notes grammar plus its source-specific row commands without being forced into generic target-collection row actions

#### Scenario: Viewing a populated supporting collection

- **WHEN** a supporting collection (e.g. Features, Traits) contains one or more records
- **THEN** the collection SHALL retain its existing structured Edit/Notes action grammar without exposing complete row-level actions per item
- **AND** its records SHALL retain the compact bullet-list presentation rather than adopting the more detailed Runtime Action row treatment

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

### Requirement: Dense collection search is deterministic and scope-appropriate

The sheet SHALL provide case-insensitive text search over primary record labels and useful authored detail for each target collection. Equipment search SHALL remain scoped to the active Weapons, Armor & Shields, or Other Gear collection. Spell search SHALL span the character's logical spell collection across displayed levels. Runtime Action search SHALL comprehensively cover current snapshot fields and source context (name, target, notes, timing, category, source label/category, source context) without live-source text.

#### Scenario: Searching one equipment group

- **WHEN** a user searches within Other Gear
- **THEN** matching Other Gear records SHALL be shown in their existing authored order
- **AND** Weapons and Armor & Shields SHALL NOT be introduced into that result set

#### Scenario: Searching spells across levels

- **WHEN** a user searches for text that matches spells at more than one level
- **THEN** every matching spell SHALL be discoverable through the same spell-search workflow
- **AND** each result SHALL identify itself as a Spell and display its cantrip or spell-level context plus prepared state when recorded

#### Scenario: Searching Runtime Actions

- **WHEN** a user searches Runtime Actions
- **THEN** every action whose current snapshot fields or source context (name, target, notes, timing, category, source label/category, source context) matches the query SHALL be returned
- **AND** the search SHALL NOT silently index newer live-source text that differs from the snapshot

#### Scenario: Search has no matches

- **WHEN** the active query matches no record in its collection scope
- **THEN** the sheet SHALL present a no-match state, a zero-result count, and an evident way to clear or revise the query

#### Scenario: Search changes the visible subset

- **WHEN** a query filters a target collection
- **THEN** matching records SHALL retain their relative authored order
- **AND** filtering SHALL NOT mutate canonical character data or imply a new saved ordering

### Requirement: Phone-sized collection cards preserve at-a-glance priority

On a phone-sized sheet, each target equipment/spell collection card and Runtime Actions SHALL show at most the first five authored records as compact previews. Supporting Collections SHALL show at most the first seven authored records as compact previews. The complete collection SHALL remain accessible. Each preview SHALL present its primary name and, when useful authored detail exists, a single-line `Name: detail` summary whose detail is visually secondary and italicized without removing the complete text from assistive technology.

#### Scenario: Phone collection has few enough records

- **WHEN** a phone-sized collection contains no more records than its compact preview limit (5 for equipment, spells, and Runtime Actions; 7 for Supporting Collections)
- **THEN** every record SHALL appear in authored order within the compact card without a remaining-item announcement

#### Scenario: Phone collection exceeds its preview limit

- **WHEN** a phone-sized collection contains more records than its compact preview limit
- **THEN** only its limited first authored records SHALL appear in the compact preview
- **AND** the complete collection SHALL remain reachable through an explicitly named action that includes the exact total item count

#### Scenario: Preview detail exceeds the card width

- **WHEN** a compact preview summary is wider than its available row
- **THEN** the visible summary SHALL truncate on one line with an ellipsis rather than expanding or overflowing the card
- **AND** assistive technology SHALL retain access to the complete record label and detail
- **AND** the compact preview SHALL NOT introduce horizontal scrolling

### Requirement: Focused and bounded collection browsing has one scroll owner

Dense collections SHALL avoid unbounded sheet growth by using bounded browsing or focused presentation on larger screens and a full-height focused presentation on phone-sized screens. For Runtime Actions with 6 or more items and Supporting Collections with 8 or more items on a larger screen, the presentation SHALL keep collection identity, result count, and search available while the collection content scrolls through one explicit scroll owner, and SHALL provide Close navigation only when the selected presentation is focused/modal.

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

#### Scenario: Returning from a focused row or card task

- **WHEN** a user closes or completes a row edit, annotation task, or card-level Edit/Notes task opened from a focused collection
- **THEN** the collection's active query and focused browsing context SHALL remain available
- **AND** keyboard focus SHALL return to the invoking action or an equivalent stable destination when that action remains visible

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
