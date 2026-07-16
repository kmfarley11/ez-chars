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

- the 5e 2014 schema and reusable grid editing primitives exist
- the home page lists locally stored or seeded characters
- the 5e sheet route exists, but only part of the full sheet is surfaced in the UI
- localStorage persistence and JSON import/export exist, but CI, storage tests, and a hardened storage adapter are still missing

## Docs

- coding-agent guide: [AGENTS.md](AGENTS.md)
- current active goals: [docs/active-goals.md](docs/active-goals.md)
- prioritized backlog: [docs/backlog.md](docs/backlog.md)
- docs index: [docs/index.md](docs/index.md)
- long-term vision: [docs/vision/index.md](docs/vision/index.md)

## Workflow

The repository prefers a structured engineering workflow for human maintainers using agentic coder tooling. Prototyping, exploration, fallout, and reconciliation complement the OpenSpec active change lifecycle:

```
(optional) Prototype
        ↓
(optional) Explore
        ↓
(openspec) Proposal
        ↓
Human Review / Approval
        ↓
(openspec) Apply Changes
        ↓
Implementation Fallout
        ↓
Repository Reconciliation
        ↓
Verify
        ↓
(openspec) Archive
```

- **Prototype** and **Explore** are optional early-stage engineering activities to prototype ideas or explore the codebase before committing to a change.
- **Proposal**, **Apply**, and **Archive** form the core OpenSpec execution loop. Run `npx openspec new change <change-id>` to create a change workspace.
- **Implementation Fallout** and **Repository Reconciliation** are practices to report discoveries, update design documents, and reconcile durable codebase/maintainer knowledge before archiving.
- For detailed agent guidelines and boundary rules, see [AGENTS.md](AGENTS.md). Particularly the [preferred agent responsibilities section](AGENTS.md#preferred-agent-responsibilities).

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
