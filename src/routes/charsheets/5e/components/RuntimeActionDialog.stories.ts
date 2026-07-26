import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, within } from 'storybook/test';
import RuntimeActionDialog from './RuntimeActionDialog.svelte';
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
	title: 'Organisms/RuntimeActionDialog',
	component: RuntimeActionDialog,
	args: {
		open: true,
		candidates,
		onConfirm: fn(),
		onClose: fn()
	}
} satisfies Meta<typeof RuntimeActionDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MixedSources: Story = {};

export const NoSources: Story = {
	args: { candidates: [] }
};

export const SourceReviewAndBack: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement.parentElement!);
		await userEvent.click(canvas.getByRole('button', { name: /Arcane Recovery/ }));
		await expect(canvas.getByRole('dialog', { name: 'Review action' })).toBeVisible();
		const name = canvas.getByRole('textbox', { name: 'Name' });
		await userEvent.clear(name);
		await userEvent.type(name, 'Arcane Recovery Override');
		await userEvent.click(canvas.getByRole('button', { name: 'Back' }));
		await expect(canvas.getByRole('dialog', { name: 'Add action' })).toBeVisible();
		await userEvent.click(canvas.getByRole('button', { name: /Arcane Recovery/ }));
		await expect(canvas.getByRole('textbox', { name: 'Name' })).toHaveValue(
			'Arcane Recovery Override'
		);
	}
};

export const SourceSwitchResetsOwnedDraft: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement.parentElement!);
		await userEvent.click(canvas.getByRole('button', { name: /Arcane Recovery/ }));
		const name = canvas.getByRole('textbox', { name: 'Name' });
		await userEvent.clear(name);
		await userEvent.type(name, 'Arcane Recovery Override');
		await userEvent.click(canvas.getByRole('button', { name: 'Back' }));
		await userEvent.click(canvas.getByRole('button', { name: /Darkvision/ }));
		await expect(canvas.getByRole('textbox', { name: 'Name' })).toHaveValue('Darkvision');
	}
};

export const CustomEntry: Story = {
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement.parentElement!);
		await userEvent.click(canvas.getByRole('button', { name: /Create custom action/ }));
		await userEvent.type(canvas.getByRole('textbox', { name: 'Name' }), 'Improvise');
		await userEvent.click(canvas.getByRole('button', { name: 'Confirm Action' }));
		await expect(args.onConfirm).toHaveBeenCalledWith(
			expect.objectContaining({ name: 'Improvise' })
		);
		await expect(args.onConfirm).toHaveBeenCalledWith(
			expect.not.objectContaining({ source: expect.anything() })
		);
	}
};

export const NoMatchesKeepsCustomEntry: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement.parentElement!);
		await userEvent.type(canvas.getByRole('searchbox'), 'missing source');
		await expect(canvas.getByText('No action sources match these filters.')).toBeVisible();
		await expect(canvas.getByRole('button', { name: /Create custom action/ })).toBeVisible();
	}
};

export const Cancellation: Story = {
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement.parentElement!);
		await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
		await expect(args.onClose).toHaveBeenCalled();
		await expect(args.onConfirm).not.toHaveBeenCalled();
	}
};

export const NarrowScreen: Story = {
	parameters: {
		viewport: { defaultViewport: 'mobile1' }
	}
};
