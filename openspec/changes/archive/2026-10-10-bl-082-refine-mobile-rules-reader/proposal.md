## Why

Phone users need dependable rules lookup without losing their character or an unfinished note. The current reader buries Find beneath a scrolling outline, devotes scarce space to multiple control regions, and produces page errors and failed Find across Safari, Firefox, and Chrome on the owner's iPhone despite visible PDF content; the owner reports all three desktop browsers work.

## Non-Goals

- Replacing the PDF engine, adding a rules compendium or cross-document text index, or highlighting search matches in PDF content.
- User-local PDF import, PDF export, source-rights changes, or new curated rules content.
- Redesigning the desktop sheet workspace, moving the persistent Rules tab, or introducing saved layout preferences.
- Scroll-triggered auto-hide, gesture-only controls, or generic multi-system provider abstractions.
- Declaring old phone defects fixed without fresh evidence, or reopening already-approved fixes without a regression.

## What Changes

- Investigate and resolve the reported phone page/text failure within a documented browser support boundary. Make failures after document loading as recoverable as initialization failures, with understandable status and a direct browser fallback.
- Require working in-app reading and Find on the owner's reported phone and current stable iOS/Safari and Android/Chrome. Preserve older-device compatibility where practical, with explicit tested limits rather than universal support claims. Fallback alone does not resolve a required-platform defect.
- Ensure a failed search stays visibly failed until retry: late progress updates must not restore a misleading searching state or contaminate a subsequent search.
- Provide a compact persistent reader header with visibly labeled Find and Outline actions, current page access, and a clear return or dismissal action. Put less frequent actions behind a discoverable secondary control.
- On constrained readers, let Find, Outline, and page tools temporarily use the document's reading area instead of compressing it beneath a second scroll pane. Keep document position, search state, and the return path intact.
- Restore the document at the selected destination after a Find or outline jump. Keep continuous page scrolling and the desktop side-by-side, resizable reader.
- Highlight matching text in Find result previews and let users collapse results without losing their query or search status. Keep expanded-reader page controls above the document, separate from the scrolling outline; compact readers retain their dedicated page-tools view. Highlighting within PDF pages remains a non-goal.
- Fit the reader to its available space in both sheet and annotation contexts, including the phone keyboard and landscape orientation. Prevent interaction with an obscured sheet while a full-screen reference is active.
- Reuse shared control and scroll-affordance patterns, preserve annotation drafts and invocation focus, and regression-check the previously fixed closed Rules-tab containment.
- Require a representative physical-phone proof before normal application rollout, followed by a separate final integrated review.

## Capabilities

### New Capabilities

None. This refines the existing reference-navigation capability.

### Modified Capabilities

- `contextual-reference-navigation`: Compact reader tool discovery and transitions, responsive sheet/dialog presentation, accessible scroll/focus behavior, and recovery from page/text failures after loading.

## Impact

The shared reader, its sheet and annotation hosts, PDF compatibility boundary, browser tests, and viewer documentation are affected. No character schema or persistence changes are intended. Compatibility work may change the adopted PDF build or require a reviewed dependency adjustment; it does not preapprove a package upgrade or replacement.

BL-082 remains the leading P0 before BL-070 expands the system surface. This supports the mobile-first, runtime-first author vision. BL-072 retains final cross-system hardening; BL-066 remains an independent P1 proposal.
