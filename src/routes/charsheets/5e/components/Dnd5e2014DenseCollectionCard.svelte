<script lang="ts">
	import { tick } from 'svelte';
	import GridContentEditDialog from '$components/GridContentEditDialog.svelte';
	import GridContentList from '$components/GridContentList.svelte';
	import GridContentNotesDialog from '$components/GridContentNotesDialog.svelte';
	import ManagePinsDialog from '$components/ManagePinsDialog.svelte';
	import {
		GRID_CONTENT_LIST_PREVIEW_LIMIT,
		type GridContentListFocusRestore,
		type GridContentListRow,
		type GridContentListRowAction
	} from '$components/gridContentList';
	import type { Dnd5e2014DenseCollectionRow } from '$lib/dnd5e2014/denseCollectionRows';
	import type { CollectionPrioritySave } from '$components/collectionPriority';
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
		onSavePins?: CollectionPrioritySave;
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
		onBulkSave,
		onSavePins = undefined
	}: Props = $props();

	let selectedKey = $state<string | undefined>(undefined);
	let isEditDialogOpen = $state(false);
	let isNotesDialogOpen = $state(false);
	let isBulkDialogOpen = $state(false);
	let isManagePinsOpen = $state(false);
	let restoreRowFocus = $state<() => boolean>(() => false);
	let bulkTriggerEl = $state<HTMLButtonElement>();
	let managePinsTriggerEl = $state<HTMLButtonElement>();
	let priorityActionError = $state('');

	const selectedRow = $derived(rows.find((row) => row.key === selectedKey));
	const selectedEditData = $derived(projectDenseCollectionEditData(character, selectedRow));
	const selectedNotesData = $derived(projectDenseCollectionNotesData(character, selectedRow));

	const selectRow = (row: GridContentListRow, restoreFocus: GridContentListFocusRestore) => {
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

	const restorePriorityActionFocus = async (restoreFocus: GridContentListFocusRestore) => {
		await tick();
		requestAnimationFrame(() => {
			if (!restoreFocus()) managePinsTriggerEl?.focus();
		});
	};

	const requestTogglePin: GridContentListRowAction = async (row, restoreFocus) => {
		const ownedRow = rows.find((candidate) => candidate.key === row.key);
		if (!ownedRow || !onSavePins) return;

		priorityActionError = '';
		const nextPinnedIdentities = rows
			.filter((candidate) =>
				candidate.identity === ownedRow.identity ? !ownedRow.pinned : candidate.pinned
			)
			.map((candidate) => candidate.identity);

		try {
			const result = await onSavePins(nextPinnedIdentities);
			if (!result.ok) priorityActionError = result.message;
		} catch {
			priorityActionError = 'Pins could not be saved. Review the collection and try again.';
		}
		await restorePriorityActionFocus(restoreFocus);
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

	const requestManagePins = () => {
		priorityActionError = '';
		isManagePinsOpen = true;
	};

	const restoreManagePinsFocus = () => {
		isManagePinsOpen = false;
		managePinsTriggerEl?.focus();
	};
</script>

<GridContentList
	{title}
	{rows}
	{emptyText}
	bind:query
	onEditRow={requestEdit}
	onNotesRow={requestNotes}
	onTogglePinRow={onSavePins ? requestTogglePin : undefined}
	onBulkEdit={requestBulkEdit}
	onManagePins={onSavePins && rows.length > 0 ? requestManagePins : undefined}
	bind:bulkTriggerEl
	bind:managePinsTriggerEl
/>

{#if priorityActionError}
	<p class="theme-error mt-3 rounded-md border px-3 py-2 text-sm" role="alert">
		{priorityActionError}
	</p>
{/if}

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

{#if onSavePins && isManagePinsOpen}
	<ManagePinsDialog
		{title}
		{rows}
		bind:open={isManagePinsOpen}
		bind:query
		searchEnabled={rows.length > GRID_CONTENT_LIST_PREVIEW_LIMIT}
		onSave={onSavePins}
		onClosed={restoreManagePinsFocus}
	/>
{/if}
