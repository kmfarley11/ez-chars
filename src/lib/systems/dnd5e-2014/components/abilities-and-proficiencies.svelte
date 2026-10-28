<script lang="ts">
	import type { JSONPatchDocument } from 'immutable-json-patch';
	import GridContentCard from '$lib/ui/organisms/grid-content-card.svelte';
	import PanelSurface from '$lib/ui/molecules/panel-surface.svelte';
	import ResponsiveGrid from '$lib/ui/molecules/responsive-grid.svelte';
	import type { CollectionPrioritySave } from '$lib/ui/molecules/collection-priority';
	import type {
		GridAnnotationEditorConfig,
		GridContentData,
		GridContentPatch
	} from '$lib/utils/gridContentTypes';
	import type { CharacterDocument5e2014 } from '../../../../schema/index';
	import type { AbilityRuntimeColumn } from '$lib/systems/dnd5e-2014/sheet-projections';
	import type { SheetEditIntent } from '$lib/systems/dnd5e-2014/editing/sheet-edit-intents';
	import SupportingCollectionCard from '$lib/systems/dnd5e-2014/components/supporting-collection-card.svelte';
	import type { SupportingCollectionRow } from '$lib/systems/dnd5e-2014/components/supporting-collection-rows';

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
			<p class="theme-text-muted text-center text-xs">P: Proficient · E: Expertise</p>
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
