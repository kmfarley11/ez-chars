# BL-089 review guide

**Archived on 2026-11-06. Proof approved on 2026-10-31; final rollout, two closure refinements and archival approved on 2026-11-06. The ordinary sheets use the approved controls. No query parameter is needed.**

## Final review — use the app

- **2014 → Quick Reference → Live state:** toggle Inspiration, add/review a note, reload. Confirm it appears only here, not in Reference stats.
- **2024 → Live state:** toggle Heroic Inspiration; save, cancel and clear multiline Conditions. Reload and confirm values and notes survive independently.
- **Phone width:** recheck unchanged Conditions read/edit geometry and scrolling for long text; nearby HP/death-save controls should still feel familiar.

These are retained normal-route retest steps, not another approval gate. Broader click-to-edit and 2014 Conditions remain deferred. The owner authorized archival; no commit, deployment or physical-device test is implied.

## Optional story sandboxes

Run `npm run storybook`. These reuse existing stories; use the viewport toolbar for phone widths.

- [Tier 1 / Default — boolean](http://localhost:6006/?path=/story/design-system-molecules-edit-first-fields-tier-1--default&args=kind:boolean). In **Controls**, change `kind` among `boolean`, `text`, `multiline`, and `number`. Keep `editAffordance=persistent`; use `absent`, `rejectSaves`, `withAnnotation`, and `initialText` as needed. Quiet Affordance is the legacy low-level read-first variant, not this proof.
- [2014 / Bryltin](http://localhost:6006/?path=/story/systems-d-d-2014-character-sheet--bryltin).
- [2024 / Representative](http://localhost:6006/?path=/story/systems-d-d-2024-character-sheet--representative). Reuse **Sparse** for missing fields and **Saturated** for density.

Canonical stories use production Pages and edition save adapters with isolated local state. **Reset example** restores the fixture; **Reject character saves** exercises rejection. They do not save application characters.

## Detailed reusable interactions

- **Boolean / both sheets:** click/tap Inspiration, then toggle with Space. It should commit immediately without a dialog. Reject a save: the checkbox must revert, show an error, and retain keyboard focus. With `absent=true`, the generic example starts unchecked, exposes “Not recorded” to assistive technology, and emits no patch until activation.
- **Short text:** edit, Save/Enter, then try Escape/Cancel. Rejection must retain your draft. Saving an unchanged empty absent field should emit no patch.
- **Multiline / 2024 Conditions:** enter `Prone` and `Concentrating on a spell` on separate lines. Enter adds a line; the checkmark saves. Paste a long value, confirm all text remains reachable, and judge phone density. Finish/cancel a draft before opening notes.
- **2014 Bryltin:** Inspiration appears once in **Live state**, not Reference stats. Toggle it, add/review a note, and edit nearby Current HP. Notes and numeric behavior should remain independent.
- **2024 Representative:** Heroic Inspiration and Conditions remain below death saves. Toggle/edit/clear, add a note, and check adjacent read-first proficiency indicators have not become directly editable.
- **Both, phone width:** judge accidental-toggle risk, readable text, touch spacing, and read/edit height changes. This is the main remaining judgment—not a request to rerun every automated assertion.

## Real-app / physical-phone review

Run `npm run dev -- --host 0.0.0.0`. Use the reported Network URL on a same-network phone; substitute that origin below rather than recording a private address.

- 2014: `/ez-chars/charsheets/5e?id=char-bryltin`
- 2024: `/ez-chars/charsheets/5e2024?id=char-5e-2024-representative`

If those examples are not in your saved list, open any character of that edition normally. Review **Quick Reference → Live state**. Unlike stories, app edits persist: toggle, save text/notes, reload, and confirm they remain independent. The former `runtimeTypeProof` query/Control was removed during rollout; old links simply use the normal presentation. Record actual device/OS/browser; emulated viewports are not physical-device evidence.

## Final review and approved cleanups — 2026-11-06

- **Agent review:** no blocking implementation or data-safety finding. The default parallel Chromium suite timed out twice at the 10-second whole-test limit: recovery in both runs, Inspiration in the first and mixed dispatch/creation in the second. Traces reached the final navigation checks; focused recovery/runtime repeats passed 12/12 and the full serialized suite passed 96 with five expected project skips. This supports timing-sensitive test composition, not proof of an application defect or a clean default smoke run.
- **Reproduction:** run `npm run test:e2e` with its default worker count. The observed long journeys lived in `tests/character-recovery.smoke.spec.ts`, `tests/runtime-types.smoke.spec.ts`, and `tests/multi-system.smoke.spec.ts`. No physical-device failure was reported. Timing depends on local load; do not assume it reproduces on every machine.
- **Approved correction:** split protection/download, reset/persistence, post-reset creation, ordinary creation, and Inspiration notes/toggling into focused independent scenarios. Keep assertions, default concurrency and timeouts intact. Retest through the ordinary `npm run verify:smoke` command.
- **Spacing finding:** short-text read mode used a 32px minimum while mobile inputs used 44px. In Tier 1 Default, select `kind=text`, set a phone viewport, and open/cancel Nickname. The shared runtime-value class now supplies the mobile minimum; the catalog checks unchanged-value heights at 390px and 1280px in light/dark themes. No new story was needed.
- **Pre-cleanup refreshed evidence:** diagnostics/lint, 399 unit tests, 115 Storybook checks, 36 catalog checks, 12 focused Firefox/WebKit/Mobile Chrome checks, production build and 23 strict OpenSpec validations passed. Default smoke timeouts are disclosed above; no fresh physical-device, audit, performance or coverage result is claimed.
- **Post-cleanup verification:** `npm run verify:smoke` passed at default concurrency: diagnostics **0 errors / 0 warnings**, lint, **52 unit files / 399 tests**, **103 Chromium tests / 5 expected project-specific skips**, and **44 Storybook files / 115 checks**. The formerly long journeys are split; no timeout, worker, retry or assertion relaxation was needed.
- Catalog: **38 passed**, light/dark, including new single-line geometry checks at phone/desktop widths. Affected Firefox/WebKit/Mobile Chrome flows: **42 passed**, covering runtime types plus the split recovery, reset, creation and dispatch scenarios. Command: `npx playwright test tests/runtime-types.smoke.spec.ts tests/character-recovery.smoke.spec.ts tests/multi-system.smoke.spec.ts --grep 'Inspiration:|Conditions:|recovery protects|explicit reset|reset restores|failed reset|mixed list dispatches|character creation retains' --project firefox --project webkit --project 'Mobile Chrome' --workers=1`.
- Production build passed. Official Svelte tooling reported no issues; existing advisory patterns remain as explained in the rollout evidence. Both review recommendations are resolved. This is affected-flow cross-browser coverage, not a rerun of every application scenario in every browser; no new physical-device, audit, coverage or performance result is claimed.
- **Archive reconciliation:** four requirements synced into `openspec/specs/character-sheet-editing/spec.md`, retaining its capability purpose and normal requirement headings. Historical delta headings remain in this archive. The affected main spec and all **22** remaining active specs/changes passed strict validation. The author-intent link was repaired for the deeper archive location and local link targets checked. BL-089 was removed from the active queue/catalog, Done Recently retained five entries, and BL-071 returned to the front of the recommended sequence. BL-088 and the 2014 Conditions ideation entry retain deferred work. No files were staged, committed, pushed or deployed.

## Rollout evidence — 2026-10-31

- `npm run verify:smoke`: diagnostics **0 errors / 0 warnings**, lint passed; **52 unit files / 399 tests**, **96 Chromium tests / 5 expected phone-project skips**, **44 Storybook files / 115 checks** passed.
- `npm run build`: passed; static adapter wrote the production site. No dependencies, schemas or build configuration changed.
- `npx playwright test --config playwright.catalog.config.ts`: **36 passed**, light/dark. Includes both editions' real rejection adapters, retained text drafts, shared/sheet geometry, canonical isolation, reset and reader behavior.
- `npx playwright test tests/runtime-types.smoke.spec.ts --project firefox --project webkit --project "Mobile Chrome" --workers=1`: **12 passed** on ordinary routes. Includes optional/false/true toggles and reload, independent notes, multiline Save/Cancel/clear/reload, narrow/wide geometry and neighboring HP editing.
- Strict change validation and whitespace checks passed. Svelte tooling reports no issues; retained advisory patterns are the immutable FieldDraft API, local fixture-reset effect, native textarea reference and documented keyboard-scroll-region exception. Repo diagnostics/lint passed with these deliberate patterns.
- Initial rollout checks caught an obsolete Live state key-list expectation and an incorrectly array-shaped 2014 annotation fixture in the new round-trip test. Corrected the assertion for the approved relocation and used the existing keyed annotation representation; no schema or production validation was weakened. The full rerun passed.
- **Self-review: Pass.** Shared controls own geometry, keyboard/focus, immediate boolean versus text-draft interaction and rejection recovery. Edition metadata/adapters own classification, optional presence, conflicts and complete-candidate validation. Proof props/queries/banners are absent from source/tests, normal routes and canonical stories use the same Pages, numeric behavior remains covered, and JSON round trips preserve both editions' values/notes. No unresolved blocking finding.
- Follow-ups remain reconciled under BL-088 (broader direct Tier 1 activation) and the sheet-coverage ideation entry (2014 Conditions); neither expanded this rollout. No physical-device test, full cross-browser application matrix, new dependency audit, coverage or performance rerun is claimed. Nothing was staged, committed or deployed. Final owner approval remains task 4.2.

## Historical proof evidence — 2026-10-30

- `npm run verify:smoke`: diagnostics **0 errors / 0 warnings**; lint passed; **52 unit files / 398 tests**; Chromium **95 passed / 5 expected phone-project skips**; Storybook **44 files / 115 checks** passed.
- `npx playwright test --config playwright.catalog.config.ts`: **26 passed**, light and dark. Includes rejected boolean state/focus through both production adapters, generic missing/no-op states, IME-safe short text, rejected multiline retention, bounded textarea geometry, and existing canonical reset/isolation checks.
- `npx playwright test tests/runtime-types.smoke.spec.ts --project chromium --project firefox --project webkit --project "Mobile Chrome" --workers=1`: **12 passed**. Includes both editions' toggle/notes/reload behavior, proof-off baseline, Conditions Save/Cancel/clear, multiline Enter, and nearby numeric editing.
- `npm run build`: passed. Strict change validation and final formatting/whitespace checks: passed.
- Svelte tooling: no reported issues in the changed shared controls. Reviewed advisory suggestions: immutable FieldDraft methods are intentional, the story effect resets editable fixture state, and repo-local lint owns TypeScript callback suppressions.
- No physical-device, full cross-browser matrix, dependency audit, coverage, or performance rerun is claimed for this pre-gate batch. Full rollout checks remain in section 3.

### Corrections found during implementation/self-review

- Storybook initially ignored URL-selected text variants, leaving the numeric fixture displayed. An explicit scalar type for the selector fixes the inferred union mapping; the same browser scenarios now pass. Switching fixture types also resets outstanding drafts.
- Grouped new-type fields now forward only the edited leaf's guarded patch; tested numeric-only groups retain their established coupled save. Missing handlers reject rather than report success.
- The first focused cross-browser run had **4 failures** from interrupted module imports. Trace evidence placed Firefox errors immediately after navigating away from a not-yet-mounted baseline; the negative checkbox assertion had passed on an empty page. Tests now wait for visible Current HP controls before checking absence/navigating. All 12 reruns pass with browser-error checks intact; no application error was suppressed.
- Earlier helper-only evidence is superseded by the completed implementation above. The earlier formatting failure was corrected before the passing smoke run. No unresolved implementation blocker or deferred product follow-up was identified in this pre-gate review.

## 2026-10-31 proof feedback and retest

- **Owner report:** Inspiration had square corners unlike other checkboxes. In the 2024 proof, entering Conditions edit shrank an approximately three-line read value to two rows; the dedicated multiline story appeared to size correctly. Browser/device for this report were not specified. Expected: matching read/edit dimensions without disruptive shifts.
- **Original reproduction:** run `npm run storybook`; open the 2024 Representative with the then-required `runtimeTypeProof=true` Control, find Conditions in Live state, enter three lines (include a long wrapping line), save, then click its pencil. Compare the same value in Tier 1 Default with `kind=multiline`, at phone and desktop widths. The former fixed two-row textarea could shrink when entering edit; both hosts used that same component rather than different implementations. After rollout, repeat the same steps without that retired Control using the ordinary story links above.
- **Revision:** shared checkbox now uses the existing rounded/bordered control styling. Shared multiline read/edit geometry is content-sized with the same 12rem scroll limit; long read values are keyboard-scrollable. The story's JSON diagnostic now wraps instead of overflowing phone width. No new story or edition-specific sizing exception was added.
- **Manual retest:** save three lines, reopen/cancel unchanged, shorten to one line, then try 30 lines. Read/edit width and height should agree for unchanged content, shrink when content is shortened, and scroll at the shared limit. Recheck Inspiration's corners and tap/Space activation. Repeat on your phone; automation does not constitute physical-device review.
- **Follow-ups:** direct Tier 1 label/value activation is captured under BL-088; 2014 Conditions is captured in the existing sheet-coverage ideation entry. Neither is implemented or added to BL-089 scope. The owner subsequently approved task 2.1 below.
- **Automated revision results:** smoke passed **398 unit tests, 96 Chromium tests (5 expected phone-project skips), and 115 Storybook checks**. Final diagnostics: **0 errors / 0 warnings**; lint passed. Focused catalog rerun: **16 passed** across light/dark, shared/2024 hosts and narrow/wide widths. Focused application rerun: **12 passed** across Firefox, WebKit and Mobile Chrome. Strict change validation and whitespace checks passed. No new physical-device evidence is claimed.
- **Test correction:** the first cross-browser geometry run passed 11/12; WebKit did not scroll for the test's platform-specific document-end shortcut. Ordinary caret arrow navigation passes with the scroll assertion intact, including the full 12-test rerun. No application error or assertion was suppressed. The intentionally focusable, named multiline scroll region uses the same narrowly documented accessibility-lint exception as existing bounded scroll regions.

## Approvals

- 2026-10-30: owner approved the planning refinements and applying through task 2.1, including relocating 2014 Inspiration. That authorizes this proof, not normal-sheet rollout.
- **Task 2.1: approved on 2026-10-31.** Owner: “all looks good, i approve, please proceed.” This accepts the revised shared controls and both in-sheet proofs and unlocks section 3; device/browser for this approval was not specified.
- **Final post-rollout task 4.2: approved on 2026-11-06.** Owner: “approved, please enact the 2 recommendations and archival”. This authorizes the test-composition and single-line spacing cleanups above and archival after verification.
