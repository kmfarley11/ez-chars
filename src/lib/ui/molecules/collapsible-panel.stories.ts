import type { Meta, StoryObj } from '@storybook/sveltekit';
import CollapsiblePanelStory from '$lib/ui/molecules/collapsible-panel-story.svelte';

const meta = {
	title: 'Design System/Molecules/CollapsiblePanel',
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
