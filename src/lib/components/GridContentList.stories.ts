import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import GridContentListStoryHarness from './GridContentListStoryHarness.svelte';
import { projectInventoryDenseCollectionRows } from '$lib/dnd5e2014/denseCollectionRows';
import { saturatedCharacter5e2014 } from '../../fixtures/saturatedCharacter.5e2014';

const saturatedGearRows = projectInventoryDenseCollectionRows(
	saturatedCharacter5e2014.inventory,
	'other'
);

const getVisible = <T extends HTMLElement>(elements: Array<T>, description: string): T => {
	const visible = elements.find((element) => element.checkVisibility());
	if (!visible) throw new Error(`Expected a visible ${description}`);
	return visible;
};

const getVisibleResults = (canvasElement: HTMLElement) =>
	getVisible(
		within(canvasElement).getAllByRole('list', { name: 'Other Gear results' }),
		'Other Gear results list'
	);

const meta = {
	title: 'Molecules/GridContentList',
	component: GridContentListStoryHarness,
	args: {
		initialRows: saturatedGearRows,
		onRowSave: fn(),
		onAnnotationsSave: fn(),
		onBulkEdit: fn()
	},
	parameters: {
		docs: {
			description: {
				component:
					'Pre-integration dense-collection proof. Use docs/dense-collection-storybook-checklist.md for the required owner review before sheet propagation.'
			}
		}
	}
} satisfies Meta<typeof GridContentListStoryHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SaturatedGear: Story = {
	play: async ({ canvasElement }) => {
		const results = getVisibleResults(canvasElement);
		const viewport = results.parentElement;
		if (!viewport) throw new Error('Expected the bounded results viewport');
		await expect(results.scrollHeight).toBeGreaterThan(results.clientHeight);
		await expect(within(results).queryByText('Inventory')).not.toBeInTheDocument();

		await waitFor(() => {
			expect(viewport.querySelector('[data-scroll-affordance="more-below"]')).toBeVisible();
		});
		results.scrollTop = results.scrollHeight;
		results.dispatchEvent(new Event('scroll'));
		await expect(results.scrollTop).toBeGreaterThan(0);
		await waitFor(() => {
			expect(viewport.querySelector('[data-scroll-affordance="more-below"]')).toBeNull();
			expect(viewport.querySelector('[data-scroll-affordance="more-above"]')).toBeVisible();
		});
	}
};

export const Empty: Story = {
	args: { initialRows: [] },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			getVisible(canvas.getAllByText('No other gear yet.'), 'empty-state message')
		).toBeVisible();
		await expect(getVisible(canvas.getAllByText('0 items'), 'empty count')).toBeVisible();
		await expect(canvas.getByRole('button', { name: 'Bulk Edit Other Gear' })).toBeVisible();
	}
};

