# 2026-10-10 — Bound development dependency security overrides

- **Status:** Approved dependency maintenance and narrowly scoped temporary security exception; owner approval recorded 2026-10-10.
- **Author:** Codex
- **Date:** 2026-10-10
- **Last reviewed:** 2026-10-10
- **Latest refinement:** Owner accepted the BL-082 advisory exception on 2026-10-10 under the conditions below.

## Context & Problem Statement

BL-082's comprehensive verification exposed existing development dependency advisories. The owner authorized maintenance after approving the integrated reader. Available fixes must not force unrelated tool downgrades or obscure the remaining audit failure.

## Decision Drivers

Keep the current toolchain, minimize lockfile churn, verify both consumers of the CSS selector parser, and preserve an honest full-audit gate.

## Considered Options

- Apply bounded patched transitive versions: small scope, but requires testing typography against a newer parser major.
- Run forced audit remediation: proposes incompatible OpenSpec downgrades and does not constitute a reviewed toolchain migration.
- Suppress development advisories: hides build/deployment-tool exposure and is not authorized.

## Decision Outcome

Pin the existing brace-expansion override to **5.0.12**, update source-map-js to **1.2.2** within its existing range, and override postcss-selector-parser to **7.1.6**. The selector override covers both typography (which pins 6.0.10) and Svelte's ESLint parser (which accepts 7.x); it removes the vulnerable nested parser copy. No application dependency or public behavior changes.

The installed selector-parser changelog identifies safe insertion during iteration as the 7.0 breaking change. Typography's inspected selector utility uses parsing, node enumeration/removal, and selector construction rather than relying on that unsafe insertion behavior. This is compatibility rationale, not a substitute for lint, production/Storybook builds, and full browser/performance checks. Results belong in the [change verification record](../../openspec/changes/archive/2026-10-10-bl-082-refine-mobile-rules-reader/verify.md).

The remaining [braces stack-exhaustion advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) has no published patched release as rechecked on 2026-10-10. OpenSpec and gh-pages reach it through fast-glob/micromatch. Keep the full audit failing; a clean production-only audit does not establish build-tool safety. Do not process untrusted glob patterns through these tools as a substitute for remediation, and do not imply that this precaution is a complete mitigation.

## Refinements & Follow-Ups

BL-072 in [the backlog](../backlog.md#harden-the-three-system-external-playtest-matrix) owns the remaining advisory and accepted exception. Recheck when braces or its consuming tools publish a reviewed replacement; any interim exception requires an explicit owner risk decision. Reassess/remove the selector override when both consumers resolve patched supported versions without it. Overrides must not become silent permanent version ceilings.

### 2026-10-10 — Advisory reachability and proposed temporary exception

**Status: approved by the owner on 2026-10-10 (“I do approve”), in direct response to the specific exception request.** The [advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) describes stack exhaustion from deeply nested brace patterns, not an established data-exfiltration or code-execution flaw. Registry rechecks still show braces 3.0.3 as latest, no patched release, OpenSpec 1.14.1 still depending on fast-glob, and gh-pages 6.3.0 still depending on globby. The installed OpenSpec remains deliberately pinned at 1.6.0. Upgrading it solely for this advisory would not remove the reported chain.

Installed-source inspection establishes the following bounded exposure:

- OpenSpec's `dist/core/artifact-graph/outputs.js` supplies schema `generates` patterns to fast-glob. `openspec schema which spec-driven --json` resolves the package schema with no overrides; its only glob is `specs/**/*.md`. Other artifact outputs are literal paths. Project/user schema overrides can change this boundary and require review before use.
- `gh-pages/lib/index.js` supplies `options.src` and `options.remove` to globby. The repository deploy script supplies neither, leaving the fixed defaults `**/*` and `.`. Build-file contents are not passed as patterns at these call sites. No deployment was executed during assessment.
- fast-glob's pattern-expansion path calls micromatch's braces helper, which returns immediately for patterns without braces. The inspected default patterns contain no braces. This is source-level reachability evidence, not a comprehensive exploit test or a guarantee for arbitrary custom patterns.
- The application uses a static adapter; source inspection found no application import of these tooling packages and no path from character imports, annotations, PDF contents, or Find queries into these glob call sites. `npm audit --omit=dev` is clean. These observations support a limited local tooling risk assessment; the development dependency classification alone does not establish safety.

**Recommendation:** permit BL-082 closure under a temporary exception for **GHSA-vfj7-8cjw-p6xm only**, contingent on explicit owner acceptance of possible developer/deployment process failure if the input boundary changes or this assessment misses a route. Keep the full audit and `verify:all` unchanged and visibly failing; closure would be recorded as an accepted exception, never a clean audit. Do not use forced historical tool downgrades, an unreviewed fork, blanket advisory suppression, or a hand-patched dependency solely to obtain a green report.

Accepted conditions:

- Use reviewed, locked tooling with the current fixed deployment patterns and package workflow schema. Review changed CLI glob arguments, custom schemas, scripts, and dependency sources before running them; do not feed untrusted patterns to these tools. These are operational constraints, not enforced security controls.
- BL-072 owns rechecking the advisory and supported remediation. Reassess **by 2026-11-09 or before the external playtest, whichever comes first**; the exception must be renewed explicitly if still needed, not silently extended. No automatic monitoring is implied.
- Reassess sooner when a patched release appears, the consuming toolchain/input boundary changes, an exploit is observed, or another advisory appears. A fix requires normal dependency gates. This exception cannot cover other vulnerabilities, publicly exposed tooling, or newly introduced untrusted-pattern processing.

The owner approval permits task 5.2 closure and BL-082 archival with an explicit exception, not a passing full audit. It accepts the recommendation and conditions above without authorizing audit suppression. The historical recommendation is retained as the rationale; no other advisory or future renewal is preapproved.
