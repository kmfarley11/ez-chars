# Capability: character-sheet-editing

## Purpose

Define atomic, identity-preserving character-sheet edits that keep structured card workflows and direct field editing consistent through validation and persistence.

## Requirements

### Requirement: Structured sheet edits are validated atomically

The system SHALL validate each deliberate structured character-sheet edit against the resulting character as one atomic operation before changing stored data. The operation SHALL include only the selected field, note, or genuinely coupled edit unit and its required domain consequences, rather than every value in the containing detail view.

#### Scenario: Valid structured edit is committed

- **WHEN** a user saves a valid structured spell, action, proficiency, feature, inventory, currency, roleplay, scratchpad, or annotation edit
- **THEN** the system SHALL commit the complete requested edit to the character's canonical data
- **AND** unrelated values and notes SHALL remain unchanged

#### Scenario: Valid combined edit is committed once

- **WHEN** a genuinely coupled edit unit contains valid authored and annotation changes
- **THEN** the system SHALL validate and commit the combined result as one operation
- **AND** it SHALL NOT require intermediate partial saves

#### Scenario: Invalid structured edit is rejected

- **WHEN** a structured edit contains an unsupported target or malformed value, or produces an invalid character
- **THEN** the system SHALL leave the stored character unchanged rather than committing a partial or defaulted interpretation
- **AND** the active editor SHALL retain the draft with actionable validation feedback

#### Scenario: Saving against current character data

- **WHEN** unrelated character information changes after a focused edit begins
- **THEN** saving SHALL apply only the requested edit to the current character while preserving those unrelated changes

#### Scenario: The edited target is stale

- **WHEN** the selected field or note has changed or disappeared since its draft began
- **THEN** saving SHALL reject the stale edit without overwriting newer information or recreating a removed target
- **AND** the user SHALL retain their draft and receive feedback allowing them to cancel or restart against current information

### Requirement: Structured edits preserve data outside their semantic target

The system MUST preserve unrelated character records and stable identities when applying a supported structured edit.

#### Scenario: One collection group is replaced

- **WHEN** a user edits one supported group within a shared character collection
- **THEN** records outside that group SHALL retain their values, annotations, ordering guarantees, and identifiers

#### Scenario: Existing record is edited

- **WHEN** a structured edit identifies an existing action, feature, inventory item, annotation, or note
- **THEN** the saved record SHALL retain its existing identifier

#### Scenario: New record is added

- **WHEN** a structured edit adds a record without an existing identifier
- **THEN** the system SHALL assign a new non-empty identifier before persistence

### Requirement: Structured and direct field editing remain behaviorally consistent

The system SHALL preserve the existing user-visible editing, annotation, validation, and persistence behavior regardless of whether a sheet surface uses structured card editing or direct primitive editing.

#### Scenario: Structured edit survives reload

- **WHEN** a user saves a supported structured edit and reloads the application
- **THEN** the sheet SHALL display the saved result through the existing local-first persistence flow

#### Scenario: Direct primitive edit remains supported

- **WHEN** a user saves a supported direct primitive field edit
- **THEN** the edit SHALL continue to update and persist without requiring conversion into a structured card edit

### Requirement: Features and Traits retain distinct sheet ownership

The system SHALL present general/manual features together with class and subclass features through the Features sheet collection while preserving each record's current owning collection, and SHALL keep ancestry Traits in a separate sheet collection.

#### Scenario: Viewing Features

- **WHEN** a character has general, class, subclass, and ancestry-trait records
- **THEN** the Features sheet collection SHALL include the general, class, and subclass records
- **AND** the ancestry-trait records SHALL remain in the separate Traits sheet collection

#### Scenario: Adding a manual Feature

- **WHEN** a user adds a new entry through the Features editing workflow without class ownership
- **THEN** the system SHALL save it as a general feature with a new stable identity
- **AND** existing class and subclass feature collections SHALL remain unchanged

#### Scenario: Editing mixed Feature ownership

- **WHEN** one valid structured edit changes general and class-owned Feature entries together
- **THEN** each entry SHALL be committed back to its existing owning collection
- **AND** unrelated feature records, unexposed authored fields, annotations, class order, and existing identities SHALL be preserved

