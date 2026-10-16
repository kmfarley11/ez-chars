<script lang="ts">
	interface Props {
		label: string;
	}

	let { label }: Props = $props();
</script>

<span class="theme-text-muted rounded border px-1 text-[10px] tracking-wide uppercase">
	{label}
</span>
