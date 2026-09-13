import type { Meta, StoryObj } from '@storybook/sveltekit';
import GridPrimitiveFieldStory from './GridPrimitiveFieldStory.svelte';

const meta = {
	title: 'Molecules/GridPrimitiveField',
	component: GridPrimitiveFieldStory,
	args: {
		kind: 'number',
		withAnnotation: false,
		editAffordance: 'persistent'
	}
} satisfies Meta<typeof GridPrimitiveFieldStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Annotated: Story = {
	args: { withAnnotation: true }
};

export const QuietAffordance: Story = {
	args: { kind: 'text', editAffordance: 'hover' }
};
