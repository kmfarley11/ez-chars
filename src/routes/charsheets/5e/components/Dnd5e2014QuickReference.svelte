<script lang="ts">
	import type { JSONPatchDocument } from 'immutable-json-patch';
	import GridContentCard from '$components/GridContentCard.svelte';
	import PanelSurface from '$components/PanelSurface.svelte';
	import ResponsiveGrid from '$components/ResponsiveGrid.svelte';
	import type {
		GridAnnotationEditorConfig,
		GridContentData,
		GridContentPatch
	} from '$utils/gridContentTypes';

	interface Props {
		liveData: GridContentData;
		referenceData: GridContentData;
		annotationEditorConfig?: GridAnnotationEditorConfig;
		// eslint-disable-next-line no-unused-vars
		onFieldSavePatch?: (patch: JSONPatchDocument) => void;
		// eslint-disable-next-line no-unused-vars
		onSavePatches?: (patches: Array<GridContentPatch>) => boolean | void;
	}

	let {
		liveData,
		referenceData,
		annotationEditorConfig = undefined,
		onFieldSavePatch = undefined,
		onSavePatches = undefined
	}: Props = $props();
</script>

<ResponsiveGrid cols={1} colsMd={2} classes="gap-3">
	<PanelSurface>
		<section aria-label="Live state" class="space-y-2">
			<h3 class="text-sm font-semibold">Live state</h3>
			<GridContentCard
				handleFieldSavePatch={onFieldSavePatch}
				handleEditSavePatches={onSavePatches}
				{annotationEditorConfig}
				displayMaxCols={2}
				data={liveData}
			/>
		</section>
	</PanelSurface>
	<PanelSurface>
		<section aria-label="Reference stats" class="space-y-2">
			<h3 class="text-sm font-semibold">Reference stats</h3>
			<GridContentCard
				detailTitle="Reference stats"
				handleFieldSavePatch={onFieldSavePatch}
				handleEditSavePatches={onSavePatches}
				{annotationEditorConfig}
				displayMaxCols={2}
				displaySectionBreakBefore="speed"
				displaySectionBreakLabel="Speeds"
				data={referenceData}
			/>
		</section>
	</PanelSurface>
</ResponsiveGrid>