#### Scenario: Editing Traits

- **WHEN** a user adds or edits an ancestry Trait
- **THEN** the system SHALL retain it in the separate ancestry-trait collection with a stable identity
- **AND** the Features collection SHALL remain unchanged

### Requirement: Character-sheet editing follows explicit read-first tiers

The system SHALL classify editable character-sheet information as frequently changed runtime state, rich field or record detail, or collection content, and SHALL present each class through a predictable interaction tier. Information without an explicit runtime classification SHALL default to a read-first presentation rather than inheriting persistent inline editing controls.

#### Scenario: Editing explicitly classified runtime state

- **WHEN** a user edits a frequently changed runtime value such as current hit points or carried currency
- **THEN** the value SHALL be editable directly on the sheet without opening a focused detail presentation
- **AND** entering and leaving edit state SHALL NOT cause disruptive movement of surrounding content

#### Scenario: Presenting neighboring runtime values

- **WHEN** multiple runtime values share one responsive grid
- **THEN** each value surface SHALL fill its allocated grid track rather than shrink to its content
- **AND** entering edit state SHALL preserve the surrounding track allocation

#### Scenario: Opening rich information

- **WHEN** a user activates the explicit detail target for a rich field or record
- **THEN** the system SHALL first present the target's available authored detail, provenance, annotations, and references together
- **AND** changing that information SHALL require a separately identifiable Edit action for the relevant small edit unit

#### Scenario: Opening a bounded group of rich information

- **WHEN** multiple non-runtime fields share one visually bounded sheet group
- **THEN** the group SHALL retain explicit access to its complete detail through a displayed field label or a fallback group control
- **AND** eligible fields SHALL be individually editable within that detail without putting unrelated fields into an edit mode
- **AND** entry SHALL make the intended field readily reachable without searching unrelated dialog content
- **AND** independent editing SHALL NOT by itself require an additional sheet control beside every leaf

#### Scenario: Entering a small coherent group

- **WHEN** a group's detail presentation makes its fields and eligible Edit actions readily apparent together
- **THEN** a single explicit group entry SHALL be sufficient without requiring additional leaf-level sheet entry controls
- **AND** the fields SHALL retain their independent save boundaries within Detail

#### Scenario: Entering a field obscured by a broad group

- **WHEN** group-only entry would require searching unrelated detail content to find an individually displayed field
- **THEN** the sheet SHALL provide a discoverable targeted path that reveals that field's relevant context and eligible Edit action
- **AND** it SHALL NOT require an extra dedicated icon beside every other field solely for visual uniformity

#### Scenario: Presenting an unclassified editable field

- **WHEN** an editable field has not been explicitly classified as frequently changed runtime state
- **THEN** the field SHALL use the read-first interaction tier
- **AND** it SHALL NOT expose persistent inline Save and Cancel controls on the sheet merely because its value is primitive

### Requirement: Rich-detail entry preserves the reading surface

The system SHALL expose an explicit keyboard-, pointer-, touch-, and assistive-technology-operable target for opening rich detail without making an entire content container behave as an undisclosed activation target. Field-targeted entry SHALL reveal and focus the intended context without automatically starting an edit.

#### Scenario: Discovering a targeted entry action

- **WHEN** a field offers targeted entry on the read-first sheet
- **THEN** its affordance SHALL have a visible interaction cue, an accessible name, and keyboard and touch operation
- **AND** discovering or using it SHALL NOT depend solely on hover or long press
- **AND** neighboring displayed values SHALL remain selectable without activating detail

#### Scenario: Showing a note indicator for a rich field

- **WHEN** a read-first rich field has annotations and its compact presentation distinguishes a field label from its displayed value
- **THEN** the field SHALL present its quiet note indicator inline with its label when space allows, followed by its displayed value
- **AND** the indicator SHALL remain separate from the field's detail action cluster

#### Scenario: Avoiding redundant detail controls

- **WHEN** visible field labels provide access to the complete containing detail
- **THEN** the sheet SHALL omit a separate duplicate group or field detail button
- **AND** label entry SHALL retain the requested field's highlight and the surrounding group's context

