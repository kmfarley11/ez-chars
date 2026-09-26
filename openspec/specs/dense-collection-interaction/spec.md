# dense-collection-interaction Specification

## Purpose

Keep saturated on-sheet collections responsive, searchable, completely reachable, and accessible without allowing long equipment, spell, Runtime Action, or supporting-information lists to overwhelm at-a-glance character-sheet use.

## Requirements

### Requirement: Collection browsing, priority, and record lifecycle remain distinct

The system SHALL keep scan-first collection browsing, singular-record detail, record lifecycle, and player-authored priority understandable as distinct concerns. An explicit collection-level Add action SHALL create one record using the minimum required authored information, while eligible removal SHALL remain associated with the selected record. Later authored and annotation changes SHALL use that record's focused detail workflow. State-sensitive record-level Pin/Unpin SHALL remain the baseline for player-authored priority; the rollout SHALL NOT require a separate batch Pin manager, generic collection organizer, or reorder workflow.

#### Scenario: Opening one record from a collection

- **WHEN** a user activates a record's explicit detail target from a compact, bounded, or focused collection
- **THEN** the system SHALL open the selected record's read-first focused detail
- **AND** it SHALL preserve the collection's active query and browsing context

#### Scenario: Creating one record

- **WHEN** a user invokes Add for a collection
- **THEN** the system SHALL collect only the authored information required to create one record
- **AND** existing records and their annotations SHALL NOT become part of the same editing surface
- **AND** successful creation SHALL close the Add surface, return focus to its invoking Add control or an equivalent stable destination, and make the new record reachable from the collection

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
- **AND** where the presentation exposes metadata badges, it SHALL place them inline with the record title when space allows, order descriptive or state metadata before the note indicator, and present supporting content afterward
- **AND** the record's focused detail SHALL expose the annotations in that record's context
- **AND** collection browsing or record lifecycle actions SHALL NOT introduce an aggregate collection-note badge or a separate collection-wide annotation overview or editing surface

#### Scenario: Opening a supporting-collection record

- **WHEN** a user activates an item in a compact Supporting Collection
- **THEN** the item SHALL have a focused detail path without requiring the complete equipment-or-spell row-action menu

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
- **AND** each Used and Max value SHALL use the same directly editable Tier 1 row grammar within its level group, with its own field-local Edit and annotation actions and without a redundant Spell Slots group-detail action
- **AND** it SHALL NOT repeat the same slot usage as a separate `Used` field or level-specific slot card

#### Scenario: Adding a previously absent spell-slot level

- **WHEN** a user edits a `0 / 0` slot level through its inline Used-and-Max control and saves a nonzero value
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
- **AND** record-level Pin or Unpin SHALL remain available in the applicable presentation

### Requirement: Dense collection search is deterministic and scope-appropriate

The sheet SHALL provide case-insensitive text search over primary record labels and useful authored detail for each searchable collection. Equipment search SHALL remain scoped to the active Weapons, Armor & Shields, or Other Gear collection. Spell search SHALL span the character's logical spell collection across displayed levels. Supporting Collection search SHALL remain scoped to the active Features, Traits, Languages, or Tools collection. Eligible matching records SHALL retain their relative canonical priority-first alphabetical order. Runtime Action search SHALL comprehensively cover current snapshot fields and source context (name, target, notes, timing, category, source label/category, source context) without live-source text and SHALL retain independently authored order.

#### Scenario: Searching one equipment group

- **WHEN** a user searches within Other Gear
- **THEN** matching pinned Other Gear records SHALL precede matching unpinned records and each tier SHALL remain alphabetical
- **AND** Weapons and Armor & Shields SHALL NOT be introduced into that result set

#### Scenario: Searching spells across levels

- **WHEN** a user searches for text that matches spells at more than one level
- **THEN** every matching spell SHALL be discoverable through the same spell-search workflow
- **AND** matching pinned spells SHALL precede unpinned level-grouped matches
- **AND** each result SHALL identify itself as a Spell and display its cantrip or spell-level context plus prepared state when recorded

