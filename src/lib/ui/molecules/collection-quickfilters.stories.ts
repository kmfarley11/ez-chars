import type { Meta, StoryObj } from '@storybook/sveltekit';
import CollectionQuickfiltersStory from '$lib/ui/molecules/collection-quickfilters-story.svelte';

const meta = {
	title: 'Design System/Molecules/CollectionQuickfilters',
	component: CollectionQuickfiltersStory
} satisfies Meta<typeof CollectionQuickfiltersStory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
