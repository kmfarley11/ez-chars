<!-- https://svelte.dev/playground/7b02f45e49744502bf5f03cb61375f9f?version=5.30.2 -->
<script lang="ts">
	/* eslint-disable no-unused-vars */
	import type { CharacterWithSystemData, Dnd5e2014SystemData } from '../schema';
	import { capitalizeFirstLetter, anyToString } from './stringFormatters';
	import TableHeader from './TableHeader.svelte';
	import TableDataRow from './TableDataRow.svelte';

	interface Props {
		tableData: CharacterWithSystemData[];
		onSelect: (rowData: CharacterWithSystemData) => void;
	}

	let {
		tableData,
		onSelect = (rowData) => {
			alert(anyToString(rowData));
		}
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
</script>

<div class="max-w-full overflow-x-auto p-0">
	<table
		class="theme-table border-tools-table-outline w-full table-auto border-separate justify-between rounded-sm border-2 text-left"
	>
		<TableHeader
			headers={columns.map((column) => column.header)}
			formatHeader={capitalizeFirstLetter}
		/>
		<tbody>
			{#each Object.values(tableData) as row (row.meta.id)}
				<TableDataRow
					cells={columns.map((column) => column.value(row) ?? '')}
					onclick={() => onSelect(row)}
				/>
			{/each}
		</tbody>
	</table>
</div>
