# BL-066 Verification Record

## Status

Planning only. No implementation, output proof, permission clearance, automated product checks, or human approval is claimed by this document. The task gates remain authoritative in [tasks.md](tasks.md).

## Prerequisite Evidence

Before product implementation, record links to the approved source-register entry, centralized template inventory, processing/output permission basis, scoped local-source review acknowledgment when required, and exact mapping/loss inventory. The existing [audit](../../../docs/fillable-pdf-interoperability-audit.md) is feasibility context, not rights clearance.

Record provisional input/output limits, font/glyph expectations, and proposed viewer versions here during Section 1. Finalize measured limits and supported glyphs after writer/font evaluation in Section 2, before the human proof gate. Candidate manual coverage: a Chromium PDF viewer, Firefox PDF viewer, an independent fill/save editor such as Preview or Acrobat Reader, and physical iPhone Safari's download/open flow. Confirm actual availability and support rather than claiming this proposed matrix passed.

## Smallest Proof Sandbox Set

- One export-review sandbox with sparse and saturated character selection, local template input, report, and download. Add exact Storybook/app location during implementation. Reuse it for viewport, keyboard, error, and cancellation checks; create another story only for a distinct unreachable state.
- The actual downloaded PDFs are part of the proof. A story screenshot, generated synthetic form, or library round-trip test does not establish official-form appearance or print fidelity.

## Human Proof Interactions

- **Export review, sparse fixture:** Select the identified blank form, inspect Included/Continued/Not represented, and download. Check that the character's identity and mapped statistics match the app. Confirm the language makes clear that JSON, not PDF, is the full backup.
- **Export review, omission classification:** Using the same sandbox, compare a fixture with omitted authored notes against one whose only exclusions are internal IDs/pin state. Notes require acknowledgment; app-only metadata receives a compact limitations disclosure without that extra action. Empty optional fields and fully preserved continuations are not reported as lost content.
- **Export review, saturated fixture:** Inspect overflow and omissions. Download and follow references from full sections to continuation pages. Check long prose, equipment/spell rows, section/level labels, and legible text. Confirm unsupported notes/metadata are disclosed rather than quietly promised to round-trip.
- **Downloaded PDF, overflow ownership:** Check that overflowing prose appears in full only on its continuation, with a short reference in the original field. Verify collection records occur once, with excess records continued intact. Confirm the review explains that later edits to the original form do not regenerate the non-fillable continuation pages.
- **Downloaded PDFs, declared viewers:** Open sparse and saturated output in the selected browser viewers and independent editor. Change a populated field, save, and reopen in the editor; check checkbox appearances and unchanged surrounding content. Inspect print preview or print-to-PDF, including continuations. Original fields are editable; continuation pages are not promised to be.
- **Export review, negative cases:** Try a non-PDF, an unknown/revised form, and an already-filled copy. Expect a useful error and no character changes. Exercise any documented output limit/glyph failure fixture without a misleading partial download.
- **Export review, keyboard and phone:** Operate selection/review/download/cancel using the keyboard and a physical phone. Check target sizes, readable reports, scrolling, focus return, and useful download/open behavior. Cancel during generation and confirm no delayed download. Viewport emulation alone does not establish phone file handling.
- **Integrated app after proof approval:** Invoke the command from the intended character menu. Confirm exporting one character does not change another, filtered/hidden mapped collection entries still export, the reviewed snapshot matches the output, and existing JSON export still works.

## Automated Evidence to Record

Record date, exact command, result, and applicable environment with each run. Cover projection and map-drift contracts; invalid/malformed/changed input; overflow, glyph and resource boundaries; reopened values/editability; cancellation and snapshot consistency; storage non-mutation; and the full dependency-change gates in [verification guidance](../../../docs/verification.md). Explicitly distinguish owned synthetic-fixture coverage from real-template coverage and identify any rights-limited automation gap.

No implementation suites have been run for this proposal.

## Human Review Record

- Mid-apply PDF proof: awaiting implementation and explicit owner approval.
- Final integrated review: awaiting implementation and explicit owner approval.
- Product follow-ups and evidence triggers: reconcile into [the backlog](../../../docs/backlog.md), not only this record.
