# Rules-Resource Policy and Source Register

- **Status:** Approved product-risk policy
- **Last reviewed:** 2026-08-01 during `BL-068` source verification

This maintainer document governs how ez-chars plans, bundles, processes, indexes, and links tabletop rules resources. It is a product-risk and provenance policy, not legal advice. Unclear or high-impact cases require written permission or qualified legal review.

## Classification Before Use

Every source must be registered before implementation and assigned exactly one public-product classification.

### Redistributable

Use this classification only when an authoritative license or direct permission covers the proposed copying and processing.

Required evidence:

- authoritative source and exact adopted version;
- license or written permission, including its scope;
- attribution and notice text or an authoritative location from which the exact required text will be copied;
- modification status, including bookmarks, compression, extracted metadata, or other transformations;
- a maintainer decision about bundling, indexing, excerpting, and update cadence.

The project prefers a self-hosted copy when this classification is verified and self-hosting improves URL stability, proximity, offline use, or page navigation. The bundled work remains separately identified and licensed; its license does not automatically become the application's source-code license.

### Link-only

Use this classification when redistribution, transformation, or full-text indexing permission is absent or unclear. The source may be free or may require the user to own or purchase it.

Permitted planning baseline:

- link to an authoritative public acquisition or information location;
- store conservative bibliographic facts and locators such as publisher, title, edition/version, ISBN or product identifier, topic, chapter or section label, page number, anchor, and URL;
- store a short, independently authored description and an explicit notice when the source is not included and must be obtained or owned by the user;
- register multiple locator sets for the same system or topic when a free quickstart, current SRD, prior book, or paid core book places the material differently.

Do not bundle the document, ingest its full text into the application, reproduce source text, art, tables, stat blocks, or substantial table-of-contents expression, create derived excerpts, or imply that the app grants access to paid material. A free price, user purchase, or locally available copy does not by itself grant public redistribution or hosted-processing rights.

### User-local

This future classification covers material a user lawfully possesses and selects on their own device. It requires a separate product, privacy, security, storage, and legal review before product implementation. It is not a shortcut for the public project to receive, retain, or process arbitrary uploads.

During maintainer planning, the owner may direct a human or coding agent to inspect a lawfully obtained local copy. Before direct inspection, an agent that cannot verify the client or provider's transmission, retention, or training controls must disclose that selected content or tool output may be transmitted to the remote service and obtain the owner's confirmation for that scoped task. Confirmation permits the review to continue; it neither makes the material public nor authorizes a future product-upload workflow.

Keep source bytes, extracted text, screenshots, transcripts, and scratch candidates ignored and uncommitted. Commit only human-reviewed bibliographic facts and independently authored locator descriptions—never the source bytes, extracted full text, embeddings, copied tables, or generated excerpts—and remove temporary processing artifacts. Sanitized source identity, page/name citations, project-owned topics, and independently authored descriptions may be processed later without repeating the disclosure.

### Unavailable to the public product

Use this classification when the project lacks the rights required for the proposed behavior or the risk cannot be bounded. The public application must neither host nor process the material. Paid access, donations, patron status, or a private deployment do not themselves change this classification.

## Source-Registration Checklist

For each adopted resource, record:

1. product/system and user-facing title;
2. publisher or rights holder;
3. exact version, publication/update date when known, and a file hash for any bundled copy;
4. authoritative landing page and direct artifact URL when stable;
5. classification and supporting license/permission URL or correspondence location;
6. approved modes: self-host, external link, bibliographic locator, section index, full-text index, excerpt, or transformation;
7. exact attribution/notice instruction and modification statement;
8. known page-number basis, anchor behavior, and URL stability risks;
9. reviewer, review date, and unresolved constraints;
10. replacement/update procedure, including whether locators require remapping.
11. relationship to other registered sources for the same system/topic and whether the user must choose, obtain, or own that source.

Any source update is a deliberate adoption event. Maintainers verify rights again, preserve the old version only when the compatibility need and rights justify it, update hashes and notices, and rerun locator checks. A changing publisher URL never authorizes an unverified mirror.

## First-Playtest Reference Contract

The first playtest requires a document-navigation index, not a normalized rules compendium. The app may search registered resource titles and curated section metadata, then navigate to a self-hosted PDF page, an authoritative web anchor, or a conservative external locator. Supported sheet editors expose relevant locators contextually. The model must not assume one canonical document per system: multiple source records may supply different locators for the same topic, although the first proof may configure only one free source.

