<script lang="ts">
	interface Props {
		classes?: string;
	}
	let { classes = 'h-[1em] w-[1em]' }: Props = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 24 24"
	fill="currentColor"
	class={classes}
	aria-hidden="true"
>
	<circle cx="12" cy="12" r="3.5" />
</svg>
