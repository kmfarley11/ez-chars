<script lang="ts">
	import GridColumn from '$lib/GridColumn.svelte';
	import GridRow from '$lib/GridRow.svelte';
	import '../../../app.css';
	import { charsArray, emptyChar } from '../../../data.js';
	import type { CharacterDocument5e2014 } from '../../../schema';

	interface Props {
		data: {
			id: string;
		};
	}

	const { data }: Props = $props();
	const charIdx = $derived($charsArray.findIndex((char) => char.meta.id == data.id));
	const char: CharacterDocument5e2014 = $derived(
		charIdx === -1 ? emptyChar : ($charsArray[charIdx] ?? emptyChar)
	) as CharacterDocument5e2014;
</script>

<!-- TODO update this per the latest form factors, prove the concept and refine -->
<p>Test page 5e...</p>

<GridColumn parent={true} pad={true} classes="rounded-lg" border={true}>
	<GridRow classes="text-center">Meta / Top level info</GridRow>
	<GridRow border={true} pad={true} parent={true} child={true} colCount={3}>
		<GridColumn>
			<GridRow>
				name: {char.identity.name}
			</GridRow>
			<GridRow>
				class levels: {JSON.stringify(char.systemData.classes)}
			</GridRow>
		</GridColumn>
		<GridColumn>
			<GridRow>
				ancestry: {JSON.stringify(char.systemData.race, null, 1)}
			</GridRow>
		</GridColumn>
		<GridColumn child={true} rowCount={2}>
			<GridRow>
				alignment: {char.identity.alignment}
			</GridRow>
			<GridRow>
				appearance: {char.identity.appearance}
			</GridRow>
		</GridColumn>
	</GridRow>
	<GridRow border={true} pad={true} classes="text-center">TODO: stat / quickref info</GridRow>
</GridColumn>

TODO: all the rest of the info...
