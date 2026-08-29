import type { Meta, StoryObj } from '@storybook/sveltekit';
import { fn } from 'storybook/test';
import { create5e2014Character } from '../../../../schema';
import SupportingCollectionViewStoryHarness from './SupportingCollectionViewStoryHarness.svelte';
import { projectPrioritizedSupportingCollectionRows } from './supportingCollectionRows';

const createFeatureCharacter = (
	count: number,
	pinnedIdentities: Array<string> = ['proof-feature-1']
) =>
	create5e2014Character({
		features: Array.from({ length: count }, (_, index) => ({
			id: `proof-feature-${index + 1}`,
			name: index === count - 1 ? 'Planar Cartographer' : `Feature ${index + 1}`,
			summary:
				index === count - 1
					? 'Recognizes unstable portals and extraplanar landmarks.'
					: `Feature summary ${index + 1}.`
		})),
		systemData: {
			...(pinnedIdentities.length > 0 ? { collectionPins: { features: pinnedIdentities } } : {})
		}
	});

const sevenFeatureRows = projectPrioritizedSupportingCollectionRows(
	createFeatureCharacter(7),
	'features'
);
const eightFeatureRows = projectPrioritizedSupportingCollectionRows(
	createFeatureCharacter(8),
	'features'
);
const eighteenFeatureRows = projectPrioritizedSupportingCollectionRows(
	createFeatureCharacter(
		18,
		Array.from({ length: 10 }, (_, index) => `proof-feature-${index + 1}`)
	),
	'features'
);
const longFeatureName = 'CartographerOfTheInterplanarBoundaryWithoutAnyNaturalBreakOpportunities';
const longFeatureRows = eightFeatureRows.map((row, index) =>
	index === 0
		? {
				...row,
				label: longFeatureName,
				detail:
					'Remembers an exceptionally detailed route through unstable extraplanar terrain without shortening the authored note.'
			}
		: row
);
const languageRows = projectPrioritizedSupportingCollectionRows(
	create5e2014Character({
		systemData: {
			proficiencies: {
				languages: [
					{ id: 'language-common', name: 'Common', source: { kind: 'background' } },
					{ id: 'language-elvish', name: 'Elvish', source: { kind: 'ancestry' } },
					{ id: 'language-draconic', name: 'Draconic', source: { kind: 'class' } }
				],
				tools: []
			},
			collectionPins: { languages: ['language-elvish'] }
		}
	}),
	'languages'
);
const emptyFeatureRows = projectPrioritizedSupportingCollectionRows(
	createFeatureCharacter(0, []),
	'features'
);
const duplicateFeatureRows = projectPrioritizedSupportingCollectionRows(
	create5e2014Character({
		features: [
			{ id: 'duplicate-feature-a', name: 'Arcane Recall', summary: 'First authored record.' },
			{ id: 'duplicate-feature-b', name: 'Arcane Recall', summary: 'Second authored record.' },
			{ id: 'duplicate-feature-c', name: 'Battle Focus', summary: 'Distinct comparison row.' }
		],
		systemData: { collectionPins: { features: ['duplicate-feature-b'] } }
	}),
	'features'
);
const manualReview = (...steps: Array<string>) => ({
	docs: {
		description: {
			story: `**Verify manually:**\n\n${steps.map((step) => `- ${step}`).join('\n')}`
		}
	}
});

const meta = {
	title: 'Organisms/SupportingCollectionView',
	component: SupportingCollectionViewStoryHarness,
	args: {
		title: 'Features',
		rows: eightFeatureRows,
		onEdit: fn(),
		onNotes: fn(),
		denseThreshold: 7,
		withScrollRunway: false,
		constrainWidth: false,
		priorityProof: true,
		prioritySaveError: '',
		onPrioritySave: fn()
	},
	parameters: {
		docs: {
			description: {
				component:
					'BL-076 established the supporting-collection baseline. BL-075 adds priority pinning across all supporting collections to organize saturated character sheets.'
			}
		}
	}
} satisfies Meta<typeof SupportingCollectionViewStoryHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SevenFeatureBoundary: Story = {
	args: { rows: sevenFeatureRows },
	parameters: manualReview(
		'Confirm the seven compact rows render without a search control.',
		'Open Card actions → Manage Pins and confirm the short manager has no search field.',
		'Toggle a checkbox, Cancel, reopen, and confirm the draft was discarded.',
		'Repeat with Escape and confirm focus returns visibly to Card actions.'
	)
};

