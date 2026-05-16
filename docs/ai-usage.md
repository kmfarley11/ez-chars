# AI Usage Guide

This guide helps choose an AI model, reasoning level, and prompt shape for this repo without spending more tokens or compute than the task deserves. Use it with [../AGENTS.md](../AGENTS.md), [current-mvp.md](current-mvp.md), and [mvp-backlog.md](mvp-backlog.md).

Model names reflect the currently available working set. If a model is renamed later, pick the closest current equivalent by size, coding strength, and reasoning depth.

## Default Model Choices

Use the smallest model that can safely handle the scope.

| Task type                                                                                                              | Suggested model             | Reasoning      | Notes                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------- | --------------------------- | -------------- | ----------------------------------------------------------------------------------------------------- |
| Commit messages, staged diff summaries, tiny docs edits, quick backlog wording                                         | `gpt-5.4-mini` or `gpt-5.2` | low            | Best for cheap read/edit tasks where the context is already narrow.                                   |
| Normal backlog slice implementation with clear local patterns                                                          | `gpt-5.3-codex`             | medium         | Good default for code edits, tests, and repo-local execution.                                         |
| Svelte UI behavior, schema/storage edges, validation bugs, or multi-file feature slices                                | `gpt-5.4`                   | medium or high | Use when the model must reason across components, data contracts, and tests.                          |
| Architecture choices, broad refactor direction, performance diagnosis, tricky state management, or data-migration risk | `gpt-5.5`                   | high           | Use for planning and hard debugging where a bad first pass would waste more time than the model cost. |
| Stuck investigations after repeated failed attempts, ambiguous performance issues, or risky cross-cutting refactors    | `gpt-5.5`                   | xhigh          | Reserve for rare cases. Ask for a plan or diagnosis first before letting it edit broadly.             |

Avoid using the strongest model for routine follow-ups such as "update the docs", "craft a commit message", or "run verification and summarize". Those are usually low-reasoning tasks once the relevant files are known.

## Reasoning Level Guidance

- low: use for narrow summaries, commit messages, mechanical docs changes, simple command output interpretation, and small copy edits.
- medium: use for the normal one-slice backlog workflow when the slice has clear boundaries and existing patterns to follow.
- high: use for refactors, shared-interface work, storage/schema changes, debugging, test architecture, accessibility behavior, and performance-sensitive UI changes.
- xhigh: use only when the task is both ambiguous and expensive to redo, such as diagnosing scroll jank after simpler passes failed or designing a broad API that many later slices will depend on.

Higher reasoning is not a replacement for smaller scope. Prefer one narrow slice on a medium model over one oversized prompt on a high-reasoning model.

## Prompt Shape By Cost Tier

The full backlog prompt in [mvp-backlog.md](mvp-backlog.md) remains the safest default for implementation slices. For cheaper work, trim the prompt only when the task is narrow and the relevant context is obvious.

### Tiny Docs Or Commit Message

Use for copy edits, commit messages, and status summaries.

```text
Use AGENTS.md and docs/mvp-backlog.md for context.
Task: <specific docs-only or summary task>.
Do not edit source code unless explicitly necessary.
Run docs-appropriate verification if you edit files.
Summarize the change briefly.
```

Recommended model: `gpt-5.4-mini` or `gpt-5.2`, low reasoning.

### Read-Only Analysis

Use when deciding what to tackle next or reviewing whether backlog items overlap.

```text
Use AGENTS.md, docs/current-mvp.md, and docs/mvp-backlog.md as source of truth.
Read only unless I explicitly ask for edits.
Analyze <specific question>.
Call out conflicts, dependencies, and recommended next steps.
Keep the answer concise and cite the relevant docs/files.
```

Recommended model: `gpt-5.4-mini` for small doc analysis, `gpt-5.3-codex` or `gpt-5.4` for codebase inventory, low to medium reasoning.

### Standard Backlog Slice

Use the full prompt pattern from [mvp-backlog.md](mvp-backlog.md). This is the normal implementation path.

Recommended model: `gpt-5.3-codex`, medium reasoning. Upgrade to `gpt-5.4` high reasoning when the slice touches shared UI contracts, schema/storage boundaries, or hard-to-manually-check behavior.

### Refactor Or Shared-Interface Slice

Use the standard backlog slice prompt, and keep these lines:

```text
Use the parent item scope, execution guidance, dependency notes, and definition of done as design constraints, but implement only the requested numbered slice.
For refactor or shared-interface work, inventory existing call sites first, describe the intended common interface or migration shape before broad edits, and preserve user-visible behavior unless the slice explicitly changes it.
```

Recommended model: `gpt-5.4` high reasoning for most cases. Use `gpt-5.5` high reasoning for high-leverage API decisions such as `p1-035` slice 2 if you want the model to think harder before editing.

### Performance Investigation

Use for `p1-025` or any scroll/render regression.

```text
Use AGENTS.md, docs/current-mvp.md, docs/mvp-backlog.md, and docs/verification.md as source of truth.
Focus on <performance item/slice>.
Start with measurement and hypotheses before edits.
Avoid broad visual/layout changes unless profiling points there.
Preserve the p0-040 findings and document any new findings in the backlog.
Run relevant local verification and explain manual scroll checks.
```

Recommended model: `gpt-5.5` high reasoning for diagnosis. Drop to `gpt-5.3-codex` medium reasoning for a tightly specified implementation after the cause is known.

## Prompt Trimming Rules

- Keep source-of-truth docs in the prompt for implementation work.
- Keep the exact backlog id and slice number for medium or larger items.
- Keep the "do not expand scope" line for implementation tasks.
- Keep the verification line, but let [verification.md](verification.md) decide the exact commands.
- Keep specialized reference docs only when the item says they apply; do not paste extra docs into every prompt.
- For docs-only changes, explicitly say "Do not edit source code" to save exploration time.
- For read-only analysis, explicitly say "Read only" so the model does not spend effort preparing patches.
- Do not ask for full check/lint/build on every tiny docs edit; `npm run lint` is usually enough when Markdown formatting is the only risk.

## When To Upgrade Mid-Task

Start cheaper and upgrade only when one of these happens:

- the model cannot form a coherent migration shape after reading the relevant files
- a change crosses schema, storage, UI, and tests at the same time
- the task involves possible data loss or persisted-data migration
- performance findings are contradictory or not reproducible
- manual verification reveals a behavioral regression after a seemingly correct implementation

When upgrading, keep the prompt focused. Provide the latest findings, changed files, failing command output, and the exact question. Do not restart with the entire conversation unless the model needs it.
