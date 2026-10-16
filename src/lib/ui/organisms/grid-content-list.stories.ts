import type { Meta, StoryObj } from '@storybook/sveltekit';
import { fn } from 'storybook/test';
import type { GridContentListRow } from '$lib/ui/molecules/grid-content-list';
import GridContentListStoryHarness from '$lib/ui/organisms/grid-content-list-story-harness.svelte';

const exampleRows: Array<GridContentListRow> = Array.from({ length: 12 }, (_, index) => ({
	key: `example-${index}`,
	label: `Supply ${index + 1}`,
	detail:
		index === 2
			? 'Long contextual detail for wrapping and scrolling. '.repeat(12)
			: 'Compact supporting detail',
	badges: [index % 2 ? 'Reusable' : 'Consumable'],
	annotations:
		index === 2
			? [
					{
						id: 'example-note',
						origin: 'user',
						kind: 'note',
						text: 'Keep this entry easy to find.'
					}
				]
			: []
}));

const meta = {
	id: 'design-system-organisms-gridcontentlist',
	title: 'Design System/Organisms/Collections (Tier 3 Field)',
	component: GridContentListStoryHarness,
	args: {
		initialRows: exampleRows,
		onRowSave: fn()
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

export const Dense: Story = {};
export const Sparse: Story = { args: { initialRows: exampleRows.slice(0, 3) } };

export const Empty: Story = {
	args: { initialRows: [] }
};

export const NoMatches: Story = {
	args: { initialQuery: 'portable hole' }
};

export const AnnotatedLongContent: Story = {
	args: { initialRows: [exampleRows[2]] }
};
