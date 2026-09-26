<script lang="ts">
	import { tick } from 'svelte';
	import GridContentEditDialog from '$components/GridContentEditDialog.svelte';
	import GridContentList from '$components/GridContentList.svelte';
	import GridRecordDetailWorkflow from '$components/GridRecordDetailWorkflow.svelte';
	import ManagePinsDialog from '$components/ManagePinsDialog.svelte';
	import {
		GRID_CONTENT_LIST_PREVIEW_LIMIT,
		type GridContentListFocusRestore,
		type GridContentListRow,
		type GridContentListRowAction
	} from '$components/gridContentList';
	import type { Dnd5e2014DenseCollectionRow } from '$lib/dnd5e2014/denseCollectionRows';
	import type { CollectionPrioritySave } from '$components/collectionPriority';
	import {
		animateCollectionRowMovement,
		captureCollectionRowPositions
	} from '$components/collectionPriority';
	import type {
		GridAnnotationEditorConfig,
		GridContentAnnotation,
		GridContentData
	} from '$utils/gridContentTypes';
	import type { CharacterDocument5e2014 } from '../../../../schema';
	import {
		decodeDenseCollectionAddIntent,
		decodeDenseCollectionRemoveIntent,
		decodeDenseCollectionSaveIntents,
		projectDenseCollectionAddData,
		projectDenseCollectionEditData,
		projectDenseCollectionNotesData
	} from '../denseCollectionEditing';
	import type { InventoryGroup } from '../sheetConstants';
	import type { SheetEditIntent } from '../sheetEditIntents';

	type DenseCollectionKind = { kind: 'item'; group: InventoryGroup } | { kind: 'spell' };
	// eslint-disable-next-line no-unused-vars
	type IntentsCallback = (_intents: ReadonlyArray<SheetEditIntent>) => boolean | void;
	type SaveResult = { ok: true; value: undefined } | { ok: false; message: string };

	interface Props {
		title: string;
		rows: ReadonlyArray<Dnd5e2014DenseCollectionRow>;
		character: CharacterDocument5e2014;
		collection: DenseCollectionKind;
		annotationEditorConfig?: GridAnnotationEditorConfig;
		emptyText?: string;
		query?: string;
		onIntents: IntentsCallback;
		onSavePins?: CollectionPrioritySave;
		showManagePins?: boolean;
	}

	let {
		title,
		rows,
		character,
		collection,
		annotationEditorConfig,
		emptyText = 'No items yet.',
		query = $bindable(''),
		onIntents,
		onSavePins = undefined,
		showManagePins = false
	}: Props = $props();

	let selectedKey = $state<string | undefined>(undefined);
	let isDetailOpen = $state(false);
	let isAddOpen = $state(false);
	let isFocusedListOpen = $state(false);
	let returnToFocusedList = $state(false);
	let isManagePinsOpen = $state(false);
	let restoreRowFocus = $state<() => boolean>(() => false);
	let addTriggerEl = $state<HTMLButtonElement>();
	let managePinsTriggerEl = $state<HTMLButtonElement>();
	let priorityActionError = $state('');
	let pendingFocusedRestore = $state<'selected' | 'start' | undefined>();

	const selectedRow = $derived(rows.find((row) => row.key === selectedKey));
	const selectedEditData = $derived(projectDenseCollectionEditData(character, selectedRow));
	const selectedNotesData = $derived(projectDenseCollectionNotesData(character, selectedRow));
	const selectedAnnotations = $derived<Array<GridContentAnnotation>>(
		selectedNotesData.record?.annotations ?? []
	);
	const addData = $derived(projectDenseCollectionAddData(collection));

	const selectRow = (row: GridContentListRow, restoreFocus: GridContentListFocusRestore) => {
		const ownedRow = rows.find((candidate) => candidate.key === row.key);
		if (!ownedRow) return;
		selectedKey = ownedRow.key;
		restoreRowFocus = restoreFocus;
	};

	const requestDetail: GridContentListRowAction = async (row, restoreFocus) => {
		selectRow(row, restoreFocus);
		returnToFocusedList = isFocusedListOpen;
		if (isFocusedListOpen) {
			isFocusedListOpen = false;
			await tick();
		}
		isDetailOpen = true;
	};

	const returnFromDetail = async () => {
		isDetailOpen = false;
		await tick();
		if (returnToFocusedList) {
			pendingFocusedRestore = 'selected';
			isFocusedListOpen = true;
		} else {
			if (!restoreRowFocus()) addTriggerEl?.focus();
		}
	};

	const restoreFocusedDialogFocus = () => {
		const target = pendingFocusedRestore;
		pendingFocusedRestore = undefined;
		if (!target) return;
		const focusedDialog = [...document.querySelectorAll<HTMLDialogElement>('dialog[open]')].find(
			(dialog) => dialog.getAttribute('aria-label') === title
		);
		if (target === 'selected') {
			const detailAction = focusedDialog?.querySelector<HTMLElement>(
				`#${CSS.escape(`${selectedKey}-detail-action`)}`
			);
			if (detailAction instanceof HTMLElement) {
				detailAction.focus();
				return;
			}
		}
		focusedDialog?.querySelector<HTMLElement>('input, button')?.focus();
	};

	const restorePriorityActionFocus = async (restoreFocus: GridContentListFocusRestore) => {
		await tick();
		requestAnimationFrame(() => {
			if (!restoreFocus()) managePinsTriggerEl?.focus();
		});
	};

	const requestTogglePin: GridContentListRowAction = async (row, restoreFocus) => {
		const ownedRow = rows.find((candidate) => candidate.key === row.key);
		if (!ownedRow || !onSavePins) return;
		priorityActionError = '';
		const list = document.getElementById(`${row.key}-detail-action`)?.closest('ul') ?? null;
		const positions = captureCollectionRowPositions(list);
		const nextPinnedIdentities = rows
			.filter((candidate) =>
				candidate.identity === ownedRow.identity ? !ownedRow.pinned : candidate.pinned
			)
			.map((candidate) => candidate.identity);
		try {
			const result = await onSavePins(nextPinnedIdentities);
			if (!result.ok) priorityActionError = result.message;
		} catch {
			priorityActionError = 'Pins could not be saved. Review the collection and try again.';
		}
		await tick();
		animateCollectionRowMovement(list, positions);
		await restorePriorityActionFocus(restoreFocus);
	};

	const saveSelectedRow = (
		data: GridContentData,
		annotations: Array<GridContentAnnotation>
	): SaveResult => {
		if (!selectedRow) return { ok: false, message: 'The selected record is no longer available.' };
		const intents = decodeDenseCollectionSaveIntents(selectedRow, data, annotations);
		if (!intents) return { ok: false, message: 'Review the record fields and annotations.' };
		if (onIntents(intents) === false) {
			return { ok: false, message: 'The record could not be saved.' };
		}
		return { ok: true, value: undefined };
	};

	const removeSelectedRow = () => {
		if (!selectedRow) return false;
		if (onIntents([decodeDenseCollectionRemoveIntent(character, selectedRow)]) === false)
			return false;
		isDetailOpen = false;
		void tick().then(() => {
			if (returnToFocusedList) {
				pendingFocusedRestore = 'start';
				isFocusedListOpen = true;
			} else requestAnimationFrame(() => addTriggerEl?.focus());
		});
		return true;
	};

	const requestAdd = () => {
		isAddOpen = true;
	};

	const saveAddedRow = (data: GridContentData) => {
		const intent = decodeDenseCollectionAddIntent(character, collection, data);
		if (!intent) return false;
		if (onIntents([intent]) === false) return false;
		return true;
	};

	const requestManagePins = () => {
		priorityActionError = '';
		isManagePinsOpen = true;
	};
