<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	let {
		children,
		class: classes = '',
		...attributes
	}: HTMLAttributes<HTMLTableRowElement> & { children: Snippet } = $props();
</script>

<tr {...attributes} class="theme-table-row {classes}">{@render children()}</tr>
