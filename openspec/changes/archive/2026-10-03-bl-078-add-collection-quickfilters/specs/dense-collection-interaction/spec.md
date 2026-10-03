## MODIFIED Requirements

### Requirement: Dense sheet collections expose a consistent interaction grammar

The 2014 character sheet SHALL present Weapons, Armor & Shields, Other Gear, Spells, Runtime Actions, and Supporting Collections (Features, Traits, Languages, Tools) with clear collection names, total or filtered counts, semantic list and row structure, predictable collection actions, and explicit empty and no-match states. Runtime Actions SHALL use a five-item simple-list limit because their information-rich rows consume more space, while compact Supporting Collections SHALL use a seven-item simple-list limit. Collections that exceed their applicable limit SHALL expose bounded or focused presentation and search controls. Each pinnable equipment, spell, Runtime Action, or Supporting Collection record SHALL provide a state-sensitive, first-class Pin/Unpin action adjacent to its explicit focused-detail target rather than requiring the user to discover priority inside an overflow menu or duplicate the same operation in a collection-level batch manager. Once focused detail provides Edit and annotation/reference access, ordinary record rows SHALL NOT retain duplicate Edit or Notes/References overflow accelerators; domain-specific source commands MAY retain an overflow menu when they remain outside focused authored-detail editing. Supporting Collections SHALL retain compact bullet rows and explicit Add and focused-detail paths when applicable rather than adopting either the complete equipment/spell menu grammar or a generic batch organizer.

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
- **AND** the collection SHALL retain its source-specific row commands while displaying matching pinned actions alphabetically first and remaining actions by timing then name without rewriting the stored action sequence

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

- **WHEN** the Runtime Actions collection contains 1–5 items
- **THEN** it SHALL be presented as a simple list without bounded scrolling, with timing quickfilters and one text search available
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

The sheet SHALL provide case-insensitive text search over primary record labels and useful authored detail for each searchable collection. Equipment search SHALL remain scoped to the active Weapons, Armor & Shields, or Other Gear collection. Spell search SHALL span the character's logical spell collection across displayed levels. Supporting Collection search SHALL remain scoped to the active Features, Traits, Languages, or Tools collection. Eligible matching records SHALL retain their relative canonical priority-first presentation order, including collection-owned timing or spell-level ordering for unpinned records. Runtime Action search SHALL comprehensively cover current snapshot fields and source context (name, target, notes, timing, category, source label/category, source context) without live-source text and SHALL retain the collection's priority-first timing/name presentation order.

#### Scenario: Searching one equipment group

- **WHEN** a user searches within Other Gear
- **THEN** matching pinned Other Gear records SHALL precede matching unpinned records and each tier SHALL remain alphabetical
- **AND** Weapons and Armor & Shields SHALL NOT be introduced into that result set

#### Scenario: Searching spells across levels

- **WHEN** a user searches for text that matches spells at more than one level
- **THEN** every spell matching the text and active Level/Prepared filters SHALL be discoverable through the same spell-search workflow
- **AND** matching pinned spells SHALL precede unpinned level-grouped matches
- **AND** each result SHALL identify itself as a Spell and display its cantrip or spell-level context plus prepared state when recorded

#### Scenario: Searching a Supporting Collection

- **WHEN** a user searches Features, Traits, Languages, or Tools
- **THEN** results SHALL remain scoped to that one supporting collection
- **AND** matching pinned entries SHALL precede matching unpinned entries in canonical alphabetical order

#### Scenario: Searching Runtime Actions

- **WHEN** a user searches Runtime Actions
- **THEN** every action whose current snapshot fields or source context (name, target, notes, timing, category, source label/category, source context) matches the query and active quickfilters SHALL be returned with matching pins alphabetically first and remaining actions by timing then name
- **AND** the search SHALL NOT silently index newer live-source text that differs from the snapshot

#### Scenario: Search has no matches

- **WHEN** the active query matches no record in its collection scope
- **THEN** the sheet SHALL present a no-match state, a zero-result count, and an evident way to clear or revise the query

#### Scenario: Search changes the visible subset

- **WHEN** a query filters a searchable collection
- **THEN** matching records SHALL retain their relative canonical presentation order
- **AND** filtering SHALL NOT mutate Pin state, authored order, or other canonical character data

