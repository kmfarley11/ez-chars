<script lang="ts">
	import GridContentActionMenu from './GridContentActionMenu.svelte';
	import DialogShell from './DialogShell.svelte';

	let { canEdit = true } = $props<{ canEdit?: boolean }>();

	let isEditDialogOpen = $state(false);
	let isNotesDialogOpen = $state(false);
	let triggerEl = $state<HTMLButtonElement>();

	const restoreFocus = () => {
		triggerEl?.focus();
	};
</script>

<div
	class="p-8 max-w-sm flex justify-end bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded"
>
	<GridContentActionMenu
		{canEdit}
		onEdit={() => (isEditDialogOpen = true)}
		onNotes={() => (isNotesDialogOpen = true)}
		bind:triggerEl
	/>
</div>

<DialogShell
	bind:open={isEditDialogOpen}
	title="Edit Content"
	closeText="Cancel"
	onClose={restoreFocus}
>
	<div class="p-2 text-sm space-y-2">
		<h3 class="font-semibold text-base">Edit Dialog</h3>
		<p class="theme-text-muted">
			The action menu popover automatically closed and reset its trigger to &hellip; when Edit was
			selected. Closing this dialog restores keyboard focus to the closed trigger button.
		</p>
	</div>
</DialogShell>

<DialogShell bind:open={isNotesDialogOpen} title="Notes" closeText="Cancel" onClose={restoreFocus}>
	<div class="p-2 text-sm space-y-2">
		<h3 class="font-semibold text-base">Notes Dialog</h3>
		<p class="theme-text-muted">
			The action menu popover automatically closed and reset its trigger to &hellip; when Notes was
			selected. Closing this dialog restores keyboard focus to the closed trigger button.
		</p>
	</div>
</DialogShell>
