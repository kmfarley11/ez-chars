<script lang="ts">
	import GridContentEditDialog from '$components/GridContentEditDialog.svelte';
	import GridContentNotesDialog from '$components/GridContentNotesDialog.svelte';
	import type {
		GridAnnotationEditorConfig,
		GridContentData,
		GridContentPatch
	} from '$utils/gridContentTypes';
	import type { CollectionPrioritySave } from '$components/collectionPriority';
	import { compare5e2014PriorityLabels } from '$lib/dnd5e2014/collectionPriority';
	import SupportingCollectionView from './SupportingCollectionView.svelte';
	import type { SupportingCollectionRow } from './supportingCollectionRows';

	interface Props {
		title: string;
		rows: ReadonlyArray<SupportingCollectionRow>;
		data: GridContentData;
		query?: string;
		annotationEditorConfig?: GridAnnotationEditorConfig;
		// eslint-disable-next-line no-unused-vars
		handleEditSavePatches: (_patches: Array<GridContentPatch>) => void;
		onSavePins?: CollectionPrioritySave;
	}

	let {
		title,
		rows,
		data,
		query = $bindable(''),
		annotationEditorConfig = undefined,
		handleEditSavePatches,
		onSavePins = undefined
	}: Props = $props();

	let isEditDialogOpen = $state(false);
	let isNotesDialogOpen = $state(false);
	let cardActionsTriggerEl = $state<HTMLButtonElement>();
	let focusedCardActionsTriggerEl = $state<HTMLButtonElement>();

	const restoreCardActionsFocus = () => {
		const target = focusedCardActionsTriggerEl?.isConnected
			? focusedCardActionsTriggerEl
			: cardActionsTriggerEl;
		target?.focus();
	};
</script>

<SupportingCollectionView
	{title}
	{rows}
	bind:query
	onEdit={() => (isEditDialogOpen = true)}
	onNotes={() => (isNotesDialogOpen = true)}
	{onSavePins}
	comparePriorityLabels={onSavePins ? compare5e2014PriorityLabels : undefined}
	bind:cardActionsTriggerEl
	bind:focusedCardActionsTriggerEl
/>

<GridContentEditDialog
	bind:open={isEditDialogOpen}
	{data}
	{handleEditSavePatches}
	onClosed={restoreCardActionsFocus}
/>

<GridContentNotesDialog
	bind:open={isNotesDialogOpen}
	{data}
	{annotationEditorConfig}
	{handleEditSavePatches}
	onClosed={restoreCardActionsFocus}
/>
