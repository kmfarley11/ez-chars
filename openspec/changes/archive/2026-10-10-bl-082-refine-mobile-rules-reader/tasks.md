## 1. Compatibility Investigation and Proof Preparation

- [x] 1.1 Read and maintain [verify.md](verify.md), starting from the owner's recorded iPhone 16 Pro Max / reported iOS 26.6.2 evidence: all three phone browsers fail while desktop works. Obtain runtime/build details and define concrete current iOS/Safari and Android/Chrome verification targets plus the practical older-version boundary; no further baseline report is required to begin. Recheck the already-approved BL-084 closed-tab/containment fix separately from open-reader defects; do not report historical observations as fresh reproduction.

  Preparation and local build/capability evidence are recorded. On 2026-10-09 the owner confirmed iPhone 16 Pro Max with the latest available Safari, Firefox, and Chrome, approved rollout, and reported that physical Android testing is unavailable. Exact app versions and an older-device floor are not independently established. Record these limits rather than inventing certification; BL-072 owns additional physical matrix evidence.

- [x] 1.2 Isolate the reported stream/page failure using the pinned PDF engine, actual runtime capability/build evidence, and a controlled missing-capability fixture where useful; distinguish initialization, canvas, text-layer, and Find results. Do not assume an old-browser gap or a Safari-brand-only bug. Evaluate the supported compatibility build and matching worker before custom adaptation, document evidence and unresolved device checks, and reconcile any support-floor or dependency change with the owner.
- [x] 1.3 Audit shared primitives and reader host ownership, including SheetReferenceController, FieldAnnotationControl, and SmallEditDialog. Plan the smallest shared trial composition and opt-in app proof boundary; preserve desktop resizing and existing history/draft behavior.

## 2. Pre-Gate Shared Reader Proof

- [x] 2.1 Implement the evidence-backed compatibility correction within the PDF boundary, with deterministic regression coverage and cancellation/cleanup checks. Keep module/worker versions aligned and build-managed; pin any dependency adjustment exactly and avoid telemetry, scaffolding, and test-environment pollution.
- [x] 2.2 Add actionable late page/text/Find failure handling and directly available browser fallback at the best verified page. Guard terminal state and active-request identity for all callbacks; test one rejected page followed by late sibling progress/results and an immediate retry using deterministic deferred promises. Confirm failure cannot revert to `Searching page 6 of 403...`, retry state cannot be contaminated, progress labels are honest, and dismissal never mutates character/draft data.
- [x] 2.3 Build the shared compact persistent controls and document/Find/Outline/Page tool transitions using existing primitives. Preserve same-document search/scroll state, focus return, and continuous page scrolling; retain expanded desktop navigation and avoid scroll auto-hide.
- [x] 2.4 Make the trial responsive to available reader width and host height, including keyboard/safe-area constraints. Prove full-screen phone focus/background isolation and the single-modal annotation step without remounting drafts; expose actual sheet and both annotation-host paths through the opt-in proof, not only a standalone story.
- [x] 2.5 Reuse SelfHostedSrdViewer and MixedSourceStates; add a story only for a genuinely unreachable distinct state. Record exact proof URLs/switches and manual desktop/phone/error interactions in verify.md; keep repeatable assertions in Vitest/Playwright, not Storybook play functions.
- [x] 2.6 Run focused compatibility, navigation, late-failure, draft/focus, and responsive tests plus `npm run verify:smoke`; record results and gaps. If dependencies/build tooling change, also run the complete dependency gates from `docs/verification.md` before handoff: audit, coverage, app/Storybook builds, cross-browser E2E, and applicable performance checks.

- [x] 2.7 Apply the approved proof refinements: highlight literal matches in contextual result previews, add a results disclosure preserving query/status and manual collapse during progress, and move expanded-reader page controls above the document while retaining compact Page tools. Reuse existing proof sandboxes, add unit/browser regressions, reconcile the in-PDF highlighting backlog boundary, and record results in verify.md before returning to gate 3.1.

- [x] 2.8 Correct the reported overflow-menu dismissal/sizing using shared menu primitives, make Outline explicitly reveal/focus its destination, and content-size compact tools while bounding long results. Add host-level regressions and concrete menu-reuse agent guidance; record reproduction and verification before returning to gate 3.1.

