<script lang="ts">
	import type { Snippet } from 'svelte';
	import BaseButton from '$components/BaseButton.svelte';
	import DialogShell from '$components/DialogShell.svelte';

	export type FocusedDetailMode = 'detail' | 'edit';

	interface Props {
		open: boolean;
		mode?: FocusedDetailMode;
		title: string;
		detail: Snippet;
		edit?: Snippet;
		detailActions?: Snippet;
		editActions?: Snippet;
		wide?: boolean;
		showBrowseBack?: boolean;
		onBrowseBack?: () => void;
		onBeginEdit?: () => void;
		onCancelEdit?: () => void;
		onSave?: () => boolean | void | Promise<boolean | void>;
		onClosed?: () => void;
	}

	let {
		open = $bindable(false),
		mode = $bindable<FocusedDetailMode>('detail'),
		title,
		detail,
		edit = undefined,
		detailActions = undefined,
		editActions = undefined,
		wide = false,
		showBrowseBack = false,
		onBrowseBack = undefined,
		onBeginEdit = undefined,
		onCancelEdit = undefined,
		onSave = undefined,
		onClosed = undefined
	}: Props = $props();

	const isEditing = $derived(mode === 'edit');

	const beginEdit = () => {
		onBeginEdit?.();
		mode = 'edit';
	};

	const returnToDetail = () => {
		onCancelEdit?.();
		mode = 'detail';
	};

	const save = async () => {
		const result = await onSave?.();
		if (result !== false) mode = 'detail';
	};

	const goBack = () => {
		if (isEditing) {
			returnToDetail();
			return;
		}
		onBrowseBack?.();
	};

	const cancelDialog = () => {
		if (!isEditing) return true;
		returnToDetail();
		return false;
	};
</script>

<DialogShell
	bind:open
	{title}
	{wide}
	fullHeightMobile={true}
	scrollAffordance={true}
	showBack={isEditing || showBrowseBack}
	onBack={goBack}
	onCancel={cancelDialog}
	onClose={onClosed}
	closeText={isEditing ? 'Cancel' : 'Close'}
>
	{#if isEditing && edit}
		{@render edit()}
	{:else}
		{@render detail()}
	{/if}

	{#snippet actions()}
		{#if isEditing}
			{#if editActions}
				{@render editActions()}
			{:else}
				<BaseButton onclick={() => void save()}>Save</BaseButton>
			{/if}
		{:else}
			{@render detailActions?.()}
			{#if edit && onBeginEdit}
				<BaseButton onclick={beginEdit}>Edit</BaseButton>
			{/if}
		{/if}
	{/snippet}
</DialogShell>
