import type { Meta, StoryObj } from '@storybook/sveltekit';
import FieldGroupViewStory from './FieldGroupViewStory.svelte';

const meta = {
	title: 'Molecules/FieldGroupView',
	component: FieldGroupViewStory,
	args: {
		displayMaxCols: 3,
		displayAlign: 'left',
		mode: 'mixed'
	},
	argTypes: {
		displayAlign: { control: 'inline-radio', options: ['left', 'center'] }
	},
	parameters: {
		docs: {
			description: {
				component:
					'Reuse Mixed, Editable, and QuietEdit to compare displayAlign in Controls at desktop and phone widths. Centering should apply to labels/values and runtime inputs without moving the separate action controls or changing edit behavior. Left remains the default; no separate alignment story is needed.'
			}
		}
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
