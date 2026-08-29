import type { Meta, StoryObj } from '@storybook/sveltekit';
import type { Dnd5e2014DenseCollectionRow } from '$lib/dnd5e2014/denseCollectionRows';
import Dnd5e2014DenseCollectionCardStory from './Dnd5e2014DenseCollectionCardStory.svelte';

const inventoryRows = (
	group: 'weapons' | 'armorShields' | 'other',
	labels: Array<string>,
	pinnedIndexes: Array<number> = []
): Array<Dnd5e2014DenseCollectionRow> =>
	labels.map((label, index) => {
		const identity = `${group}-${index + 1}`;
		return {
			key: `item:${identity}`,
			identity,
			label,
			pinned: pinnedIndexes.includes(index),
			detail: `${label} authored detail ${index + 1}.`,
			context: `Quantity ${index + 1}`,
			source: { kind: 'item', id: identity, group }
		};
	});

const otherGearRows = inventoryRows(
	'other',
	['Rope', 'Bucket', 'Rope', 'Chalk', 'Lantern', 'Rations', 'Bedroll', 'Crowbar', 'Waterskin'],
	[0, 1, 2, 3, 4, 5, 6]
);

const getSpellLevelGroupLabel = (level: number): string => {
	if (level === 0) return 'Cantrips';
	const suffix = level === 1 ? 'st' : level === 2 ? 'nd' : level === 3 ? 'rd' : 'th';
	return `${level}${suffix}-level spells`;
};

const spellRows = [
	{ id: 'spell-fire-bolt', name: 'Fire Bolt', level: 0 as const, prepared: true },
	{ id: 'spell-shield-cantrip', name: 'Shield', level: 0 as const, prepared: true },
	{ id: 'spell-magic-missile', name: 'Magic Missile', level: 1 as const, prepared: true },
	{ id: 'spell-shield-level-one', name: 'Shield', level: 1 as const, prepared: false },
	{ id: 'spell-fireball', name: 'Fireball', level: 3 as const, prepared: true, pinned: true },
	{ id: 'spell-fly', name: 'Fly', level: 3 as const, prepared: false },
	{ id: 'spell-teleport', name: 'Teleport', level: 7 as const, prepared: true, pinned: true },
	{ id: 'spell-wish', name: 'Wish', level: 9 as const, prepared: false }
].map(({ id, name, level, prepared, pinned = false }) => ({
	key: `spell:${id}`,
	identity: id,
	label: name,
	pinned,
	detail: `${name} authored reminder.`,
	context: `${level === 0 ? 'Cantrip' : `Spell level ${level}`} · ${prepared ? 'Prepared' : 'Not prepared'}`,
	groupLabel: getSpellLevelGroupLabel(level),
	badges: ['Spell'],
	source: { kind: 'spell' as const, id, level }
}));

const manualReview = (...steps: Array<string>) => ({
	docs: {
		description: {
			story: `**Verify manually:**\n\n${steps.map((step) => `- ${step}`).join('\n')}`
		}
	}
});

const meta = {
	title: 'Organisms/Dnd5e2014DenseCollectionCard',
	component: Dnd5e2014DenseCollectionCardStory,
	args: {}
} satisfies Meta<typeof Dnd5e2014DenseCollectionCardStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	parameters: manualReview(
		'Confirm the pinned Longsword appears before the alphabetical unpinned Weapons tier.',
		'Open Dagger row actions, choose Pin, and confirm Dagger moves into the pinned tier while focus returns to its row-actions button.',
		'Reopen Dagger row actions, confirm the command now reads Unpin, invoke it, and confirm Dagger returns to the alphabetical unpinned tier.',
		'Choose Manage Pins and confirm the four-item manager does not show search.',
		'Change Pins, save, and confirm ordering updates while focus returns to Manage Pins.'
	)
};

export const Empty: Story = {
	args: { emptyText: 'No items found.', rows: [] },
	parameters: manualReview(
		'Confirm the empty state and Bulk Edit action remain available.',
		'Confirm Manage Pins is omitted because there are no eligible identities.'
	)
};

export const OtherGearFilteredUnlimitedPins: Story = {
	args: { title: 'Other Gear', rows: otherGearRows, query: 'rope' },
	parameters: manualReview(
		'Confirm both duplicate Rope rows remain distinguishable by authored detail and identity-owned state.',
		'Open Manage Pins and confirm the active Rope query is retained.',
		'Clear the manager query and confirm seven pinned choices remain selected—more than the five-row preview limit.',
		'Save a change and confirm filtered context and focus are preserved.'
	)
};

export const InvalidInventoryPrioritySave: Story = {
	args: {
		title: 'Other Gear',
		rows: otherGearRows,
		prioritySaveError: 'One selected item no longer belongs to this inventory.'
	},
	parameters: manualReview(
		'Open an unpinned row action menu, choose Pin, and confirm the validation alert appears without reordering while focus returns to that row action.',
		'Open Manage Pins, change a checkbox, and choose Save Pins.',
		'Confirm the validation alert remains in the open dialog and no row reorders.',
		'Confirm changing the draft clears the stale alert before retrying.'
	)
};

export const SpellPriorityAcrossLevels: Story = {
	args: { title: 'Spells', rows: spellRows },
	parameters: manualReview(
		'Confirm one Pinned spells tier appears first with Fireball and Teleport in alphabetical order and with their level/preparation context intact.',
		'Confirm the remaining spells appear exactly once under cantrip-through-ninth-level headings and alphabetically within each populated level.',
		'Open Magic Missile row actions, choose Pin, and confirm it moves into Pinned spells while focus returns to its row-actions button.',
		'Reopen Magic Missile row actions, choose Unpin, and confirm it returns to the 1st-level group with focus preserved.',
		'Open Manage Pins and confirm all levels share the same batch manager and search context.'
	)
};
