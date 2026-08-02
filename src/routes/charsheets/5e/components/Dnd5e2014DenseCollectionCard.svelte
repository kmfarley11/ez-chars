<script lang="ts">
	import GridContentEditDialog from '$components/GridContentEditDialog.svelte';
	import GridContentList from '$components/GridContentList.svelte';
	import GridContentNotesDialog from '$components/GridContentNotesDialog.svelte';
	import type { GridContentListRow, GridContentListRowAction } from '$components/gridContentList';
	import type { Dnd5e2014DenseCollectionRow } from '$lib/dnd5e2014/denseCollectionRows';
	import type {
		GridAnnotationEditorConfig,
		GridContentData,
		GridContentPatch
	} from '$utils/gridContentTypes';
	import type { CharacterDocument5e2014 } from '../../../../schema';
	import {
		decodeDenseCollectionAnnotationsIntent,
		decodeDenseCollectionEditIntent,
		projectDenseCollectionEditData,
		projectDenseCollectionNotesData
	} from '../denseCollectionEditing';
	import type { SheetEditIntent } from '../sheetEditIntents';
	// eslint-disable-next-line no-unused-vars
	type IntentCallback = (...args: [SheetEditIntent]) => void;
	// eslint-disable-next-line no-unused-vars
	type BulkSaveCallback = (...args: [Array<GridContentPatch>]) => void;

	interface Props {
		title: string;
		rows: ReadonlyArray<Dnd5e2014DenseCollectionRow>;
		character: CharacterDocument5e2014;
		bulkEditData: GridContentData;
		annotationEditorConfig?: GridAnnotationEditorConfig;
		emptyText?: string;
		query?: string;
		onIntent: IntentCallback;
		onBulkSave: BulkSaveCallback;
	}

	let {
		title,
		rows,
		character,
		bulkEditData,
		annotationEditorConfig,
		emptyText = 'No items yet.',
		query = $bindable(''),
		onIntent,
		onBulkSave
	}: Props = $props();

	let selectedKey = $state<string | undefined>(undefined);
	let isEditDialogOpen = $state(false);
	let isNotesDialogOpen = $state(false);
	let isBulkDialogOpen = $state(false);
	let restoreRowFocus = $state<() => void>(() => {});
	let bulkTriggerEl = $state<HTMLButtonElement>();

	const selectedRow = $derived(rows.find((row) => row.key === selectedKey));
	const selectedEditData = $derived(projectDenseCollectionEditData(character, selectedRow));
	const selectedNotesData = $derived(projectDenseCollectionNotesData(character, selectedRow));

	const selectRow = (row: GridContentListRow, restoreFocus: () => void) => {
		const ownedRow = rows.find((candidate) => candidate.key === row.key);
		if (!ownedRow) return;
		selectedKey = ownedRow.key;
		restoreRowFocus = restoreFocus;
	};

	const requestEdit: GridContentListRowAction = (row, restoreFocus) => {
		selectRow(row, restoreFocus);
		isEditDialogOpen = true;
	};

	const requestNotes: GridContentListRowAction = (row, restoreFocus) => {
		selectRow(row, restoreFocus);
		isNotesDialogOpen = true;
	};

	const saveSelectedRow = (data: GridContentData) => {
		if (!selectedRow) return;
		const intent = decodeDenseCollectionEditIntent(selectedRow, data);
		if (intent) onIntent(intent);
	};

	const saveSelectedAnnotations = (patches: Array<GridContentPatch>) => {
		if (!selectedRow) return;
		const intent = decodeDenseCollectionAnnotationsIntent(selectedRow, patches);
		if (intent) onIntent(intent);
	};

	const requestBulkEdit = () => {
		isBulkDialogOpen = true;
	};

	const restoreBulkFocus = () => {
		bulkTriggerEl?.focus();
	};
</script>

<GridContentList
	{title}
	{rows}
	{emptyText}
	bind:query
	onEditRow={requestEdit}
	onNotesRow={requestNotes}
	onBulkEdit={requestBulkEdit}
	bind:bulkTriggerEl
/>

<GridContentEditDialog
	bind:open={isEditDialogOpen}
	data={selectedEditData}
	title={selectedRow ? `Edit ${selectedRow.label}` : 'Edit item'}
	handleEditSave={saveSelectedRow}
	onClosed={restoreRowFocus}
/>

<GridContentNotesDialog
	bind:open={isNotesDialogOpen}
	data={selectedNotesData}
	{annotationEditorConfig}
	handleEditSavePatches={saveSelectedAnnotations}
	onClosed={restoreRowFocus}
/>

<GridContentEditDialog
	bind:open={isBulkDialogOpen}
	data={bulkEditData}
	title={`Bulk Edit ${title}`}
	handleEditSavePatches={onBulkSave}
	onClosed={restoreBulkFocus}
/>
