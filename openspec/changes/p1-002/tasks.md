## 1. Tooling Installation

- [ ] 1.1 Install `@fission-ai/openspec` pinned to `1.6.0` as devDependency in package.json and run npm install
- [ ] 1.2 Verify that the local `npx openspec` command executes successfully

## 2. Guideline Updates

- [ ] 2.1 Update AGENTS.md to remove transitional disclaimer, establish OpenSpec as adopted, and integrate Change-Classification Thresholds and ADR triggers
- [ ] 2.2 Update README.md to add the human-driven OpenSpec workflow cycle under "Workflow"

## 3. Decision & Backlog Updates

- [ ] 3.1 Update docs/spec-workflow-decision.md with Approved status and the final evaluation Outcome section
- [ ] 3.2 Update docs/mvp-backlog.md to mark p1-002 as complete with the documented outcome and update AI prompting guidelines

## 4. Verification & Archive

- [ ] 4.1 Run local quality gates (test, lint, check, build) to verify everything passes
- [ ] 4.2 Run openspec validate and archive the change to merge specs and clean up the change folder