#### Scenario: Searching a Supporting Collection

- **WHEN** a user searches Features, Traits, Languages, or Tools
- **THEN** results SHALL remain scoped to that one supporting collection
- **AND** matching pinned entries SHALL precede matching unpinned entries in canonical alphabetical order

#### Scenario: Searching Runtime Actions

- **WHEN** a user searches Runtime Actions
- **THEN** every action whose current snapshot fields or source context (name, target, notes, timing, category, source label/category, source context) matches the query SHALL be returned in independently authored order
- **AND** the search SHALL NOT silently index newer live-source text that differs from the snapshot

#### Scenario: Search has no matches

- **WHEN** the active query matches no record in its collection scope
- **THEN** the sheet SHALL present a no-match state, a zero-result count, and an evident way to clear or revise the query

#### Scenario: Search changes the visible subset

- **WHEN** a query filters a searchable collection
- **THEN** matching records SHALL retain their relative canonical presentation order
- **AND** filtering SHALL NOT mutate Pin state, authored order, or other canonical character data

### Requirement: Phone-sized collection cards preserve at-a-glance priority

On a phone-sized sheet, each eligible equipment/spell collection card SHALL show at most the first five records from its canonical priority-first presentation, and each eligible Supporting Collection SHALL show at most the first seven records from that presentation. Runtime Actions SHALL continue to show at most the first five independently authored records. The complete collection SHALL remain accessible. Each preview SHALL present its primary name and, when useful authored detail exists, a single-line `Name: detail` summary whose detail is visually secondary and italicized without removing the complete text from assistive technology.

#### Scenario: Phone eligible collection has few enough records

- **WHEN** a phone-sized eligible collection contains no more records than its compact preview limit (5 for equipment and spells; 7 for Supporting Collections)
- **THEN** every record SHALL appear in canonical priority-first alphabetical order within the compact card without a remaining-item announcement

#### Scenario: Phone Runtime Actions has few enough records

- **WHEN** Runtime Actions contains 5 or fewer records on a phone-sized sheet
- **THEN** every action SHALL appear in independently authored order within the compact card without a remaining-item announcement

#### Scenario: Phone collection exceeds its preview limit

- **WHEN** a phone-sized collection contains more records than its applicable compact preview limit
- **THEN** only the applicable first canonical records SHALL appear in the compact preview
- **AND** the complete collection SHALL remain reachable through an explicitly named action that includes the exact total item count

#### Scenario: Pinned records exceed the eligible preview limit

- **WHEN** an eligible collection contains more pinned records than fit in its phone preview
- **THEN** the preview SHALL contain only the applicable number of alphabetically first pinned records
- **AND** every other pinned and unpinned record SHALL remain reachable through the complete collection workflow

#### Scenario: Preview detail exceeds the card width

- **WHEN** a compact preview summary is wider than its available row
- **THEN** the visible summary SHALL truncate on one line with an ellipsis rather than expanding or overflowing the card
- **AND** assistive technology SHALL retain access to the complete record label and detail
- **AND** the compact preview SHALL NOT introduce horizontal scrolling

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

Each target collection record SHALL provide an explicit path to one focused read-first detail and editing workflow. A compact submenu MAY expose accelerators into that same workflow. Collection-level Add, focused eligible removal, and immediate record-level Pin/Unpin SHALL remain distinct from authored-detail editing; a batch Pin manager or generic batch organizer SHALL NOT be required as an alternate editing or priority model.

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

#### Scenario: Distinguishing priority from record creation

- **WHEN** an eligible collection supports both player priority and user-authored creation
- **THEN** the system SHALL present Pin/Unpin on each record and Add at the collection boundary
- **AND** any eligible Remove action SHALL remain associated with the selected record rather than a universal collection organizer

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
