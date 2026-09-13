<script lang="ts">
	/* eslint-disable no-unused-vars */
	type Props = {
		headers: string[];
		formatHeader?: (value: string) => string;
		align?: 'left' | 'center' | 'right';
	};

	let { headers, formatHeader = (value) => value, align = 'center' }: Props = $props();

	const alignClass = $derived(
		align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center'
	);
</script>

<thead>
	<tr class="theme-table-head {alignClass}">
		{#each headers as header, i (i)}
			<th class="rounded-sm border p-2">
				{formatHeader(header)}
			</th>
		{/each}
	</tr>
</thead>
