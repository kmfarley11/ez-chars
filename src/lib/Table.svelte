<!-- https://svelte.dev/playground/7b02f45e49744502bf5f03cb61375f9f?version=5.30.2 -->
<script lang="ts">
	import type { CharacterWithSystemData } from '../schema';
	import { capitalizeFirstLetter, arrToString, objToString } from './stringFormatters';

	interface Props {
		tableData: CharacterWithSystemData[];
		onSelect: (rowData: CharacterWithSystemData) => void;
	}

	let {
		tableData,
		onSelect = (rowData) => {
			alert(objToString(rowData));
		}
	}: Props = $props();

	const disallowedRows = [
		'systemdata', 'notes', 'annotations', 'inventory', 'features'
	]

	const checkRowKeyOk = (key: string) => {
		return !disallowedRows.includes(key.toLowerCase())
	}
</script>

<div class="max-w-full overflow-x-auto p-0">
	<table
		class="theme-table border-tools-table-outline w-full table-auto border-separate justify-between rounded-sm border-2 text-left"
	>
		<thead>
			<tr class="theme-table-head text-center">
				{#each Object.keys(tableData[0]) as columnHeading}
					{#if checkRowKeyOk(columnHeading)}
						<th class="rounded-sm border p-2">{capitalizeFirstLetter(columnHeading)}</th>
					{/if}
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each Object.values(tableData) as row}
				<tr class="theme-table-row hover:mouse cursor-pointer" onclick={() => onSelect(row)}>
					{#each Object.entries(row) as [key, value]}
						{#if checkRowKeyOk(key)}
							<td class="rounded-sm border p-2 text-left align-top break-words">
								<!-- TODO: better renderings once typings implemented etc. -->
								{#if Array.isArray(value)}
									{arrToString(value)}
								{:else if typeof value === 'object'}
									{objToString(value)}
								{:else}
									{value}
								{/if}
							</td>
						{/if}
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
