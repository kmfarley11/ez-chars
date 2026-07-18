# 2026-07-18 Storybook Integration for UI Components

## Metadata
* **Status**: Approved
* **Author**: Antigravity & User
* **Date**: 2026-07-18

## Context & Problem Statement
We are preparing for Phase 2 (UX Polish & Playtest Prep) and recognize the need to improve the "Dev UX" significantly. Building Svelte components directly within the main character sheet (`src/routes/charsheets/5e/+page.svelte`) requires navigating complex 5e state hydration and layout grids, making it slow and brittle for human developers and AI agents to iterate on visual atoms like buttons, dialogs, and typography.

We need a way to isolate visual UI components so they can be built, styled, and audited independent of the application logic.

## Decision Drivers
* Need for component isolation to speed up visual development.
* Must support AI agents reading component contracts easily without parsing deep Svelte logic.
* Must support accessibility (a11y) auditing.
* Must align with our existing Svelte 5 + Vite infrastructure.

## Considered Options

### 1. Custom Svelte Component Sandbox Route
* **Pros**: Zero dependencies, perfectly tailored to our setup.
* **Cons**: Requires building custom hot-reloading dashboard UI, custom test runners, and custom a11y integrations. Reinvents the wheel.

### 2. Storybook with Svelte native CSF (`.story.svelte`)
* **Pros**: Uses Svelte syntax directly for writing stories.
* **Cons**: Svelte CSF is an unofficial addon that occasionally lags behind major Svelte compiler changes (like the recent Svelte 5 runes). Less widely understood by older LLMs.

### 3. Storybook with TypeScript CSF (`.stories.ts`)
* **Pros**: Official `@storybook/svelte-vite` builder support. TypeScript CSF is the industry standard format—universally supported by AI generators. Official `addon-a11y` support.
* **Cons**: Requires installing Storybook dependencies. Stories are written in JS/TS instead of HTML/Svelte.

## Decision Outcome
We have chosen **Option 3: Storybook with TypeScript CSF**.
We will install Storybook to run exclusively as a local development tool. 

### Consequences
* **Positive:** Developers and agents gain an isolated dashboard to rapidly build and audit UI components.
* **Positive:** Real-time Axe-core accessibility testing via `@storybook/addon-a11y` ensures we don't regress on our P1 mobile/accessibility goals.
* **Positive:** `.stories.ts` files act as durable, typed documentation/contracts for agents.
* **Negative:** Adds development dependencies to the `package.json`.

### Refinements & Follow-Ups
* We will keep the deployment local-only to avoid CI/CD complexities at this stage.
* Implemented via OpenSpec change `p1-012`.
