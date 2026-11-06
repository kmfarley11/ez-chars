## ADDED Requirements

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
