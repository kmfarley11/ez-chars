<script lang="ts">
	import { untrack } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import Dnd5e2014DenseCollectionCard from './Dnd5e2014DenseCollectionCard.svelte';
	import {
		projectPrioritizedSpellDenseCollectionRows,
		type Dnd5e2014DenseCollectionRow
	} from '$lib/dnd5e2014/denseCollectionRows';
	import { projectCollectionPriorityRows } from '$components/collectionPriority';
	import { compare5e2014PriorityLabels } from '$lib/dnd5e2014/collectionPriority';
	import { withInventoryGroupTags } from '$lib/dnd5e2014/inventory';
	import { create5e2014Character } from '../../../../schema';

	const defaultRows: Array<Dnd5e2014DenseCollectionRow> = [
		{
			key: 'item:weapon-1',
			identity: 'weapon-1',
			label: 'Longsword',
			pinned: true,
			detail: '1d8 Slashing, Versatile (1d10)',
			source: { kind: 'item', id: 'weapon-1', group: 'weapons' }
		},
		{
			key: 'item:weapon-2',
			identity: 'weapon-2',
			label: 'Dagger',
			pinned: false,
			detail: '1d4 Piercing, Finesse, Light, Thrown (Range 20/60)',
			source: { kind: 'item', id: 'weapon-2', group: 'weapons' }
		},
		{
			key: 'item:weapon-3',
			identity: 'weapon-3',
			label: 'Light Crossbow',
			pinned: false,
			detail: '1d8 Piercing, Ammunition (Range 80/320), Loading, Two-Handed',
			source: { kind: 'item', id: 'weapon-3', group: 'weapons' }
		},
		{
			key: 'item:weapon-4',
			identity: 'weapon-4',
			label: 'Silvered Mace',
			pinned: false,
			detail: '1d6 Bludgeoning, Silvered',
			source: { kind: 'item', id: 'weapon-4', group: 'weapons' }
		}
	];

	interface Props {
		title?: string;
		emptyText?: string;
		query?: string;
		prioritySaveError?: string;
		rows?: Array<Dnd5e2014DenseCollectionRow>;
	}

	let {
		title = 'Weapons',
		emptyText = 'No items found.',
		query = $bindable(''),
		prioritySaveError = '',
		rows = defaultRows
	}: Props = $props();

	const pinnedIdentities = new SvelteSet<string>(
		untrack(() => rows.filter((row) => row.pinned).map((row) => row.identity))
	);
	const storySpells = $derived(
		rows.flatMap((row) =>
			row.source.kind === 'spell'
				? [
						{
							spellId: row.source.id,
							name: row.label,
							level: row.source.level,
							prepared: row.context?.includes('Prepared') ?? false,
							notes: row.detail,
							annotations: row.annotations
						}
					]
				: []
		)
	);
	const presentedRows = $derived.by(() =>
		storySpells.length > 0
			? projectPrioritizedSpellDenseCollectionRows(storySpells, pinnedIdentities)
			: projectCollectionPriorityRows<Dnd5e2014DenseCollectionRow>(
					rows.map((row) => ({ ...row, pinned: pinnedIdentities.has(row.identity) })),
					compare5e2014PriorityLabels
				)
	);
	const mockCharacter = $derived(
		create5e2014Character({
			meta: { id: 'dense-collection-story' },
			inventory: rows.flatMap((row) =>
				row.source.kind === 'item'
					? [
							{
								id: row.source.id,
								name: row.label,
								notes: row.detail,
								tags: withInventoryGroupTags(undefined, row.source.group)
							}
						]
					: []
			),
			systemData:
				storySpells.length > 0
					? { spellcasting: { ability: 'int', spells: storySpells } }
					: undefined
		})
	);

	const onIntent = () => {};
	const onBulkSave = () => {};
	const onSavePins = async (identities: ReadonlyArray<string>) => {
		if (prioritySaveError) return { ok: false as const, message: prioritySaveError };
		pinnedIdentities.clear();
		for (const identity of identities) pinnedIdentities.add(identity);
		return { ok: true as const };
	};
</script>

<div class="p-4" style="max-width: 600px;">
	<Dnd5e2014DenseCollectionCard
		{title}
		rows={presentedRows}
		character={mockCharacter}
		bulkEditData={{}}
		{emptyText}
		bind:query
		{onIntent}
		{onBulkSave}
		{onSavePins}
	/>
</div>
