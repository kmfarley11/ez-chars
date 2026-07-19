# ez-chars

`ez-chars` is a SvelteKit prototype for local-first tabletop RPG character sheets.

## Current Focus

This repository is intentionally scoped to a narrow MVP:

- one system: D&D 5e 2014
- editable, mobile-friendly character sheets
- local-first persistence
- JSON import/export for backup
- optional annotations and source references

Everything else is long-term vision, not the immediate build target. For roadmap and future-scope notes, see [docs/vision/index.md](docs/vision/index.md).

## Current State

- the versioned 5e 2014 schema hydrates supported legacy data into one canonical model, and reusable grid editing primitives exist
- the home page lists locally stored or seeded characters
- the 5e sheet route exists, but only part of the full sheet is surfaced in the UI
- validated localStorage persistence, JSON import/export, migration/storage contract tests, and browser smoke coverage exist; CI remains deferred

## Docs

- coding-agent guide: [AGENTS.md](AGENTS.md)
- current active goals: [docs/active-goals.md](docs/active-goals.md)
- prioritized backlog: [docs/backlog.md](docs/backlog.md)
- docs index: [docs/index.md](docs/index.md)
- long-term vision: [docs/vision/index.md](docs/vision/index.md)

## Workflow

The repository prefers a structured engineering workflow for human maintainers using agentic coder tooling. Prototyping, exploration, fallout, and reconciliation complement the OpenSpec active change lifecycle:

- (optional) is self explanatory
- (complex|mixed|simple) indicates which type of agentic coding model to use
  - mixed indicates that the nature of the effort will vary the needs

```
(optional) Prototype
        ↓
(optional, complex) Explore
        ↓
(openspec, complex) Proposal
        ↓
Human Review / Approval
        ↓
(openspec, mixed) Apply Changes
        ↓
(mixed) Implementation Fallout
        ↓
(mixed) Repository Reconciliation
        ↓
Verify
        ↓
(openspec) Archive
```

- **Prototype** and **Explore** are optional early-stage engineering activities to prototype ideas or explore the codebase before committing to a change.
- **Proposal**, **Apply**, and **Archive** form the core OpenSpec execution loop. Run `npx openspec new change <change-id>` to create a change workspace.
- **Implementation Fallout** and **Repository Reconciliation** are practices to report discoveries, update design documents, and reconcile durable codebase/maintainer knowledge before archiving.
- For detailed agent guidelines and boundary rules, see [AGENTS.md](AGENTS.md). Particularly the [preferred agent responsibilities section](AGENTS.md#preferred-agent-responsibilities).

### The Draft → Refine Agentic Workflow

When executing complex architectural changes or creating new OpenSpec proposals, we strongly recommend the **Draft → Refine Workflow**:

1. **Mid-Tier Draft**: Use a faster, less complex model to draft the initial proposal, layout the tasks, and write the boilerplate markdown.
2. **Human Smell Test**: Review the drafted boundaries, scope, and objectives.
3. **High-Tier Refinement**: Pass the draft to a high-reasoning model and ask it to "Strategically review the changes."

**Why this works:** Mid-tier models are excellent at structurally formatting plans and identifying the "happy path" integration steps. High-tier models excel at scrutinizing those plans to identify framework-specific nuances, systemic edge cases (e.g., test runner pollution), and defensive architecture constraints. Combining them is highly cost-effective and produces superior, resilient architectures.

## Development

You will need Git LFS installed to fetch the PDF assets used by the repo.

```bash
npm i  # prefer Node 20
```

Run the dev server:

```bash
npm run dev
```

Run local verification as described in [docs/verification.md](docs/verification.md).

### Browser-test prerequisites

Playwright browser suites require local browser binaries. After `npm i`, install them from the repository root:

```bash
npx playwright install
```

On Linux, WebKit may also require system libraries. Install them with your normal sudo access, then rerun the browser suite:

```bash
npx playwright install-deps
```

If you only need a missing browser, install it by name, for example `npx playwright install webkit`.

Preview the production build locally:

```bash
npm run preview
```

Deploy remains manual for now:

```bash
npm run deploy
```

## Optional: Svelte MCP setup for coding agents

This repository includes the official `@sveltejs/mcp` server as a development dependency. It is not required to run, build, or deploy the app, but lets supported coding-agent clients consult the current Svelte 5 tooling and documentation while working on Svelte files.

After `npm i`, register the local server with Codex CLI from the repository root:

```bash
codex mcp add svelte -- "$(pwd)/node_modules/.bin/svelte-mcp"
codex mcp get svelte
```

Start a new Codex session after registration; the tools available to an existing session do not change in place. Other coding-agent clients need an equivalent local stdio MCP configuration. If a client cannot expose MCP tools, agents should use the official Svelte documentation and the local verification commands instead; see [AGENTS.md](AGENTS.md#svelte-5-agent-workflow).

## Licensing

- Source code in this repository is licensed under MIT. See [LICENSE](LICENSE).
- Included third-party assets, such as SRD PDFs under [docs/ext/](docs/ext/), retain their original licenses.
- Third-party attributions and license details are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
