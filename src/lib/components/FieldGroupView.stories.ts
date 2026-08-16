import type { Meta, StoryObj } from '@storybook/sveltekit';
import FieldGroupViewStory from './FieldGroupViewStory.svelte';

const meta = {
	title: 'Molecules/FieldGroupView',
	component: FieldGroupViewStory,
	args: {
		displayMaxCols: 3,
		mode: 'mixed'
	}
} satisfies Meta<typeof FieldGroupViewStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mixed: Story = {};

export const ReadOnly: Story = {
	args: { mode: 'readonly' }
};

export const Editable: Story = {
	args: { mode: 'editable' }
};

export const Annotated: Story = {
	args: { mode: 'annotated' }
};

export const MultilineAndArray: Story = {
	args: { mode: 'multiline' }
};

export const QuietEdit: Story = {
	args: { mode: 'quiet' }
};

export const Empty: Story = {
	args: { mode: 'empty' }
};

export const SingleColumn: Story = {
	args: { displayMaxCols: 1 }
};
