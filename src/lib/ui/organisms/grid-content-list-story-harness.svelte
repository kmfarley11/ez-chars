<script lang="ts">
	import { untrack } from 'svelte';
	import StorySurface from '$lib/storybook/story-surface.svelte';
	import GridContentEditDialog from '$lib/ui/organisms/grid-content-edit-dialog.svelte';
	import GridContentList from '$lib/ui/organisms/grid-content-list.svelte';
	import type {
		GridContentListRow,
		GridContentListRowAction
	} from '$lib/ui/molecules/grid-content-list';
	import type { GridContentData } from '$lib/utils/gridContentTypes';
	// eslint-disable-next-line no-unused-vars
	type RowUpdateCallback = (...args: [GridContentListRow]) => void;

	interface Props {
		initialRows: ReadonlyArray<GridContentListRow>;
		initialQuery?: string;
		presentation?: 'cards' | 'compact';
		onRowSave?: RowUpdateCallback;
	}

	let { initialRows, initialQuery = '', presentation = 'cards', onRowSave }: Props = $props();
	let pins = $state<Array<string>>([]);

	let rows = $state.raw<Array<GridContentListRow>>(
		untrack(() => structuredClone([...initialRows]))
	);
	const priorityRows = $derived(
		[...rows]
			.map((row) => ({ ...row, pinned: pins.includes(row.key) }))
			.sort((a, b) => Number(b.pinned) - Number(a.pinned))
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
</script>

<StorySurface>
	<div class="mx-auto max-w-3xl space-y-3 p-4">
		<h2 class="font-semibold">Collections (Tier 3 Field)</h2>
		<p class="text-sm">
			Production list, row, search and scrolling primitives with illustrative supplies. Search,
			Pin/Unpin, open a row, save or cancel, and try phone width. The small two-field editor
			demonstrates the list callback, not system-owned sheet detail; use Read-first Detail for
			independent saves. This system-neutral sandbox covers collection rendering, search, pinning
			and row edits. Domain-owned Add/Remove and filters remain in Systems examples; the deferred
			Collection Organizer is a separate future concept, not the Tier 3 baseline.
		</p>

		{#if feedback}
			<p class="theme-text-muted mb-3 text-sm" role="status">{feedback}</p>
		{/if}

		<div class="theme-grid-layer rounded-md border p-3">
			<GridContentList
				title="Supplies"
				{presentation}
				rows={priorityRows}
				emptyText="No supplies yet."
				bind:query
				onOpenRow={requestEdit}
				onTogglePinRow={(row) => {
					pins = pins.includes(row.key)
						? pins.filter((key) => key !== row.key)
						: [...pins, row.key];
				}}
			/>
		</div>

		<GridContentEditDialog
			bind:open={isEditDialogOpen}
			data={selectedEditData}
			title={selectedRow ? `Edit ${selectedRow.label}` : 'Edit item'}
			handleEditSave={saveSelectedRow}
			onClosed={restoreRowFocus}
		/>
	</div>
</StorySurface>
