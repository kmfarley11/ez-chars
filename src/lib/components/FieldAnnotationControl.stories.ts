import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import FieldAnnotationControlStory from './FieldAnnotationControlStory.svelte';

const meta = {
	title: 'Molecules/FieldAnnotationControl',
	component: FieldAnnotationControlStory,
	args: {
		withAnnotations: false,
		canEdit: true
	}
} satisfies Meta<typeof FieldAnnotationControlStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithAnnotations: Story = {
	args: { withAnnotations: true },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole('button', { name: /View annotations/i }));
		const dialog = within(document.body).getByRole('dialog', { name: 'Test Field Annotations' });
		await expect(within(dialog).getByText('A basic note on this field')).toBeVisible();
	}
};

export const DraftCancelButton: Story = {
	args: { withAnnotations: true },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const notesBtn = canvas.getByRole('button', { name: /View annotations/i });
		await userEvent.click(notesBtn);

		const dialog = within(document.body).getByRole('dialog', { name: 'Test Field Annotations' });
		const editBtn = within(dialog).getByRole('button', { name: 'Edit' });
		await userEvent.click(editBtn);

		const cancelBtn = within(dialog).getByRole('button', { name: 'Cancel' });
		await userEvent.click(cancelBtn);

		// Cancel exits the draft while preserving the read-only dialog.
		await expect(dialog).toBeVisible();
		await expect(within(dialog).getByRole('button', { name: 'Edit' })).toBeVisible();
	}
};

export const AddSaveAndFocusReturn: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const notesButton = canvas.getByRole('button', { name: /Add annotations/i });
		await userEvent.click(notesButton);
		const dialog = within(document.body).getByRole('dialog', { name: 'Test Field Annotations' });
		await userEvent.click(within(dialog).getByRole('button', { name: 'Add' }));
		await userEvent.click(within(dialog).getByText('Annotations (0)'));
		await userEvent.click(within(dialog).getByRole('button', { name: 'Add' }));
		const name = within(dialog)
			.getByText('Name (optional)')
			.closest('label')
			?.querySelector('input');
		if (!(name instanceof HTMLInputElement)) throw new Error('Expected annotation name input.');
		await userEvent.type(name, 'Rules note');
		const text = within(dialog)
			.getByText('Text (optional)')
			.closest('label')
			?.querySelector('textarea');
		if (!(text instanceof HTMLTextAreaElement)) throw new Error('Expected annotation text input.');
		await userEvent.type(text, 'Check the local rules.');
		await userEvent.click(within(dialog).getByLabelText('Local rules PDF'));
		await userEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
		await expect(within(dialog).getByText('Check the local rules.')).toBeVisible();
		await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
		await waitFor(() => expect(notesButton).toHaveFocus());
	}
};

export const RemoveExisting: Story = {
	args: { withAnnotations: true },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole('button', { name: /View annotations/i }));
		const dialog = within(document.body).getByRole('dialog', { name: 'Test Field Annotations' });
		await userEvent.click(within(dialog).getByRole('button', { name: 'Edit' }));
		await userEvent.click(within(dialog).getByText('Annotations (2)'));
		await userEvent.click(within(dialog).getByText('Annotation 1'));
		await userEvent.click(within(dialog).getAllByRole('button', { name: 'Remove' })[0]);
		await userEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
		await expect(within(dialog).queryByText('A basic note on this field')).not.toBeInTheDocument();
	}
};

export const ReadOnly: Story = {
	args: { withAnnotations: true, canEdit: false }
};
