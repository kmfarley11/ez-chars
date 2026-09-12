<script lang="ts">
	import {
		createDnd5e2014SheetLandmarkCoordinator,
		setDnd5e2014SheetLandmarkCoordinator
	} from '../sheetLandmarkNavigation';
	import { dnd5e2014SheetLandmarks, type Dnd5e2014SheetLandmark } from '../sheetLandmarks';
	import Dnd5e2014NavigablePanel from './Dnd5e2014NavigablePanel.svelte';
	import Dnd5e2014NavigableRegion from './Dnd5e2014NavigableRegion.svelte';
	import Dnd5e2014SheetNavigation from './Dnd5e2014SheetNavigation.svelte';

	interface Props {
		compactPresentation?: 'rail' | 'drawer';
		wideBreakpoint?: number;
	}

	let { compactPresentation = 'rail', wideBreakpoint = 1280 }: Props = $props();
	let viewportWidth = $state(0);
	let sheetWorkspaceWidth = $state(0);
	const coordinator = createDnd5e2014SheetLandmarkCoordinator();
	setDnd5e2014SheetLandmarkCoordinator(coordinator);
	const landmarkById = new Map(
		dnd5e2014SheetLandmarks.map((landmark) => [landmark.fragmentId, landmark])
	);

	const landmark = (fragmentId: string): Dnd5e2014SheetLandmark => {
		const result = landmarkById.get(fragmentId);
		if (!result) throw new Error(`Missing proof landmark: ${fragmentId}`);
		return result;
	};
</script>

<svelte:window bind:innerWidth={viewportWidth} />

{#snippet proofContent(summary: string, labels: Array<string>)}
	<div class="grid gap-2 p-1 sm:grid-cols-2 lg:grid-cols-3">
		{#each labels as label (label)}
			<div class="theme-muted-surface min-h-20 rounded-md border p-3">
				<p class="font-semibold">{label}</p>
				<p class="theme-text-muted mt-1 text-sm">{summary}</p>
			</div>
		{/each}
	</div>
{/snippet}

<div class="theme-page min-h-screen">
	<header class="theme-navbar border-b px-3 py-2 text-sm">
		<strong>BL-073 navigation proof</strong>
		<span class="ml-3">
			Viewport: {viewportWidth}px · usable sheet workspace: {Math.round(sheetWorkspaceWidth)}px
		</span>
	</header>
	<div class="flex items-start gap-2 py-2 pr-2">
		<Dnd5e2014SheetNavigation {compactPresentation} {wideBreakpoint} />
		<main
			bind:clientWidth={sheetWorkspaceWidth}
			class="flex min-w-0 flex-1 flex-col gap-3"
			aria-label="Representative 2014 character sheet"
		>
			<Dnd5e2014NavigableRegion landmark={landmark('sheet-overview-heading')}>
				<Dnd5e2014NavigablePanel landmark={landmark('sheet-meta-heading')}>
					{@render proofContent('Character identity and table-facing context.', [
						'Character name',
						'Class and level',
						'Ancestry and background'
					])}
				</Dnd5e2014NavigablePanel>
			</Dnd5e2014NavigableRegion>

			<Dnd5e2014NavigableRegion landmark={landmark('sheet-runtime-heading')} startsCollapsed={true}>
				<Dnd5e2014NavigablePanel landmark={landmark('sheet-quick-reference-heading')}>
					{@render proofContent('Frequently consulted defensive and movement values.', [
						'Armor class',
						'Hit points',
						'Speed'
					])}
				</Dnd5e2014NavigablePanel>
				<Dnd5e2014NavigablePanel landmark={landmark('sheet-actions-heading')}>
					{@render proofContent('Representative action-economy summaries.', [
						'Attack',
						'Bonus action',
						'Reaction'
					])}
				</Dnd5e2014NavigablePanel>
				<Dnd5e2014NavigablePanel landmark={landmark('sheet-abilities-proficiencies-heading')}>
					{@render proofContent('Ability modifiers, saves, skills, languages, and tools.', [
						'Strength',
						'Dexterity',
						'Proficiencies'
					])}
				</Dnd5e2014NavigablePanel>
				<Dnd5e2014NavigablePanel
					landmark={landmark('sheet-features-traits-heading')}
					startsCollapsed={true}
				>
					{@render proofContent('Identity-backed abilities and authored reminders.', [
						'Class features',
						'Ancestry features',
						'Traits'
					])}
				</Dnd5e2014NavigablePanel>
				<Dnd5e2014NavigablePanel landmark={landmark('sheet-spells-heading')} startsCollapsed={true}>
					{@render proofContent('Spellcasting summary and level-grouped collection.', [
						'Cantrips',
						'1st level',
						'3rd level'
					])}
				</Dnd5e2014NavigablePanel>
			</Dnd5e2014NavigableRegion>

			<Dnd5e2014NavigableRegion
				landmark={landmark('sheet-organizational-heading')}
				startsCollapsed={true}
			>
				<Dnd5e2014NavigablePanel landmark={landmark('sheet-inventory-heading')}>
					{@render proofContent('Equipment and carried-resource collections.', [
						'Weapons',
						'Armor & shields',
						'Other gear'
					])}
				</Dnd5e2014NavigablePanel>
				<Dnd5e2014NavigablePanel landmark={landmark('sheet-background-notes-heading')}>
					{@render proofContent('Roleplay context and flexible character-authored notes.', [
						'Background',
						'Personality',
						'Misc. notes'
					])}
				</Dnd5e2014NavigablePanel>
			</Dnd5e2014NavigableRegion>
		</main>
	</div>
</div>
