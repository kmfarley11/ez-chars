<script>
	import GridColumn from '$lib/GridColumn.svelte';
	import GridRow from '$lib/GridRow.svelte';
	import '../../../app.css';
	import { charsArray, emptyChar } from '../../../data.js';

	const props = $props();
	/** @type {import('./$types').PageProps['data']} */
	const data = $derived(props.data);

	const charId = $derived(parseInt(data.id));
	const charIdx = $derived(charId > 0 ? charId - 1 : -1);

	const char = $derived(
		charIdx === -1 ? emptyChar : $charsArray[charIdx] ?? emptyChar
	);
</script>

<p>Test page 5e...</p>

<GridColumn parent={true} pad={true} classes="rounded-lg" border={true}>
	<GridRow classes="text-center">Meta / Top level info</GridRow>
	<GridRow border={true} pad={true} parent={true} child={true} colCount={3}>
		<GridColumn>
			<GridRow>
				name: {char.name}
			</GridRow>
			<GridRow>
				class levels: {JSON.stringify(char.classLevels)}
			</GridRow>
		</GridColumn>
		<GridColumn>
			<GridRow>
				ancestry: {JSON.stringify(char.ancestry, null, 1)}
			</GridRow>
		</GridColumn>
		<GridColumn child={true} rowCount={2}>
			<GridRow>
				alignment: {char.alignment}
			</GridRow>
			<GridRow>
				appearance: {char.appearance}
			</GridRow>
		</GridColumn>
	</GridRow>
	<GridRow border={true} pad={true} classes="text-center">TODO: stat / quickref info</GridRow>
</GridColumn>

TODO: all the rest of the info...
