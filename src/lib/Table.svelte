<!-- https://svelte.dev/playground/7b02f45e49744502bf5f03cb61375f9f?version=5.30.2 -->
<script lang="ts">
	/* eslint-disable no-unused-vars */
	import type { CharacterWithSystemData, Dnd5e2014SystemData } from '../schema';
	import { capitalizeFirstLetter, anyToString } from './stringFormatters';
	import TableHeader from './TableHeader.svelte';

	interface Props {
		tableData: CharacterWithSystemData[];
		onSelect: (rowData: CharacterWithSystemData) => void;
		onDelete?: (rowData: CharacterWithSystemData) => void;
	}

	let {
		tableData,
		onSelect = (rowData) => {
			alert(anyToString(rowData));
		},
		onDelete = undefined
	}: Props = $props();

	const columns: Array<{
		header: string;
		value: (row: CharacterWithSystemData) => string | undefined;
	}> = [
		{ header: 'id', value: (row) => row.meta.id },
		{
			header: 'identity',
			value: (row) =>
				anyToString({
					name: row.identity.name,
					alignment: row.identity.alignment ?? 'DNE',
					lineage: row.identity.ancestryLineage ?? 'DNE'
				})
		},
		{ header: 'system', value: (row) => row.system.id },
		{
			header: 'classes',
			value: (row) =>
				anyToString((row.systemData as Dnd5e2014SystemData | undefined)?.classes ?? { DNE: 'DNE' })
		},
		{ header: 'created', value: (row) => row.meta.createdAt },
		{ header: 'updated', value: (row) => row.meta.updatedAt }
	];

	const showDelete = $derived(typeof onDelete === 'function');
	const headers = $derived(
		showDelete
			? [...columns.map((column) => column.header), 'actions']
			: columns.map((column) => column.header)
	);
</script>

<div class="max-w-full overflow-x-auto p-0">
	<table
		class="theme-table border-tools-table-outline w-full table-auto border-separate justify-between rounded-sm border-2 text-left"
	>
		<TableHeader {headers} formatHeader={capitalizeFirstLetter} />
		<tbody>
			{#each Object.values(tableData) as row (row.meta.id)}
				<tr class="theme-table-row cursor-pointer" onclick={() => onSelect(row)}>
					{#each columns as column, i (i)}
						<td class="rounded-sm border p-2 text-left align-top wrap-break-word">
							{column.value(row) ?? ''}
						</td>
					{/each}
					{#if showDelete}
						<td class="rounded-sm border p-2 text-right align-top">
							<button
								type="button"
								class="theme-btn-light btn rounded-md border px-2 py-1 text-xs"
								aria-label={`Delete ${row.identity.name?.trim() || row.meta.id}`}
								onclick={(event) => {
									event.stopPropagation();
									onDelete?.(row);
								}}
							>
								Delete
							</button>
						</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
