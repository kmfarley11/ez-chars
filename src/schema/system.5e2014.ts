import type { CharacterDocument5e2014, Reference } from '.';
import { SCHEMA_VER, type Annotation, type Id } from './core'
import { nowIso, createId } from './helpers';
import { FULL_2014_SRD_HREF } from '$lib/urlHelpers';

// =======================================================
// System: D&D 5e (2014) — SRD 5.1
// =======================================================
export const SYSTEM_ID_5E2014_val = "dnd5e-2014"
export type SYSTEM_ID_5E2014 = "dnd5e-2014"

export const CHAR_SCHEMA_VER_5E2014_val = "SRD-5.1-2023"
export type CHAR_SCHEMA_VER_5E2014 = "SRD-5.1-2023"

export type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

export interface Dnd5e2014SystemData {
  level: number;

  /**
   * You can store this explicitly (manual-friendly),
   * or compute it. Storing supports house rules easily.
   */
  proficiencyBonus: number;

  abilities: Record<AbilityKey, AbilityScore>;

  saves: Partial<Record<AbilityKey, Save>>;

  skills: Partial<Record<Dnd5eSkillName, Skill>>;

  /**
   * Core combat stats (manual-friendly; derived fields can be computed in UI).
   */
  combat: CombatBlock;

  /**
   * 5e identity choices
   */
  race?: RaceChoice;
  background?: BackgroundChoice;

  /**
   * Multi-class supported.
   */
  classes: ClassLevel[];

  /**
   * Attacks/actions are extremely “runtime”, but keep them here as system canonical.
   * (You can also mirror into core.features if you want generic views later.)
   */
  attacks?: Attack[];

  /**
   * Optional subsystem
   */
  spellcasting?: SpellcastingBlock;

  annotations?: Annotation[];
}

export interface AbilityScore {
  score: number; // 1-30 (typical)
  mod?: number; // store or compute
  annotations?: Annotation[];
}

export interface Save {
  proficient?: boolean;
  bonus?: number; // store or compute
  annotations?: Annotation[];
}

export interface Skill {
  proficient?: boolean;
  expertise?: boolean; // optional house-rule-friendly
  bonus?: number; // store or compute
  annotations?: Annotation[];
}

export interface CombatBlock {
  armorClass: number;
  initiative?: number; // store or compute
  speed?: number; // feet
  hitPoints: HitPoints;
  hitDice?: HitDice;

  senses?: {
    passivePerception?: number;
    darkvision?: number; // feet
    blindsight?: number;
    tremorsense?: number;
    truesight?: number;
  };

  conditions?: string[]; // keep simple; can later become structured refs
  annotations?: Annotation[];
}

export interface HitPoints {
  max: number;
  current: number;
  temp?: number;
  annotations?: Annotation[];
}

export interface HitDice {
  total: string; // e.g. "3d8"
  remaining?: string; // e.g. "2d8"
  annotations?: Annotation[];
}

export interface RaceChoice {
  name: string; // "Elf"
  subrace?: string; // "High Elf"
  size?: "Tiny" | "Small" | "Medium" | "Large" | "Huge" | "Gargantuan";
  speed?: number;
  languages?: string[];
  traits?: FeatureRef[]; // references into system features list (or inline via FeatureRef.name)
  annotations?: Annotation[];
}

export interface BackgroundChoice {
  name: string;
  features?: FeatureRef[];
  proficiencies?: {
    skills?: Dnd5eSkillName[];
    tools?: string[];
    languages?: string[];
  };
  annotations?: Annotation[];
}

export interface ClassLevel {
  name: string; // "Fighter"
  level: number;
  subclass?: string;

  hitDie?: string; // "d10"
  features?: FeatureRef[];

  spellcasting?: {
    ability?: AbilityKey;
  };

  annotations?: Annotation[];
}

export interface FeatureRef {
  /**
   * Either link to an existing Feature (by id) or keep it as an inline reference.
   * This avoids forcing a global “feature catalog” on day 1.
   */
  featureId?: Id;
  name: string;
  annotations?: Annotation[];
}

/** SRD skill list (stable, finite) */
export type Dnd5eSkillName =
  | "Acrobatics"
  | "Animal Handling"
  | "Arcana"
  | "Athletics"
  | "Deception"
  | "History"
  | "Insight"
  | "Intimidation"
  | "Investigation"
  | "Medicine"
  | "Nature"
  | "Perception"
  | "Performance"
  | "Persuasion"
  | "Religion"
  | "Sleight of Hand"
  | "Stealth"
  | "Survival";

export interface Attack {
  id: Id;
  name: string;
  kind?: "melee" | "ranged" | "spell" | "other";
  toHit?: number; // store or compute
  reachOrRange?: string; // "5 ft" or "30/120"
  target?: string; // "1 creature"
  damage?: string; // "1d8+3 slashing"
  notes?: string;
  annotations?: Annotation[];
}

export interface SpellcastingBlock {
  ability: AbilityKey;
  spellSaveDC?: number; // store or compute
  spellAttackBonus?: number; // store or compute

  slots?: Partial<Record<SpellLevel, SpellSlots>>;
  spells?: SpellRef[];

  annotations?: Annotation[];
}

export type SpellLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface SpellSlots {
  max: number;
  used: number;
  annotations?: Annotation[];
}

export interface SpellRef {
  /**
   * Same idea as FeatureRef: link later, keep light now.
   */
  spellId?: Id;
  name: string;
  level?: SpellLevel;
  prepared?: boolean;
  notes?: string;
  annotations?: Annotation[];
}

export const SRD_REF_5E_2014: Reference = {
    kind: 'url', locator: { url: FULL_2014_SRD_HREF }, sourceId: createId()
}

export function create5e2014Character(name?: string, hp?: number, ac?: number): CharacterDocument5e2014 {
  return {
    meta: {
      id: createId(),
      schemaVersion: SCHEMA_VER,
      createdAt: nowIso(),
      updatedAt: nowIso()
    },
    system: {
      id: SYSTEM_ID_5E2014_val,
      version: CHAR_SCHEMA_VER_5E2014_val,
      source: 'local',
      annotations: [
        { origin: 'source', kind: 'tag', text: '2014-5e' },
        { origin: 'source', kind: 'tag', text: '2014-5e-srd', ref: SRD_REF_5E_2014 },
        { origin: 'source', kind: 'tag', text: '2014-5e-ua-sidekick' },
      ]
    },
    identity: {
      name: name ?? 'Ole No Name',
    },
    systemData: {
      level: 0,
      proficiencyBonus: 0,
      abilities: {
        str: { score: 10, mod: 0 },
        dex: { score: 10, mod: 0 },
        con: { score: 10, mod: 0 },
        int: { score: 10, mod: 0 },
        wis: { score: 10, mod: 0 },
        cha: { score: 10, mod: 0 }
      },
      saves: {},
      skills: {},
      combat: {
        armorClass: ac ?? 10,
        hitPoints: {
          max: hp ?? 5,
          current: hp ?? 5,
          temp: 0
        }
      },
      classes: []
    }
  }
}