#### Scenario: Preserving access without a usable label

- **WHEN** a supported detail target has no usable displayed label entry
- **THEN** an explicit fallback detail control SHALL remain available
- **AND** empty collections SHALL retain their eligible creation path

#### Scenario: Reading compact rich fields consistently

- **WHEN** a bounded sheet group presents several read-first primitive values
- **THEN** the default compact presentation SHALL use one shared label-and-value grammar across those values
- **AND** a section MAY explicitly request a stacked label-over-value variant when its information hierarchy justifies the additional height

#### Scenario: Selecting text near a detail target

- **WHEN** a user selects or copies displayed character information without activating its explicit detail target
- **THEN** the selection or copy interaction SHALL remain available
- **AND** the focused detail presentation SHALL NOT open

#### Scenario: Reaching a particular field in a long detail view

- **WHEN** a user activates a field-targeted detail action within a compound sheet group
- **THEN** the focused view SHALL reveal that field and place keyboard focus at its relevant named context or control
- **AND** the requested field SHALL be visually distinguished from neighboring fields without automatically entering edit mode
- **AND** the field's eligible Edit action SHALL be available there without scrolling through unrelated fields

#### Scenario: Returning from focused detail

- **WHEN** a user closes or navigates back from focused detail after resolving any active draft
- **THEN** focus SHALL return to the invoking target or an equivalent stable destination
- **AND** the user SHALL return to the prior sheet or collection context

### Requirement: Focused detail supports independently saved small edits

The system SHALL expose field-local Edit, Save, and Cancel within focused detail. Each editor SHALL own one selected field or a small set of genuinely coupled values; sharing a visual group SHALL NOT by itself couple their saves. There SHALL NOT be an additional outer Save or whole-detail rollback for existing-target edits.

#### Scenario: Editing one field

- **WHEN** a user starts editing an eligible field in Detail
- **THEN** only its edit unit SHALL expand into editable controls
- **AND** the surrounding information SHALL remain readable
- **AND** changing or blurring an input SHALL NOT implicitly commit it

#### Scenario: Saving one edit and cancelling the next

- **WHEN** a user explicitly saves field A, starts changing field B, and cancels B
- **THEN** A SHALL retain its saved value and B SHALL retain its pre-edit value
- **AND** Detail SHALL remain open without an outer Save or Cancel transaction

#### Scenario: Saving and returning to reading

- **WHEN** a local edit saves successfully or is explicitly cancelled
- **THEN** that region SHALL return to its read-first presentation with focus restored to its relevant control or a stable equivalent
- **AND** unrelated reading and scroll context SHALL remain available

#### Scenario: Editing a coupled unit

- **WHEN** values must be changed together for one coherent valid edit
- **THEN** the system SHALL present only that coupled unit in one local editor
- **AND** its Save or Cancel SHALL affect the complete unit atomically without enrolling unrelated fields

#### Scenario: Creating a new record

- **WHEN** a user fills a new-record creation form
- **THEN** the system SHALL retain the existing explicit final creation boundary rather than persist a partially entered record through per-field saves

### Requirement: Focused navigation protects one active draft

Each focused surface SHALL permit at most one active field, coupled-unit, or note editor. Leaving a dirty editor through target switching or in-app workflow dismissal SHALL require explicit resolution without silently saving or losing changes.

#### Scenario: Switching or leaving with unsaved work

- **WHEN** a user attempts to edit another target or use Close, Back, or Escape while the active draft is dirty
- **THEN** the current logical surface SHALL offer Save and continue, Discard and continue, and Keep editing
- **AND** it SHALL NOT stack another modal over the focused surface
- **AND** choosing Keep editing or encountering a save error SHALL retain the active draft and relevant focus

#### Scenario: Cancelling the active edit directly

- **WHEN** a user activates the active editor's explicit Cancel control
- **THEN** only that draft SHALL be discarded and the surrounding Detail SHALL remain open
- **AND** previously saved edits SHALL remain committed

#### Scenario: Leaving an unchanged editor

- **WHEN** a user leaves an editor whose draft has no changes
- **THEN** the workflow SHALL continue without demanding confirmation for unsaved work

