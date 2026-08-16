import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, within } from 'storybook/test';
import StructuredFormStory from './StructuredFormStory.svelte';

const meta = {
	title: 'Molecules/StructuredForm',
	component: StructuredFormStory,
	args: {
		withArray: false
	}
} satisfies Meta<typeof StructuredFormStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const name = canvas.getByRole('textbox', { name: 'Character Name' });
		await userEvent.clear(name);
		await userEvent.type(name, 'Dwalin');
		await userEvent.click(canvas.getByRole('button', { name: 'Submit Form Outside' }));
		await expect(canvas.getByLabelText('Last submitted data')).toHaveTextContent('Dwalin');
	}
};

export const WithArray: Story = {
	args: { withArray: true },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole('button', { name: 'Add' }));
		await expect(canvas.getAllByRole('textbox', { name: 'Properties Property' })).toHaveLength(2);
		await userEvent.click(canvas.getAllByRole('button', { name: 'Remove' })[1]);
		await expect(canvas.getAllByRole('textbox', { name: 'Properties Property' })).toHaveLength(1);
	}
};
