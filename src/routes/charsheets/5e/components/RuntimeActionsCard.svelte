<script lang="ts">
	import { getSmallEditAccess } from '$components/smallEditContext';
	const smallEdit = getSmallEditAccess();
	import { tick } from 'svelte';
	import GridRecordDetailWorkflow from '$components/GridRecordDetailWorkflow.svelte';
	import {
		list5eRuntimeActionSourceCandidates,
		type RuntimeActionDraft
	} from '$lib/dnd5e2014/runtimeActionSources';
	import type {
		GridAnnotationEditorConfig,
		GridContentAnnotation,
		GridContentData
	} from '$utils/gridContentTypes';
	import type { CharacterDocument5e2014, RuntimeActionSource } from '../../../../schema';
	import {
		decodeRuntimeActionRemoveIntent,
		decodeRuntimeActionSaveIntent,
		projectRuntimeActionEditData
	} from '../runtimeActionEditing';
	import type { SheetEditIntent } from '../sheetEditIntents';
	import { projectRuntimeActionRows, type RuntimeActionRow } from './runtimeActionRows';
	import RuntimeActionDialog from './RuntimeActionDialog.svelte';
	import RuntimeActionsCollection from './RuntimeActionsCollection.svelte';

	type SaveResult = { ok: true; value: undefined } | { ok: false; message: string };

	interface Props {
		character: CharacterDocument5e2014;
		annotationEditorConfig?: GridAnnotationEditorConfig;
		// eslint-disable-next-line no-unused-vars
		onIntents: (_intents: ReadonlyArray<SheetEditIntent>) => boolean | void;
		// eslint-disable-next-line no-unused-vars
		onCreateAction: (_draft: RuntimeActionDraft) => void;
		// eslint-disable-next-line no-unused-vars
		onResyncAction: (_actionId: string) => void;
		// eslint-disable-next-line no-unused-vars
		onNavigateToSource: (_source: RuntimeActionSource) => void;
		// eslint-disable-next-line no-unused-vars
		confirmResync?: (_actionName: string, _sourceLabel: string) => boolean;
	}

	let {
		character,
		annotationEditorConfig = undefined,
		onIntents,
		onCreateAction,
		onResyncAction,
		onNavigateToSource,
		confirmResync = (actionName, sourceLabel) =>
			window.confirm(
				`Resync "${actionName}" from ${sourceLabel}? Source-owned name and detail may overwrite direct edits on this action.`
			)
	}: Props = $props();

	let isSuggestionPanelOpen = $state(false);
	let detailOpen = $state(false);
	let focusedOpen = $state(false);
	let returnToFocused = $state(false);
	let returnToFocusedAfterAdd = $state(false);
	let selectedId = $state<string | undefined>();
	let restoreRowFocus = $state<() => boolean>(() => false);
	let addActionTriggerEl = $state<HTMLButtonElement>();
	let pendingFocusedRestore = $state<'selected' | 'add' | undefined>();
	const actionRows = $derived(
		projectRuntimeActionRows(character.systemData.runtimeActions, character)
	);
	const sourceCandidates = $derived(list5eRuntimeActionSourceCandidates(character));
	const selectedRow = $derived(actionRows.find((row) => row.id === selectedId));
	const selectedData = $derived(projectRuntimeActionEditData(character, selectedRow));
	const selectedAnnotations = $derived<Array<GridContentAnnotation>>(
		selectedRow?.annotations ?? []
	);

	const requestSuggestions = (fromFocusedView = false) => {
		returnToFocusedAfterAdd = fromFocusedView;
		isSuggestionPanelOpen = true;
	};

	const closeSuggestions = async () => {
		isSuggestionPanelOpen = false;
		await tick();
		if (returnToFocusedAfterAdd) {
			pendingFocusedRestore = 'add';
			focusedOpen = true;
		} else requestAnimationFrame(() => addActionTriggerEl?.focus());
	};

	const openAction = async (
		row: RuntimeActionRow,
		restoreFocus: () => boolean,
		fromFocusedView: boolean
	) => {
		selectedId = row.id;
		restoreRowFocus = restoreFocus;
		returnToFocused = fromFocusedView;
		if (fromFocusedView) {
			focusedOpen = false;
			await tick();
		}
		if (
			smallEdit?.openRecord(
				`runtime-action:${row.id}`,
				returnFromDetail,
				() => {
					if (!character.systemData.runtimeActions.some((action) => action.id === row.id))
						return false;
					return onIntents([decodeRuntimeActionRemoveIntent(character, row.id)]);
				},
				'Remove action'
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
			if (!restoreRowFocus()) addActionTriggerEl?.focus();
		}
	};

	const restoreFocusedDialogFocus = () => {
		const target = pendingFocusedRestore;
		pendingFocusedRestore = undefined;
		if (!target) return;
		const focusedDialog = [...document.querySelectorAll<HTMLDialogElement>('dialog[open]')].find(
			(dialog) => dialog.getAttribute('aria-label') === 'Runtime actions'
		);
		if (target === 'selected') {
			const detailAction = focusedDialog?.querySelector<HTMLElement>(
				`#${CSS.escape(`runtime-action-${selectedId}-detail`)}`
			);
			if (detailAction instanceof HTMLElement) {
				detailAction.focus();
				return;
			}
		}
		const addAction = focusedDialog?.querySelector<HTMLElement>('button');
		(addAction ?? addActionTriggerEl)?.focus();
	};

	const saveAction = (
		data: GridContentData,
		annotations: Array<GridContentAnnotation>
	): SaveResult => {
		if (!selectedId) return { ok: false, message: 'The selected action is no longer available.' };
		const intent = decodeRuntimeActionSaveIntent(character, selectedId, data, annotations);
		if (!intent) return { ok: false, message: 'Action name is required.' };
		if (onIntents([intent]) === false) {
			return { ok: false, message: 'The action could not be saved.' };
		}
		return { ok: true, value: undefined };
	};

	const removeAction = () => {
		if (
			!selectedId ||
			onIntents([decodeRuntimeActionRemoveIntent(character, selectedId)]) === false
		)
			return false;
		detailOpen = false;
		void tick().then(() => {
			if (returnToFocused) {
				pendingFocusedRestore = 'add';
				focusedOpen = true;
			} else requestAnimationFrame(() => addActionTriggerEl?.focus());
		});
		return true;
	};

	const handleResyncRequest = (actionId: string, actionName: string, sourceLabel: string) => {
		if (confirmResync(actionName, sourceLabel)) onResyncAction(actionId);
	};
</script>

<div class="space-y-4">
	<RuntimeActionsCollection
		rows={actionRows}
		onAdd={requestSuggestions}
		onOpenAction={openAction}
		{onNavigateToSource}
		onResyncAction={handleResyncRequest}
		bind:addActionTriggerEl
		onFocusedOpened={restoreFocusedDialogFocus}
		bind:focusedOpen
	/>

	{#if selectedRow && (!smallEdit?.enabled || detailOpen)}
		<GridRecordDetailWorkflow
			bind:open={detailOpen}
			title={selectedRow.name}
			data={selectedData}
			annotations={selectedAnnotations}
			{annotationEditorConfig}
			provenance={selectedRow.source
				? `Source-linked action · ${selectedRow.source.label}`
				: 'Custom runtime action'}
			referenceSummary={selectedRow.source
				? `Use the Source menu in the collection to view or resync ${selectedRow.source.label}.`
				: 'No linked source.'}
			showBrowseBack={returnToFocused}
			onBrowseBack={() => void returnFromDetail()}
			onSave={saveAction}
			onRemove={removeAction}
			removeLabel="Remove action"
			onClosed={() => void returnFromDetail()}
		/>
	{/if}

	<RuntimeActionDialog
		bind:open={isSuggestionPanelOpen}
		candidates={sourceCandidates}
		onConfirm={onCreateAction}
		onClose={closeSuggestions}
	/>
</div>
