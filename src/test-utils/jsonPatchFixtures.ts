export type RepresentativePatchCharacter = {
	identity: {
		name: string;
	};
	systemData: {
		abilities: {
			strength: {
				score: number;
				annotations: Array<{ id: string; text: string }>;
			};
			dexterity: {
				score: number;
			};
		};
		features: Array<{ id: string; name: string; uses: string }>;
		spells: {
			levels: {
				'1': {
					spells: Array<{ id: string; name: string }>;
				};
			};
		};
	};
	inventory: Array<{ id: string; name: string }>;
	notes: {
		scratchpad: string;
	};
};

export const createRepresentativePatchCharacter = (): RepresentativePatchCharacter => ({
	identity: {
		name: 'Patch Tester'
	},
	systemData: {
		abilities: {
			strength: {
				score: 12,
				annotations: [{ id: 'strength-note', text: 'Initial strength note' }]
			},
			dexterity: {
				score: 14
			}
		},
		features: [
			{ id: 'feature-action-surge', name: 'Action Surge', uses: '1 / short rest' },
			{ id: 'feature-second-wind', name: 'Second Wind', uses: '1 / short rest' }
		],
		spells: {
			levels: {
				'1': {
					spells: [
						{ id: 'spell-shield', name: 'Shield' },
						{ id: 'spell-magic-missile', name: 'Magic Missile' }
					]
				}
			}
		}
	},
	inventory: [{ id: 'item-sword', name: 'Longsword' }],
	notes: {
		scratchpad: 'Remember the standard JSON Patch shape.'
	}
});
