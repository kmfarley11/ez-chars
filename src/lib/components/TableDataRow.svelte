<script lang="ts">
	type Props = {
		cells: string[];
		onclick?: () => void;
	};

	let { cells, onclick }: Props = $props();
</script>

<tr class="theme-table-row hover:mouse cursor-pointer" {onclick}>
	{#each cells as cell, i (i)}
		<td class="rounded-sm border p-2 text-left align-top wrap-break-word">{cell}</td>
	{/each}
</tr>
