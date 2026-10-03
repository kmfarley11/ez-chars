import type { Meta, StoryObj } from '@storybook/sveltekit';
import { saturatedCharacter5e2014 } from '../../../../fixtures/saturatedCharacter.5e2014';
import type { CharacterDocument5e2014 } from '../../../../schema';
import RuntimeActionsCollectionStoryHarness from './RuntimeActionsCollectionStoryHarness.svelte';

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

const boundedCharacter = (count: number): CharacterDocument5e2014 => ({
	...denseCharacter,
	systemData: {
		...denseCharacter.systemData,
		runtimeActions: denseCharacter.systemData.runtimeActions
			.slice(0, count)
			.map((action, index) => ({
				...action,
				timing: (['action', 'bonusAction', 'reaction', 'action', 'reaction', 'action'] as const)[
					index
				],
				category: index === 0 ? undefined : action.category
			})),
		collectionPins: {
			...denseCharacter.systemData.collectionPins,
			runtimeActions: denseCharacter.systemData.runtimeActions
				.slice(0, 2)
				.map((action) => action.id)
		}
	}
});

const meta = {
	title: 'Organisms/RuntimeActionsCollection',
	component: RuntimeActionsCollectionStoryHarness,
	args: {
		initialCharacter: boundedCharacter(6),
		withScrollRunway: false,
		showTimingHeadings: true
	},
	parameters: {
		docs: {
			description: {
				component:
					'BL-078 production-backed proof: timing plus text, saved pins, independent detail edits, and filtered phone browsing. Toggle showTimingHeadings to compare scanning density.'
			}
		}
	}
} satisfies Meta<typeof RuntimeActionsCollectionStoryHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FiveActionBoundary: Story = {
	args: { initialCharacter: boundedCharacter(5) }
};

export const SixActionsDesktopInlineScroll: Story = {};

export const SixActionsDesktopWheelPlaytest: Story = {
	args: { withScrollRunway: true }
};
