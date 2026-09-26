import type { Meta, StoryObj } from '@storybook/sveltekit';
import { fn } from 'storybook/test';
import { projectInventoryDenseCollectionRows } from '$lib/dnd5e2014/denseCollectionRows';
import { saturatedCharacter5e2014 } from '../../fixtures/saturatedCharacter.5e2014';
import GridContentListStoryHarness from './GridContentListStoryHarness.svelte';

const saturatedGearRows = projectInventoryDenseCollectionRows(
	saturatedCharacter5e2014.inventory,
	'other'
);

const meta = {
	title: 'Molecules/GridContentList',
	component: GridContentListStoryHarness,
	args: {
		initialRows: saturatedGearRows,
		onRowSave: fn(),
		onBulkEdit: fn()
	},
	parameters: {
		docs: {
			description: {
				component:
					'Dense collection sandbox for human review. Use the viewport toolbar to repeat the same interactions at desktop and phone widths; repeatable behavior belongs in Vitest or Playwright.'
			}
		}
	}
} satisfies Meta<typeof GridContentListStoryHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SaturatedGear: Story = {};

export const Empty: Story = {
	args: { initialRows: [] }
};

export const NoMatches: Story = {
	args: { initialQuery: 'portable hole' }
};

export const AnnotatedLongContent: Story = {
	args: { initialRows: [saturatedGearRows[2]] }
};
