export const SYSTEM_ID_5E2014 = 'dnd5e-2014' as const;

/** Identifies the D&D 5e rules/source release, not the ez-chars data layout. */
export const RULES_VERSION_5E2014 = 'SRD-5.1-2023' as const;

/** Identifies the current persisted/runtime shape for a D&D 5e 2014 character. */
export const CHARACTER_DATA_VERSION_5E2014 = 'dnd5e-2014.v3' as const;

export const CHARACTER_DATA_VERSION_5E2014_V2 = 'dnd5e-2014.v2' as const;

export const LEGACY_CHARACTER_DATA_VERSIONS_5E2014 = [
	'0.0.1',
	'char.v1',
	CHARACTER_DATA_VERSION_5E2014_V2
] as const;
