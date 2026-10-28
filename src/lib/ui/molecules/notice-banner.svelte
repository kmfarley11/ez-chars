<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		title: string;
		message?: string;
		tone?: 'amber' | 'orange';
		role?: 'note' | 'alert';
		ariaLabel?: string;
		children?: Snippet;
	}
	let { title, message, tone = 'amber', role = 'note', ariaLabel, children }: Props = $props();
</script>

<div
	{role}
	aria-label={ariaLabel ?? title}
	class="theme-grid-layer mx-4 mt-4 space-y-1 rounded-md border p-4"
	style:border-color={tone === 'orange' ? 'var(--color-orange-500)' : 'var(--color-amber-500)'}
>
	<p
		class={[
			'text-sm font-semibold',
			tone === 'orange'
				? 'text-orange-700 dark:text-orange-400'
				: 'text-amber-600 dark:text-amber-400'
		]}
	>
		<span aria-hidden="true">🚧</span>
		{title}
	</p>
	<div class="theme-text-muted space-y-1 text-sm">
		{#if message}<p>{message}</p>{/if}
		{@render children?.()}
	</div>
</div>
