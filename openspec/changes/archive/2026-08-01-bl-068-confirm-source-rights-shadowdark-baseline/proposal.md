## Why

The first-playtest roadmap now depends on exact D&D source artifacts and a useful but conservative Shadowdark reference boundary. Before resource navigation or Shadowdark sheet work begins, the repository needs source-specific evidence, explicit exposure modes, and a reviewable way to author bibliographic locators without turning a link-only document into redistributed or reconstructed rules content.

## What Changes

- Adopt and self-host the official D&D SRD 5.1 and SRD 5.2.1 artifacts as the explicit first-playtest sources, with verified provenance, attribution instructions, base-path-safe local URLs, and deliberate upgrade rules.
- Make the official local SRD 5.1 artifact the sole bundled 2014 rules PDF used by current application references.
- Define the public Shadowdark baseline as user-authored character data, authoritative acquisition links, and a first sparse locator set for character creation, equipment, and game rules containing reviewed page/name references and independently authored descriptions.
- Define which Shadowdark uses remain outside that baseline and require written permission or qualified review, including bundling, excerpting, full-text processing, official-form interoperability, and restricted brand or asset use.
- Establish an owner-authorized human/agent locator-curation workflow with remote-model disclosure when provider controls are unknown, temporary-source hygiene, and human review of the sanitized committed output.
- Confirm that Cairn or another fourth system is not added unless the conservative Shadowdark baseline leaves a concrete first-playtest evidence gap.
- Refine the existing rules-resource ADR and maintainer policy rather than creating a parallel rights doctrine.
- Keep resource discovery UI, custom PDF viewing, the Shadowdark sheet, compendium behavior, PDF adapters, and user-upload processing outside this source-baseline change.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `product-scope-planning`: Make the adopted SRD versions, conservative Shadowdark locator boundary, source-curation review, expansion gates, and deliberate source-upgrade behavior explicit.
- `developer-workflow`: Require a concise disclosure before an agent directly inspects protected local content when remote-model data controls are unknown, while allowing owner-approved work to proceed without repeated warnings.

## Impact

- **Documentation and planning:** Refines the source register, rules-resource policy, rights-classification ADR, backlog definition, and agent guidance.
- **Product behavior:** The existing 2014 SRD link resolves to the official self-hosted PDF; later BL-069 and BL-071 proposals consume the approved source boundaries.
- **Source material:** The two verified official CC BY D&D SRDs are included as static assets. No Shadowdark PDF, extracted source text, embeddings, excerpts, or temporary processing artifacts are committed or published.
- **Data and dependencies:** No character-schema, persistence, package-manifest, or runtime-dependency changes; the existing static-asset pipeline is narrowed so only publishable external documents are copied.