### Requirement: Phone-sized collection cards preserve at-a-glance priority

On a phone-sized sheet, each eligible equipment/spell collection card SHALL show at most the first five records from its canonical priority-first presentation, and each eligible Supporting Collection SHALL show at most the first seven records from that presentation. Runtime Actions SHALL show at most the first five matching records in their priority-first timing/name presentation. Runtime Action and Spell previews SHALL derive from the same text-and-quickfilter results as their full browsing views; filtering SHALL NOT change the density threshold or discard active controls. The complete collection SHALL remain accessible. Each preview SHALL present its primary name and, when useful authored detail exists, a single-line `Name: detail` summary whose detail is visually secondary and italicized without removing the complete text from assistive technology.

#### Scenario: Phone eligible collection has few enough records

- **WHEN** a phone-sized eligible collection contains no more records than its compact preview limit (5 for equipment and spells; 7 for Supporting Collections)
- **THEN** every matching record SHALL appear in its canonical priority-first presentation order within the compact card without a remaining-item announcement

#### Scenario: Phone Runtime Actions has few enough records

- **WHEN** Runtime Actions contains 5 or fewer records on a phone-sized sheet
- **THEN** every matching action SHALL appear in priority-first timing/name order within the compact card without a remaining-item announcement

#### Scenario: Phone collection exceeds its preview limit

- **WHEN** a phone-sized collection contains more records than its applicable compact preview limit
- **THEN** only the applicable first matching canonical records SHALL appear in the compact preview
- **AND** the complete collection SHALL remain reachable through an explicitly named browse action that includes the exact total item count
- **AND** for narrowed Runtime Actions and Spells, that action SHALL instead identify the matching count, with a visible matching-versus-total count and independent resets making excluded records recoverable without changing priority

#### Scenario: Pinned records exceed the eligible preview limit

- **WHEN** an eligible collection contains more matching pinned records than fit in its phone preview
- **THEN** the preview SHALL contain only the applicable number of alphabetically first matching pinned records
- **AND** every other pinned and unpinned record SHALL remain reachable through the complete collection workflow

#### Scenario: Preview detail exceeds the card width

- **WHEN** a compact preview summary is wider than its available row
- **THEN** the visible summary SHALL truncate on one line with an ellipsis rather than expanding or overflowing the card
- **AND** assistive technology SHALL retain access to the complete record label and detail
- **AND** the compact preview SHALL NOT introduce horizontal scrolling

### Requirement: Focused and bounded collection browsing has one scroll owner

Dense collections SHALL avoid unbounded sheet growth by using bounded browsing or focused presentation on larger screens and a full-height focused presentation on phone-sized screens. For Runtime Actions with 6 or more items and Supporting Collections with 8 or more items on a larger screen, the presentation SHALL keep collection identity, result count, search, and applicable quickfilter controls available while the collection content scrolls through one explicit scroll owner, and SHALL provide Close navigation only when the selected presentation is focused/modal. A phone-focused collection SHALL transition among browse, record detail, and record editing within one logical focused workflow rather than stacking another modal over it.

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
- **AND** Back SHALL restore the collection query, quickfilter selections, and browsing context without requiring the collection to reload

#### Scenario: Returning from a focused row or card task

- **WHEN** a user closes or completes a row edit, annotation task, or record-lifecycle task opened from a focused collection
- **THEN** the collection's active query, quickfilter selections, and focused browsing context SHALL remain available
- **AND** keyboard focus SHALL return to the invoking action or an equivalent stable destination when that action remains visible

## ADDED Requirements

### Requirement: Collection quickfilters compose explicitly with text search

Runtime Actions SHALL offer multi-select Action, Bonus action, Reaction, Free, and Other timings for every populated collection. Spells SHALL offer multi-select Cantrip and levels 1–9 plus a Prepared-only control. These collections SHALL make one text search available alongside their filters, including in short collections. Choices within a category SHALL combine as alternatives; categories and text search SHALL combine as simultaneous restrictions. An empty selection SHALL impose no restriction for that category. Filter state SHALL be temporary and SHALL NOT change character data or Pin membership.

#### Scenario: Selecting and deselecting several timings