- [x] 2.9 Restore independent desktop sheet/reader scrolling and stable sticky sheet navigation by distinguishing modal scroll locking from a non-modal workspace. Regress opening from a scrolled sheet, resizing, independent wheel/page navigation, and retained locking for actual modals. Record the owner's resume-position suggestion separately without introducing unapproved persistence.

- [x] 2.10 Correct repeated Close/Back traversal after background sheet jumps by preserving one dismissible reader history entry. Cover PDF jumps, sheet navigation, source switching, direct locators, invoker focus, and ordinary closed-reader history; reconcile the history rationale and accepted backlogged resume direction.

- [x] 2.11 Separate explicit reader dismissal from browser Back after owner follow-up: Close and resize-to-close must preserve the current sheet fragment and exact scroll position, including offscreen invoker focus return. Preserve browser Back's invocation-context behavior, cover direct locators and closed-entry Back/Forward, and record the exact Quick Reference → Rules → Inventory → Close regression and verification evidence.

## 3. STOP — Physical-Phone Reader Proof Approval

- [x] 3.1 STOP for explicit owner approval using verify.md. Review successful in-app reading/Find on the affected phone and the required current iOS/Safari and Android/Chrome targets, all-three-iPhone-browser regressions, immediately discoverable Find, readable document space, tool return behavior, keyboard/landscape, and both sheet and unsaved-annotation entry. Fallback alone is not success for required targets; any baseline reduction needs explicit scope approval. Approval unlocks Section 4 normal rollout. The 2026-10-09 owner-approved exception permits rollout with unavailable physical Android coverage documented, not counted as a pass; requested implementation revisions still require review.

  Owner formally approved the current implementation and explicitly authorized rollout on 2026-10-09 after the device-evidence gap was raised. Preserve the required in-app reading/Find behavior, the owner-reported iPhone result, and the acknowledged Android/older-device evidence limits in final verification; no repeated approval is needed to begin Section 4.

## 4. Approved Rollout

- [x] 4.1 Enable the approved shared behavior in all current reader hosts and remove proof-only switches/scaffolding. Confirm focused notes and piecewise detail annotations use the same controls without duplicate modal shells or hardcoded nested viewer heights.
- [x] 4.2 Extend application regressions for compact/wide transitions, page jumps/continuous scrolling, Find state, keyboard/focus, sheet Back/direct locators, draft preservation, source states, and open/closed containment. Assert successful text/page readiness rather than only presence of a page wrapper; keep the physical-device gap explicit.
- [x] 4.3 Amend the existing viewer ADR with accepted compact presentation and compatibility strategy, supersede the old stacked-phone rule where changed, and document the agreed support boundary and troubleshooting/fallback behavior. Keep source-rights and deferred highlighting/indexing scope unchanged.

## 5. Final Verification and Owner Approval

- [x] 5.1 Strategically review shared ownership, no hidden/obscured focus targets, async cleanup, source-locator safety, desktop regressions, and support claims. Reconcile material implementation fallout and every deferred evidence trigger into the backlog and applicable artifacts.
- [x] 5.2 Run `npm run verify:all`, strict OpenSpec validation, and the final applicable physical-phone/manual checks. Record dated results, actual browser/device versions, intentional project skips, and environmental or manual gaps in verify.md; do not equate desktop WebKit with physical iOS evidence.

  2026-10-09: all non-audit automated gates pass after rollout corrections, including 265 cross-browser tests and the Chromium performance gate. Full audit still reports 10 unchanged development-dependency findings; keep this task open pending separately authorized maintenance and a clean audit. Physical Android remains the explicitly accepted evidence exception, not a pass. See verify.md for the complete results and final human prompts.

  2026-10-10 maintenance: patched three dependency families; six high package findings remain from the single unpatched braces advisory. No audit waiver or forced downgrade. Post-maintenance results and the independent optional-peer diagnostic are recorded in verify.md and BL-072.

  The post-maintenance browser matrix also found one intermittent WebKit resize-dismissal scroll failure (261 passed, 1 failed, 27 intentional skips, 3 not run). All 24 reader cases passed in three unchanged follow-up runs, but this does not resolve the original failure. Keep 5.2 open for investigation; verify.md preserves reproduction and evidence. All other executable gates passed.

  Owner-approved diagnostics now compare combined Home, split focus/keydown/keyup, and Close with bounded event attachments. Final full WebKit validation passed 68 tests (7 existing skips); the corresponding other-engine cases passed 9/9. The failure did not recur and no production fix is claimed. Inspect the next failure's attachment before choosing a workaround; retain 5.2 as open. See verify.md for commands, earlier repetitions, and instrumentation limitations.

  Subsequent owner decision (2026-10-10) supersedes the scroll-investigation closure block above: no manual occurrence has been observed, and the owner explicitly accepts moving on with recurrence monitoring. BL-072 owns the trigger and diagnostic pointers; preserve strict tests and historical failures. Task 5.2 stays open for the independent dependency-audit blocker, not for continued speculative scroll investigation. No security exception is implied.

