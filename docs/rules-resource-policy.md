# Rules-Resource Policy and Source Register

- **Status:** Approved product-risk policy
- **Last reviewed:** 2026-08-01 during `BL-067` refinement

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

During planning, the owner may use a lawfully obtained local copy to draft conservative locator metadata with a local tool or agent only when source bytes remain under the owner's control. Commit only reviewed bibliographic facts and independently authored locator descriptions—never the source bytes, extracted full text, embeddings, copied tables, or generated excerpts—and remove temporary processing artifacts. Uploading the source to a third-party model or service requires its own terms, privacy, and rights review.

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
- **Adopted rules source:** SRD 5.1, official CC release
- **Authoritative sources:** [official SRD landing page](https://www.dndbeyond.com/srd) and [official SRD 5.1 PDF](https://media.dndbeyond.com/compendium-images/srd/5.1/SRD_CC_v5.1.pdf)
- **Observed artifact hash:** Official PDF SHA-256 `2504d2a0abb0a4d491a939be4f17910a2dde0312570ab8d208080225ccf0a1f0`
- **Classification:** Redistributable under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- **Approved direction:** Self-host the adopted PDF, maintain curated section/page locators, and provide contextual navigation. Any extraction or excerpting remains separately reviewed even though the license permits adaptation.
- **Current repository artifact:** `docs/ext/5e2014/SRD5.1_-_Bookmarked_Full_-_v2.pdf`, SHA-256 `7a08145159155aef03d607bab35f0b3dad87bb625d8fe5a57fae386946ba2a54`, a bookmarked third-party derivative whose provenance and attribution are recorded in `THIRD_PARTY_NOTICES.md`
- **Attribution instruction:** Preserve the exact attribution required by the adopted SRD and identify any bookmark or other modification. Keep the PDF and derivative notices separate from the MIT-licensed application code.
- **Adopted replacement:** `BL-069` will replace the bookmarked derivative with the official PDF for a shorter provenance chain, then update `THIRD_PARTY_NOTICES.md`, verify the official hash, and establish locators against the official page basis. This planning change does not replace the binary itself.

### D&D 5e 2024 — SRD 5.2.1

- **Publisher:** Wizards of the Coast LLC
- **Planning-baseline rules source:** SRD 5.2.1, the current release identified by the official SRD landing page at this policy review
- **Authoritative sources:** [official SRD landing page](https://www.dndbeyond.com/srd) and [official SRD 5.2.1 PDF](https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf)
- **Observed artifact hash:** Official PDF SHA-256 `8974902d109d6e63672d7c490bde9ccf052410503d9cfa768237154fbc5e3d87`
- **Classification:** Redistributable under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- **Approved direction:** Self-host the exact adopted PDF after artifact verification, preserve its required attribution and modification statement, and index curated sections for 2024-specific sheet contexts.
- **Version policy:** Support one explicitly adopted current SRD 5.2.x release at a time. Recheck the official landing page immediately before public handoff, adopt and pin the then-current release, and remap locators if it differs from the 5.2.1 planning baseline. Concurrent support for prior 5.2 releases is not required.
- **Unresolved constraint:** No 2024 SRD PDF is bundled today. The resource-navigation implementation must verify that the observed hash still matches the adopted artifact, copy the exact attribution from its legal page, record any project modification, and establish the shipped page map.

### Shadowdark — Quickstart and official character sheet

- **Publisher:** The Arcane Library, LLC
- **Candidate sources:** [free Shadowdark RPG Quickstart Set](https://www.thearcanelibrary.com/products/shadowdark-rpg-quickstart-set-pdf) and [official free form-fillable character sheet](https://www.thearcanelibrary.com/blogs/shadowdark-blog/shadowdark-rpg-character-sheet)
- **Current classification:** Link-only for the public playtest baseline
- **Rights evidence:** The quickstart is offered free, but no redistribution grant has been verified. The official [third-party-license FAQ](https://www.thearcanelibrary.com/blogs/shadowdark-blog/faq-on-the-shadowdark-rpg-third-party-license) permits general page/name references while stating that character-building applications are outside that license.
- **Approved planning baseline:** A system-native sheet containing user-authored Shadowdark data plus authoritative acquisition links and conservative bibliographic page/name locators. The app must not reproduce rules text, claim official status, imply that the third-party license authorizes a character builder, or bundle/ingest the quickstart or sheet under the current evidence.
- **Expansion gate:** Written permission or qualified review is required before bundling, redistributing, excerpting, full-text ingest/indexing, official-form interoperability, use of restricted branding/assets, or other behavior outside the conservative baseline. Free availability is insufficient.
- **Locator-authoring workflow:** The owner may provide a lawfully obtained local PDF to a locally controlled tool or agent solely to draft locator candidates under the user-local planning rule above. Human review must ensure the committed output stays bibliographic and contains no copied expression.
- **Scope consequence:** Shadowdark implementation is not blocked by the owner's decision not to seek permission, provided the proposal stays within the baseline. Cairn v1 remains an optional explicitly approved fourth system if it adds necessary evidence; it is not an automatic substitute.

## Attribution and Repository Hygiene

- Keep bundled third-party assets under `docs/ext/` or another clearly designated asset boundary.
- Record each included asset in `THIRD_PARTY_NOTICES.md`, including source, license, modifications, and required attribution.
- Use repo-relative paths in repository documentation and authoritative external HTTPS links for source evidence.
- Do not copy a source's legal notice from memory. Copy it exactly from the adopted artifact during implementation and verify it in review.
- Do not describe unresolved permission as licensed, approved, or legally safe.
