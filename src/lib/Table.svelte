<!-- https://svelte.dev/playground/7b02f45e49744502bf5f03cb61375f9f?version=5.30.2 -->
<script lang="ts">
	/* eslint-disable no-unused-vars */
	import DialogButton from './DialogButton.svelte';
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
						<td
							class="rounded-sm border p-2 text-right align-top"
							onclick={(event) => event.stopPropagation()}
						>
							<DialogButton
								title="Delete character"
								ariaLabel={`Delete ${row.identity.name?.trim() || row.meta.id}`}
								closeText="Cancel"
								triggerVariant="compact"
							>
								Delete
								{#snippet dialogContent()}
									<div class="space-y-2 px-1 py-1 text-left text-sm">
										<h3 class="text-lg leading-none font-semibold">Delete character?</h3>
										<p class="theme-text-muted">
											This will permanently remove
											<strong>{row.identity.name?.trim() || row.meta.id}</strong>
											from local storage.
										</p>
									</div>
								{/snippet}
								{#snippet actions(closeDialog: () => void)}
									<button
										type="button"
										class="theme-btn-dark btn cursor-pointer rounded-md border px-3 py-1"
										onclick={() => {
											onDelete?.(row);
											closeDialog();
										}}
									>
										Delete
									</button>
								{/snippet}
							</DialogButton>
						</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
