<script>
	let { children, onclick = () => {} } = $props();
</script>

<div class="rounded-lg p-1 px-2 py-2 hover:bg-white" role="none">
	<button
		class="btn text-left text-gray-900 dark:text-white"
		role="menuitem"
		tabindex="-1"
		{onclick}
	>
		{@render children?.()}
	</button>
</div>
