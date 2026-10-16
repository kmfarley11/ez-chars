<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

<!-- Match the app layout's surface and inherited foreground, independently of
     Storybook's browser-preference/background setting. No persistence or app chrome. -->
<div class="theme-page">
	{@render children()}
</div>