- [x] 5.3 STOP — Final post-apply user review and explicit approval. Present the integrated result, compatibility evidence, accepted limitations, and backlog follow-ups. Leave this task unchecked until the owner explicitly approves; passing tests and earlier proof approval do not satisfy this gate.

  Owner approved the integrated result on 2026-10-09: “everything looks great! yeah go ahead with dependency maintenance”. This approves the reader and authorizes bounded maintenance, not an audit waiver. Task 5.2 remains open until its independent security blocker is resolved.

Owner security decision (2026-10-10): “I do approve” explicitly accepts the bounded GHSA-vfj7-8cjw-p6xm exception and permits closure. This supersedes the historical audit block above, not its failed results. Task 5.2 is complete with accepted audit, physical-device, and monitored-scroll limitations recorded in verify.md; `verify:all` remains audit-blocked. BL-072 owns the review deadline and recurrence triggers.

## 6. Backlog Updates & Reconciliation

Archive-time only, after 5.3 approval.

- [x] 6.1 Confirm that BL-072 or another appropriate backlog entry owns every remaining matrix check/evidence trigger; no unresolved requirement may be hidden by reclassifying it as a follow-up without owner approval.
- [x] 6.2 Sync the contextual-reference-navigation delta into the main capability, preserving unchanged scenarios and valid Purpose/Requirements structure; archive the change, preserve its historical delta, repair relocated relative links, and validate the affected main spec plus `openspec validate --all --strict`.
- [x] 6.3 Remove BL-082's queue/catalog entry, add a dated Done Recently summary retaining 3–5 recent entries, and reconcile the Next recommended sequence with BL-070 leading unless the owner changes priorities. Update active goals if applicable and supply a BL-082 commit subject; do not stage or commit without authorization.

## Executor Recommendation

Minimum capability tier: **Advanced**. This is shared UI/lifecycle work with a browser-compatibility investigation; model strength cannot substitute for physical-device evidence.

| Working phase               | Task/gate boundary        | Default reasoning | Complexity | Rationale                                                                                |
| --------------------------- | ------------------------- | ----------------- | ---------- | ---------------------------------------------------------------------------------------- |
| Initial apply through proof | Sections 1–2; stop at 3.1 | High              | Complex    | Compatibility, reader state, modal ownership, and responsiveness interact.               |
| Evaluate proof feedback     | Gate 3.1 / verify.md      | Medium            | Moderate   | Separate measured failures from bounded layout preferences.                              |
| Ordinary proof revisions    | Section 2 with 3.1 open   | Medium            | Moderate   | Refine labels, spacing, thresholds, and controls without expanding lifecycle scope.      |
| Resume approved rollout     | Section 4                 | High              | Complex    | Propagate one accepted implementation across sheet and draft-owning hosts.               |
| Final strategic review      | 5.1–5.2; stop at 5.3      | High              | Complex    | Cross-browser evidence, focus/history, cleanup, and support claims require joint review. |
| Approved cleanup/archive    | Section 6 after 5.3       | Medium            | Moderate   | Spec merging, ADR/backlog reconciliation, and evidence/link maintenance.                 |

Escalate ordinary revisions when they change history, modal/focus ownership, async resource lifetime, PDF build/worker strategy, or the supported browser floor. Stop for owner direction if the correction requires an engine replacement or a material scope/support change. Reclassify final-review fixes as implementation, not archival cleanup. These recommendations do not authorize automatic model switching, delegation, or approval-gate bypass.
