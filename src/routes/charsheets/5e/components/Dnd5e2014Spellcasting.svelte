<script lang="ts">
	import type { JSONPatchDocument } from 'immutable-json-patch';
	import GridContentCard from '$components/GridContentCard.svelte';
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
</script>

<ResponsiveGrid cols={1} classes="gap-3">
	<section aria-label="Spellcasting summary">
		<PanelSurface>
			<GridContentCard
				detailTitle="Spellcasting summary"
				handleFieldSavePatch={onFieldSavePatch}
				handleEditSavePatches={onSavePatches}
				{annotationEditorConfig}
				displayAlign="center"
				data={summaryData}
			/>
		</PanelSurface>
	</section>
	<section aria-label="Spell slots">
		<PanelSurface>
			<GridContentCard
				detailTitle="Spell slots"
				handleFieldSavePatch={onFieldSavePatch}
				handleEditSavePatches={onSavePatches}
				{annotationEditorConfig}
				displayAlign="center"
				data={slotData}
			/>
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
