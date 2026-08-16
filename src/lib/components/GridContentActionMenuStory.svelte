<script lang="ts">
	import GridContentActionMenu from './GridContentActionMenu.svelte';

	let { canEdit = true } = $props<{ canEdit?: boolean }>();

	const onEdit = () => console.log('Edit clicked');
	const onNotes = () => console.log('Notes clicked');
</script>

<div class="p-8 max-w-sm flex justify-end bg-white border rounded">
	<GridContentActionMenu {canEdit} {onEdit} {onNotes} />
</div>
