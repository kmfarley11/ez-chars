import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { RuntimeActionSuggestion } from '$lib/compendium/dnd5e2014/suggestInventoryRuntimeActions';
import { create5e2014Character } from '../../../../schema';
import RuntimeActionsCardStoryHarness from './RuntimeActionsCardStoryHarness.svelte';

const character = create5e2014Character({
	inventory: [
		{ id: 'sword-1', name: 'Longsword', equipped: true, notes: '1d8 slashing' },
		{ id: 'rope-1', name: 'Rope', equipped: false, notes: '50 feet' }
	],
	systemData: {
		runtimeActions: [
			{
				id: 'linked-action',
				name: 'Longsword attack',
				source: { kind: 'item', id: 'sword-1' }
			},
			{ id: 'custom-action', name: 'Improvise' }
		]
	}
});
const suggestions: RuntimeActionSuggestion[] = [
	{
		name: 'Longsword',
		notes: '1d8 slashing',
		source: { kind: 'item', id: 'sword-1' }
	}
];

const meta = {
	title: 'Molecules/RuntimeActionsCard',
	component: RuntimeActionsCardStoryHarness,
	args: {
		initialCharacter: character,
		loadSuggestions: async () => suggestions,
		onEditSavePatches: fn(),
		onAcceptSuggestion: fn(),
		onResyncAction: fn(),
		onNavigateToSource: fn()
	}
} satisfies Meta<typeof RuntimeActionsCardStoryHarness>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InteractivePlayground: Story = {};

export const LinkedAndCustom: Story = {
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole('button', { name: 'View Longsword' }));
		await expect(canvas.getByRole('status')).toHaveTextContent(
			'Source navigation requested for Longsword'
		);
		await userEvent.click(canvas.getByRole('button', { name: 'Resync from source' }));
		await expect(args.onNavigateToSource).toHaveBeenCalledWith('sword-1');
		await expect(args.onResyncAction).toHaveBeenCalledWith('linked-action');
		await expect(canvas.getByRole('status')).toHaveTextContent(
			'Resynced action from its inventory source'
		);
		await expect(canvas.queryByRole('button', { name: /View Improvise/ })).not.toBeInTheDocument();
	}
};

export const EditableActions: Story = {
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole('button', { name: 'Card actions' }));
		await userEvent.click(canvas.getByRole('menuitem', { name: 'Edit' }));
		const dialog = within(canvas.getByRole('dialog'));
		const actionNames = dialog.getAllByLabelText('Runtime Actions Name');
		await userEvent.clear(actionNames[0]);
		await userEvent.type(actionNames[0], 'Longsword strike');
		await userEvent.click(dialog.getByRole('button', { name: 'Save' }));
		const sourceStatus = within(canvas.getByRole('list', { name: 'Runtime action source status' }));
		await expect(sourceStatus.getByText('Longsword strike', { exact: true })).toBeVisible();
		await expect(canvas.getByRole('status')).toHaveTextContent('Saved runtime action changes');
		await expect(args.onEditSavePatches).toHaveBeenCalled();
	}
};

export const ResolvedSuggestions: Story = {
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole('button', { name: 'Add action from inventory' }));
		await userEvent.click(await canvas.findByRole('button', { name: 'Add Longsword' }));
		await expect(args.onAcceptSuggestion).toHaveBeenCalledWith(suggestions[0]);
		await expect(canvas.getByRole('status')).toHaveTextContent('Added Longsword');
		await expect(canvas.getAllByText('Linked to Longsword')).toHaveLength(2);
	}
};

export const PendingSuggestions: Story = {
	args: {
		loadSuggestions: () => new Promise<ReadonlyArray<RuntimeActionSuggestion>>(() => undefined)
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole('button', { name: 'Add action from inventory' }));
		await expect(canvas.getByRole('status')).toHaveTextContent('Loading inventory suggestions');
	}
};

export const EmptySuggestions: Story = {
	args: {
		loadSuggestions: async () => []
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole('button', { name: 'Add action from inventory' }));
		await expect(await canvas.findByText('No equipped inventory items to suggest.')).toBeVisible();
	}
};

export const RejectedSuggestions: Story = {
	args: {
		loadSuggestions: async () => {
			throw new Error('Suggestion service unavailable');
		}
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole('button', { name: 'Add action from inventory' }));
		await expect(await canvas.findByRole('alert')).toHaveTextContent(
			'Inventory suggestions could not be loaded'
		);
		await expect(canvas.getByText(/Manual custom actions remain available/)).toBeVisible();
	}
};