### Requirement: Focused notes are readable and independently maintainable

The system SHALL let a player read notes attached to the intended field or record and explicitly add, edit, or remove one note without entering an unrelated value-editing form. Each note operation SHALL preserve other notes, attachment identity, and source references, and SHALL use the same explicit small-edit validation boundary.

#### Scenario: Inspecting existing notes

- **WHEN** a user activates an existing note count or notes affordance
- **THEN** the relevant notes SHALL open for reading with individual Edit and eligible Remove actions plus Add note
- **AND** the system SHALL NOT automatically put every note into an editor or create a nested modal

#### Scenario: Offering a note for an empty target

- **WHEN** a focused target supports notes but has none
- **THEN** it SHALL offer a compact Add note action without a reserved empty bordered editor section
- **AND** a note editor SHALL appear only after deliberate activation

#### Scenario: Editing one note

- **WHEN** a user saves or cancels changes to one note's content or reference
- **THEN** only that note's requested edit SHALL commit or be discarded
- **AND** authored field values and other notes SHALL remain unchanged

#### Scenario: Removing and restoring a note

- **WHEN** a user stages removal of an existing note in focused detail
- **THEN** Undo SHALL remain available before explicit confirmation commits the removal
- **AND** neither staging nor Undo SHALL change stored character data
- **AND** the operation SHALL NOT require a record-wide outer Save

### Requirement: Field controls reflect authored ownership and removal eligibility

The system SHALL distinguish editable, genuinely derived, and unavailable information through eligible actions while retaining readable context. Category badges SHALL NOT determine whether a value is editable. Clear or Remove SHALL be available only when the selected information is eligible for that operation.

#### Scenario: Authored values that resemble calculations

- **WHEN** a value is authored and writable even though players commonly calculate it
- **THEN** it SHALL remain editable rather than being reclassified as computed by its appearance or name

#### Scenario: Explaining derived information

- **WHEN** the system provides a supplemental explanation for a genuinely derived value
- **THEN** that explanation SHALL be accessible through keyboard, pointer, and touch without requiring a persistent Calculated label
- **AND** the readable value SHALL NOT present an unsupported Edit action or appear as a disabled input

#### Scenario: Clearing eligible optional information

- **WHEN** a user explicitly confirms Clear for an eligible optional value
- **THEN** the system SHALL preserve the meaning of absence rather than substitute zero or false
- **AND** it SHALL preserve attached notes unless the user separately requests their removal

#### Scenario: Required or unavailable information

- **WHEN** a field is required, derived, or has no supported writable target
- **THEN** it SHALL NOT expose an unsupported removal action
- **AND** unavailable information SHALL NOT be represented as an editable default value

### Requirement: Runtime boolean fields support direct validated activation

The system SHALL provide an accessible, labeled, directly actionable checkbox for explicitly runtime-classified boolean fields. One activation SHALL attempt one independently validated value change without opening Detail or requiring a separate edit-confirmation step. Successful changes SHALL preserve focus, unrelated values, and notes. Rejected changes SHALL leave the committed value unchanged, restore its visible checked state, and expose accessible feedback without moving the user away from the control.

#### Scenario: Toggling an existing runtime flag

- **WHEN** the user activates an explicitly runtime-classified boolean through pointer, touch, or keyboard
- **THEN** the system SHALL attempt to save the opposite boolean value exactly once
- **AND** a successful change SHALL be reflected immediately and retained after reload
- **AND** notes and unrelated character data SHALL remain unchanged

#### Scenario: Rejecting a runtime flag change

- **WHEN** validation, conflict handling, or the owning save operation rejects a boolean change
- **THEN** the checkbox SHALL reflect the previously committed value rather than the rejected value
- **AND** the user SHALL receive accessible error feedback and retain control focus

### Requirement: Runtime text fields support type-appropriate inline drafts

The system SHALL let users edit explicitly runtime-classified single-line and multiline text directly on the sheet with an identifiable edit action, local draft, and explicit Save/Cancel. Displayed text SHALL remain selectable. Multiline values SHALL preserve authored line breaks. Controls SHALL use the available field width, avoid document-level horizontal overflow, and bound multiline editor growth while keeping all draft content reachable. Validation rejection SHALL retain the editable draft and provide feedback; changes SHALL NOT commit merely on blur.

