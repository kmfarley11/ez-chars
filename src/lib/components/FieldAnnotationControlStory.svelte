<script lang="ts">
	import FieldAnnotationControl from './FieldAnnotationControl.svelte';
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
					{ text: 'A basic note on this field', origin: 'user', kind: 'note' },
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
				key: 'local-rules',
				label: 'Local rules PDF',
				reference: {
					kind: 'pdf',
					sourceId: 'local-rules',
					locator: { url: '/rules.pdf', page: 12 }
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