export const FiveItemPhoneBoundary: Story = {
	args: { initialRows: saturatedGearRows.slice(0, 5) },
	parameters: { viewport: { defaultViewport: 'mobile1' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const preview = canvas.getByRole('list', { name: 'Other Gear preview' });
		await expect(within(preview).getAllByRole('listitem')).toHaveLength(5);
		await expect(within(preview).queryByText(/more items/)).not.toBeInTheDocument();
		await expect(canvas.getByRole('button', { name: 'Browse all 5 items' })).toBeVisible();
	}
};

export const PhonePreviewAndFocusedBrowse: Story = {
	parameters: { viewport: { defaultViewport: 'mobile1' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const preview = canvas.getByRole('list', { name: 'Other Gear preview' });
		await expect(within(preview).getAllByRole('listitem')).toHaveLength(5);
		await expect(within(preview).queryByText(/more items/)).not.toBeInTheDocument();
		await expect(within(preview).queryByText('Campaign gear 6')).not.toBeInTheDocument();

		const browse = canvas.getByRole('button', { name: 'Browse all 32 items' });
		await userEvent.click(browse);
		const dialog = within(canvasElement.ownerDocument.body).getByRole('dialog', {
			name: 'Other Gear'
		});
		await expect(dialog).toBeVisible();
		await expect(
			within(dialog).getByRole('searchbox', { name: 'Search Other Gear' })
		).toBeVisible();
		await expect(getComputedStyle(canvasElement.ownerDocument.body).overflow).toBe('hidden');
		const dialogViewport = dialog.querySelector<HTMLElement>(
			'[data-scroll-viewport="dialog-content"]'
		);
		if (!dialogViewport) throw new Error('Expected the focused dialog scroll viewport');
		const dialogLayout = dialog.firstElementChild as HTMLElement | null;
		if (!dialogLayout) throw new Error('Expected the focused dialog layout');
		if (dialogViewport.scrollHeight <= dialogViewport.clientHeight) {
			throw new Error(
				JSON.stringify({
					dialogHeight: dialog.clientHeight,
					layoutHeight: dialogLayout.clientHeight,
					layoutCssHeight: getComputedStyle(dialogLayout).height,
					viewportHeight: dialogViewport.clientHeight,
					viewportScrollHeight: dialogViewport.scrollHeight
				})
			);
		}
		await expect(dialogViewport.scrollHeight).toBeGreaterThan(dialogViewport.clientHeight);
		await waitFor(() => {
			expect(dialog.querySelector('[data-scroll-affordance="more-below"]')).toBeVisible();
		});

		await userEvent.type(within(dialog).getByRole('searchbox'), 'xyz dungeon');
		await expect(within(dialog).getByText('Random rock')).toBeVisible();
		await expect(within(dialog).getByText('1 of 32 items')).toBeVisible();
		const closeButton = within(dialog).getByRole('button', { name: 'Close Other Gear' });
		const dialogFooter = closeButton.parentElement;
		if (!dialogFooter) throw new Error('Expected the focused dialog footer');
		await expect(parseFloat(getComputedStyle(dialogFooter).borderTopWidth)).toBeGreaterThan(0);
		await expect(parseFloat(getComputedStyle(dialogFooter).paddingTop)).toBeGreaterThan(0);
		await userEvent.click(closeButton);
		await expect(browse).toHaveFocus();
	}
};

export const NoMatches: Story = {
	args: { initialQuery: 'portable hole' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(getVisible(canvas.getAllByText('0 of 32 items'), 'filtered count')).toBeVisible();
		await expect(
			getVisible(canvas.getAllByText(/No other gear match “portable hole”/), 'no-match message')
		).toBeVisible();
		await expect(canvas.getByRole('button', { name: 'Clear search' })).toBeVisible();
		await userEvent.click(
			getVisible(canvas.getAllByRole('button', { name: 'Clear' }), 'inline Clear')
		);
		await expect(
			getVisible(
				canvas.getAllByText('32 items', { selector: '[role="status"]' }),
				'cleared result count'
			)
		).toBeVisible();
	}
};

export const DuplicateNameEditSaved: Story = {
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.type(canvas.getByRole('searchbox'), 'rope');
		const results = within(getVisibleResults(canvasElement));
		const rowMenus = results.getAllByRole('button', { name: /Row actions for Rope/ });
		await expect(rowMenus).toHaveLength(2);
		await userEvent.click(rowMenus[1]);
		await userEvent.click(
			within(canvasElement.ownerDocument.body).getByRole('button', { name: 'Edit' })
		);

		const editDialog = within(canvasElement.ownerDocument.body).getByRole('dialog', {
			name: 'Edit Rope'
		});
		const nameInput = within(editDialog).getByRole('textbox', { name: 'Name' });
		await userEvent.clear(nameInput);
		await userEvent.type(nameInput, 'Climbing rope');
		await userEvent.click(within(editDialog).getByRole('button', { name: 'Save' }));

		await expect(canvas.getByText('Saved Climbing rope.')).toBeVisible();
		await expect(args.onRowSave).toHaveBeenCalledWith(
			expect.objectContaining({ key: 'item:saturated-gear-9', label: 'Climbing rope' })
		);
		await expect(rowMenus[1]).toHaveFocus();
	}
};

export const FocusedEditCancelled: Story = {
	args: { initialRows: saturatedGearRows.slice(0, 3) },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const rowMenu = within(getVisibleResults(canvasElement)).getByRole('button', {
			name: /Row actions for Random rock/
		});
		await userEvent.click(rowMenu);
		await userEvent.click(
			within(canvasElement.ownerDocument.body).getByRole('button', { name: 'Edit' })
		);
		const editDialog = within(canvasElement.ownerDocument.body).getByRole('dialog', {
			name: 'Edit Random rock'
		});
		const nameInput = within(editDialog).getByRole('textbox', { name: 'Name' });
		await userEvent.clear(nameInput);
		await userEvent.type(nameInput, 'Discarded edit');
		await userEvent.click(within(editDialog).getByRole('button', { name: 'Cancel' }));

		await expect(args.onRowSave).not.toHaveBeenCalled();
		await expect(within(getVisibleResults(canvasElement)).getByText('Random rock')).toBeVisible();
		await expect(rowMenu).toHaveFocus();
	}
};

