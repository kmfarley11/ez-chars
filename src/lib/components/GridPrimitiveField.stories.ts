import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, waitFor, within } from 'storybook/test';
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

export const GuardedEscapedPatch: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const editButton = canvas.getByRole('button', { name: 'Edit Score' });
		await userEvent.click(editButton);
		const input = canvas.getByRole('spinbutton', { name: 'Score' });
		await expect(input).toHaveFocus();
		await userEvent.clear(input);
		await userEvent.type(input, '15');
		await userEvent.keyboard('{Enter}');
		await expect(canvas.getByText('15', { exact: true })).toBeVisible();
		await waitFor(() => expect(canvas.getByRole('button', { name: 'Edit Score' })).toHaveFocus());
		await expect(canvas.getByLabelText('Last emitted patch')).toHaveTextContent(
			JSON.stringify([
				{ op: 'test', path: '/profile/a~1b/tilde~0key', value: 12 },
				{ op: 'replace', path: '/profile/a~1b/tilde~0key', value: 15 }
			])
		);
	}
};

export const UnchangedSave: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const editButton = canvas.getByRole('button', { name: 'Edit Score' });
		await userEvent.click(editButton);
		await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
		await expect(canvas.getByLabelText('Last emitted patch')).toHaveTextContent('No patch emitted');
		await waitFor(() => expect(canvas.getByRole('button', { name: 'Edit Score' })).toHaveFocus());
	}
};

export const InvalidNumber: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole('button', { name: 'Edit Score' }));
		const input = canvas.getByRole('spinbutton', { name: 'Score' });
		// Native number inputs reject non-numeric keystrokes. Temporarily relax only
		// the story DOM control to exercise the component's defensive validation branch.
		input.setAttribute('type', 'text');
		await userEvent.clear(input);
		await userEvent.type(input, 'not-a-number');
		await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
		await expect(canvas.getByRole('alert')).toHaveTextContent('Expected a finite number.');
		await expect(canvas.getByLabelText('Last emitted patch')).toHaveTextContent('No patch emitted');
	}
};

export const KeyboardCancel: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const editButton = canvas.getByRole('button', { name: 'Edit Score' });
		await userEvent.click(editButton);
		const input = canvas.getByRole('spinbutton', { name: 'Score' });
		await userEvent.clear(input);
		await userEvent.type(input, '99');
		await userEvent.keyboard('{Escape}');
		await expect(canvas.getByText('12', { exact: true })).toBeVisible();
		await waitFor(() => expect(canvas.getByRole('button', { name: 'Edit Score' })).toHaveFocus());
		await expect(canvas.getByLabelText('Last emitted patch')).toHaveTextContent('No patch emitted');
	}
};

export const Annotated: Story = {
	args: { withAnnotation: true }
};

export const QuietAffordance: Story = {
	args: { kind: 'text', editAffordance: 'hover' }
};
