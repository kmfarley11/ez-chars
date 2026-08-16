<script lang="ts">
	import StructuredForm from './StructuredForm.svelte';
	import type { GridContentData, GridContentField } from '$utils/gridContentTypes';

	let { withArray = false } = $props<{
		withArray?: boolean;
	}>();

	let mockData: GridContentData = $derived(
		(withArray
			? {
					name: { fieldName: 'Name', value: 'Longsword' },
					properties: {
						fieldName: 'Properties',
						value: [{ fieldName: 'Property', value: 'Versatile' }],
						addItemTemplate: { fieldName: 'Property', value: '' } as unknown as GridContentField
					} as GridContentField
				}
			: {
					name: { fieldName: 'Character Name', value: 'Thorin' },
					age: { fieldName: 'Age', value: 150, inputKind: 'number' },
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
					},
					notes: {
						fieldName: 'Background',
						value: 'A dwarf from the lonely mountain.',
						multiline: true
					}
				}) as GridContentData
	);
	let submittedData = $state<GridContentData | undefined>(undefined);
</script>

<div class="p-8 max-w-md bg-white border rounded">
	<StructuredForm data={mockData} onSave={(data) => (submittedData = data)} />
	<button
		form="structured-form"
		type="submit"
		class="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
	>
		Submit Form Outside
	</button>
	<output aria-label="Last submitted data" class="mt-4 block text-xs">
		{submittedData ? JSON.stringify(submittedData) : 'No data submitted'}
	</output>
</div>
