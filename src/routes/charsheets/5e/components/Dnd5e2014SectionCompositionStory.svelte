<script lang="ts">
	import { immutableJSONPatch, type JSONPatchDocument } from 'immutable-json-patch';
	import SmallEditScope from '$components/SmallEditScope.svelte';
	import type { SmallEditEntryStyle } from '$components/smallEditContext';
	import {
		create5eSmallGridModel,
		create5eSmallRecordModel,
		shouldTarget5eSmallGrid
	} from '../smallEditAdapters';
	import type { CollectionPrioritySaveResult } from '$components/collectionPriority';
	import { projectPrioritizedSpellDenseCollectionRows } from '$lib/dnd5e2014/denseCollectionRows';
	import { applyGridPatches } from '$utils/characterGridHelpers';
	import type { GridContentPatch } from '$utils/gridContentTypes';
	import { saturatedCharacter5e2014 } from '../../../../fixtures/saturatedCharacter.5e2014';
	import {
		parse5e2014CharacterDocument,
		type CharacterDocument5e2014,
		type CollectionPriorityKind5e2014
	} from '../../../../schema';
	import { decode5eGridPatches } from '../sheetEditDecoder';
	import { project5eSheet } from '../sheetProjections';
	import { reduce5eSheetEditIntents, type SheetEditIntent } from '../sheetEditIntents';
	import Dnd5e2014AbilitiesAndProficiencies from './Dnd5e2014AbilitiesAndProficiencies.svelte';
	import Dnd5e2014QuickReference from './Dnd5e2014QuickReference.svelte';
	import Dnd5e2014Spellcasting from './Dnd5e2014Spellcasting.svelte';
	import { projectPrioritizedSupportingCollectionRows } from './supportingCollectionRows';

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
		if (patch.length === 0) return;
		const patchBase = patch.some((operation) =>
			operation.path.startsWith('/systemData/combat/deathSaves/')
		)
			? parse5e2014CharacterDocument(
					immutableJSONPatch(character, [
						{
							op: 'add',
							path: '/systemData/combat/deathSaves',
							value: character.systemData.combat.deathSaves ?? {
								successes: 0,
								failures: 0
							}
						}
					])
				)
			: character;
		character = parse5e2014CharacterDocument(immutableJSONPatch(patchBase, patch));
	};

	const applyIntents = (intents: ReadonlyArray<SheetEditIntent>): boolean => {
		if (rejectMutations) return false;
		const result = reduce5eSheetEditIntents(character, intents);
		if (!result.ok) return false;
		character = result.character;
		return true;
	};

	const applyPatches = (patches: Array<GridContentPatch>): boolean => {
		if (rejectMutations) return false;
		const decoded = decode5eGridPatches(patches);
		if (!decoded.ok) return false;
		const candidate = applyGridPatches(character, decoded.edits.canonicalPatches);
		const result = reduce5eSheetEditIntents(candidate, decoded.edits.intents);
		if (!result.ok) return false;
		character = result.character;
		return true;
	};

	const savePins = (
		collection: CollectionPriorityKind5e2014,
		identities: ReadonlyArray<string>
	): CollectionPrioritySaveResult =>
		applyIntents([{ type: 'replace-collection-pins', collection, identities: [...identities] }])
			? { ok: true }
			: { ok: false, message: 'Pins could not be saved.' };
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
			<Dnd5e2014QuickReference
				liveData={projection.quickRefLiveData}
				referenceData={projection.quickRefReferenceData}
				annotationEditorConfig={projection.annotationEditorConfig}
				onFieldSavePatch={applyCharacterJsonPatch}
				onSavePatches={applyPatches}
			/>
		{:else if section === 'abilities-proficiencies'}
			<Dnd5e2014AbilitiesAndProficiencies
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
			<Dnd5e2014Spellcasting
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
