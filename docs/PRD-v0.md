# ez-chars — Product Requirements Document (PRD)

This document was derived from repo contents & local note contents via LLMs as of 2/6/2026. The intent of the document is to succinctly distill the design principles established and desired so far into 1 document for AI ingestion. There may be future versions of this document to help guide AI at varying points in the attempted product.

## 1. Overview

**ez-chars** is a free, lightweight, mobile-friendly web application for creating, viewing, and managing tabletop RPG character sheets.

The goal is to provide a **middle ground** between:

- static PDFs (too manual, poor mobile UX)
- full VTTs (too heavy, costly, opinionated)

ez-chars focuses on **structured character data**, **fast reference during play**, and **flexible annotations**, without attempting to run the game or enforce rules.

---

## 2. Product Intent

> Create a free and simple tool for players to fill, view, and save character data in a way that can be officially guided and supported.

### Why This Exists

- Many players want **digital character sheets**
- Mobile usage is common at the table
- Players do _not_ universally want automation or hand-holding
- SRDs and open rules exist, but tooling is fragmented or expensive

### Core Philosophy

- Support multiple game systems I actually run
  - A5E
  - Shadowdark
  - Other SRD / Black Flag systems
- Favor **clarity and flexibility** over completeness
- Respect that **players often want to write things themselves**

---

## 3. Goals & Non-Goals

### Goals

- Enable fast creation and access to character sheets
- Clearly distinguish **runtime-critical information** from **organizational data**
- Work equally well on **mobile and desktop**
- Require **no payment, minimal setup, and no account**
- Allow data to be owned, exported, and backed up by the user

### Non-Goals (v1)

- Acting as a VTT (no maps, initiative trackers, chat, etc.)
- Enforcing rule correctness or completeness
- Hosting copyrighted or premium rules content
- Deep automation or dice rolling engines

---

## 4. Design Principles

### Primary Attributes to Prioritize

- **Mobile-friendly first**
- **Modular, simple form design**
- **Flexible content** that supports manual updates
- **Local-first data ownership**
- Ability to run:
  - fully offline (after load)
  - or with lightweight remote storage later

### Data Philosophy

- Data must be:
  - browser-cached locally
  - importable/exportable
- Cloud storage is optional, not required
- Users should never feel locked in

### Rules & Guidance

- Game system details may be supported via:
  - tooltips
  - summaries
  - optional dropdown suggestions
- Full rule text is out of scope
- Some players want guidance — but it must be **optional and non-invasive**

---

## 5. Information Architecture (Core Pillar)

All character information must clearly fall into one of two categories:

### Runtime Information (Primary)

Information referenced frequently during active play.

Examples:

- Ability scores & modifiers
- HP, AC, saves
- Attacks, actions, spell summaries
- Key traits or features
- Temporary notes or reminders

**Design Requirements**

- Visible by default or one interaction away
- Minimal scrolling on mobile
- High contrast and readable at a glance

---

### Organizational Information (Secondary)

Information used between sessions or for prep.

Examples:

- Appearance & backstory
- Detailed feature descriptions
- Equipment lists
- Long-form notes
- Source annotations

**Design Requirements**

- Collapsible or clearly sectioned
- Supports free-form text
- Does not crowd runtime UI

---

## 6. Target Users (Concise)

- **Player (Casual or Semi-Experienced)**  
  Wants a fast, readable sheet on their phone.

- **DM / GM**  
  Manages multiple PCs, sidekicks, or NPCs.

- **System Tinkerer / Homebrewer**  
  Wants structure without rigidity.

---

## 7. Core User Stories (Concise)

- As a player, I can open my character sheet and immediately see what matters during my turn.
- As a DM, I can switch between multiple characters quickly.
- As a user, I can annotate abilities and rules in my own words.
- As a user, I can export my data and not worry about lock-in.
- As a tinkerer, I can bend the sheet without fighting the UI.

---

## 8. Functional Requirements (v1)

### Navigation & Structure

- System selection menu
- Character list view (add / edit / delete)
- Deep-linkable character sheets
- Clear navigation between list and sheet

### Character Sheets (Initial Focus)

- Editable D&D 5e (2014) sidekick sheet
- Sections include:
  - Identity & appearance
  - Ancestry / background
  - Class levels
  - Ability scores & proficiency
  - Combat stats (AC, HP, saves, attacks)
  - Features & traits
  - Equipment
  - Notes (free-form, prominent)

### Data & Persistence

- Typed data model (TypeScript preferred)
- Local-first persistence via LocalStorage
- Import/export JSON for backup and sharing
- Graceful handling of partial or invalid data

### UX & Accessibility

- Responsive across mobile and desktop
- Keyboard-navigable menus
- Semantic headings and focus styles
- Clear empty and error states

---

## 9. Backend & Storage Strategy

### v1: Minimal by Design

- LocalStorage as default persistence
- No accounts required
- No server dependency

### Near-Term Exploration

One lightweight backend option, chosen for:

- free tier viability
- minimal operational burden
- simple mental model

Candidates:

- Google Sheets + AppScript
- Firebase (single Firestore DB)

Early constraints:

- Ideally users only see their own data
- Campaign-wide shared editing may be global initially
- Data model must support future migration

---

## 10. Technical Architecture

### Frontend

- SPA, mobile-first
- Current: Svelte + Vite
- Acceptable alternative: React

Framework choice is **pragmatic**, not ideological.
Momentum > purity.

### Component Development

- Introduce Storybook after MVP
- Use Storybook to:
  - isolate runtime UI components
  - validate mobile breakpoints
  - support future system theming

### Routing

- SPA fallback required for deep links
- Avoid prerender conflicts with dynamic character routes

---

## 11. Non-Functional Requirements

- Initial load < 2s on mid-tier mobile
- Bundle size target: <250kb gz (v1)
- Offline-capable once loaded
- No PII collection
- No authentication required

---

## 12. Success Metrics

- Character can be created and reopened in <90 seconds
- No data loss during normal usage
- Mobile Lighthouse score ≥80
- Dogfooding reveals no “table friction” blockers

---

## 13. Risks & Assumptions

- Single-user, single-device usage acceptable initially
- Ruleset expansion requires modular schemas
- Too much structure risks becoming VTT-lite
- Too little structure risks becoming a PDF clone

---

## 14. Roadmap (Concise)

### Phase 1 — Foundation

- Finalize data schema
- Lock runtime vs organizational layout

### Phase 2 — MVP

- Editable 5e sidekick sheet
- LocalStorage persistence
- JSON import/export

### Phase 3 — Polish

- Mobile UX pass
- Accessibility baseline
- Routing & deployment hardening

### Phase 4 — Exploration

- Storybook integration
- Optional backend prototype
- Second system proof-of-concept (e.g., Shadowdark)

---

## 15. Open Questions

- Auto-save vs explicit save?
- Manual vs derived calculations?
- Free-text vs SRD-suggested pickers?
- How visible should source annotations be?

---

## 16. Next Actions

1. Finalize runtime vs organizational section boundaries
2. Lock v1 character data schema
3. Refactor stores to typed interfaces
4. Implement LocalStorage adapter
5. Resolve SPA routing strategy
6. Ship something playable before expanding scope
