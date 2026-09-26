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
		'Use one row-level Pin or Unpin control and confirm the selected identity reorders without opening another surface.',
		"Confirm focus returns visibly to that record's priority control and no collection-level Manage Pins action competes with it."
	)
};

export const EightFeaturesDenseBoundary: Story = {
	parameters: manualReview(
		'Confirm the eighth row activates dense search and bounded/focused presentation.',
		'Enter a query, Pin or Unpin a visible record, and confirm the same query is retained.',
		'Using only Shift+Tab, Enter, and Tab, move between Search Features, Add, the row-level Pin/Unpin control, and the Detail control.',
		'Confirm the priority and detail controls have evident focus outlines and no redundant batch manager appears.',
		"Switch Storybook's viewport toolbar to a phone preset and confirm the compact preview shows seven rows plus Browse all 8 items.",
		'Open Browse all and confirm Add, row-level Pin/Unpin, Detail, and Close are comfortable touch targets with no horizontal scrolling or precision pointer required.'
	)
};

export const EighteenFeaturesSaturated: Story = {
	args: { rows: eighteenFeatureRows },
	parameters: manualReview(
		'Confirm ten pinned entries remain first and every remaining entry is reachable in the bounded list.',
		"Enter “feature summary 1”, change one visible record's Pin state, and confirm the query and filtered subset are retained.",
		'Clear the query and confirm the changed identity remains in its expected priority tier.'
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
		'Use Tab and Space to toggle one row-level Pin control and confirm focus returns to that record after reordering.',
		'Confirm the adjacent Detail action remains distinct from priority.'
	)
};

export const EmptyFeaturesPriority: Story = {
	args: { rows: emptyFeatureRows },
	parameters: manualReview(
		'Confirm the explicit empty state remains compact.',
		'Confirm direct Add remains available while record-level priority and detail actions are naturally absent.'
	)
};

export const DuplicateNamePriority: Story = {
	args: { rows: duplicateFeatureRows },
	parameters: manualReview(
		'Confirm the pinned Arcane Recall appears before its identically named unpinned peer.',
		"Use the authored detail to distinguish the two rows, then toggle only one duplicate's row-level priority control.",
		'Confirm the intended stable identity changes without affecting its identically named peer.'
	)
};

export const InvalidPinRetainsRows: Story = {
	args: {
		rows: eightFeatureRows,
		prioritySaveError:
			'One selected feature is no longer available. Review the draft and try again.'
	},
	parameters: manualReview(
		'Choose Pin or Unpin on a row and confirm the understandable validation message is announced without reordering the records.',
		'Confirm focus remains on the same row-level priority control.',
		'Choose another row-level priority action and confirm the stale message clears before the next result is reported.'
	)
};
