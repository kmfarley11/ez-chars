import type { Meta, StoryObj } from '@storybook/sveltekit';
import ResponsiveGridStory from './ResponsiveGridStory.svelte';

const meta = {
	title: 'Molecules/ResponsiveGrid',
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
