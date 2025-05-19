<script>
	import '../../../../app.css';
	import { charsArray } from '../../../../data.js';

	/** @type {import('./$types').PageProps} */
	let { data } = $props();
	console.log(data);

	const charId = parseInt(data.id);
	const charIdx = charId > 0 ? charId - 1 : 0;

	const char = $state($charsArray[charIdx]);
</script>

<p>Test page 5e...</p>

<div class="grid grid-flow-row grid-rows-3 border rounded-lg grid-parent m-2 p-2">
	<div class="text-center row-span-1 flex-1/2">Meta / Top level info</div>
	<!-- TODO: why is there so much space here?... -->
	<div class="row-span-1 border rounded-md m-2 p-2">
		<div class="grid grid-parent grid-child grid-flow-col grid-cols-3">
			<div class="col-span-1">
				<div class="grid grid-child grid-flow-row grid-rows-2">
					<div class="row-span-1">
						name: {char.name}
					</div>
					<div class="row-span-1">
						class levels: {JSON.stringify(char.classLevels)}
					</div>
				</div>
			</div>
			<div class="col-span-1">
				{JSON.stringify(char.ancestry)}
			</div>
			<div class="col-span-1">
				<div class="grid grid-child grid-flow-row grid-rows-2">
					<div class="row-span-1">
						{char.alignment}
					</div>
					<div class="row-span-1">
						{char.appearance}
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="row-span-1 border rounded-md m-2 p-2">
		TODO: stat / quickref info
	</div>
</div>

TODO: all the rest of the info...
