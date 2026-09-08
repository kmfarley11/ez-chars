<script lang="ts">
	import FieldAnnotationControl from './FieldAnnotationControl.svelte';
	import { FULL_2014_SRD_PATH } from '$utils/urlHelpers';
	import { DND5E_2014_SRD_RESOURCE_ID } from '$lib/resources/dnd5e2014ResourceCatalog';
	import type { GridAnnotationEditorConfig, GridContentAnnotation } from '$utils/gridContentTypes';

	let { withAnnotations = false, canEdit = true } = $props<{
		withAnnotations?: boolean;
		canEdit?: boolean;
	}>();

	// eslint-disable-next-line svelte/prefer-writable-derived
	let mockAnnotations = $state<Array<GridContentAnnotation>>([]);

	$effect(() => {
		mockAnnotations = withAnnotations
			? [
					{
						text: 'A basic note on this field',
						origin: 'user',
						kind: 'note',
						ref: {
							kind: 'pdf',
							sourceId: DND5E_2014_SRD_RESOURCE_ID,
							locator: { url: FULL_2014_SRD_PATH, page: 8 }
						}
					},
					{
						text: 'A more urgent pinned note',
						origin: 'user',
						kind: 'note'
					}
				]
			: [];
	});

	const handleSave = (nextAnnotations: Array<GridContentAnnotation>) => {
		mockAnnotations = nextAnnotations;
	};

	const annotationEditorConfig: GridAnnotationEditorConfig = {
		referenceTemplates: [
			{
				key: 'srd-class-features',
				label: 'SRD class features',
				reference: {
					kind: 'pdf',
					sourceId: DND5E_2014_SRD_RESOURCE_ID,
					locator: { url: FULL_2014_SRD_PATH, page: 8 }
				}
			}
		]
	};
</script>

<div class="p-8 max-w-sm bg-white border rounded">
	<p class="mb-4">Hover over the button or click to interact.</p>
	<FieldAnnotationControl
		fieldLabel="Test Field"
		annotations={mockAnnotations}
		annotationAffordance="persistent"
		{annotationEditorConfig}
		onSaveAnnotations={canEdit ? handleSave : undefined}
	/>
</div>
