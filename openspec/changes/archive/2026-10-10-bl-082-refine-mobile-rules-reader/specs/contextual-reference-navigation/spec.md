## ADDED Requirements

### Requirement: Compact reader tools preserve reading context

In a constrained reader, the system SHALL keep visibly labeled Find and Outline actions, current page access, source context, and a clear return or dismissal action persistently available without scroll-triggered hiding. Less frequent actions SHALL remain reachable through an explicitly named secondary control. The reader SHALL initially prioritize document content with tools closed. Compact presentation SHALL depend on the reader's available space, including narrow readers within wider application windows.

#### Scenario: User opens Find without navigating the outline

- **WHEN** a user activates Find in a compact reader
- **THEN** the search field and results area SHALL be available directly without scrolling through an outline
- **AND** Find SHALL temporarily use the reading area with a visible one-step return to the document
- **AND** opening the reader without activating Find SHALL NOT automatically focus a text input

#### Scenario: User selects a document destination

- **WHEN** a user selects a Find result, outline destination, or page jump from compact tools
- **THEN** the reader SHALL return to the document with the requested page aligned in view
- **AND** focus SHALL move to the reading region rather than remain in hidden tools
- **AND** reopening Find in the same document SHALL retain its query and available results

#### Scenario: User dismisses tools without selecting a destination

- **WHEN** a user returns from compact tools without making a document jump
- **THEN** the previous reading position SHALL be restored and focus SHALL return to the invoking tool control
- **AND** tool query/results and scroll position SHALL remain available for the same open document

#### Scenario: User opens page controls

- **WHEN** a user activates the visible current-page control
- **THEN** page input and Previous/Next actions SHALL be reachable without sacrificing their touch targets
- **AND** continuous document scrolling SHALL remain available independently of those actions

#### Scenario: Reader space changes

- **WHEN** the reader becomes narrow, wide, or shorter because of its host, orientation, or onscreen keyboard
- **THEN** controls and the active reading or tool area SHALL remain reachable without document-level horizontal overflow
- **AND** document position and search state SHALL survive a presentation change
- **AND** focus SHALL NOT remain on a control hidden by that change

#### Scenario: User scans and collapses Find results

- **WHEN** a search produces contextual result previews
- **THEN** matching text within those previews SHALL be visibly highlighted
- **AND** the user SHALL be able to collapse and reopen results while retaining the query, result count, and search status
- **AND** a new search SHALL expand results, while later progress SHALL NOT override a user collapse
- **AND** editing an unsubmitted query SHALL NOT change the highlights belonging to existing results

#### Scenario: User changes pages in an expanded reader

- **WHEN** the reader has room for side-by-side navigation and document content
- **THEN** Previous, page entry, and Next SHALL be available above the document independently of outline or result-list scrolling
- **AND** the persistent current-page action SHALL direct focus to those controls

## MODIFIED Requirements

### Requirement: Reference presentation follows viewport and browser-history expectations

The system SHALL present a sheet-invoked reference beside the sheet at desktop width and as a full-screen reference mode at phone width while allowing browser history to dismiss the reference and restore its invocation context.

#### Scenario: Reference opens at desktop width

- **WHEN** a user opens a supported reference from a desktop sheet presentation
- **THEN** the reference SHALL appear in a non-modal side presentation that retains useful sheet context
- **AND** the sheet SHALL remain independently scrollable while the reader is open or resized, without displacing its sticky navigation on opening
- **AND** navigating document pages SHALL NOT move the sheet's reading position

#### Scenario: Desktop user adjusts reference workspace allocation

- **WHEN** a pointer or keyboard user resizes the desktop reference or its side-by-side document navigation
- **THEN** the affected pane SHALL resize within usable bounds while preserving the viewer controls, document region, and some visible sheet context
- **AND** the temporary size SHALL NOT become character data or a persisted character preference

#### Scenario: Desktop user resizes the reference closed

- **WHEN** a user drags the sheet-facing reference divider through its minimum usable width toward the viewport edge
- **THEN** the reference SHALL dismiss through the same history, cleanup, and focus-restoration path as its Close action
- **AND** the persistent Rules action SHALL remain available to reopen the reference

#### Scenario: User minimizes document navigation

- **WHEN** a user minimizes the viewer's side-by-side document-navigation pane
- **THEN** the viewer SHALL reduce it to a compact, clearly named control and give the released space to the document
- **AND** expanding the control SHALL restore the prior usable navigation allocation without persisting that preference as character data

#### Scenario: Reference opens at phone width

- **WHEN** a user opens a supported reference from a phone-sized sheet presentation
- **THEN** the reference SHALL occupy the usable viewport without requiring a narrow centered-dialog interaction
- **AND** document tools SHALL initially be closed behind direct visibly named controls so the document retains useful reading space
- **AND** the obscured sheet SHALL NOT receive pointer or keyboard interaction while the full-screen reference is active
- **AND** opening or dismissing the reference SHALL NOT introduce unintended sheet displacement, document overflow, or a residual blank overlay

#### Scenario: User dismisses with browser history

- **WHEN** a user invokes browser Back or a supported back gesture while sheet reference mode is active
- **THEN** the reference SHALL close before navigating away from the character sheet
- **AND** the prior sheet interaction context SHALL be restored
- **AND** individual tool disclosures SHALL NOT add browser-history steps that prevent this dismissal

#### Scenario: Sheet navigation continues beside an open reference

