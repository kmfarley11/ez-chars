# svelte5-audit Specification

## Purpose

Ensure that the application's components conform to Svelte 5 best practices and runes, eliminating legacy Svelte 4 structures to maintain reactivity correctness and optimal performance.

## Requirements

### Requirement: Svelte 5 Rune conformance

All Svelte UI components SHALL use Svelte 5 runes (`$props()`, `$state()`, `$derived()`) to manage prop bindings, local reactive state, and computed properties.

#### Scenario: Verify component state runs on Svelte 5

- **WHEN** any Svelte component declares props or state
- **THEN** it SHALL use `$props()` and `$state()` runes instead of legacy `export let` or `let` variables

### Requirement: Standard event handling syntax

All Svelte components SHALL bind event handlers using Svelte 5 native event properties (e.g., `onclick`) instead of legacy event directives (e.g., `on:click`).

#### Scenario: Verify button click binding

- **WHEN** a Svelte component binds a click handler to a button element
- **THEN** it SHALL declare it using `onclick={handler}` instead of `on:click={handler}`
