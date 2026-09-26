<script lang="ts">
	import { untrack } from 'svelte';
	import GridContentEditDialog from '$components/GridContentEditDialog.svelte';
	import GridContentList from '$components/GridContentList.svelte';
	import type { GridContentListRow, GridContentListRowAction } from '$components/gridContentList';
	import type { GridContentData } from '$utils/gridContentTypes';
	// eslint-disable-next-line no-unused-vars
	type RowUpdateCallback = (...args: [GridContentListRow]) => void;

	interface Props {
		initialRows: ReadonlyArray<GridContentListRow>;
		initialQuery?: string;
		onRowSave?: RowUpdateCallback;
		onBulkEdit?: () => void;
	}

	let { initialRows, initialQuery = '', onRowSave, onBulkEdit }: Props = $props();

	let rows = $state.raw<Array<GridContentListRow>>(
		untrack(() => structuredClone([...initialRows]))
	);
	let query = $state(untrack(() => initialQuery));
	let selectedKey = $state<string | undefined>(undefined);
	let isEditDialogOpen = $state(false);
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

	const selectRow = (row: GridContentListRow, restoreFocus: () => void) => {
		selectedKey = row.key;
		restoreRowFocus = restoreFocus;
		feedback = undefined;
	};

	const requestEdit: GridContentListRowAction = (row, restoreFocus) => {
		selectRow(row, restoreFocus);
		isEditDialogOpen = true;
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
		onOpenRow={requestEdit}
		onAdd={requestBulkEdit}
	/>
</div>

<GridContentEditDialog
	bind:open={isEditDialogOpen}
	data={selectedEditData}
	title={selectedRow ? `Edit ${selectedRow.label}` : 'Edit item'}
	handleEditSave={saveSelectedRow}
	onClosed={restoreRowFocus}
/>
