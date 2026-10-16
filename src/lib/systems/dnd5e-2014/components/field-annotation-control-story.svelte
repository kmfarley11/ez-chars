<script lang="ts">
	import { asset } from '$app/paths';
	import { create5eAnnotationReferenceProvider } from '$lib/systems/dnd5e-2014/annotation-reference';
	import { setAnnotationReferenceProvider } from '$lib/resources/annotation-reference-context';
	// This existing SRD-specific story remains system-owned until catalog rollout.
	setAnnotationReferenceProvider(
		create5eAnnotationReferenceProvider((path) => asset(path as Parameters<typeof asset>[0]))
	);
	import FieldAnnotationControl from '$lib/ui/molecules/field-annotation-control.svelte';
	import { FULL_2014_SRD_PATH } from '$lib/utils/urlHelpers';
	import { DND5E_2014_SRD_RESOURCE_ID } from '$lib/resources/dnd5e2014ResourceCatalog';
	import type {
		GridAnnotationEditorConfig,
		GridContentAnnotation
	} from '$lib/utils/gridContentTypes';

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
