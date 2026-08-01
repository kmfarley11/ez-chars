# 2026-07-31 Classify rules resources by permitted use

- **Status:** Approved
- **Author:** Codex with project owner direction
- **Date:** 2026-07-31
- **Last reviewed:** 2026-08-01
- **Latest refinement:** `BL-067` established the conservative Shadowdark baseline, multi-source locator direction, and official SRD replacement policy; see the final refinement below.

## Context & Problem Statement

ez-chars wants contextual access to free rules resources and prefers stable self-hosted PDFs, but “free” describes price or access rather than permission to redistribute, transform, index, or excerpt. The first playtest spans D&D SRDs published under CC BY 4.0 and Shadowdark materials whose free availability and third-party license do not establish the same application rights.

The project needs one durable architecture and product-risk rule that supports useful references without treating every source identically or turning the first playtest into a compendium service.

## Decision Drivers

- Give users stable, nearby, system-relevant rules navigation.
- Prefer self-hosting when the project can verify that right.
- Preserve exact attribution, provenance, version, and modification status.
- Avoid public redistribution or processing based only on free availability.
- Keep the first reference capability smaller than a normalized compendium.
- Allow future user-local and private-deployment exploration without weakening the public-product boundary.

## Considered Options

### Link every source externally

This is operationally simple and conservative, but gives up stable URLs, offline proximity, and reliable page navigation even for openly licensed sources.

### Self-host every freely available source

This maximizes convenience, but wrongly treats price as permission and creates unacceptable provenance and copyright risk.

### Classify each source and combine self-hosted with link-only behavior

This adds a small source-register burden, but it allows strong experiences for verified open material while bounding uncertain sources explicitly.

## Decision Outcome

Classify every rules resource before implementation as **redistributable**, **link-only**, **user-local**, or **unavailable to the public product**. The classification controls bundling, processing, indexing, and navigation behavior.

Prefer a self-hosted, hashed artifact for redistributable PDFs when it improves stability, proximity, offline access, or page-level navigation. Preserve the adopted version, exact required attribution, license notice, and modification status. Treat the bundled resource as separately licensed material; do not represent the whole application as inheriting that content license.

For link-only sources, store only conservative bibliographic and navigation metadata: source/edition identity, acquisition links, independently authored descriptions, topics, chapter or section labels, page numbers, and other locators. Do not ingest or excerpt the full source. The catalog may register multiple free or user-owned paid sources for the same system/topic without supplying access to paid material. User-local product processing and private/table deployments require separate product, privacy, security, and rights decisions.

The first reference feature is a document-navigation index: resource metadata plus curated topics, sections, and locators. It is not a normalized compendium merely because users can search the index. Full-text ingestion, semantic search, structured rules records, arbitrary uploads, and general-purpose rules APIs require later explicit decisions.

The conservative Shadowdark public baseline may proceed without a permission request: a system-native sheet containing user-authored data plus authoritative acquisition links and general bibliographic page/name locators. Permission or qualified review remains a gate before bundling, excerpting, ingesting, transforming, official-form interoperability, restricted branding/assets, or other behavior outside that baseline. This product-risk decision does not claim that the application is an official or third-party-license-authorized character builder.

The maintainer-facing operational contract and source register live in [the rules-resource policy](../rules-resource-policy.md).

### Consequences

- Openly licensed D&D SRDs can be self-hosted with a stable, attributable provenance chain.
- Shadowdark can retain conservative user-authored and link-oriented planning without an unsupported redistribution claim.
- Every source version or replacement requires a small, explicit adoption and locator review.
- The product may initially offer different reference depth by source because rights differ.
- A later compendium or local-ingestion feature cannot be inferred from this decision.

## Refinements & Follow-Ups

### 2026-07-31: First-playtest source set

The first source register adopts SRD 5.1 for 2014 D&D and SRD 5.2.1 for 2024 D&D, both as CC BY 4.0 redistributable candidates for self-hosting. The exact 2024 artifact and the choice between the repository's bookmarked SRD 5.1 derivative and the official PDF remain implementation-time provenance checks.

The Shadowdark Quickstart and official form-fillable sheet remain link-only. The 2026-08-01 refinement below supersedes the original assumption that every Shadowdark implementation required a permission gate. A fourth CC-licensed system is not an automatic fallback; it requires an explicit scope decision based on missing evidence.

### 2026-08-01: Conservative link-only baseline and source plurality

`BL-067` refined link-only behavior from a generic restriction into a useful product boundary. A source index may record conservative bibliographic facts and page/name/chapter/topic locators for free or user-owned paid sources while linking to an authoritative acquisition location. It must not reproduce source expression, supply paid access, or turn temporary local analysis into committed source text, excerpts, or embeddings. Multiple source records may map the same system topic differently; the first implementation need not expose every source choice.

The official Shadowdark FAQ expressly distinguishes general page/name references from broader app and content rights. The roadmap therefore no longer requires a permission request before the user-authored sheet and conservative locator baseline. The expansion gate above remains in force for materially broader source or brand use. The maintainer policy remains a conservative product-risk rule, not legal advice.

For D&D 2014, the owner selected the official SRD 5.1 PDF to replace the repository's bookmarked derivative during `BL-069`; changing the binary, notices, hash, and locators belongs to that implementation slice. For D&D 2024, SRD 5.2.1 is the planning baseline, but the project will recheck and pin the then-current official 5.2.x release before public handoff rather than support several releases concurrently.
