<script lang="ts">
	import { getSmallEditAccess } from '$components/smallEditContext';
	const smallEdit = getSmallEditAccess();
	import { tick } from 'svelte';
	import GridContentEditDialog from '$components/GridContentEditDialog.svelte';
	import GridRecordDetailWorkflow from '$components/GridRecordDetailWorkflow.svelte';
	import type { CollectionPrioritySave } from '$components/collectionPriority';
	import { compare5e2014PriorityLabels } from '$lib/dnd5e2014/collectionPriority';
	import type {
		GridAnnotationEditorConfig,
		GridContentAnnotation,
		GridContentData
	} from '$utils/gridContentTypes';
	import type { CharacterDocument5e2014 } from '../../../../schema';
	import {
		decodeSupportingAddIntent,
		decodeSupportingRecordSaveIntent,
		decodeSupportingRemoveIntent,
		isSupportingRecordRemovable,
		projectSupportingAddData,
		projectSupportingRecordEditData
	} from '../supportingCollectionEditing';
	import type { SheetEditIntent } from '../sheetEditIntents';
	import SupportingCollectionView from './SupportingCollectionView.svelte';
	import type {
		SupportingCollectionKind,
		SupportingCollectionRow
	} from './supportingCollectionRows';

	type SaveResult = { ok: true; value: undefined } | { ok: false; message: string };

	interface Props {
		title: string;
		kind: SupportingCollectionKind;
		rows: ReadonlyArray<SupportingCollectionRow>;
		character: CharacterDocument5e2014;
		query?: string;
		annotationEditorConfig?: GridAnnotationEditorConfig;
		// eslint-disable-next-line no-unused-vars
		onIntents: (_intents: ReadonlyArray<SheetEditIntent>) => boolean | void;
		onSavePins?: CollectionPrioritySave;
	}

	let {
		title,
		kind,
		rows,
		character,
		query = $bindable(''),
		annotationEditorConfig = undefined,
		onIntents,
		onSavePins = undefined
	}: Props = $props();

	let selectedKey = $state<string | undefined>();
	let detailOpen = $state(false);
	let addOpen = $state(false);
	let focusedOpen = $state(false);
	let returnToFocused = $state(false);
	let returnToFocusedAfterAdd = $state(false);
	let restoreRowFocus = $state<() => boolean>(() => false);
	let addTriggerEl = $state<HTMLButtonElement>();
	let pendingFocusedRestore = $state<'selected' | 'add' | undefined>();
	const selectedRow = $derived(rows.find((row) => row.key === selectedKey));
	const selectedData = $derived(projectSupportingRecordEditData(character, selectedRow));
	const selectedAnnotations = $derived<Array<GridContentAnnotation>>(
		selectedRow?.annotations ?? []
	);
	const addData = $derived(projectSupportingAddData(kind));

	const openRow = async (
		row: SupportingCollectionRow,
		restoreFocus: () => boolean,
		fromFocusedView: boolean
	) => {
		selectedKey = row.key;
		restoreRowFocus = restoreFocus;
		returnToFocused = fromFocusedView;
		if (fromFocusedView) {
			focusedOpen = false;
			await tick();
		}
		if (
			smallEdit?.openRecord(
				row.key,
				returnFromDetail,
				isSupportingRecordRemovable(row)
					? () => {
							const current = rows.find((candidate) => candidate.identity === row.identity);
							if (!current) return false;
							const intent = decodeSupportingRemoveIntent(character, kind, current);
							return intent ? onIntents([intent]) : false;
						}
					: undefined,
				`Remove ${row.label}`
			)
		)
			return;
		detailOpen = true;
	};

	const returnFromDetail = async () => {
		detailOpen = false;
		await tick();
		if (returnToFocused) {
			pendingFocusedRestore = 'selected';
			focusedOpen = true;
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
		const addAction = [...(focusedDialog?.querySelectorAll<HTMLElement>('button') ?? [])].find(
			(button) => button.getAttribute('aria-label') === `Add ${title}`
		);
		(addAction ?? addTriggerEl)?.focus();
	};

	const saveRow = (
		data: GridContentData,
		annotations: Array<GridContentAnnotation>
	): SaveResult => {
		if (!selectedRow) return { ok: false, message: 'The selected record is no longer available.' };
		const intent = decodeSupportingRecordSaveIntent(
			character,
			kind,
			selectedRow,
			data,
			annotations
		);
		if (!intent) return { ok: false, message: 'Name is required.' };
		if (onIntents([intent]) === false) {
			return { ok: false, message: 'The record could not be saved.' };
		}
		return { ok: true, value: undefined };
	};

	const removeRow = () => {
		if (!selectedRow) return false;
		const intent = decodeSupportingRemoveIntent(character, kind, selectedRow);
		if (!intent || onIntents([intent]) === false) return false;
		detailOpen = false;
		void tick().then(() => {
			if (returnToFocused) {
				pendingFocusedRestore = 'add';
				focusedOpen = true;
			} else requestAnimationFrame(() => addTriggerEl?.focus());
		});
		return true;
	};

	const saveAddedRow = (data: GridContentData) => {
		const intent = decodeSupportingAddIntent(character, kind, data);
		if (!intent) return false;
		if (onIntents([intent]) === false) return false;
		return true;
	};
</script>

<SupportingCollectionView
	{title}
	{rows}
	bind:query
	bind:focusedOpen
	bind:addTriggerEl
	onFocusedOpened={restoreFocusedDialogFocus}
	onAdd={(fromFocusedView) => {
		returnToFocusedAfterAdd = fromFocusedView ?? false;
		addOpen = true;
	}}
	onOpenRow={openRow}
	{onSavePins}
	comparePriorityLabels={compare5e2014PriorityLabels}
/>

{#if selectedRow && (!smallEdit?.enabled || detailOpen)}
	<GridRecordDetailWorkflow
		bind:open={detailOpen}
		title={selectedRow.label}
		data={selectedData}
		annotations={selectedAnnotations}
		{annotationEditorConfig}
		provenance={selectedRow.context ?? 'Character collection record'}
		showBrowseBack={returnToFocused}
		onBrowseBack={() => void returnFromDetail()}
		onSave={saveRow}
		onRemove={isSupportingRecordRemovable(selectedRow) ? removeRow : undefined}
		removeLabel={`Remove ${selectedRow.label}`}
		onClosed={() => void returnFromDetail()}
	/>
{/if}

<GridContentEditDialog
	bind:open={addOpen}
	data={addData}
	title={`Add ${title}`}
	handleEditSave={saveAddedRow}
	onClosed={() => {
		if (returnToFocusedAfterAdd) {
			pendingFocusedRestore = 'add';
			focusedOpen = true;
		} else requestAnimationFrame(() => addTriggerEl?.focus());
	}}
/>
