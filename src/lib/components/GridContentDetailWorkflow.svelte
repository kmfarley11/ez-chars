<script lang="ts">
	import FieldGroupView from '$components/FieldGroupView.svelte';
	import FocusedDetailWorkflow, {
		type FocusedDetailMode
	} from '$components/FocusedDetailWorkflow.svelte';
	import GridContentAnnotationsDisplay from '$components/GridContentAnnotationsDisplay.svelte';
	import StructuredForm from '$components/StructuredForm.svelte';
	import {
		collectAnnotationPatchesFromData,
		collectHelpAnnotationGroups,
		collectPatchesFromData
	} from '$utils/gridContentHelpers';
	import { validateDraftAnnotations } from '$utils/focusedDraft';
	import type {
		GridAnnotationEditorConfig,
		GridContentData,
		GridContentPatch
	} from '$utils/gridContentTypes';

	type SaveResult = boolean | void;

	interface Props {
		open: boolean;
		title: string;
		data: GridContentData;
		annotationEditorConfig?: GridAnnotationEditorConfig;
		// eslint-disable-next-line no-unused-vars
		onSaveData?: (_data: GridContentData) => SaveResult;
		// eslint-disable-next-line no-unused-vars
		onSavePatches?: (_patches: Array<GridContentPatch>) => SaveResult;
		onCancel?: () => void;
		onClosed?: () => void;
	}

	let {
		open = $bindable(false),
		title,
		data,
		annotationEditorConfig = undefined,
		onSaveData = undefined,
		onSavePatches = undefined,
		onCancel = undefined,
		onClosed = undefined
	}: Props = $props();

	const uid = $props.id();
	const formId = `${uid}-structured-detail-form`;
	let mode = $state<FocusedDetailMode>('detail');
	let saveError = $state('');
	const annotationGroups = $derived(collectHelpAnnotationGroups(data));

	const beginEdit = () => {
		saveError = '';
	};

	const cancelEdit = () => {
		saveError = '';
		onCancel?.();
	};

	const save = (draftData: GridContentData) => {
		for (const patch of collectAnnotationPatchesFromData(draftData)) {
			const validationError = validateDraftAnnotations(patch.value);
			if (validationError) {
				saveError = validationError;
				return;
			}
		}

		const result = onSaveData
			? onSaveData(draftData)
			: onSavePatches?.(collectPatchesFromData(draftData));
		if (result === false) {
			saveError = 'Could not save these changes. Review the edited values and try again.';
			return;
		}

		saveError = '';
		mode = 'detail';
	};

	const closed = () => {
		mode = 'detail';
		saveError = '';
		onClosed?.();
	};
</script>

<FocusedDetailWorkflow
	bind:open
	bind:mode
	{title}
	wide={true}
	onBeginEdit={beginEdit}
	onCancelEdit={cancelEdit}
	onClosed={closed}
>
	{#snippet detail()}
		<div class="space-y-5">
			<section>
				<h3 class="text-sm font-semibold">Authored information</h3>
				<div class="mt-1"><FieldGroupView {data} displayMaxCols={1} interactive={false} /></div>
			</section>
			<section>
				<h3 class="text-sm font-semibold">Provenance</h3>
				<p class="theme-text-muted mt-1 text-sm">Character-authored information</p>
			</section>
			<section>
				<h3 class="text-sm font-semibold">Notes</h3>
				{#if annotationGroups.length === 0}
					<p class="theme-text-muted mt-1 text-sm italic">No notes yet.</p>
				{:else}
					<div class="mt-2 space-y-3">
						{#each annotationGroups as group (group.key)}
							<div class="rounded-md border p-2">
								<p class="mb-1 text-sm font-semibold">{group.title}</p>
								<GridContentAnnotationsDisplay annotations={group.annotations} />
							</div>
						{/each}
					</div>
				{/if}
			</section>
			<section>
				<h3 class="text-sm font-semibold">References</h3>
				<p class="theme-text-muted mt-1 text-sm">
					References remain attached to the annotations above.
				</p>
			</section>
		</div>
	{/snippet}
	{#snippet edit()}
		<div class="space-y-4">
			<StructuredForm
				id={formId}
				{data}
				{annotationEditorConfig}
				showAnnotations={true}
				onSave={save}
			/>
			{#if saveError}<p class="theme-error text-sm" role="alert">{saveError}</p>{/if}
		</div>
	{/snippet}
	{#snippet editActions()}
		<button
			type="submit"
			form={formId}
			class="theme-btn-light touch-target btn whitespace-nowrap rounded-lg border px-4 py-2 font-semibold shadow-sm"
		>
			Save
		</button>
	{/snippet}
</FocusedDetailWorkflow>
