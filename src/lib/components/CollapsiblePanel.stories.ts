import type { Meta, StoryObj } from '@storybook/sveltekit';
import CollapsiblePanelStory from './CollapsiblePanelStory.svelte';

const meta = {
	title: 'Molecules/CollapsiblePanel',
	component: CollapsiblePanelStory,
	args: {
		heading: 'Abilities',
		startsCollapsed: false
	}
} satisfies Meta<typeof CollapsiblePanelStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Expanded: Story = {};

export const Collapsed: Story = {
	args: {
		startsCollapsed: true
	}
};