export const AnnotationSaved: Story = {
	args: { initialRows: [saturatedGearRows[2]] },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const results = within(getVisibleResults(canvasElement));
		const rowMenu = results.getByRole('button', { name: /Row actions for Random rock/ });
		await expect(results.getByText('1 note')).toBeVisible();
		await userEvent.click(rowMenu);
		await userEvent.click(
			within(canvasElement.ownerDocument.body).getByRole('button', { name: 'Notes' })
		);

		const notesDialog = within(canvasElement.ownerDocument.body).getByRole('dialog', {
			name: 'Notes'
		});
		await userEvent.click(within(notesDialog).getByRole('button', { name: 'Edit' }));
		await userEvent.click(within(notesDialog).getByText('Annotations (1)'));
		await userEvent.click(within(notesDialog).getByText('Annotation 1'));
		const textInput = within(notesDialog).getByRole('textbox', { name: 'Text (optional)' });
		await userEvent.clear(textInput);
		await userEvent.type(textInput, 'Confirmed magical after the sage visit.');
		await userEvent.click(within(notesDialog).getByRole('button', { name: 'Save' }));
		await userEvent.click(within(notesDialog).getByRole('button', { name: 'Close' }));

		await expect(args.onAnnotationsSave).toHaveBeenCalledWith(
			expect.objectContaining({
				key: 'item:saturated-gear-3',
				annotations: [expect.objectContaining({ text: 'Confirmed magical after the sage visit.' })]
			})
		);
		await expect(rowMenu).toHaveFocus();
	}
};

export const AnnotationCancelled: Story = {
	args: { initialRows: [saturatedGearRows[2]] },
	play: async ({ canvasElement, args }) => {
		const results = within(getVisibleResults(canvasElement));
		const rowMenu = results.getByRole('button', { name: /Row actions for Random rock/ });
		await userEvent.click(rowMenu);
		await userEvent.click(
			within(canvasElement.ownerDocument.body).getByRole('button', { name: 'Notes' })
		);

		const notesDialog = within(canvasElement.ownerDocument.body).getByRole('dialog', {
			name: 'Notes'
		});
		await userEvent.click(within(notesDialog).getByRole('button', { name: 'Edit' }));
		await userEvent.click(within(notesDialog).getByText('Annotations (1)'));
		await userEvent.click(within(notesDialog).getByText('Annotation 1'));
		const textInput = within(notesDialog).getByRole('textbox', { name: 'Text (optional)' });
		await userEvent.clear(textInput);
		await userEvent.type(textInput, 'This change should be discarded.');
		await userEvent.click(within(notesDialog).getByRole('button', { name: 'Cancel' }));

		await expect(args.onAnnotationsSave).not.toHaveBeenCalled();
		await expect(
			within(notesDialog).getByText('Ask the sage whether this is actually magical.')
		).toBeVisible();
		await userEvent.click(within(notesDialog).getByRole('button', { name: 'Close' }));
		await expect(rowMenu).toHaveFocus();
	}
};

export const LongTextPhoneTruncation: Story = {
	args: { initialRows: [saturatedGearRows[2]] },
	parameters: { viewport: { defaultViewport: 'mobile1' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const detail = getVisible(
			canvas
				.getAllByText(/Wrapped in oilcloth/)
				.filter((element) => element.classList.contains('truncate')),
			'compact truncated detail'
		);
		await expect(detail).toBeVisible();
		await expect(detail).toHaveClass('truncate');
		await expect(detail).toHaveTextContent(/flooded lower halls of the XYZ dungeon/);
	}
};

export const BulkEditRemainsDistinct: Story = {
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole('button', { name: 'Bulk Edit Other Gear' }));
		await expect(canvas.getByText('Bulk Edit requested.')).toBeVisible();
		await expect(args.onBulkEdit).toHaveBeenCalledOnce();
	}
};
