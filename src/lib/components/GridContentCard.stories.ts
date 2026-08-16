import type { Meta, StoryObj } from '@storybook/sveltekit';
import GridContentCardStory from './GridContentCardStory.svelte';

const meta = {
	title: 'Organisms/GridContentCard',
	component: GridContentCardStory,
	args: {
		withData: true
	}
} satisfies Meta<typeof GridContentCardStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithContent: Story = {};

import { expect, userEvent, within, waitFor } from 'storybook/test';

export const Editable: Story = {
	args: { withData: true },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const editBtn = canvas.getByRole('button', { name: 'Edit Character Name' });
		await userEvent.click(editBtn);

		const editField = canvas.getByRole('textbox', { name: 'Character Name' });

		await userEvent.clear(editField);
		await userEvent.type(editField, 'Dwalin');

		await userEvent.keyboard('{Enter}');

		await waitFor(() => expect(canvas.getByText('Dwalin')).toBeVisible());
		await expect(canvas.getByLabelText('Last card patch')).toHaveTextContent(
			JSON.stringify([
				{ op: 'test', path: '/profile/a~1b/tilde~0key', value: 'Thorin' },
				{ op: 'replace', path: '/profile/a~1b/tilde~0key', value: 'Dwalin' }
			])
		);
	}
};

export const Dialog_UnchangedSave: Story = {
	args: { withData: true },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const actionsBtn = canvas.getByRole('button', { name: /Card actions/i });

		await userEvent.click(actionsBtn);

		const editMenuBtn = within(document.body).getByRole('button', { name: 'Edit' });
		await userEvent.click(editMenuBtn);

		const dialog = within(document.body).getByRole('dialog', { name: 'Edit Fields' });
		const saveBtn = within(dialog).getByRole('button', { name: 'Save' });

		await userEvent.click(saveBtn);
		await expect(dialog).not.toBeVisible();

		await waitFor(() => expect(actionsBtn).toHaveFocus());
	}
};

export const Dialog_CancelButton: Story = {
	args: { withData: true },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const actionsBtn = canvas.getByRole('button', { name: /Card actions/i });

		await userEvent.click(actionsBtn);

		const editMenuBtn = within(document.body).getByRole('button', { name: 'Edit' });
		await userEvent.click(editMenuBtn);

		const dialog = within(document.body).getByRole('dialog', { name: 'Edit Fields' });
		const cancelBtn = within(dialog).getByRole('button', { name: 'Cancel' });

		await userEvent.click(cancelBtn);

		await expect(dialog).not.toBeVisible();

		await waitFor(() => expect(actionsBtn).toHaveFocus());
	}
};

export const WithoutActions: Story = {
	args: { hideActions: true }
};

export const Empty: Story = {
	args: {
		withData: false
	}
};