This index may contain source IDs, system/rules versions, titles, topics, section labels, page numbers, anchors, URLs, and short maintainer-authored descriptions. It does not require source-text extraction, normalized spell/equipment/rules records, semantic search, or a general-purpose API.

Arbitrary ingestion, user uploads, OCR, scan/image recognition, and automated excerpt generation remain outside the first-playtest contract. Licensed full-text indexing may be considered later as a separately specified use because permission to redistribute a work does not automatically settle product, performance, attribution, or update design.

## Adopted and Candidate Source Register

### D&D 5e 2014 — SRD 5.1

- **Publisher:** Wizards of the Coast LLC
- **Adopted rules source:** SRD 5.1, official English CC release published under CC BY 4.0 in January 2023; canonical artifact reverified 2026-08-01
- **Artifact inventory:** [Third-Party Notices](../THIRD_PARTY_NOTICES.md#included-assets) is authoritative for the local file, official download, checksum, review date, page count, modification status, license, and attribution.
- **Classification:** Redistributable under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- **Approved direction:** Self-host the adopted PDF, maintain curated section/page locators, and provide contextual navigation. Any extraction or excerpting remains separately reviewed even though the license permits adaptation.
- **Page basis:** Printed labels and one-based PDF pages align in the reviewed artifact; a zero-based PDF index is `page - 1`. Any future modified copy must reverify this relationship before reusing locators.
- **Modification policy:** Bookmarks, compression, re-pagination, extraction, or other future changes must be identified and trigger inventory, notice, and locator review.
- **Required attribution:** Copy the following statement exactly into any work that uses the adopted SRD content:

  > This work includes material taken from the System Reference Document 5.1 (“SRD 5.1”) by Wizards of the Coast LLC and available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode.

  The artifact instructs users not to add other Wizards attribution, while permitting “compatible with fifth edition” or “5E compatible.” Keep this attribution and any modification notice separate from the MIT-licensed application code.

- **Adopted implementation:** `BL-068` self-hosts the official PDF and migrates current application references to it. `BL-069` establishes curated official-page locators and resource navigation.

### D&D 5e 2024 — SRD 5.2.1

- **Publisher:** Wizards of the Coast LLC
- **Adopted rules source:** English SRD 5.2.1, published 2025-05-01 and explicitly adopted for the 2024 D&D playtest line; canonical artifact reverified 2026-08-01
- **Artifact inventory:** [Third-Party Notices](../THIRD_PARTY_NOTICES.md#included-assets) is authoritative for the local file, official download, checksum, review date, page count, modification status, license, and attribution. The official landing page was last updated 2026-03-02 at review time.
- **Classification:** Redistributable under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- **Approved direction:** Self-host the exact adopted PDF after artifact verification, preserve its required attribution and modification statement, and index curated sections for 2024-specific sheet contexts.
- **Page basis:** Printed labels and one-based PDF pages align in the reviewed artifact; a zero-based PDF index is `page - 1`. Any future modified copy must reverify this relationship before reusing locators.
- **Modification policy:** Any future transformation must be identified and trigger inventory, notice, and locator review.
- **Required attribution:** Copy the following statement exactly into any work that uses the adopted SRD content:

  > This work includes material from the System Reference Document 5.2.1 (“SRD 5.2.1”) by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.

  The artifact instructs users not to add other attribution to Wizards, its parent, or affiliates, while permitting “compatible with fifth edition” or “5E compatible.” Keep this attribution and any modification notice separate from the MIT-licensed application code.

- **Version policy:** Support SRD 5.2.1 as the one adopted 2024 rules release. Recheck authoritative provenance and the artifact hash before public handoff, but do not silently upgrade when a later release appears. A version change requires explicit owner approval after reviewing rules identity, schema assumptions, fixtures, attribution, locators, and page remapping. Concurrent support for other 5.2 releases is not required.
- **Unresolved constraint:** No 2024 sheet exposes contextual locators today. `BL-069` must establish the source registry and page map before reference navigation relies on this bundled artifact, and `BL-070` must consume that adopted source rather than invent another version.

### Shadowdark — Quickstart and official character sheet

- **Publisher:** The Arcane Library, LLC
- **Candidate sources:** [free Shadowdark RPG Quickstart Set](https://www.thearcanelibrary.com/products/shadowdark-rpg-quickstart-set-pdf) and [official free form-fillable character sheet](https://www.thearcanelibrary.com/blogs/shadowdark-blog/shadowdark-rpg-character-sheet)
- **Reviewed locator source:** _Shadowdark RPG Player Quickstart Guide_, 68 PDF pages, SHA-256 `25b1a35120dc1ca2ac5518add82c919daa8accfb141d5042cb5c02ce8848d7cb`; owner-supplied local artifact reviewed 2026-08-01 and intentionally uncommitted
- **Current classification:** Link-only for the public playtest baseline
- **Rights evidence:** The quickstart is offered free, but no redistribution grant has been verified. The official [third-party-license FAQ](https://www.thearcanelibrary.com/blogs/shadowdark-blog/faq-on-the-shadowdark-rpg-third-party-license), reverified 2026-08-01, permits general page/name references while stating that character-building applications are outside that license and that the FAQ is not legal advice or an amendment to it.
- **Approved planning baseline:** A system-native sheet containing user-authored Shadowdark data plus authoritative acquisition links and conservative bibliographic page/name locators. The app must not reproduce rules text, claim official status, imply that the third-party license authorizes a character builder, or bundle/ingest the quickstart or sheet under the current evidence.
- **Approved public presentation:** Identify the factual title and The Arcane Library as publisher/source, link to the authoritative acquisition page, state “Source not included” and “Unofficial; not affiliated with The Arcane Library,” and avoid compatibility logos, third-party-license claims, restricted trade dress, or other affiliation implications.
- **Page basis:** Printed labels and one-based PDF pages align in the reviewed quickstart; zero-based indexes are one less than the displayed page.
- **Approved first locator set:**

  | Project topic      | Cited source heading | Printed/PDF page | Zero-based index | Independently authored purpose              |
  | ------------------ | -------------------- | ---------------: | ---------------: | ------------------------------------------- |
  | Character creation | Characters           |               11 |               10 | Start creating or reviewing a character.    |
  | Equipment          | Gear                 |               32 |               31 | Find the general equipment listing.         |
  | Game rules         | Gameplay             |               39 |               38 | Begin reviewing the rules used during play. |

  These three broad citations are the complete initial set. Narrower headings or additional topics require a concrete contextual-navigation need and the same review; do not mirror the full contents hierarchy.

- **Expansion gate:** Written permission or qualified review is required before bundling, redistributing, excerpting, full-text ingest/indexing, official-form interoperability, use of restricted branding/assets, or other behavior outside the conservative baseline. Free availability is insufficient.
- **Locator-authoring audit:** Human review verifies the exact source hash, page basis, destination, allowed fields, independently authored wording, review date, unresolved constraints, and source-drift procedure. Reject copied or close-paraphrased prose, mechanics summaries, tables, examples, stat blocks, exhaustive heading sequences, keyword indexes, embeddings, and temporary processing artifacts.
- **Scope consequence:** Shadowdark implementation is not blocked by the owner's decision not to seek permission, provided the proposal stays within the baseline. Qualified review becomes a gate if final presentation broadens that factual citation-only use. Cairn v1 or another fourth system requires an explicit PRD amendment after the owner documents a first-playtest architecture or resource hypothesis that the approved Shadowdark baseline cannot test; it is not an automatic substitute.

## Downstream Handoff

`BL-069` owns the durable source/locator representation and reference UX. It receives:

- the two adopted local D&D artifacts, hashes, aligned page bases, exact attribution statements, base-path-safe locations, and modification-review requirements above;
- the Shadowdark link-only source identity, three approved locator records, allowed bibliographic fields, factual public notice, and expansion gates; and
- a fail-closed drift rule: if a source URL, artifact hash, or locator cannot be verified, mark the source unavailable or the locator stale, keep character editing usable, explain that the source is not included or currently unavailable, and never silently mirror, substitute, or remap it.

`BL-071` owns the system-native Shadowdark sheet. It may store user-authored character data and expose the approved acquisition link and three citations. Before shipping, it must recheck the actual title, notice, branding, and locator presentation against this baseline; it may not infer source ingestion, rules summaries, official-form interoperability, or third-party-license authorization.

## Attribution and Repository Hygiene

- Keep bundled third-party assets under `docs/ext/` or another clearly designated asset boundary.
- Record each included asset in `THIRD_PARTY_NOTICES.md`, including source, license, modifications, and required attribution.
- Use repo-relative paths in repository documentation and authoritative external HTTPS links for source evidence.
- Do not copy a source's legal notice from memory. Copy it exactly from the adopted artifact during implementation and verify it in review.
- Do not describe unresolved permission as licensed, approved, or legally safe.
