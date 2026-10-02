<script lang="ts">
	import type { JSONPatchDocument } from 'immutable-json-patch';
	import GridContentCard from '$components/GridContentCard.svelte';
	import PanelSurface from '$components/PanelSurface.svelte';
	import ResponsiveGrid from '$components/ResponsiveGrid.svelte';
	import type { CollectionPrioritySave } from '$components/collectionPriority';
	import type {
		GridAnnotationEditorConfig,
		GridContentData,
		GridContentPatch
	} from '$utils/gridContentTypes';
	import type { CharacterDocument5e2014 } from '../../../../schema';
	import type { AbilityRuntimeColumn } from '../sheetProjections';
	import type { SheetEditIntent } from '../sheetEditIntents';
	import SupportingCollectionCard from './SupportingCollectionCard.svelte';
	import type { SupportingCollectionRow } from './supportingCollectionRows';

	interface Props {
		character: CharacterDocument5e2014;
		proficiencyBonusData: GridContentData;
		abilityColumns: Array<AbilityRuntimeColumn>;
		languageRows: ReadonlyArray<SupportingCollectionRow>;
		toolRows: ReadonlyArray<SupportingCollectionRow>;
		annotationEditorConfig?: GridAnnotationEditorConfig;
		languageQuery?: string;
		toolQuery?: string;
		// eslint-disable-next-line no-unused-vars
		onFieldSavePatch?: (patch: JSONPatchDocument) => void;
		// eslint-disable-next-line no-unused-vars
		onSavePatches?: (patches: Array<GridContentPatch>) => boolean | void;
		// eslint-disable-next-line no-unused-vars
		onIntents: (intents: ReadonlyArray<SheetEditIntent>) => boolean | void;
		onSaveLanguagePins?: CollectionPrioritySave;
		onSaveToolPins?: CollectionPrioritySave;
	}

	let {
		character,
		proficiencyBonusData,
		abilityColumns,
		languageRows,
		toolRows,
		annotationEditorConfig = undefined,
		languageQuery = $bindable(''),
		toolQuery = $bindable(''),
		onFieldSavePatch = undefined,
		onSavePatches = undefined,
		onIntents,
		onSaveLanguagePins = undefined,
		onSaveToolPins = undefined
	}: Props = $props();
</script>

<div class="space-y-3">
	<div class="w-full">
		<PanelSurface>
			<GridContentCard
				handleFieldSavePatch={onFieldSavePatch}
				handleEditSavePatches={onSavePatches}
				{annotationEditorConfig}
				displayMaxCols={1}
				displayAlign="center"
				hideActions={true}
				data={proficiencyBonusData}
			/>
		</PanelSurface>
	</div>

	<ResponsiveGrid cols={1} colsMd={2} colsLg={3} classes="gap-3">
		{#each abilityColumns as column (column.key)}
			<PanelSurface>
				<GridContentCard
					detailTitle={`${column.shortLabel} ability and skills`}
					handleFieldSavePatch={onFieldSavePatch}
					handleEditSavePatches={onSavePatches}
					{annotationEditorConfig}
					displayMaxCols={1}
					data={column.data}
				/>
			</PanelSurface>
		{/each}
	</ResponsiveGrid>

	<ResponsiveGrid cols={1} colsMd={2} classes="gap-3">
		<section aria-label="Prof. Languages" class="grid">
			<PanelSurface>
				<SupportingCollectionCard
					title="Prof. Languages"
					kind="languages"
					rows={languageRows}
					{character}
					{annotationEditorConfig}
					{onIntents}
					bind:query={languageQuery}
					onSavePins={onSaveLanguagePins}
				/>
			</PanelSurface>
		</section>
		<section aria-label="Prof. Tools" class="grid">
			<PanelSurface>
				<SupportingCollectionCard
					title="Prof. Tools"
					kind="tools"
					rows={toolRows}
					{character}
					{annotationEditorConfig}
					{onIntents}
					bind:query={toolQuery}
					onSavePins={onSaveToolPins}
				/>
			</PanelSurface>
		</section>
	</ResponsiveGrid>
</div>
