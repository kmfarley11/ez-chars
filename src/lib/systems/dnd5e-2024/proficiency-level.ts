export type ProficiencyFlags = { proficient?: boolean; expertise?: boolean };
export type ProficiencyLevel =
	'Not recorded' | 'None' | 'Proficient' | 'Expertise' | 'Custom (preserved)';

// A view over the existing optional flags, never a normalization during hydration.
export const proficiencyLevel = (
	{ proficient, expertise }: ProficiencyFlags,
	skill: boolean
): ProficiencyLevel => {
	if (proficient === undefined && expertise === undefined) return 'Not recorded';
	if (expertise === true) return skill && proficient === true ? 'Expertise' : 'Custom (preserved)';
	if (proficient === true) return 'Proficient';
	if (proficient === false) return 'None';
	return 'Custom (preserved)';
};

export const proficiencyChoices = (skill: boolean): ProficiencyLevel[] => [
	'Not recorded',
	'None',
	'Proficient',
	...(skill ? ['Expertise' as const] : [])
];

export const proficiencyFlags = (level: ProficiencyLevel): ProficiencyFlags => {
	if (level === 'Not recorded') return {};
	return {
		proficient: level === 'Proficient' || level === 'Expertise',
		expertise: level === 'Expertise'
	};
};

export const proficiencyStatus = (flags: ProficiencyFlags, skill: boolean) => {
	const label = proficiencyLevel(flags, skill);
	return {
		label,
		mark:
			label === 'Expertise'
				? 'E'
				: label === 'Proficient'
					? 'P'
					: label === 'Custom (preserved)'
						? '!'
						: ''
	};
};
