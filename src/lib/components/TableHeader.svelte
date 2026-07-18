<script lang="ts">
	/* eslint-disable no-unused-vars */
	type Props = {
		headers: string[];
		formatHeader?: (value: string) => string;
	};

	let { headers, formatHeader = (value) => value }: Props = $props();
</script>

<thead>
	<tr class="theme-table-head text-center">
		{#each headers as header, i (i)}
			<th class="rounded-sm border p-2">{formatHeader(header)}</th>
		{/each}
	</tr>
</thead>
