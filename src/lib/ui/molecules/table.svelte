<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLTableAttributes } from 'svelte/elements';
	let {
		children,
		class: classes = '',
		...attributes
	}: HTMLTableAttributes & { children: Snippet } = $props();
</script>

<table
	{...attributes}
	class="theme-table border-tools-table-outline w-full table-auto border-separate justify-between rounded-sm border-2 text-left {classes}"
>
	{@render children()}
</table>
