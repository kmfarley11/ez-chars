<script lang="ts">
	import DialogShell from '$components/DialogShell.svelte';
	import StructuredForm from '$components/StructuredForm.svelte';
	import { collectValuePatchesFromData } from '$utils/gridContentHelpers';
	import type { GridContentData, GridContentPatch } from '$utils/gridContentTypes';

	interface Props {
		open: boolean;
		data: GridContentData;
		// eslint-disable-next-line no-unused-vars
		handleEditSave?: (_payload: GridContentData) => void;
		// eslint-disable-next-line no-unused-vars
		handleEditSavePatches?: (_patches: Array<GridContentPatch>) => void;
		handleEditCancel?: () => void;
		onClosed?: () => void;
		title?: string;
	}

	let {
		open = $bindable(),
		data,
		handleEditSave,
		handleEditSavePatches,
		handleEditCancel = undefined,
		onClosed = undefined,
		title = 'Edit Fields'
	}: Props = $props();

	const handleCloseAction = () => {
		open = false;
	};

	const onDialogShellClose = () => {
		onClosed?.();
	};

	const onCancelAction = () => {
		handleEditCancel?.();
		return true;
	};

	const onSaveComplete = (payload: GridContentData) => {
		if (handleEditSave) {
			handleEditSave(payload);
		} else if (handleEditSavePatches) {
			handleEditSavePatches(
				collectValuePatchesFromData(payload).map(({ path, value }) => ({ path, value }))
			);
		}
		handleCloseAction();
	};

	const formId = 'structured-edit-form';
</script>

<DialogShell
	bind:open
	{title}
	onClose={onDialogShellClose}
	onCancel={onCancelAction}
	closeText="Cancel"
	scrollAffordance={true}
>
	{#if open}
		<StructuredForm id={formId} {data} onSave={onSaveComplete} />
	{/if}

	{#snippet actions()}
		<button
			type="submit"
			form={formId}
			class="theme-btn-light touch-target btn whitespace-nowrap rounded-lg border px-4 py-2 font-semibold shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
		>
			Save
		</button>
	{/snippet}
</DialogShell>
