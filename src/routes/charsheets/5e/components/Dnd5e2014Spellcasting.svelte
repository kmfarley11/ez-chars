<script lang="ts">
	import type { JSONPatchDocument } from 'immutable-json-patch';
	import GridContentCard from '$components/GridContentCard.svelte';
	import { getSmallEditAccess } from '$components/smallEditContext';
	import { isGridNestedFields } from '$utils/gridFieldGuards';
	const smallEdit = getSmallEditAccess();
	import PanelSurface from '$components/PanelSurface.svelte';
	import ResponsiveGrid from '$components/ResponsiveGrid.svelte';
	import type { CollectionPrioritySave } from '$components/collectionPriority';
	import type { Dnd5e2014DenseCollectionRow } from '$lib/dnd5e2014/denseCollectionRows';
	import type {
		GridAnnotationEditorConfig,
		GridContentData,
		GridContentPatch
	} from '$utils/gridContentTypes';
	import type { CharacterDocument5e2014 } from '../../../../schema';
	import type { SheetEditIntent } from '../sheetEditIntents';
	import Dnd5e2014DenseCollectionCard from './Dnd5e2014DenseCollectionCard.svelte';

	interface Props {
		readFirstSlots?: boolean;
		character: CharacterDocument5e2014;
		summaryData: GridContentData;
		slotData: GridContentData;
		spellRows: ReadonlyArray<Dnd5e2014DenseCollectionRow>;
		annotationEditorConfig?: GridAnnotationEditorConfig;
		query?: string;
		// eslint-disable-next-line no-unused-vars
		onFieldSavePatch?: (patch: JSONPatchDocument) => void;
		// eslint-disable-next-line no-unused-vars
		onSavePatches?: (patches: Array<GridContentPatch>) => boolean | void;
		// eslint-disable-next-line no-unused-vars
		onIntents: (intents: ReadonlyArray<SheetEditIntent>) => boolean | void;
		onSavePins?: CollectionPrioritySave;
	}

	let {
		readFirstSlots = false,
		character,
		summaryData,
		slotData,
		spellRows,
		annotationEditorConfig = undefined,
		query = $bindable(''),
		onFieldSavePatch = undefined,
		onSavePatches = undefined,
		onIntents,
		onSavePins = undefined
	}: Props = $props();
	const proofSummary = $derived(
		smallEdit?.enabled && isGridNestedFields(summaryData.spellcastingSummary?.value)
			? Object.fromEntries(
					Object.entries(summaryData.spellcastingSummary.value).map(([key, field]) => [
						key,
						{ ...field, label: undefined }
					])
				)
			: summaryData
	);
	const slotFields = (value: GridContentData[string]['value']): GridContentData =>
		isGridNestedFields(value)
			? Object.fromEntries(
					Object.entries(value).map(([key, field]) => [
						key,
						{
							...field,
							label: field.fieldName,
							interaction: { ...field.interaction, tier: 'read-first' as const }
						}
					])
				)
			: {};
</script>

<ResponsiveGrid cols={1} classes="gap-3">
	<section aria-label="Spellcasting summary">
		<PanelSurface>
			<GridContentCard
				detailTitle="Spellcasting summary"
				handleFieldSavePatch={onFieldSavePatch}
				handleEditSavePatches={onSavePatches}
				{annotationEditorConfig}
				displayAlign={smallEdit?.enabled ? 'left' : 'center'}
				inlineFieldControls={!smallEdit?.enabled}
				data={proofSummary}
			/>
		</PanelSurface>
	</section>
	<section aria-label="Spell slots">
		<PanelSurface>
			{#if smallEdit?.enabled && readFirstSlots}
				<ResponsiveGrid cols={1} colsMd={2} colsLg={3} classes="gap-2">
					{#each Object.entries(slotData) as [key, slot] (key)}
						<section
							class="theme-panel min-w-0 rounded-md border p-2"
							aria-label={`${slot.fieldName} spell slots`}
						>
							<GridContentCard
								detailTitle={`${slot.fieldName} spell slots`}
								data={{ [key]: { ...slot, value: slotFields(slot.value) } }}
								inlineFieldControls={false}
								displayMaxCols={1}
								{annotationEditorConfig}
								handleEditSavePatches={onSavePatches}
							/>
						</section>
					{/each}
				</ResponsiveGrid>
			{:else}
				<GridContentCard
					detailTitle="Spell slots"
					handleFieldSavePatch={onFieldSavePatch}
					handleEditSavePatches={onSavePatches}
					{annotationEditorConfig}
					displayAlign="center"
					data={slotData}
				/>
			{/if}
		</PanelSurface>
	</section>
	<section aria-label="Spells collection">
		<PanelSurface>
			<Dnd5e2014DenseCollectionCard
				title="Spells"
				rows={spellRows}
				{character}
				collection={{ kind: 'spell' }}
				bind:query
				{annotationEditorConfig}
				emptyText="No spells yet."
				{onIntents}
				{onSavePins}
			/>
		</PanelSurface>
	</section>
</ResponsiveGrid>
