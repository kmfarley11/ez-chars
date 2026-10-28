<script lang="ts">
	import { tick } from 'svelte';
	import GridContentList from '$lib/ui/organisms/grid-content-list.svelte';
	import GridContentEditDialog from '$lib/ui/organisms/grid-content-edit-dialog.svelte';
	import { getSmallEditAccess } from '$lib/ui/organisms/small-edit-context';
	import type { GridContentListRowAction } from '$lib/ui/molecules/grid-content-list';
	import type { GridContentData, GridAnnotationEditorConfig } from '$lib/utils/gridContentTypes';
	import type { SmallEditAction, ScalarValue } from '$lib/utils/smallEdit';
	import { create5eSmallGridModel, type SmallEditOwner } from '../editing/small-edit-adapters';
	import { project5eSheet, projectClassRows } from '../sheet-projections';

	let {
		owner,
		annotationEditorConfig
	}: { owner: SmallEditOwner; annotationEditorConfig?: GridAnnotationEditorConfig } = $props();
	const detail = getSmallEditAccess();
	const rows = $derived(projectClassRows(owner.read()));
	const data = $derived({ classLevels: project5eSheet(owner.read()).metaPrimaryData.classLevels });
	let adding = $state(false);
	let browsing = $state(false);
	let addTrigger = $state<HTMLButtonElement>();
	let addAction = $state.raw<SmallEditAction>();
	let addData = $state.raw<GridContentData>({});
	let pendingRestore: (() => boolean) | undefined;

	const openRow: GridContentListRowAction = async (row, restore) => {
		const returnToBrowse = browsing;
		if (browsing) {
			browsing = false;
			await tick();
		}
		detail?.openGrid({
			data,
			title: 'Classes',
			annotationEditorConfig,
			selectedKey: `/systemData/classes/${row.key.slice('class:'.length)}/name`,
			onClosed: async () => {
				await tick();
				if (returnToBrowse) {
					pendingRestore = restore;
					browsing = true;
				} else if (!restore()) addTrigger?.focus();
			}
		});
	};
	const add = () => {
		// Reuse the guarded class operation, including stale-array and source reconciliation rules.
		addAction = create5eSmallGridModel(
			owner,
			data,
			'Classes',
			annotationEditorConfig
		)?.actions?.find((action) => action.key === 'add-class');
		if (!addAction) return;
		addData = Object.fromEntries(
			(addAction.fields ?? []).map((field) => [
				field.key,
				{
					fieldName: field.label,
					value: field.read() ?? '',
					inputKind: field.kind === 'number' ? 'number' : 'text'
				}
			])
		);
		adding = true;
	};
</script>

<GridContentList
	title="Classes"
	presentation="compact"
	{rows}
	onOpenRow={openRow}
	onAdd={add}
	bind:focusedOpen={browsing}
	bind:addTriggerEl={addTrigger}
	onFocusedOpened={() => {
		pendingRestore?.();
		pendingRestore = undefined;
	}}
/>
<GridContentEditDialog
	title="Add Classes"
	bind:open={adding}
	data={addData}
	handleEditSave={(values) =>
		addAction?.commit(
			Object.fromEntries(
				Object.entries(values).map(([key, field]) => [key, field.value as ScalarValue])
			)
		).ok ?? false}
	onClosed={() => addTrigger?.focus()}
/>
