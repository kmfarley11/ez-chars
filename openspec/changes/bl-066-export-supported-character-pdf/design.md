## Context

The [form audit](../../../docs/fillable-pdf-interoperability-audit.md) identifies a three-page 2014 fillable form with substantially clearer field names than the 2024 candidate. It establishes feasibility, not processing permission or verified output fidelity. The [resource policy](../../../docs/rules-resource-policy.md) still requires separate review before a user-local processing feature. The [author vision](../../../docs/vision/author-desires.md) treats PDF as complementary portability, with JSON remaining canonical.

The current implementation has validated JSON I/O in `src/schema/importExport.ts`, local persistence in `src/lib/storage/`, shared dialogs, and PDF.js reading support in `src/lib/resources/pdfViewer.ts`. It has no PDF-writing dependency. Existing JSON export concerns all characters; this export concerns one selected 2014 character. No universal system adapter is warranted.

## Goals / Non-Goals

**Goals:** Produce an editable, honestly bounded 2014 PDF; retain readable mapped content beyond fixed capacities; keep files/data on-device and character storage untouched; prove real output before application rollout.

**Non-goals:** Those in [proposal.md](proposal.md), particularly import, retained uploads, bundled forms, multi-system mapping, new rules calculations, and full-fidelity PDF backup. Continuation pages are readable export content, not another editable character model.

## Decisions

### 1. Separate rights resolution from technical feasibility

Use one exact user-selected blank template. Do not fetch, bundle, cache, or silently substitute it. Provide an authoritative acquisition link with the supported version identified. Reverify the audit's candidate against the current official download: a stable title or changed URL does not establish identical bytes.

Before product implementation, record the exact source classification, permission basis for local filling and filled-output creation, privacy/security review, required notices, and update procedure in the resource policy/register. Centralize adopted artifact provenance in `THIRD_PARTY_NOTICES.md` and link it from the audit rather than copying metadata into every artifact. User selection and the SRD's license do not license the publisher's character-sheet design. If evidence is insufficient, stop for written permission or qualified review; neither this proposal nor proof approval waives the policy. A bounded user-local approval for this form must not authorize arbitrary document ingestion or BL-080 by implication.

The agent must obtain the repository's scoped remote-processing acknowledgment before inspecting restricted local material when provider controls are unknown. No local publisher PDF was opened to prepare this proposal. Project-owned synthetic fixtures can exercise mechanics, but cannot establish official-form fidelity or replace the real-output approval gate.

### 2. Isolate template recognition, character projection, and PDF generation

Use a small 2014-specific pipeline:

```text
local blank form → exact signature + field/type checks ─┐
validated character snapshot → mapped values + losses ├→ generate → review → download
                                                      ┘
                    no character-store write path
```

Recognize the reviewed blank bytes, then verify expected AcroForm field names/types. Reject malformed, encrypted, unknown, revised, and already-filled variants with a useful supported-template explanation. Filenames are not identity. A filled file's hash will change; future import needs its own recognition design, not this blank-template check.

Create a pure typed projection and explicit mapping table, not a reflection-based mapper or generic registry. The table records source paths, target fields, formatting, fixed capacities, checkbox mappings, and unsupported content. Baseline coverage is identity/class/background; ability scores and displayed modifiers; saves/skills/proficiency; HP/AC/initiative/speeds and other matching core statistics; currency/equipment/weapons; traits/features/background prose; and spellcasting summaries, slots, and spell listings where semantically supported by the form. Never infer a mapping from a similar label alone. Material reductions of that baseline require artifact reconciliation before proof approval.

Use stored authored values and established sheet selectors for genuinely derived display values; do not invent rules calculations, allow PDF JavaScript to recalculate authoritative values, or turn missing optional data into fabricated facts. Include all mapped collection records, not just the visible density slice, filtered matches, or pinned rows. Keep export ordering deterministic and system-owned (spell level where applicable, otherwise stable source order); UI search/priority state must not change export coverage.

### 3. Continue overflow, disclose unsupported data, block unsafe output

Measure text with the selected font and use a documented legible minimum size. When mapped prose exceeds capacity, move its entire value to app-authored continuation pages and place a short section/page reference in the original field; do not retain a duplicate or partial editable copy of that prose. For collections, fill the original rows that fit and put excess records on continuation pages, with each record's mapped content appearing once. A record too large for its row moves intact to the continuation. Repeated identity/section labels and cross-references are navigation aids, not duplicate content. Include character identity, section headings, page numbers, and preserve record boundaries and spell levels. Do not use silent clipping, summaries that discard authored content, or ever-smaller fonts as the overflow policy.

Continuation pages are deliberately plain and non-fillable; original form fields remain editable. Disclose before download that continuations are export-time snapshots: later PDF edits neither regenerate nor synchronize them. Avoiding duplicated content reduces conflicting copies but does not create a live PDF layout engine. PDF edits are not importable into the app in this change.

Report Included / Continued / Not represented using meaningful section/field labels and counts. Notes, provenance, source relationships, record IDs, and priority state are not implicitly representable: inventory their treatment explicitly rather than promising to copy everything into an appendix. Classify losses by meaning, not just storage field type: omitted non-empty player-authored notes, reference information, or meaningful game values are material and require acknowledgment. Internal record IDs, pin order, and other app-only presentation state belong in a compact standard limitations disclosure and do not alone require acknowledgment. Empty optional values are not lost content. Readable continuation is a representation difference, not an omission. JSON backup remains the recovery recommendation, without embedding it into the PDF.

