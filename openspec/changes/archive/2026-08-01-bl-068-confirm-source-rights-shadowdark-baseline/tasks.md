## 1. Adopt and Verify the D&D Sources

- [x] 1.1 Re-open the official D&D SRD landing page and the exact SRD 5.1 and SRD 5.2.1 artifacts, then record review dates, canonical URLs, publication/version evidence, and the observed file hashes in the source register
- [x] 1.2 Copy each adopted artifact's attribution instruction from its legal page into the maintainer policy, preserving the required license link and publisher limits without paraphrasing the notice as the shipped attribution
- [x] 1.3 Record SRD 5.2.1 as the explicit 2024 rules source and replace any floating “current 5.2.x at handoff” language with a provenance recheck plus an explicit owner-approved upgrade decision
- [x] 1.4 Include the verified official SRD 5.1 and SRD 5.2.1 PDFs at their approved local paths as the only bundled D&D SRD artifacts
- [x] 1.5 Migrate current application and newly created 2014 SRD references to the official base-path-safe local PDF, updating user-facing wording and focused coverage
- [x] 1.6 Update `docs/ext/Readme.md`, `THIRD_PARTY_NOTICES.md`, the source register, and the rights ADR with both local files, hashes, official sources, exact attribution instructions, and modification status
- [x] 1.7 Exclude `docs/ext/local-only/` from development serving and production copying while preserving approved `docs/ext` assets, then verify the built output contains both official SRDs and no local-only source

## 2. Confirm the Shadowdark Citation Baseline

- [x] 2.1 Re-verify the official Shadowdark third-party-license FAQ and source landing pages, recording the page/name citation statement, the character-app limitation, review date, and unresolved legal/product-risk constraints without presenting the FAQ as legal advice
- [x] 2.2 Reverify the owner-reviewed 68-page quickstart against SHA-256 `25b1a35120dc1ca2ac5518add82c919daa8accfb141d5042cb5c02ce8848d7cb`, then carry forward only the approved broad topics: character creation, equipment, and game rules
- [x] 2.3 Record the three accepted candidates with cited headings “Characters,” “Gear,” and “Gameplay”; printed pages 11, 32, and 39; one-based PDF pages 11, 32, and 39; zero-based indexes 10, 31, and 38; independently authored purposes; and review status
- [x] 2.4 Audit the candidate set to remove copied or close-paraphrased rules expression, mechanics summaries, tables, examples, stat blocks, exhaustive heading sequences, keyword extraction, embeddings, and temporary source-processing artifacts
- [x] 2.5 Document the approved factual presentation: source title and publisher, authoritative acquisition link, “Source not included,” and “Unofficial; not affiliated with The Arcane Library”; reserve compatibility branding, license claims, affiliation implications, or broader wording for permission or qualified review

## 3. Reconcile the Maintainer Policy and ADR

- [x] 3.1 Update `docs/rules-resource-policy.md` so the source register, locator allowlist, page-basis convention, audit checklist, deliberate source-upgrade behavior, and expansion gates match the approved design
- [x] 3.2 Replace the policy's offline-only implication with the owner-authorized human/agent workflow: disclose unknown remote-model controls, retain temporary material outside Git, and commit only reviewed sanitized metadata
- [x] 3.3 Refine `docs/decisions/2026-07-31-classify-rules-resources-by-rights.md` with the explicit SRD 5.2.1 adoption, sparse Shadowdark locator decision, agent-assisted review boundary, and unchanged gates for broader source use; do not create a parallel ADR
- [x] 3.4 Confirm Cairn or another fourth system remains outside PRD v1 because the conservative Shadowdark baseline still supplies the required non-5e evidence; record a concrete trigger rather than an automatic fallback

## 4. Reconcile Cross-Repository Guidance

- [x] 4.1 Reconcile the `AGENTS.md` remote-model disclosure so it warns without claiming public exposure or training, accepts owner confirmation for the scoped task, and does not repeat for sanitized metadata
- [x] 4.2 Reconcile `docs/vision/PRD-v1.md`, `docs/vision/author-desires.md`, `docs/active-goals.md`, and `docs/backlog.md` with the fixed SRD 5.2.1 decision, Shadowdark citation baseline, and BL-068/BL-069/BL-071 ownership boundaries
- [x] 4.3 Verify raw or owner-supplied source files, extracted text, screenshots, transcripts, and scratch locator candidates remain ignored, uncommitted, unserved, and absent from production output; keep only reviewed bibliographic evidence in version control
- [x] 4.4 Review every new repository link and path for portability, using repo-relative paths internally, base-path-safe local asset URLs in the application, and authoritative HTTPS URLs for external evidence

## 5. Verification and Implementation Fallout

- [x] 5.1 Run `openspec validate bl-068-confirm-source-rights-shadowdark-baseline --strict`, strict validation for both affected main capabilities when synced, and `openspec validate --all --strict`
- [x] 5.2 Run `npm run verify:smoke`, focused local-asset/browser checks, a production build-output audit, and `git diff --check`; inspect the final diff for source excerpts, raw identifiers, untracked protected artifacts, contradictory classifications, and accidental claims of legal approval
- [x] 5.3 Reconcile material apply findings into `design.md` and `tasks.md`; update `proposal.md` or the delta specs only if product scope or observable requirements changed
- [x] 5.4 Record the exact downstream inputs handed to BL-069 and BL-071, including adopted local sources, approved locator fields, source-unavailable behavior, attribution instructions, and remaining expansion gates

## 6. Backlog Updates & Reconciliation

- [x] 6.1 Present the completed source, documentation, local-link, build-exclusion, verification, and material fallout scope to the human owner for post-apply review
- [x] 6.2 Obtain explicit human approval of the resulting BL-068 work before archival; agents MUST leave this task unchecked and MUST NOT self-complete the approval gate
- [x] 6.3 During the approved archive workflow, remove `BL-068` from the P0 queue and refined catalog, add a dated bounded summary to `Done Recently`, and prune that section to its 3–5 most recent entries
- [x] 6.4 During archival, remove `BL-068` from the Next Recommended Sequence, promote `BL-064` to the first position, and preserve BL-069's dependency on the source evidence produced here
- [x] 6.5 Update `docs/active-goals.md` during archival only if the completed source evidence changes the current-versus-target status summary

## Executor Recommendation

Use a high-capability implementation/research model at high reasoning. The apply work combines a bounded application/static-asset change with primary-source verification, careful rights and privacy language, exact attribution/provenance handling, owner-directed locator review, and cross-artifact reconciliation. Antigravity Pro/High or Codex Sol/High are both suitable; model complexity matters more than agent identity.
