<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLTdAttributes } from 'svelte/elements';
	let {
		children,
		class: classes = '',
		...attributes
	}: HTMLTdAttributes & { children: Snippet } = $props();
</script>

<td {...attributes} class="rounded-sm border p-2 text-left align-top wrap-break-word {classes}"
	>{@render children()}</td
>
