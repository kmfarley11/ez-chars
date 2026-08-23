import type { Meta, StoryObj } from '@storybook/sveltekit';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { saturatedCharacter5e2014 } from '../../../../fixtures/saturatedCharacter.5e2014';
import type { CharacterDocument5e2014 } from '../../../../schema';
import RuntimeActionsCollectionStoryHarness from './RuntimeActionsCollectionStoryHarness.svelte';
import { projectRuntimeActionRows } from './runtimeActionRows';

const denseCharacter: CharacterDocument5e2014 = {
	...saturatedCharacter5e2014,
	systemData: {
		...saturatedCharacter5e2014.systemData,
		runtimeActions: [
			...saturatedCharacter5e2014.systemData.runtimeActions.map((action) =>
				action.id === 'saturated-linked-item-action'
					? { ...action, target: 'One creature' }
					: action
			),
			{
				id: 'saturated-linked-feature-action',
				name: 'Recover arcane power',
				timing: 'action',
				category: 'effect',
				target: 'Self',
				notes: 'Use during a short rest.',
				source: { kind: 'feature', id: 'saturated-class-feature-1' }
			}
		]
	}
};

const denseActionRows = projectRuntimeActionRows(
	denseCharacter.systemData.runtimeActions,
	denseCharacter
);
const fiveActionRows = denseActionRows.slice(0, 5);
const sixActionRows = [...denseActionRows.slice(0, 5), ...denseActionRows.slice(-1)];

const getVisible = <T extends HTMLElement>(elements: Array<T>, description: string): T => {
	const visible = elements.find((element) => element.checkVisibility());
	if (!visible) throw new Error(`Expected a visible ${description}`);
	return visible;
};

const getVisibleResults = (canvasElement: HTMLElement) =>
	getVisible(
		within(canvasElement).getAllByRole('list', { name: 'Runtime actions results' }),
		'Runtime actions results list'
	);

const meta = {
	title: 'Organisms/RuntimeActionsCollection',
	component: RuntimeActionsCollectionStoryHarness,
	args: {
		rows: sixActionRows,
		onAdd: fn(),
		onEdit: fn(),
		onNotes: fn(),
		onNavigateToSource: fn(),
		onResyncAction: fn(),
		denseThreshold: 5,
		withScrollRunway: false,
		requiresPhoneViewport: false
	},
	parameters: {
		docs: {
			description: {
				component:
					'BL-076 isolated proof. Review the five-item Runtime Action boundary, desktop inline scroll ownership, phone focused dialog, search scope, and preserved commands before route integration.'
			}
		}
	}
} satisfies Meta<typeof RuntimeActionsCollectionStoryHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FiveActionBoundary: Story = {
	args: { rows: fiveActionRows },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.queryByRole('searchbox')).not.toBeInTheDocument();
		await expect(canvas.queryByRole('button', { name: /Browse all/ })).not.toBeInTheDocument();
		await expect(within(getVisibleResults(canvasElement)).getAllByRole('listitem')).toHaveLength(5);
	}
};

export const SixActionsDesktopInlineScroll: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const search = canvas.getByRole('searchbox', { name: 'Search Runtime actions' });
		const viewport = canvas.getByRole('region', {
			name: 'Runtime actions scrollable results'
		});
		await expect(search).toBeVisible();
		await expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
		await waitFor(() => {
			expect(
				viewport.parentElement?.querySelector('[data-scroll-affordance="more-below"]')
			).toBeVisible();
		});

		await userEvent.type(search, 'wizard self effect');
		const results = getVisibleResults(canvasElement);
		await expect(within(results).getByText('Recover arcane power')).toBeVisible();
		await expect(within(results).getByText('Wizard')).toBeVisible();
		await expect(within(results).queryByText('Longsword attack')).not.toBeInTheDocument();
		await expect(canvas.getByText('1 of 6 items')).toBeVisible();
	}
};

export const SixActionsDesktopWheelPlaytest: Story = {
	args: { withScrollRunway: true }
};

export const SixActionsPhoneFocusedDialog: Story = {
	args: { requiresPhoneViewport: true },
	parameters: { viewport: { defaultViewport: 'mobile1' } },
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const preview = canvas.getByRole('list', { name: 'Runtime actions preview' });
		await expect(within(preview).getAllByRole('listitem')).toHaveLength(5);
		await expect(within(preview).queryByText('Recover arcane power')).not.toBeInTheDocument();

		const browse = canvas.getByRole('button', { name: 'Browse all 6 items' });
		await userEvent.click(browse);
		const dialog = within(canvasElement.ownerDocument.body).getByRole('dialog', {
			name: 'Runtime actions'
		});
		await expect(dialog).toBeVisible();
		await expect(within(dialog).getByRole('button', { name: 'Add action' })).toBeVisible();
		await expect(within(dialog).getByRole('button', { name: 'Card actions' })).toBeVisible();
		await expect(getComputedStyle(canvasElement.ownerDocument.body).overflow).toBe('hidden');

		await userEvent.type(within(dialog).getByRole('searchbox'), 'wizard self');
		await expect(within(dialog).getByText('Recover arcane power')).toBeVisible();
		await userEvent.click(
			within(dialog).getByRole('button', {
				name: 'Source actions for Recover arcane power'
			})
		);
		await userEvent.click(
			within(dialog).getByRole('button', { name: 'View Feature · Class feature 1' })
		);
		await expect(args.onNavigateToSource).toHaveBeenCalledWith({
			kind: 'feature',
			id: 'saturated-class-feature-1'
		});
		await expect(dialog).not.toBeVisible();
	}
};

export const SixActionsPhoneFocusedPlaytest: Story = {
	args: { requiresPhoneViewport: true },
	parameters: { viewport: { defaultViewport: 'mobile1' } }
};
