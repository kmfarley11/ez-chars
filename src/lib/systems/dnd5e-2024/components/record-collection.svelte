<script lang="ts">
	import { tick } from 'svelte';
	import GridContentList from '$lib/ui/organisms/grid-content-list.svelte';
	import GridContentEditDialog from '$lib/ui/organisms/grid-content-edit-dialog.svelte';
	import CollectionQuickfilters from '$lib/ui/molecules/collection-quickfilters.svelte';
	import ChipButton from '$lib/ui/atoms/chip-button.svelte';
	import { getSmallEditAccess } from '$lib/ui/organisms/small-edit-context';
	import type { GridContentListRowAction } from '$lib/ui/molecules/grid-content-list';
	import {
		captureCollectionRowPositions,
		animateCollectionRowMovement
	} from '$lib/ui/molecules/collection-priority';
	import type { CharacterDocument5e2024 } from '../../../../schema/system-5e2024';
	import {
		newRecordData,
		inventoryCategories,
		type RecordKind,
		type SheetEditSession
	} from '../editing/sheet-edit-session';
	import {
		collectionRows,
		collectionGroupRows,
		timingOptions,
		spellLevelOptions
	} from '../collection-rows';
	import { actionSourceCandidates } from '../action-sources';
	import ActionCreateDialog from './action-create-dialog.svelte';
	let {
		character,
		kind,
		title,
		session,
		category,
		additionalKinds = [],
		presentation = 'cards',
		pinning = true
	}: {
		character: CharacterDocument5e2024;
		kind: RecordKind;
		title: string;
		session: SheetEditSession;
		category?: keyof typeof inventoryCategories;
		additionalKinds?: RecordKind[];
		presentation?: 'cards' | 'compact';
		pinning?: boolean;
	} = $props();
	const detail = getSmallEditAccess();
	const typeLabel = (kind: RecordKind) =>
		kind === 'features' ? 'Feature' : kind === 'feats' ? 'Feat' : kind;
	let query = $state('');
	let timings = $state<string[]>([]);
	let levels = $state<string[]>([]);
	let prepared = $state(false);
	let adding = $state(false);
	let browsing = $state(false);
	let addTrigger = $state<HTMLButtonElement>();
	let error = $state('');
	let pendingRestore: (() => boolean) | undefined;
	const matches = $derived(
		additionalKinds.length
			? collectionGroupRows(character, [kind, ...additionalKinds], query)
			: collectionRows(character, kind, query, timings, {
					category,
					levels,
					prepared,
					priority: pinning
				})
	);
	const addData = $derived.by(() => {
		const data = newRecordData(kind);
		if (category && data.category) data.category.value = inventoryCategories[category];
		if (additionalKinds.length)
			return {
				recordType: {
					fieldName: 'Record type',
					value: typeLabel(kind),
					options: [kind, ...additionalKinds].map(typeLabel)
				},
				...data
			};
		return data;
	});
	const clear = () => {
		query = '';
		timings = [];
		levels = [];
		prepared = false;
	};
	const openRecord: GridContentListRowAction = async (row, restore) => {
		const rowKind = row.key.slice(0, row.key.indexOf(':')) as RecordKind;
		const returnToBrowse = browsing;
		if (browsing) {
			browsing = false;
			await tick();
		}
		detail?.openRecord(
			row.key,
			async () => {
				await tick();
				if (returnToBrowse) {
					pendingRestore = restore;
					browsing = true;
				} else if (!restore()) addTrigger?.focus();
			},
			() => session.remove(rowKind, row.key.slice(rowKind.length + 1)).ok,
			kind === 'notes'
				? 'Remove note'
				: kind === 'runtimeActions'
					? 'Remove action'
					: kind === 'spells'
						? 'Remove spell'
						: 'Remove item'
		);
	};
	const togglePin: GridContentListRowAction = async (row, restore, trigger) => {
		if (kind === 'notes') return;
		const rowKind = row.key.slice(0, row.key.indexOf(':')) as RecordKind;
		if (rowKind === 'notes') return;
		const list = trigger?.closest('ul') ?? null;
		const positions = captureCollectionRowPositions(list);
		const result = session.togglePin(rowKind, row.key.slice(rowKind.length + 1));
		error = result.ok ? '' : result.message;
		await tick();
		animateCollectionRowMovement(list, positions);
		if (!restore()) addTrigger?.focus();
	};
</script>

{#snippet filters()}
	{#if kind === 'spells'}
		<CollectionQuickfilters
			{title}
			label="Spell level"
			heading="Spell level & preparedness"
			options={spellLevelOptions}
			bind:selected={levels}
			bind:query
		>
			{#snippet extra()}<ChipButton
					label="Prepared only"
					selected={prepared}
					onclick={() => (prepared = !prepared)}
				/>{/snippet}
		</CollectionQuickfilters>
	{:else}
		<CollectionQuickfilters
			{title}
			label="Timing"
			options={timingOptions}
			bind:selected={timings}
			bind:query
		/>
	{/if}
{/snippet}

<GridContentList
	{title}
	{presentation}
	rows={matches.rows}
	retrieval={{ total: matches.total, narrowed: matches.narrowed, clear }}
	controls={(kind === 'runtimeActions' || kind === 'spells') && matches.total > 0
		? filters
		: undefined}
	bind:query
	bind:focusedOpen={browsing}
	bind:addTriggerEl={addTrigger}
	onOpenRow={openRecord}
	onTogglePinRow={kind === 'notes' || !pinning ? undefined : togglePin}
	onAdd={() => {
		error = '';
		adding = true;
	}}
	onFocusedOpened={() => {
		pendingRestore?.();
		pendingRestore = undefined;
	}}
/>
{#if error}<p class="theme-error mt-2 text-sm" role="alert">{error}</p>{/if}
{#if kind === 'runtimeActions'}
	<ActionCreateDialog
		bind:open={adding}
		candidates={actionSourceCandidates(character)}
		{session}
		onClosed={() => addTrigger?.focus()}
	/>
{:else}
	<GridContentEditDialog
		bind:open={adding}
		data={addData}
		title={`Add ${title}`}
		handleEditSave={(data) => {
			const selected =
				[kind, ...additionalKinds].find(
					(candidate) => typeLabel(candidate) === data.recordType?.value
				) ?? kind;
			return session.add(selected, data).ok;
		}}
		onClosed={() => addTrigger?.focus()}
	/>
{/if}
