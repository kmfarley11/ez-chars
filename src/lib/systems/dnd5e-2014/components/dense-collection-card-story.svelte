<script lang="ts">
	import DenseCollectionCard from '$lib/systems/dnd5e-2014/components/dense-collection-card.svelte';
	import {
		projectPrioritizedSpellDenseCollectionRows,
		projectPrioritizedInventoryDenseCollectionRows,
		type Dnd5e2014DenseCollectionRow
	} from '$lib/systems/dnd5e-2014/dense-collection-rows';
	import { set5e2014CollectionPins } from '$lib/systems/dnd5e-2014/collection-priority';
	import { withInventoryGroupTags } from '$lib/systems/dnd5e-2014/inventory';
	import { create5e2014Character, type CharacterDocument5e2014 } from '../../../../schema/index';
	import { createCanonicalSheetState } from '../pages/canonical-sheet-state';
	import { create5eSheetEditSession } from '../editing/sheet-edit-session';
	import type { SheetEditIntent } from '../editing/sheet-edit-intents';

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
		rejectIntents?: boolean;
		rows?: Array<Dnd5e2014DenseCollectionRow>;
	}

	let {
		title = 'Weapons',
		emptyText = 'No items found.',
		query = $bindable(''),
		prioritySaveError = '',
		rejectIntents = false,
		rows = defaultRows
	}: Props = $props();

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
	const initialCharacter = $derived(
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

	const firstInventoryRow = $derived(rows.find((row) => row.source.kind === 'item'));
	const collection = $derived(
		rows[0]?.source.kind === 'spell'
			? ({ kind: 'spell' } as const)
			: ({
					kind: 'item',
					group:
						firstInventoryRow?.source.kind === 'item' ? firstInventoryRow.source.group : 'weapons'
				} as const)
	);
	const sandbox = $derived(
		createCanonicalSheetState(
			set5e2014CollectionPins(
				initialCharacter,
				collection.kind === 'spell' ? 'spells' : 'inventory',
				rows.filter((row) => row.pinned).map((row) => row.identity)
			)
		)
	);
	let revision = $state(0);
	const mockCharacter = $derived.by(() => {
		revision;
		return sandbox.read();
	});
	const session = create5eSheetEditSession({
		read: () => mockCharacter,
		write: (next: CharacterDocument5e2014) => {
			sandbox.write(next);
			revision += 1;
		},
		reject: () => rejectIntents
	});
	const presentedRows = $derived(
		collection.kind === 'spell'
			? projectPrioritizedSpellDenseCollectionRows(
					mockCharacter.systemData.spellcasting?.spells ?? [],
					new Set(mockCharacter.systemData.collectionPins?.spells ?? [])
				)
			: projectPrioritizedInventoryDenseCollectionRows(
					mockCharacter.inventory,
					collection.group,
					new Set(mockCharacter.systemData.collectionPins?.inventory ?? [])
				)
	);
	const onIntents = (intents: ReadonlyArray<SheetEditIntent>) => session.intents(intents).ok;
	const onSavePins = async (identities: ReadonlyArray<string>) => {
		if (prioritySaveError) return { ok: false as const, message: prioritySaveError };
		return collection.kind === 'spell'
			? session.pins('spells', identities)
			: session.inventoryPins(collection.group, identities);
	};
</script>

<p class="p-4 text-sm">
	System-owned collection boundary fixture. Uses the production edit session; error controls
	intentionally reject saves. Search, use the direct Pin/Unpin buttons, open a row, and try Add or
	focused Remove. Compare phone width and full sheet placement in Character Sheet / Saturated. This
	standalone boundary intentionally exercises the retained whole-record Detail/Edit fallback, not
	the sheet's independently saved fields. Use Character Sheet / Saturated for the current sheet
	editing workflow.
</p>
<div class="p-4" style="max-width: 600px;">
	<DenseCollectionCard
		{title}
		rows={presentedRows}
		character={mockCharacter}
		{collection}
		{emptyText}
		bind:query
		{onIntents}
		{onSavePins}
	/>
</div>
