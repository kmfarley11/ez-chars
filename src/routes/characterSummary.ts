import type { CharacterWithSystemData } from '../schema/index.js';
import { SYSTEM_ID_5E2014 } from '../schema/versions.5e2014.js';

export interface CharacterSummary {
	id: string;
	name: string;
	systemId: string;
	systemLabel: string;
	classSummary: string;
	updatedAt: string;
	updatedAtRaw: string;
	createdAt: string;
	createdAtRaw: string;
	raw: CharacterWithSystemData;
}

export const formatCharacterName = (name?: string, fallbackId: string = ''): string => {
	const trimmed = name?.trim();
	return trimmed && trimmed.length > 0 ? trimmed : fallbackId;
};

export const formatSystemLabel = (systemId?: string): string => {
	if (systemId === SYSTEM_ID_5E2014) {
		return 'D&D 5e (2014)';
	}
	return systemId && systemId.trim() ? systemId.trim() : 'Unknown System';
};

export const formatClassSummary = (character: CharacterWithSystemData): string => {
	const systemData = character.systemData as Record<string, unknown> | undefined;
	if (!systemData || !Array.isArray(systemData.classes) || systemData.classes.length === 0) {
		return '—';
	}
	const parts = systemData.classes
		.map((cls) => {
			if (cls && typeof cls === 'object') {
				const name = typeof cls.name === 'string' && cls.name.trim() ? cls.name.trim() : 'Class';
				const level = typeof cls.level === 'number' ? cls.level : undefined;
				return level !== undefined ? `${name} ${level}` : name;
			}
			return String(cls);
		})
		.filter(Boolean);

	return parts.length > 0 ? parts.join(', ') : '—';
};

export const formatTimestamp = (isoString?: string): string => {
	if (!isoString) return '—';
	const date = new Date(isoString);
	if (Number.isNaN(date.getTime())) return isoString;

	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		timeZone: 'UTC'
	});
};

export const toCharacterSummary = (character: CharacterWithSystemData): CharacterSummary => {
	const id = character.meta?.id ?? '';
	const name = formatCharacterName(character.identity?.name, id);
	const systemId = character.system?.id ?? '';
	const systemLabel = formatSystemLabel(systemId);
	const classSummary = formatClassSummary(character);
	const updatedAt = formatTimestamp(character.meta?.updatedAt);
	const createdAt = formatTimestamp(character.meta?.createdAt);

	return {
		id,
		name,
		systemId,
		systemLabel,
		classSummary,
		updatedAt,
		updatedAtRaw: character.meta?.updatedAt ?? '',
		createdAt,
		createdAtRaw: character.meta?.createdAt ?? '',
		raw: character
	};
};
