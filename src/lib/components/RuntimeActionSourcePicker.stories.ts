import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, within } from 'storybook/test';
import RuntimeActionSourcePicker from './RuntimeActionSourcePicker.svelte';
import type { RuntimeActionSourceCandidate } from '$lib/dnd5e2014/runtimeActionSources';

const candidates: RuntimeActionSourceCandidate[] = [
	{
		key: 'item:shield-item',
		source: { kind: 'item', id: 'shield-item' },
		category: 'inventory',
		label: 'Shield',
		detail: '+2 AC',
		context: 'Armor & Shields · Quantity 2',
		searchText: 'shield +2 ac armor shields quantity 2 inventory equipped',
		sourceLabel: 'Inventory · Shield',
		badges: ['Inventory', 'Equipped'],
		equipped: true,
		destination: { kind: 'inventory', group: 'armorShields' },
		ownedText: { name: 'Shield', ownsNotes: true, notes: '+2 AC' }
	},
	{
		key: 'spell:shield-spell',
		source: { kind: 'spell', id: 'shield-spell' },
		category: 'spell',
		label: 'Shield',
		context: 'Level 1 · Prepared',
		searchText: 'shield spell level 1 prepared',
		sourceLabel: 'Spell · Shield',
		badges: ['Spell'],
		destination: { kind: 'spell', level: 1 },
		ownedText: { name: 'Shield', ownsNotes: true }
	},
	{
		key: 'spell:fire-bolt',
		source: { kind: 'spell', id: 'fire-bolt' },
		category: 'spell',
		label: 'Fire Bolt',
		context: 'Cantrip',
		searchText: 'fire bolt cantrip spell',
		sourceLabel: 'Spell · Fire Bolt',
		badges: ['Spell'],
		destination: { kind: 'spell', level: 0 },
		ownedText: { name: 'Fire Bolt', ownsNotes: true }
	},
	{
		key: 'feature:arcane-recovery',
		source: { kind: 'feature', id: 'arcane-recovery' },
		category: 'feature',
		label: 'Arcane Recovery',
		context: 'Wizard',
		searchText: 'arcane recovery wizard feature class',
		sourceLabel: 'Feature · Arcane Recovery',
		badges: ['Feature', 'Class'],
		destination: { kind: 'features' },
		ownedText: { name: 'Arcane Recovery', ownsNotes: false }
	},
	{
		key: 'feature:darkvision',
		source: { kind: 'feature', id: 'darkvision' },
		category: 'trait',
		label: 'Darkvision',
		context: 'Elf',
		searchText: 'darkvision elf trait ancestry',
		sourceLabel: 'Trait · Darkvision',
		badges: ['Trait', 'Ancestry'],
		destination: { kind: 'traits' },
		ownedText: { name: 'Darkvision', ownsNotes: false }
	}
];

const meta = {
	title: 'Molecules/RuntimeActionSourcePicker',
	component: RuntimeActionSourcePicker,
	args: {
		candidates,
		onSelect: fn()
	}
} satisfies Meta<typeof RuntimeActionSourcePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MixedSources: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const shieldOptions = canvas.getAllByRole('button', { name: /Shield/ });
		await expect(within(shieldOptions[0]).getByText('Inventory')).toBeVisible();
		await expect(within(shieldOptions[1]).getByText('Spell')).toBeVisible();
		const fireBolt = canvas.getByRole('button', { name: /Fire Bolt/ });
		await expect(within(fireBolt).getByText('Spell')).toBeVisible();
		await expect(within(fireBolt).getByText('Cantrip')).toBeVisible();
	}
};

export const DuplicateNameSelected: Story = {
	args: { selectedKey: 'spell:shield-spell' }
};

export const InventoryFilterControls: Story = {
	args: { category: 'inventory' }
};

export const InventoryQuantitySelectedFiltered: Story = {
	args: { selectedKey: 'item:shield-item' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('Armor & Shields · Quantity 2')).toBeVisible();
		await userEvent.click(canvas.getByRole('button', { name: 'Spells' }));
		const selectedFiltered = canvas.getByText('Selected (filtered)').closest('button');
		if (!selectedFiltered) throw new Error('Expected the selected filtered source option');
		await expect(selectedFiltered).toBeVisible();
		await expect(within(selectedFiltered).getByText('Inventory')).toBeVisible();
		await expect(canvas.getByText('Armor & Shields · Quantity 2')).toBeVisible();
	}
};

export const NoMatches: Story = {
	args: { searchQuery: 'missing source' }
};

export const FilterInteraction: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.type(canvas.getByRole('searchbox'), 'prepared shield');
		await expect(canvas.getByText('Level 1 · Prepared')).toBeVisible();
		await expect(canvas.queryByText('Armor & Shields · Quantity 2')).not.toBeInTheDocument();

		await userEvent.clear(canvas.getByRole('searchbox'));
		await userEvent.click(canvas.getByRole('button', { name: 'Inventory' }));
		await userEvent.click(canvas.getByRole('checkbox', { name: 'Equipped only' }));
		await expect(canvas.getByText('Armor & Shields · Quantity 2')).toBeVisible();
		await expect(canvas.queryByText('Wizard')).not.toBeInTheDocument();
	}
};
