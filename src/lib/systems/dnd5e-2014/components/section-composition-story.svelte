<script lang="ts">
	import { resolveAssetUrl } from '$lib/resources/asset-url';
	import { create5eAnnotationReferenceProvider } from '$lib/systems/dnd5e-2014/annotation-reference';
	import { setAnnotationReferenceProvider } from '$lib/resources/annotation-reference-context';
	setAnnotationReferenceProvider(
		create5eAnnotationReferenceProvider((path) => resolveAssetUrl(path))
	);
	import type { JSONPatchDocument } from 'immutable-json-patch';
	import { create5eSheetEditSession } from '$lib/systems/dnd5e-2014/editing/sheet-edit-session';
	import SmallEditScope from '$lib/ui/organisms/small-edit-scope.svelte';
	import type { SmallEditEntryStyle } from '$lib/ui/organisms/small-edit-context';
	import {
		create5eSmallGridModel,
		create5eSmallRecordModel,
		shouldTarget5eSmallGrid
	} from '$lib/systems/dnd5e-2014/editing/small-edit-adapters';
	import type { CollectionPrioritySaveResult } from '$lib/ui/molecules/collection-priority';
	import { projectPrioritizedSpellDenseCollectionRows } from '$lib/systems/dnd5e-2014/dense-collection-rows';
	import type { GridContentPatch } from '$lib/utils/gridContentTypes';
	import { saturatedCharacter5e2014 } from '../../../../fixtures/saturatedCharacter.5e2014';
	import {
		type CharacterDocument5e2014,
		type CollectionPriorityKind5e2014
	} from '../../../../schema/index';
	import { project5eSheet } from '$lib/systems/dnd5e-2014/sheet-projections';
	import type { SheetEditIntent } from '$lib/systems/dnd5e-2014/editing/sheet-edit-intents';
	import AbilitiesAndProficiencies from '$lib/systems/dnd5e-2014/components/abilities-and-proficiencies.svelte';
	import QuickReference from '$lib/ui/organisms/quick-reference.svelte';
	import Spellcasting from '$lib/systems/dnd5e-2014/components/spellcasting.svelte';
	import { projectPrioritizedSupportingCollectionRows } from '$lib/systems/dnd5e-2014/components/supporting-collection-rows';

	type Section = 'quick-reference' | 'abilities-proficiencies' | 'spellcasting';

	interface Props {
		section: Section;
		rejectMutations?: boolean;
		entryStyle?: SmallEditEntryStyle;
		readFirstSlots?: boolean;
	}

	let {
		section,
		rejectMutations = false,
		entryStyle = 'label',
		readFirstSlots = true
	}: Props = $props();
	let character = $state.raw<CharacterDocument5e2014>(structuredClone(saturatedCharacter5e2014));
	let languageQuery = $state('');
	let toolQuery = $state('');
	let spellQuery = $state('');
	const smallEditOwner = {
		read: () => character,
		write: (next: CharacterDocument5e2014) => {
			character = next;
		},
		reject: () => rejectMutations
	};

	const projection = $derived(project5eSheet(character));
	const supportingRows = $derived({
		languages: projectPrioritizedSupportingCollectionRows(character, 'languages'),
		tools: projectPrioritizedSupportingCollectionRows(character, 'tools')
	});
	const spellRows = $derived(
		projectPrioritizedSpellDenseCollectionRows(
			character.systemData.spellcasting?.spells ?? [],
			new Set(character.systemData.collectionPins?.spells ?? [])
		)
	);

	const applyCharacterJsonPatch = (patch: JSONPatchDocument) => {
		const result = edits.patch(patch);
		if (!result.ok) throw new Error(result.message);
	};
	const edits = create5eSheetEditSession(smallEditOwner);

	const applyIntents = (intents: ReadonlyArray<SheetEditIntent>): boolean => {
		return edits.intents(intents).ok;
	};

	const applyPatches = (patches: Array<GridContentPatch>): boolean => {
		return edits.grid(patches).ok;
	};

	const savePins = (
		collection: CollectionPriorityKind5e2014,
		identities: ReadonlyArray<string>
	): CollectionPrioritySaveResult => edits.pins(collection, identities);
</script>

<SmallEditScope
	enabled
	{entryStyle}
	canTarget={shouldTarget5eSmallGrid}
	buildGrid={(input) =>
		create5eSmallGridModel(smallEditOwner, input.data, input.title, input.annotationEditorConfig)}
	buildRecord={(key) =>
		create5eSmallRecordModel(smallEditOwner, key, projection.annotationEditorConfig)}
>
	<div class="p-3">
		<p class="theme-text-muted mb-3 text-sm">
			Open a field or group, save one edit, then cancel a different edit. Saved changes remain. Use
			the same sandbox at phone width. Collection Add remains one complete creation draft.
		</p>
		{#if section === 'quick-reference'}
			<QuickReference
				liveData={projection.quickRefLiveData}
				referenceData={projection.quickRefReferenceData}
				annotationEditorConfig={projection.annotationEditorConfig}
				onFieldSavePatch={applyCharacterJsonPatch}
				onSavePatches={applyPatches}
			/>
		{:else if section === 'abilities-proficiencies'}
			<AbilitiesAndProficiencies
				{character}
				proficiencyBonusData={projection.proficiencyBonusRuntimeData}
				abilityColumns={projection.abilityRuntimeColumns}
				languageRows={supportingRows.languages}
				toolRows={supportingRows.tools}
				annotationEditorConfig={projection.annotationEditorConfig}
				bind:languageQuery
				bind:toolQuery
				onFieldSavePatch={applyCharacterJsonPatch}
				onSavePatches={applyPatches}
				onIntents={applyIntents}
				onSaveLanguagePins={(identities) => savePins('languages', identities)}
				onSaveToolPins={(identities) => savePins('tools', identities)}
			/>
		{:else}
			<Spellcasting
				{readFirstSlots}
				{character}
				summaryData={projection.spellcastingRuntimeData}
				slotData={projection.spellSlotRuntimeData}
				{spellRows}
				annotationEditorConfig={projection.annotationEditorConfig}
				bind:query={spellQuery}
				onFieldSavePatch={applyCharacterJsonPatch}
				onSavePatches={applyPatches}
				onIntents={applyIntents}
				onSavePins={(identities) => savePins('spells', identities)}
			/>
		{/if}
	</div>
</SmallEditScope>
