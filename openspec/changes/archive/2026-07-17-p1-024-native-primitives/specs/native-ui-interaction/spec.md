## ADDED Requirements

### Requirement: Platform-native dialog interaction

All modal overlay views in the application SHALL be managed using the platform-native HTML `<dialog>` element. The UI SHALL bind the modal's open and close states to standard browser events and Svelte state without custom JS event-loop simulation, and SHALL support standard native behavior (like ESC key to dismiss, focus trap, and background clicking if applicable).

#### Scenario: Native dialog backdrop dismiss

- **WHEN** a native dialog is displayed
- **THEN** pressing the ESC key SHALL trigger the browser-native close handler and update the associated Svelte state cleanly

#### Scenario: Svelte state bindings to native dialog

- **WHEN** Svelte state changes to open or close the dialog
- **THEN** the component SHALL call `.showModal()` or `.close()` directly on the native dialog element

### Requirement: Svelte-idiomatic event handlers

All native browser interaction handlers (such as clicks, focus changes, keydowns) on native HTML elements SHALL bind using Svelte-idiomatic native attribute property syntax (e.g. `onclick={...}`, `onkeydown={...}`) instead of custom JS events or legacy Svelte directives (like `on:click`).

#### Scenario: Native click handler execution

- **WHEN** a user triggers a click on a button using Svelte 5 standard bindings
- **THEN** the browser-native handler `onclick` SHALL fire directly
