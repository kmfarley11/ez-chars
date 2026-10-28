import { describe, expect, it } from 'vitest';
import { proficiencyLevel, proficiencyStatus } from '../proficiency-level';

describe('authored proficiency status', () => {
	it.each([
		[undefined, undefined, 'Not recorded', ''],
		[false, undefined, 'None', ''],
		[false, false, 'None', ''],
		[true, undefined, 'Proficient', 'P'],
		[true, false, 'Proficient', 'P'],
		[true, true, 'Expertise', 'E'],
		[undefined, false, 'Custom (preserved)', '!'],
		[undefined, true, 'Custom (preserved)', '!'],
		[false, true, 'Custom (preserved)', '!']
	] as const)('projects %s/%s without changing the flags', (proficient, expertise, label, mark) => {
		const flags = Object.freeze({ proficient, expertise });
		expect(proficiencyLevel(flags, true)).toBe(label);
		expect(proficiencyStatus(flags, true)).toEqual({ label, mark });
	});
	it('does not portray an authored save expertise flag as standard skill Expertise', () => {
		expect(proficiencyStatus({ proficient: true, expertise: true }, false)).toEqual({
			label: 'Custom (preserved)',
			mark: '!'
		});
	});
});
