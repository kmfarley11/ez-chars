<script lang="ts">
	import Table from './table.svelte';
	import TableHeader from './table-header.svelte';
	import TableRow from '../atoms/table-row.svelte';
	import TableCell from '../atoms/table-cell.svelte';
	import BaseButton from '../atoms/base-button.svelte';
	let selected = $state('No row selected.');
	const rows = [
		{ id: 'pack', name: 'Travel pack', quantity: 2, detail: 'Compact supporting text.' },
		{
			id: 'supplies',
			name: 'Shared expedition supplies',
			quantity: 12,
			detail:
				'A longer description demonstrates wrapping without a game-specific schema or column renderer.'
		}
	];
</script>

<section class="mx-auto max-w-3xl space-y-3 p-4" aria-label="Table composition example">
	<h1 class="font-semibold">Semantic table composition</h1>
	<p class="text-sm">
		Table, TableHeader, TableRow and TableCell compose ordinary HTML content. Tab to a Select button
		and activate it to check the action cell; reduce the viewport to inspect wrapping and horizontal
		overflow. This example stays a table. CharacterList owns its separate mobile cards.
	</p>
	<div class="max-w-full overflow-x-auto">
		<Table>
			<caption class="pb-2 text-left">Illustrative supplies</caption>
			<TableHeader headers={['Item', 'Quantity', 'Detail', 'Action']} align="left" />
			<tbody>
				{#each rows as row (row.id)}
					<TableRow>
						<TableCell>{row.name}</TableCell>
						<TableCell><span class="tabular-nums">{row.quantity}</span></TableCell>
						<TableCell>{row.detail}</TableCell>
						<TableCell class="w-px whitespace-nowrap">
							<BaseButton
								size="sm"
								ariaLabel={`Select ${row.name}`}
								onclick={() => (selected = `Selected ${row.name}.`)}>Select</BaseButton
							>
						</TableCell>
					</TableRow>
				{/each}
			</tbody>
		</Table>
	</div>
	<p role="status">{selected}</p>
</section>
