<script lang="ts">
	import Dnd5e2014DenseCollectionCard from './Dnd5e2014DenseCollectionCard.svelte';
	import type { Dnd5e2014DenseCollectionRow } from '$lib/dnd5e2014/denseCollectionRows';
	import type { CharacterDocument5e2014 } from '../../../../schema';

	let {
		emptyText = 'No items found.',
		rows = [
			{
				key: 'weapons:1',
				label: 'Longsword',
				detail: '1d8 Slashing, Versatile (1d10)',
				source: { kind: 'item', id: '1', group: 'weapons' }
			},
			{
				key: 'weapons:2',
				label: 'Dagger',
				detail: '1d4 Piercing, Finesse, Light, Thrown (Range 20/60)',
				source: { kind: 'item', id: '2', group: 'weapons' }
			},
			{
				key: 'weapons:3',
				label: 'Light Crossbow',
				detail: '1d8 Piercing, Ammunition (Range 80/320), Loading, Two-Handed',
				source: { kind: 'item', id: '3', group: 'weapons' }
			},
			{
				key: 'weapons:4',
				label: 'Silvered Mace',
				detail: '1d6 Bludgeoning, Silvered',
				source: { kind: 'item', id: '4', group: 'weapons' }
			}
		]
	} = $props<{ emptyText?: string; rows?: Array<Dnd5e2014DenseCollectionRow> }>();

	const mockCharacter = {
		meta: { id: 'mock', schemaVersion: 'dnd5e-2014.schema.v0' },
		system: { id: 'dnd5e-2014' },
		identity: { name: 'Mock' },
		systemData: {}
	} as CharacterDocument5e2014;

	const onIntent = (intent: any) => console.log('Intent:', intent);
	const onBulkSave = (patches: any) => console.log('Bulk save:', patches);
</script>

<div class="p-4" style="max-width: 600px;">
	<Dnd5e2014DenseCollectionCard
		title="Weapons"
		{rows}
		character={mockCharacter}
		bulkEditData={{}}
		{emptyText}
		{onIntent}
		{onBulkSave}
	/>
</div>