- **WHEN** a user jumps between sheet sections or selects another source while a sheet-invoked reference remains open
- **THEN** one Close action SHALL dismiss the reader without changing the current sheet section or scroll position
- **AND** one browser Back action SHALL dismiss the reader and restore its invocation context without stepping through open-reader copies
- **AND** normal section-navigation history SHALL remain available when the reader is closed

#### Scenario: User closes after independently scrolling the sheet

- **WHEN** a user scrolls the sheet while a desktop reference is open and then dismisses it using Close or resize-to-close
- **THEN** the sheet SHALL remain at its current reading position, even when the original invoking control is offscreen
- **AND** focus restoration SHALL NOT scroll the sheet back to that control
- **AND** subsequent browser Back and Forward SHALL NOT reopen the explicitly dismissed reader entry

### Requirement: Viewer and locator failures preserve character work

The system SHALL report viewer initialization, document loading, page-rendering, text-extraction, Find, offline, unavailable-source, and stale-locator failures without mutating character data or trapping the user away from the sheet. Failure recovery SHALL remain available after a document has initially loaded. The supported browser boundary and any accepted fallback-only limitations SHALL be explicitly documented rather than inferred from desktop automation alone. The verified current stable iOS/Safari and Android/Chrome baseline SHALL support in-app reading and Find; browser fallback alone MUST NOT be represented as satisfying that baseline. Concrete tested versions and known older-version limits SHALL be disclosed without implying universal or untested future-version compatibility.

#### Scenario: Self-hosted document cannot load

- **WHEN** the in-app viewer cannot load the selected self-hosted document
- **THEN** the system SHALL present an understandable unavailable or offline state with Retry and browser-fallback actions where applicable
- **AND** closing or returning SHALL restore the character context unchanged

#### Scenario: Exact locator is not trusted

- **WHEN** a contextual reference resolves to a stale locator
- **THEN** the system SHALL withhold the exact-page action, preserve the citation and section context, and offer only verified general or details actions

#### Scenario: A page fails after loading

- **WHEN** the document opens but a page fails to render
- **THEN** the affected content SHALL provide an understandable failure state and a directly reachable browser fallback with retry where meaningful
- **AND** fallback SHALL use the current verified page when available, otherwise a verified starting or general locator
- **AND** return or dismissal SHALL remain operable without changing an active draft

#### Scenario: Text functionality fails while a page remains readable

- **WHEN** text extraction or Find fails but document content remains usable
- **THEN** the system SHALL identify the affected text functionality and retain usable reading/navigation
- **AND** it SHALL NOT present a failed or incomplete search as a successful no-match result
- **AND** browser fallback SHALL be directly available without hunting through secondary controls

#### Scenario: An obsolete operation completes

- **WHEN** an earlier load or search is superseded or the reference is closed
- **THEN** its late results SHALL NOT replace the active document/search state or reopen the dismissed reference
- **AND** ordinary rendering cancellation during navigation SHALL NOT be presented as a viewer failure

#### Scenario: Progress arrives after a search has failed

- **WHEN** a search fails and pending work from that same search later reports progress or results
- **THEN** the failed state SHALL remain visible rather than reverting to searching or appearing successfully complete
- **AND** search progress SHALL NOT describe failed page processing as successfully searched content

#### Scenario: User retries a failed search

- **WHEN** a user starts a new search after a failure
- **THEN** only the new search SHALL update its progress, results, and final status
- **AND** late callbacks from the failed search SHALL NOT alter the retry's state

#### Scenario: Required mobile platform is verified

- **WHEN** the reader is checked on the documented current stable iOS/Safari or Android/Chrome baseline
- **THEN** successful reading and document Find SHALL be demonstrated independently of visible page containers and browser-fallback availability

### Requirement: Reference controls remain accessible across supported presentations

The system SHALL give resource results, reference actions, viewer controls, document regions, source notices, and dismissal controls logical accessible names, keyboard order, visible focus, and conforming coarse-pointer targets.

#### Scenario: Keyboard user traverses the viewer

- **WHEN** a keyboard user opens and operates the reference viewer
- **THEN** focus SHALL move logically among visible source context, tools, document, fallback, and dismissal controls
- **AND** hidden tools SHALL NOT remain in the keyboard or assistive-technology interaction order
- **AND** closing SHALL restore the invoking context without an unannounced focus loss

#### Scenario: Pointer user discovers document jumps

- **WHEN** a pointer user hovers a curated section, native PDF outline destination, or Find result
- **THEN** the actionable destination SHALL use the expected link-like pointer affordance in addition to its visible text and focus treatment

#### Scenario: Touch user operates the phone viewer

- **WHEN** a coarse-pointer user opens a reference at phone width
- **THEN** primary viewer, navigation, fallback, and dismissal controls SHALL meet the repository touch-target policy without horizontal page scrolling

#### Scenario: User expands navigation in a narrow viewer

- **WHEN** a user expands the document outline in a narrow reference presentation
- **THEN** the navigation region SHALL use the available working area with usable bounded scrolling and a visible one-step return to the document
- **AND** overflow cues SHALL indicate when additional outline or search-result content is available above or below

#### Scenario: Source state changes the next action

- **WHEN** a reference is external, unavailable, offline, alternate, or stale
- **THEN** its notice and available action SHALL be conveyed by visible text and accessible semantics rather than color alone

#### Scenario: Reference is inspected inside an annotation dialog

- **WHEN** a user opens a reference within an existing modal editor
- **THEN** the shared reader tools SHALL fit that host's usable space, including when the onscreen keyboard is open
- **AND** the editor SHALL retain one modal focus context and preserve its unsaved draft on return
