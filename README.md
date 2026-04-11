# ez-chars

`ez-chars` is a SvelteKit prototype for local-first tabletop RPG character sheets.

## Current Focus

This repository is intentionally scoped to a narrow MVP:

- one system: D&D 5e 2014
- editable, mobile-friendly character sheets
- local-first persistence
- JSON import/export for backup
- optional annotations and source references

Everything else is long-term vision, not the immediate build target. For roadmap and future-scope notes, see `docs/vision/index.md`.

## Current State

- the 5e 2014 schema and reusable grid editing primitives exist
- the home page lists locally stored or seeded characters
- the 5e sheet route exists, but only part of the full sheet is surfaced in the UI
- localStorage persistence exists, but import/export, tests, CI, and a hardened storage adapter are still missing

## Docs

- coding-agent guide: `AGENTS.md`
- current MVP definition: `docs/current-mvp.md`
- prioritized MVP backlog: `docs/mvp-backlog.md`
- docs index: `docs/index.md`
- long-term vision: `docs/vision/index.md`

## Development

You will need Git LFS installed to fetch the PDF assets used by the repo.

```bash
npm i  # prefer Node 20
```

Run the dev server:

```bash
npm run dev
```

Run the main verification commands:

```bash
npm run check
npm run lint
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Deploy remains manual for now:

```bash
npm run deploy
```

## Licensing

- Source code in this repository is licensed under MIT. See `LICENSE`.
- Included third-party assets, such as SRD PDFs under `docs/ext/`, retain their original licenses.
- Third-party attributions and license details are listed in `THIRD_PARTY_NOTICES.md`.