Record provisional font/glyph expectations and input-size, output-page, and processing bounds in Section 1; these are planning assumptions, not measured support claims. After evaluating the writer/font strategy, measure and finalize those limits during Section 2 using the supported template and sparse/saturated fixtures. Document and test the final limits before the human proof gate. If content cannot be rendered faithfully within those bounds or the selected font cannot represent a character, fail with an actionable field-specific explanation. Do not silently substitute glyphs or discard data. Font embedding, if necessary, requires its own license/dependency review.

### 4. Evaluate a browser writer, preserve editability and appearances

Evaluate `pdf-lib`, used in the prior audit, as the bounded writer candidate. Its [form API](https://pdf-lib.js.org/docs/api/classes/pdfform) supports field appearance updates and flattening; do not flatten the original fields. Confirm actual output behavior rather than assuming API support guarantees viewer interoperability. Reuse PDF.js only where existing rendering primitives cleanly support a local generated document; do not turn the rules-resource registry into an export-preview service.

Record the projection/dependency boundary and alternatives in a lightweight ADR before adoption. Pin any adopted writer/font dependency exactly after current security/compatibility review. Lazy-load writing support on export, add no telemetry, scaffolding, onboarding files, or new test framework, and keep browser work out of the unit-test environment. Check bundle impact and existing scroll/performance gates after adoption.

### 5. Review a stable snapshot through shared UI

Recommended entry point: an `Export PDF` command in the selected character's existing action menu, not a second global backup action or a permanent sheet toolbar. Reuse the shared menu, dialog, buttons, status, and disclosure primitives after scanning current implementations. Preserve direct file-picker activation from a user gesture and keyboard/focus restoration.

The flow identifies the form and explains local handling, takes a validated character snapshot, accepts the local blank file, shows progress, then offers coverage review and download. The download must use the same generated snapshot/report the user reviewed. Changing the source selection or restarting after character changes requires fresh generation and acknowledgment. Cancel/error does not write to storage or leave a late asynchronous result eligible to download. Release object URLs and file buffers when no longer needed; do not log character content or retain it in service-worker/localStorage caches.

An in-app rendered preview is optional, not required to construct a second PDF reader. Coverage review and a real downloadable PDF are mandatory. Ordinary application operation and JSON backup remain available when export cannot proceed.

### 6. Prove the output before broad entry-point rollout

Build one focused export sandbox with sparse/saturated fixture selection and error states reachable through file selection. Use a second story only for a materially distinct state that the first cannot reasonably reach. Use no Storybook `play` functions. A controlled app proof may substitute where real file/download behavior cannot be represented faithfully in Storybook.

The named mid-apply gate reviews actual generated PDFs, editable fields after reopening, print layout, continuation legibility, omissions, and the desktop/phone workflow. Only explicit approval unlocks normal application entry points and rollout. A separate final approval covers the integrated result. [verify.md](verify.md) owns the manual instructions and evidence; screenshots or synthetic fixtures alone cannot approve the real-form output.

Automate pure projections, mapping drift, omission classification, overflow boundaries, invalid inputs, and storage non-mutation with Vitest; use existing Playwright projects for visible picker/review/cancel/download behavior. Reopen generated output to assert values, field types/editability, and continuation content, while retaining human appearance/printing checks. Use owned synthetic form fixtures in committed automation unless rights explicitly cover a publisher fixture; record any resulting real-template automation gap. Inject clocks/identifiers if output metadata requires them, normalize nondeterministic PDF metadata for assertions, and prefer semantic assertions over binary snapshots.

## Risks / Trade-offs

- **Unresolved source permission** → Section 1 stops product implementation until documented review; user-local selection is not a workaround.
- **Fixed form capacity and character encodings** → Measured continuation layout plus clear rejection for unsupported output, reviewed on a saturated character.
- **Editable fields differ across viewers** → Regenerate appearances and verify browser viewing, an independent editor, and print output; do not promise universal compatibility.
- **Mobile memory or long generation** → Lazy load, bounded input/output, observable progress/cancellation, and real-phone checks; introduce a worker only if measurements justify it.
- **Schema/template drift** → Typed projection and explicit adoption checks; re-audit relevant mapping when BL-070 changes shared data. No speculative multi-system facade.
- **User expects PDF backup/import** → Explicit partial-fidelity wording and independent JSON export; future reviewed import is recorded in the backlog.

## Migration Plan

No persisted-data migration. Introduce the isolated proof after rights clearance, then expose the approved per-character command. Rollback removes that command and writer loading without touching character data or existing JSON export. Keep this P1 proposal out of the P0 critical path; BL-082 remains next.

## Open Questions / Review Attention

The recommended product defaults are settled: export only, one user-selected 2014 form, editable original fields, plain continuation pages, and explicit omissions. No preference answer is required before reviewing the proposal.

Execution must resolve: (1) the exact permission basis and current template identity; (2) verified field coverage, glyph support, and resource limits; and (3) the actual viewer/phone compatibility evidence. If these cannot support the proposal, pause and revise it instead of quietly lowering fidelity. The human proof should especially judge whether continuation pages remain useful and whether obtaining the blank template is acceptable friction.
