<script lang="ts">
	import MenuButton from '$components/MenuButton.svelte';
	import MenuItemButton from '$components/MenuItemButton.svelte';

	interface Props {
		canEdit: boolean;
		onEdit: () => void;
		onNotes: () => void;
		triggerEl?: HTMLButtonElement;
	}

	let { canEdit, onEdit, onNotes, triggerEl = $bindable() }: Props = $props();
</script>

<div class="touch-target relative h-7 w-7 shrink-0">
	<MenuButton
		iconVariant="ellipsis"
		buttonSize="sm"
		buttonIconOnly
		buttonClasses="rounded-md"
		ariaLabel="Card actions"
		title="Card actions"
		bind:triggerEl
	>
		{#if canEdit}
			<MenuItemButton onclick={onEdit}>Edit</MenuItemButton>
		{/if}
		<MenuItemButton onclick={onNotes}>Notes</MenuItemButton>
	</MenuButton>
</div>