- **WHEN** a user selects Action and Reaction
- **THEN** actions with either timing SHALL match the timing restriction
- **AND** selecting an active option again SHALL deselect it
- **AND** deselecting the final option SHALL restore all timings without clearing text search

#### Scenario: Combining spell levels, preparation, and text

- **WHEN** a user selects levels 1 and 2, enables Prepared-only, and enters text
- **THEN** only spells at either selected level that are explicitly marked Prepared and match the text SHALL appear
- **AND** false or absent preparation state SHALL NOT match Prepared-only, including unmarked cantrips
- **AND** filtering SHALL use the same effective level/timing shown by the collection without writing missing defaults into the character

#### Scenario: Excluding a pinned item

- **WHEN** a pinned action or spell does not satisfy an active filter or query
- **THEN** it SHALL be excluded from results without losing its pin
- **AND** removing that restriction SHALL make it eligible for the global pinned tier again

#### Scenario: Resetting one or all restrictions

- **WHEN** a user resets one category or clears text
- **THEN** only that restriction SHALL be removed
- **AND** a no-match result SHALL additionally offer Clear all to remove all quickfilter selections and text together without altering pins
- **AND** ordinary matching results SHALL NOT require a dedicated reset-all control in the filter group

#### Scenario: Handling zero matches and changing counts

- **WHEN** active narrowing returns no records
- **THEN** the collection SHALL show zero matching records out of its total, a no-match explanation that accounts for filters as well as text, and an evident Clear all action
- **AND** options and selections SHALL remain reachable rather than disappear as counts change
- **AND** if the underlying collection becomes empty, active restrictions SHALL remain resettable and Add SHALL remain reachable

#### Scenario: Keeping filter state local to the current sheet session

- **WHEN** a user moves between preview, focused browse, and record detail for the same collection
- **THEN** query and quickfilter selections SHALL be preserved
- **AND** starting a fresh sheet session or changing characters SHALL restore unrestricted filters rather than import another character's selections
- **AND** exporting the character SHALL NOT include temporary retrieval state

### Requirement: Quickfilter presentation preserves domain meaning and accessible operation

Each collection SHALL explicitly choose its filter categories and vocabulary. Sharing the interaction SHALL NOT require all systems to adopt 2014 timings or generate filters from arbitrary metadata badges. Runtime Action rows SHALL expose passive timing, category, and source-kind metadata in a consistent compact presentation. Filter controls SHALL be distinguishable from passive badges, visibly selected when active, named for assistive technology, and operable by keyboard and touch without hover-only discovery.

#### Scenario: Reading metadata without adding accidental actions

- **WHEN** an action row displays timing, category, source kind, or note metadata
- **THEN** its badges SHALL remain informational rather than act as implicit filter commands
- **AND** matching approved filter labels SHALL use consistent vocabulary without making category, source, or note state into additional facets

#### Scenario: Operating filters on a phone

- **WHEN** a user views the populated Runtime Actions collection on a phone
- **THEN** timing choices SHALL be reachable directly from the sheet rather than only after opening the complete collection
- **AND** selecting a timing SHALL update the compact preview as well as full browsing
- **AND** filter controls SHALL meet the established coarse-pointer target baseline without horizontal page overflow

#### Scenario: Reading an unclassified action

- **WHEN** an action has no authored category
- **THEN** it SHALL have no category badge and its Category editor SHALL remain unset until a value is chosen
- **AND** viewing it or editing another field SHALL NOT infer or save a category
- **AND** explicitly authored categories SHALL remain unchanged

#### Scenario: Operating spell filters without opening a disclosure

- **WHEN** a user views spell quickfilters at desktop or phone widths
- **THEN** the group SHALL identify spell level and preparedness and show every level and Prepared-only directly without an expand/collapse step
- **AND** selections SHALL be evident on the choices themselves without requiring a separate selection-count summary
- **AND** reset actions SHALL remain reachable without replacing text search or stacking another modal

#### Scenario: Returning after an edit changes filter membership

- **WHEN** a user saves a name, timing, level, or preparation change that excludes the record from current results
- **THEN** its open Detail SHALL remain associated with that record until dismissed
- **AND** returning SHALL preserve the user's restrictions and show the updated results or no-match state
- **AND** focus SHALL return to a stable collection destination when the invoking record no longer appears