</script>

<GridContentList
	{title}
	{rows}
	{emptyText}
	bind:query
	bind:focusedOpen={isFocusedListOpen}
	onOpenRow={requestDetail}
	onTogglePinRow={onSavePins ? requestTogglePin : undefined}
	onAdd={requestAdd}
	onManagePins={showManagePins && onSavePins && rows.length > 0 ? requestManagePins : undefined}
	onFocusedOpened={restoreFocusedDialogFocus}
	bind:addTriggerEl
	bind:managePinsTriggerEl
/>

{#if priorityActionError}
	<p class="theme-error mt-3 rounded-md border px-3 py-2 text-sm" role="alert">
		{priorityActionError}
	</p>
{/if}

{#if selectedRow}
	<GridRecordDetailWorkflow
		bind:open={isDetailOpen}
		title={selectedRow.label}
		data={selectedEditData}
		annotations={selectedAnnotations}
		{annotationEditorConfig}
		provenance={selectedRow.context ??
			(selectedRow.source.kind === 'spell' ? 'Spell record' : 'Inventory record')}
		showBrowseBack={returnToFocusedList}
		onBrowseBack={() => void returnFromDetail()}
		onSave={saveSelectedRow}
		onRemove={removeSelectedRow}
		removeLabel={selectedRow.source.kind === 'spell' ? 'Remove spell' : 'Remove item'}
		onClosed={() => void returnFromDetail()}
	/>
{/if}

<GridContentEditDialog
	bind:open={isAddOpen}
	data={addData}
	title={`Add ${title}`}
	handleEditSave={saveAddedRow}
	onClosed={() => addTriggerEl?.focus()}
/>

{#if onSavePins && isManagePinsOpen}
	<ManagePinsDialog
		{title}
		{rows}
		bind:open={isManagePinsOpen}
		bind:query
		searchEnabled={rows.length > GRID_CONTENT_LIST_PREVIEW_LIMIT}
		onSave={onSavePins}
		onClosed={() => managePinsTriggerEl?.focus()}
	/>
{/if}
