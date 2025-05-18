<script>
	// TODO typescript to hint and verify variant...
	let { children = undefined, text = undefined, variant = 'xl' } = $props();
</script>

<div class="p-2 leading-none tracking-tight text-gray-900 dark:text-white">
	{#if variant === 'xl' || !variant}
		<h1 class="mb-4 text-4xl font-extrabold md:text-5xl lg:text-6xl">
			{text}{@render children?.()}
		</h1>
	{:else if variant === 'lg'}
		<h2 class="mb-3 text-2xl font-extrabold md:text-3xl lg:text-4xl">
			{text}{@render children?.()}
		</h2>
	{:else if variant === 'md'}
		<h3 class="mb-2 text-lg font-bold md:text-xl lg:text-2xl">
			{text}{@render children?.()}
		</h3>
	{:else if variant === 'sm'}
		<h4 class="text-md md:text-md mb-1 font-bold lg:text-lg">
			{text}{@render children?.()}
		</h4>
	{/if}
</div>
