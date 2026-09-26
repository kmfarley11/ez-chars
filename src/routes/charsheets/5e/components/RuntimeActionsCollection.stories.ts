import type { Meta, StoryObj } from '@storybook/sveltekit';
import { fn } from 'storybook/test';
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
	args: { rows: fiveActionRows }
};

export const SixActionsDesktopInlineScroll: Story = {};

export const SixActionsDesktopWheelPlaytest: Story = {
	args: { withScrollRunway: true }
};
