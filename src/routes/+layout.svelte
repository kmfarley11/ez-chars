<script>
	import NavBar from '$lib/NavBar.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<div>
	<NavBar />
	{@render children()}
</div>
