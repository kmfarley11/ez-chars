import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, within } from 'storybook/test';
import ActionDraftForm from './ActionDraftForm.svelte';

const meta = {
	title: 'Molecules/ActionDraftForm',
	component: ActionDraftForm,
	args: {
		draft: {
			name: 'Initial Action',
			timing: 'action',
			category: 'effect',
			notes: 'Some notes here'
		},
		onChange: fn()
	}
} satisfies Meta<typeof ActionDraftForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Blank: Story = {
	args: {
		draft: {
			name: ''
		}
	}
};

export const Interaction: Story = {
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const nameInput = canvas.getByRole('textbox', { name: 'Name' });
		await userEvent.clear(nameInput);
		await userEvent.type(nameInput, 'Updated Action');
		await expect(args.onChange).toHaveBeenCalledWith(
			expect.objectContaining({ name: 'Updated Action' })
		);
	}
};
