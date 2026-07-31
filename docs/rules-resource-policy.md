# Rules-Resource Policy and Source Register

- **Status:** Approved product-risk policy
- **Last reviewed:** 2026-07-31

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

Use this classification when a source is free to access but redistribution, transformation, or indexing permission is absent or unclear.

Permitted planning baseline:

- link to an authoritative public location;
- store bibliographic facts and conservative locators such as a title, topic, chapter label, page number, anchor, or URL;
- describe the source without reproducing protected content.

Do not bundle the document, ingest its full text, create derived excerpts, or assume a free price grants processing permission.

### User-local

This future classification covers material a user lawfully possesses and selects on their own device. It requires a separate product, privacy, security, storage, and legal review before implementation. It is not a shortcut for the public project to receive, retain, or process arbitrary uploads.

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

Any source update is a deliberate adoption event. Maintainers verify rights again, preserve the old version only when the compatibility need and rights justify it, update hashes and notices, and rerun locator checks. A changing publisher URL never authorizes an unverified mirror.

## First-Playtest Reference Contract

The first playtest requires a document-navigation index, not a normalized rules compendium. The app may search registered resource titles and curated section metadata, then navigate to a self-hosted PDF page, an authoritative web anchor, or a conservative external locator. Supported sheet editors expose relevant locators contextually.

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
- **Unresolved maintenance choice:** Before the playtest resource slice, decide whether to retain the bookmarked derivative or replace it with the official PDF for a shorter provenance chain; record a hash and page-locator basis for the chosen artifact.

### D&D 5e 2024 — SRD 5.2.1

- **Publisher:** Wizards of the Coast LLC
- **Project-adopted rules source:** SRD 5.2.1, the current release identified by the official SRD landing page at this policy review
- **Authoritative sources:** [official SRD landing page](https://www.dndbeyond.com/srd) and [official SRD 5.2.1 PDF](https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf)
- **Observed artifact hash:** Official PDF SHA-256 `8974902d109d6e63672d7c490bde9ccf052410503d9cfa768237154fbc5e3d87`
- **Classification:** Redistributable under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- **Approved direction:** Self-host the exact adopted PDF after artifact verification, preserve its required attribution and modification statement, and index curated sections for 2024-specific sheet contexts.
- **Version policy:** Support one explicitly adopted current SRD 5.2 release at a time. A later upstream release requires a recorded adoption decision and locator review; this PRD does not require concurrent support for prior 5.2 releases.
- **Unresolved constraint:** No 2024 SRD PDF is bundled today. The resource-navigation implementation must verify that the observed hash still matches the adopted artifact, copy the exact attribution from its legal page, record any project modification, and establish the shipped page map.

### Shadowdark — Quickstart and official character sheet

- **Publisher:** The Arcane Library, LLC
- **Candidate sources:** [free Shadowdark RPG Quickstart Set](https://www.thearcanelibrary.com/products/shadowdark-rpg-quickstart-set-pdf) and [official free form-fillable character sheet](https://www.thearcanelibrary.com/blogs/shadowdark-blog/shadowdark-rpg-character-sheet)
- **Current classification:** Link-only pending written permission or qualified legal review for the exact public application behavior
- **Rights evidence:** The quickstart is offered free, but no redistribution grant has been verified. The official [third-party-license FAQ](https://www.thearcanelibrary.com/blogs/shadowdark-blog/faq-on-the-shadowdark-rpg-third-party-license) permits general page/name references while stating that character-building applications are outside that license.
- **Approved planning baseline:** User-authored Shadowdark data plus conservative bibliographic and external-link locators. Do not bundle or ingest the quickstart or sheet in the repository under the current evidence.
- **Blocking gate:** A Shadowdark implementation proposal must cite written permission or qualified review defining the allowed sheet behavior, form interoperability, link/index granularity, self-hosting, and any attribution. Free availability is insufficient.
- **If unresolved:** Keep Shadowdark in the desired playtest target, record the blocked source behaviors, and explicitly decide playtest timing. Consider a fourth CC-licensed system only if it adds necessary non-5e architecture or resource evidence; do not silently remove or replace Shadowdark.

## Attribution and Repository Hygiene

- Keep bundled third-party assets under `docs/ext/` or another clearly designated asset boundary.
- Record each included asset in `THIRD_PARTY_NOTICES.md`, including source, license, modifications, and required attribution.
- Use repo-relative paths in repository documentation and authoritative external HTTPS links for source evidence.
- Do not copy a source's legal notice from memory. Copy it exactly from the adopted artifact during implementation and verify it in review.
- Do not describe unresolved permission as licensed, approved, or legally safe.
