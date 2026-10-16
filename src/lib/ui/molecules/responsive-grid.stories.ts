import type { Meta, StoryObj } from '@storybook/sveltekit';
import ResponsiveGridStory from '$lib/ui/molecules/responsive-grid-story.svelte';

const meta = {
	title: 'Design System/Molecules/ResponsiveGrid',
	component: ResponsiveGridStory,
	args: {
		cols: 1,
		colsSm: 2,
		colsMd: 3,
		colsLg: 4
	}
} satisfies Meta<typeof ResponsiveGridStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
