import type { Meta, StoryObj } from '@storybook/sveltekit';
import Dnd5e2014DenseCollectionCardStory from './Dnd5e2014DenseCollectionCardStory.svelte';

const meta = {
	title: 'Organisms/Dnd5e2014DenseCollectionCard',
	component: Dnd5e2014DenseCollectionCardStory,
	args: {}
} satisfies Meta<typeof Dnd5e2014DenseCollectionCardStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
	args: { emptyText: 'No items found.', rows: [] }
};
