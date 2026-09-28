<script lang="ts">
	import BaseButton from './BaseButton.svelte';
	interface Props {
		label: string;
		ariaLabel?: string;
		presentation?: 'label' | 'button';
		// eslint-disable-next-line no-unused-vars
		onclick: (event: MouseEvent) => void;
	}
	let { label, ariaLabel = `View ${label}`, presentation = 'label', onclick }: Props = $props();
</script>

<BaseButton
	size="sm"
	{ariaLabel}
	ariaHaspopup="dialog"
	{onclick}
	classes={`min-h-0 min-w-0 max-w-full justify-start rounded-sm px-1 py-0.5 font-medium leading-normal text-left whitespace-normal break-words shadow-none ring-0 ${
		presentation === 'label'
			? 'border-transparent! bg-transparent! text-[var(--color-brand)]! underline decoration-dotted underline-offset-4'
			: ''
	}`}
>
	{label}
</BaseButton>
