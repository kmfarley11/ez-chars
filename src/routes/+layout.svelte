<script>
	import NavBar from '$lib/NavBar.svelte';
	import { onMount } from 'svelte';
	import { initializeTheme } from '$lib/theme';
	import '../app.css';

	let { children } = $props();

	onMount(() => {
		initializeTheme();
	});
</script>

<div class="theme-page">
	<NavBar />
	{@render children()}
</div>
