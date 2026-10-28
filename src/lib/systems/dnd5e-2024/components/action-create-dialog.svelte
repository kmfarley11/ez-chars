<script lang="ts">
	import { tick } from 'svelte';
	import BaseButton from '$lib/ui/atoms/base-button.svelte';
	import DialogShell from '$lib/ui/molecules/dialog-shell.svelte';
	import GridContentListView from '$lib/ui/molecules/grid-content-list-view.svelte';
	import StructuredForm from '$lib/ui/molecules/structured-form.svelte';
	import type { GridContentData } from '$lib/utils/gridContentTypes';
	import { actionSourceCandidates, type ActionSource } from '../action-sources';
	import { newRecordData, type SheetEditSession } from '../editing/sheet-edit-session';

	let {
		open = $bindable(false),
		candidates,
		session,
		onClosed
	}: {
		open: boolean;
		candidates: ReturnType<typeof actionSourceCandidates>;
		session: SheetEditSession;
		onClosed: () => void;
	} = $props();
	let shell = $state<ReturnType<typeof DialogShell>>();
	let reviewing = $state(false);
	let selectedKey = $state<string>();
	let source = $state<ActionSource>();
	let data = $state<GridContentData>();
	let query = $state('');
	let error = $state('');
	const uid = $props.id();
	const formId = `${uid}-action-draft`;

	const select = async (key?: string) => {
		const candidate = key ? candidates.find((entry) => entry.key === key) : undefined;
		if (key && !candidate) return;
		if (!data || selectedKey !== key) {
			const next = newRecordData('runtimeActions');
			if (candidate) {
				next.name.value = candidate.label;
				next.detail.value = candidate.detail ?? '';
			}
			data = next;
		}
		selectedKey = key;
		source = candidate?.source;
		error = '';
		reviewing = true;
		await tick();
		shell?.focusHeading();
	};
	const back = async () => {
		reviewing = false;
		await tick();
		shell?.focusHeading();
	};
	const save = (draft: GridContentData) => {
		const result = session.add('runtimeActions', draft, source);
		if (!result.ok) {
			error = result.message;
			return;
		}
		open = false;
	};
	const closed = () => {
		reviewing = false;
		selectedKey = undefined;
		source = undefined;
		data = undefined;
		query = '';
		error = '';
		onClosed();
	};
</script>

<DialogShell
	bind:this={shell}
	bind:open
	title={reviewing ? 'Review action' : 'Add action'}
	showBack={reviewing}
	onBack={back}
	onClose={closed}
	closeText="Cancel"
	scrollAffordance
>
	{#if open}
		<div hidden={reviewing} class="space-y-3">
			<BaseButton onclick={() => select()}>Create custom action</BaseButton>
			<p class="theme-text-muted text-sm">
				Or copy an item's, spell's or feature's name and description. Timing stays your choice.
			</p>
			<GridContentListView
				title="Action sources"
				rows={candidates}
				bind:query
				bounded
				emptyText="No sources yet. Create a custom action or add an item, spell or feature first."
				onOpenRow={(row) => select(row.key)}
			/>
		</div>
		{#if data}
			<div hidden={!reviewing} class="space-y-3">
				<p class="theme-text-muted text-sm">
					{source
						? 'Source snapshot — later source edits do not update this action automatically.'
						: 'Custom action — no source link.'}
				</p>
				{#key selectedKey ?? 'custom'}
					<StructuredForm id={formId} {data} onSave={save} />
				{/key}
				{#if error}<p class="theme-error text-sm" role="alert">{error}</p>{/if}
			</div>
		{/if}
	{/if}
	{#snippet actions()}
		{#if reviewing}<BaseButton type="submit" form={formId}>Confirm Action</BaseButton>{/if}
	{/snippet}
</DialogShell>
