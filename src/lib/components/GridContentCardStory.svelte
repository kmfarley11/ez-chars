<script lang="ts">
	import GridContentCard from './GridContentCard.svelte';
	import type { JSONPatchDocument } from 'immutable-json-patch';
	import type { GridContentData } from '$utils/gridContentTypes';

	let { withData = true, hideActions = false } = $props<{
		withData?: boolean;
		hideActions?: boolean;
	}>();

	let mockData: GridContentData = $derived(
		(withData
			? {
					name: {
						fieldName: 'Character Name',
						value: 'Thorin',
						bindPath: ['profile', 'a/b', 'tilde~key'],
						interaction: { editAffordance: 'persistent' },
						capabilities: { canEditValue: true }
					},
					class: { fieldName: 'Class', value: 'Fighter', readOnly: true },
					level: { fieldName: 'Level', value: 3, readOnly: true },
					hp: { fieldName: 'Hit Points', value: 32, inputKind: 'number' },
					alignment: {
						fieldName: 'Alignment',
						value: 'Lawful Good',
						options: [
							'Lawful Good',
							'Neutral Good',
							'Chaotic Good',
							'Lawful Neutral',
							'True Neutral',
							'Chaotic Neutral',
							'Lawful Evil',
							'Neutral Evil',
							'Chaotic Evil'
						]
					}
				}
			: {}) as GridContentData
	);
	let savedData = $state<GridContentData | undefined>(undefined);
	let lastPatch = $state<JSONPatchDocument | undefined>(undefined);

	const handleEditSave = (payload: GridContentData) => {
		savedData = payload;
	};

	const handleFieldSavePatch = (patches: JSONPatchDocument) => {
		lastPatch = patches;
		for (const patch of patches) {
			if (patch.op === 'replace') {
				savedData = {
					...mockData,
					name: { ...mockData.name, value: patch.value as string }
				};
			}
		}
	};
</script>

<div class="p-8 max-w-2xl bg-white border rounded">
	<GridContentCard
		data={savedData ?? mockData}
		{hideActions}
		{handleEditSave}
		{handleFieldSavePatch}
	/>
	<output aria-label="Last card patch" class="mt-4 block text-xs">
		{lastPatch ? JSON.stringify(lastPatch) : 'No patch emitted'}
	</output>
</div>
