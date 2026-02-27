<!-- https://svelte.dev/playground/7b02f45e49744502bf5f03cb61375f9f?version=5.30.2 -->
<script>
	import { capitalizeFirstLetter, arrToString, objToString } from './stringFormatters';

	let {
		tableData,
		variant,
		onSelect = (/** @type {{ [x: string]: any; }} */ rowData) => {
			alert(objToString(rowData));
		}
	} = $props();
</script>

<div class="max-w-full overflow-x-auto p-2">
	<table
		class="{variant} border-tools-table-outline border-slate w-full table-auto border-separate justify-between rounded-sm border-2 text-left"
	>
		<thead>
			<tr class="bg-slate-700 text-center text-slate-100">
				{#each Object.keys(tableData[0]) as columnHeading}
					<th class="rounded-sm border p-2">{capitalizeFirstLetter(columnHeading)}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each Object.values(tableData) as row}
				<tr
					class="text-black hover:text-white even:bg-slate-300 hover:bg-slate-700 even:hover:bg-slate-700 hover:mouse cursor-pointer"
					onclick={() => onSelect(row)}
				>
					{#each Object.values(row) as cell}
						<td class="rounded-sm border p-2 text-left align-top break-words">
							<!-- TODO: better renderings once typings implemented etc. -->
							{#if Array.isArray(cell)}
								{arrToString(cell)}
							{:else if typeof cell === 'object'}
								{objToString(cell)}
							{:else}
								{cell}
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
