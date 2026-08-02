<script lang="ts">
	import { untrack } from 'svelte';
	import GridContentEditDialog from '$components/GridContentEditDialog.svelte';
	import GridContentList from '$components/GridContentList.svelte';
	import GridContentNotesDialog from '$components/GridContentNotesDialog.svelte';
	import type { GridContentListRow, GridContentListRowAction } from '$components/gridContentList';
	import type { GridContentData, GridContentPatch } from '$utils/gridContentTypes';
	// eslint-disable-next-line no-unused-vars
	type RowUpdateCallback = (...args: [GridContentListRow]) => void;

	interface Props {
		initialRows: ReadonlyArray<GridContentListRow>;
		initialQuery?: string;
		onRowSave?: RowUpdateCallback;
		onAnnotationsSave?: RowUpdateCallback;
		onBulkEdit?: () => void;
	}

	let {
		initialRows,
		initialQuery = '',
		onRowSave,
		onAnnotationsSave,
		onBulkEdit
	}: Props = $props();

	let rows = $state.raw<Array<GridContentListRow>>(
		untrack(() => structuredClone([...initialRows]))
	);
	let query = $state(untrack(() => initialQuery));
	let selectedKey = $state<string | undefined>(undefined);
	let isEditDialogOpen = $state(false);
	let isNotesDialogOpen = $state(false);
	let restoreRowFocus = $state<() => void>(() => {});
	let feedback = $state<string | undefined>(undefined);

	const selectedRow = $derived(rows.find((row) => row.key === selectedKey));
	const selectedEditData = $derived<GridContentData>(
		selectedRow
			? {
					name: { fieldName: 'Name', value: selectedRow.label },
					detail: {
						fieldName: 'Detail',
						value: selectedRow.detail ?? '',
						multiline: true
					}
				}
			: {}
	);
	const selectedNotesData = $derived<GridContentData>(
		selectedRow
			? {
					row: {
						fieldName: selectedRow.label,
						value: selectedRow.label,
						annotations: selectedRow.annotations ?? [],
						annotationBindPath: ['annotations']
					}
				}
			: {}
	);

	const selectRow = (row: GridContentListRow, restoreFocus: () => void) => {
		selectedKey = row.key;
		restoreRowFocus = restoreFocus;
		feedback = undefined;
	};

	const requestEdit: GridContentListRowAction = (row, restoreFocus) => {
		selectRow(row, restoreFocus);
		isEditDialogOpen = true;
	};

	const requestNotes: GridContentListRowAction = (row, restoreFocus) => {
		selectRow(row, restoreFocus);
		isNotesDialogOpen = true;
	};

	const getEditedString = (data: GridContentData, key: string): string => {
		const value = data[key]?.value;
		return typeof value === 'string' ? value : '';
	};

	const saveSelectedRow = (data: GridContentData) => {
		if (!selectedRow) return;
		const nextRow = {
			...selectedRow,
			label: getEditedString(data, 'name'),
			detail: getEditedString(data, 'detail')
		};
		rows = rows.map((row) => (row.key === nextRow.key ? nextRow : row));
		feedback = `Saved ${nextRow.label}.`;
		onRowSave?.(nextRow);
	};

	const saveSelectedAnnotations = (patches: Array<GridContentPatch>) => {
		if (!selectedRow) return;
		const annotationPatch = patches.find(
			(patch) => patch.path.length === 1 && patch.path[0] === 'annotations'
		);
		if (!annotationPatch || !Array.isArray(annotationPatch.value)) return;
		const nextRow = { ...selectedRow, annotations: annotationPatch.value } as GridContentListRow;
		rows = rows.map((row) => (row.key === nextRow.key ? nextRow : row));
		feedback = `Saved notes for ${nextRow.label}.`;
		onAnnotationsSave?.(nextRow);
	};

	const requestBulkEdit = () => {
		feedback = 'Bulk Edit requested.';
		onBulkEdit?.();
	};
</script>

{#if feedback}
	<p class="theme-text-muted mb-3 text-sm" role="status">{feedback}</p>
{/if}

<div class="theme-grid-layer rounded-md border p-3">
	<GridContentList
		title="Other Gear"
		{rows}
		emptyText="No other gear yet."
		bind:query
		onEditRow={requestEdit}
		onNotesRow={requestNotes}
		onBulkEdit={requestBulkEdit}
	/>
</div>

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
	handleEditSavePatches={saveSelectedAnnotations}
	onClosed={restoreRowFocus}
/>