export const EightFeaturesDenseBoundary: Story = {
	parameters: manualReview(
		'Confirm the eighth row activates dense search and bounded/focused presentation.',
		'Enter a query, open Card actions → Manage Pins, and confirm the same query is retained.',
		'Using only Shift+Tab, Enter, and Tab, move from Search Features to Card actions, then through Edit, Notes, and Manage Pins.',
		'Tab through the manager to Save Pins; confirm both Card actions and Save Pins have evident focus outlines.',
		'Save one Pin change and confirm focus returns visibly to Card actions.',
		"Switch Storybook's viewport toolbar to a phone preset and confirm the compact preview shows seven rows plus Browse all 8 items.",
		'Open Browse all and Manage Pins; confirm checkbox rows, Cancel, and Save Pins are comfortable touch targets with no horizontal scrolling or precision pointer required.'
	)
};

export const EighteenFeaturesSaturated: Story = {
	args: { rows: eighteenFeatureRows },
	parameters: manualReview(
		'Confirm ten pinned entries remain first and every remaining entry is reachable in the bounded list.',
		'Enter “feature summary 1”, open Manage Pins, and confirm the query and filtered subset are retained.',
		'Change a visible Pin, clear the manager query, and confirm hidden draft state remains intact.'
	)
};

export const EighteenFeaturesPageScrollRunway: Story = {
	args: { rows: eighteenFeatureRows, withScrollRunway: true },
	parameters: manualReview(
		'Scroll until the collection is centered, then continue scrolling with the pointer inside the bounded results.',
		'Confirm the inner results move while more rows remain and page scrolling resumes at the collection boundary.',
		'Repeat after switching Storybook to a phone preset and confirm the same nested-scroll handoff remains usable.'
	)
};

export const LongFeatureContentAcrossViewports: Story = {
	args: { rows: longFeatureRows, constrainWidth: true },
	parameters: manualReview(
		'At desktop width, confirm the long row wraps without horizontal scrolling.',
		"Switch Storybook's viewport toolbar to a phone preset and confirm the compact preview truncates the long row and offers Browse all 8 items.",
		'Open Browse all and confirm the complete long row wraps without horizontal scrolling.'
	)
};

export const ShortLanguages: Story = {
	args: { title: 'Prof. Languages', rows: languageRows },
	parameters: manualReview(
		'Confirm Elvish shows the quiet pinned marker without changing the compact row grammar.',
		'Open Manage Pins and confirm all three Languages are available without a search field.',
		'Use Tab and Space to change the draft, save it, and confirm focus returns to Card actions.'
	)
};

export const EmptyFeaturesPriority: Story = {
	args: { rows: emptyFeatureRows },
	parameters: manualReview(
		'Confirm the explicit empty state remains compact.',
		'Open Card actions and confirm Edit and Notes remain available while Manage Pins is omitted.'
	)
};

export const DuplicateNamePriority: Story = {
	args: { rows: duplicateFeatureRows },
	parameters: manualReview(
		'Confirm the pinned Arcane Recall appears before its identically named unpinned peer.',
		'Open Manage Pins and use the authored detail to distinguish the two checkbox rows.',
		'Toggle only one duplicate, save, and confirm the intended identity changes.'
	)
};

export const InvalidSaveRetainsDialog: Story = {
	args: {
		rows: eightFeatureRows,
		prioritySaveError:
			'One selected feature is no longer available. Review the draft and try again.'
	},
	parameters: manualReview(
		'Open Manage Pins, change a checkbox, and choose Save Pins.',
		'Confirm the dialog remains open and the understandable validation message is announced.',
		'Change another checkbox and confirm the stale message clears before another save attempt.'
	)
};
