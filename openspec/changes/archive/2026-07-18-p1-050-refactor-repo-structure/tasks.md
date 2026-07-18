## 1. Directory Setup and Vite Aliases

- [ ] 1.1 Create `src/lib/components/`, `src/lib/storage/`, and `src/lib/utils/` directories
- [ ] 1.2 Update `svelte.config.js` to add `kit.alias` mappings for `$components`, `$storage`, `$utils`, and `$fixtures`

## 2. File Relocations via Git Move

- [ ] 2.1 Use `git mv` to move visual UI `.svelte` files from `src/lib/` to `src/lib/components/`
- [ ] 2.2 Use `git mv` to move `src/lib/characterStorage.ts` to `src/lib/storage/`
- [ ] 2.3 Use `git mv` to move `src/data.ts` to `src/lib/storage/store.ts`
- [ ] 2.4 Use `git mv` to move non-visual JS/TS helpers (e.g. `urlHelpers.ts`, `theme.ts`, `displayHelpers.ts`, `stringFormatters.ts`, `characterGridHelpers.ts`, `fieldDraftHelpers.ts`, `gridContentHelpers.ts`, `buttonTypes.ts`, `gridContentTypes.ts`, `gridFieldGuards.ts`, `index.ts`) from `src/lib/` to `src/lib/utils/`

## 3. Import Path Refactoring

- [ ] 3.1 Update imports in `src/routes/+page.svelte` and `src/routes/charsheets/5e/+page.svelte` to use the new aliases (`$components`, `$storage`, `$utils`)
- [ ] 3.2 Update imports inside `src/lib/components/` to use `$components`, `$utils`, and `$storage` instead of relative paths
- [ ] 3.3 Update imports in `src/lib/utils/` and `src/lib/storage/` to use new aliases
- [ ] 3.4 Update imports in `src/routes/charsheets/5e/sheetProjections.ts` and `sheetEditIntents.ts`
- [ ] 3.5 Run `npm run check` and `npm run lint` to catch and fix any unresolved aliases or circular dependencies

## 4. Backlog Updates & Reconciliation

- [ ] 4.1 Move `p1-050` to 'Done Recently' in `docs/backlog.md` with a summary of the structural refactoring
- [ ] 4.2 Reconcile the 'Next recommended sequence' target in `docs/backlog.md` to point to the next priority (`p1-005`)
- [ ] 4.3 Update `docs/active-goals.md` if the change affects goal tracking status

## Executor Recommendation

**Complexity**: Medium  
**Reasoning**: Low-to-Medium  
**Rationale**: This is primarily a mechanical refactoring task, but it requires careful execution of `git mv` to preserve history, and precise search-and-replace for alias imports across the codebase. A standard or fast model (Codex) should easily handle this, provided it checks TypeScript compilation after the moves.
