<!-- https://svelte.dev/playground/7b02f45e49744502bf5f03cb61375f9f?version=5.30.2 -->
<script lang="ts">
	import type { CharacterWithSystemData, Dnd5e2014SystemData } from '../schema';
	import { capitalizeFirstLetter, anyToString } from './stringFormatters';

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
</script>

<div class="max-w-full overflow-x-auto p-0">
	<table
		class="theme-table border-tools-table-outline w-full table-auto border-separate justify-between rounded-sm border-2 text-left"
	>
		<!-- TODO - abstract headers and rows/cells into their own components and genericize -->
		<thead>
			<tr class="theme-table-head text-center">
				<th class="rounded-sm border p-2">{capitalizeFirstLetter('id')}</th>
				<th class="rounded-sm border p-2">{capitalizeFirstLetter('identity')}</th>
				<th class="rounded-sm border p-2">{capitalizeFirstLetter('system')}</th>
				<th class="rounded-sm border p-2">{capitalizeFirstLetter('classes')}</th>
				<th class="rounded-sm border p-2">{capitalizeFirstLetter('created')}</th>
				<th class="rounded-sm border p-2">{capitalizeFirstLetter('updated')}</th>
			</tr>
		</thead>
		<tbody>
			{#each Object.values(tableData) as row}
				<tr class="theme-table-row hover:mouse cursor-pointer" onclick={() => onSelect(row)}>
					<td class="rounded-sm border p-2 text-left align-top break-words">
						{row.meta.id}
					</td>
					<td class="rounded-sm border p-2 text-left align-top break-words">
						{anyToString({
							name: row.identity.name,
							alignment: row.identity.alignment ?? 'DNE',
							lineage: row.identity.ancestryLineage ?? 'DNE'
						})}
					</td>
					<td class="rounded-sm border p-2 text-left align-top break-words">
						{row.system.id}
					</td>
					<td class="rounded-sm border p-2 text-left align-top break-words">
						{anyToString(
							(row.systemData as Dnd5e2014SystemData | undefined)?.classes ?? { DNE: 'DNE' }
						)}
					</td>
					<td class="rounded-sm border p-2 text-left align-top break-words">
						{row.meta.createdAt}
					</td>
					<td class="rounded-sm border p-2 text-left align-top break-words">
						{row.meta.updatedAt}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