#### Scenario: Saving or cancelling short text

- **WHEN** the user edits a runtime single-line string
- **THEN** Save or Enter outside an active text-composition session SHALL attempt to commit that field only
- **AND** Cancel or Escape SHALL discard that draft without modifying stored values or notes
- **AND** successful Save or cancellation SHALL return focus to the field's edit control

#### Scenario: Editing multiline runtime text

- **WHEN** the user edits multiline runtime text and presses Enter
- **THEN** Enter SHALL insert a newline rather than save
- **AND** explicit Save SHALL preserve the authored text and line breaks
- **AND** all content SHALL remain reachable when the bounded editor scrolls

#### Scenario: Rejecting text without losing work

- **WHEN** the owning save operation rejects a runtime text change
- **THEN** the stored field SHALL remain unchanged
- **AND** the draft and accessible rejection feedback SHALL remain available for correction or cancellation

### Requirement: Runtime type extensions preserve optional data and neighboring interactions

The system SHALL classify runtime interaction explicitly rather than promoting all boolean or text fields. Rendering or cancelling an optional runtime field SHALL NOT populate missing character data. Notes SHALL remain independently accessible and saved without changing the field value; accessing notes SHALL NOT silently discard an active text draft. Existing numeric runtime fields and unclassified read-first fields SHALL retain their established interactions.

#### Scenario: Activating an absent optional flag

- **WHEN** an optional runtime boolean has not been recorded
- **THEN** viewing the sheet SHALL leave it absent
- **AND** its accessible presentation SHALL distinguish unrecorded from explicitly false
- **AND** the first deliberate checkbox activation SHALL attempt to record true

#### Scenario: Opening an absent text editor without authoring

- **WHEN** the user opens an absent optional runtime text field and cancels or saves an unchanged empty draft
- **THEN** the field SHALL remain absent
- **AND** its notes SHALL remain unchanged

#### Scenario: Clearing authored runtime text

- **WHEN** the user explicitly clears a previously authored freeform Conditions value and saves
- **THEN** the system SHALL retain an empty text value without deleting that field's notes or changing unrelated data

#### Scenario: An absent field is authored while a runtime edit is pending

- **WHEN** a boolean or text runtime edit began with an absent value, that field has since been authored, and the pending edit attempts to save a value
- **THEN** the system SHALL reject the stale save without overwriting the newly authored value or notes
- **AND** accessible conflict feedback SHALL remain available at the control
- **AND** a text draft SHALL remain available for review or cancellation, while a boolean control SHALL reflect the current committed value

#### Scenario: Preserving adjacent interaction tiers

- **WHEN** runtime booleans and text appear beside numeric runtime values and read-first information
- **THEN** numeric controls SHALL retain their established save/cancel, focus and layout behavior
- **AND** fields not explicitly classified as runtime SHALL remain read-first
- **AND** each control SHALL remain keyboard and touch operable without requiring hover to discover it

### Requirement: Both 5e editions expose their selected transient fields in Live state

The 2014 sheet SHALL present Inspiration in Live state as an edit-first boolean and SHALL NOT duplicate it in Reference stats. The 2024 sheet SHALL present Heroic Inspiration as an edit-first boolean and Conditions as edit-first freeform multiline text in Live state. Both editions SHALL preserve their own labels, existing values and notes, and their surrounding runtime controls.

#### Scenario: Using 2014 Inspiration after relocation

- **WHEN** a user opens an existing 2014 character with Inspiration and associated notes
- **THEN** Inspiration SHALL appear once in Live state with the existing value and notes accessible
- **AND** it SHALL be directly changeable without opening a read-first dialog
- **AND** relocating its presentation SHALL NOT rewrite the character data

#### Scenario: Updating 2024 transient state

- **WHEN** a user updates Heroic Inspiration or Conditions on the 2024 sheet
- **THEN** the selected value SHALL be editable directly in Live state
- **AND** a valid save SHALL survive reload while preserving the other live-state values and notes
