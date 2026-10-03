import type { Meta, StoryObj } from '@storybook/sveltekit';
import CollectionQuickfiltersStory from './CollectionQuickfiltersStory.svelte';

const meta = {
	title: 'Molecules/CollectionQuickfilters',
	component: CollectionQuickfiltersStory
} satisfies Meta<typeof CollectionQuickfiltersStory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
