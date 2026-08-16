import type { Meta, StoryObj } from '@storybook/sveltekit';
import PanelSurfaceStory from './PanelSurfaceStory.svelte';

const meta = {
	title: 'Molecules/PanelSurface',
	component: PanelSurfaceStory,
	args: {
		nested: false
	}
} satisfies Meta<typeof PanelSurfaceStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Nested: Story = {
	args: {
		nested: true
	}
};
