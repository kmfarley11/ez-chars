<script lang="ts">
	import GridPrimitiveField from './GridPrimitiveField.svelte';
	import type { JSONPatchDocument } from 'immutable-json-patch';
	import type {
		GridContentAnnotation,
		GridContentField,
		GridContentPatch
	} from '$utils/gridContentTypes';

	let {
		kind = 'number',
		withAnnotation = false,
		editAffordance = 'persistent'
	} = $props<{
		kind?: 'number' | 'text';
		withAnnotation?: boolean;
		editAffordance?: 'persistent' | 'hover';
	}>();

	let field = $state<GridContentField>({ fieldName: 'Score', value: 12 });
	let lastPatch = $state<JSONPatchDocument | undefined>(undefined);

	$effect(() => {
		field = {
			fieldName: kind === 'number' ? 'Score' : 'Nickname',
			value: kind === 'number' ? 12 : 'Sparky',
			inputKind: kind,
			bindPath: ['profile', 'a/b', 'tilde~key'],
			annotationBindPath: ['annotations', 'profile'],
			annotations: withAnnotation
				? [{ id: 'note-1', origin: 'user', kind: 'note', text: 'Remember the bonus.' }]
				: [],
			capabilities: { canEditValue: true, canEditAnnotations: true },
			interaction: { editAffordance, annotationAffordance: 'persistent' }
		};
		lastPatch = undefined;
	});

	const savePatch = (patch: JSONPatchDocument, compatibilityPatches: Array<GridContentPatch>) => {
		lastPatch = patch;
		const replacement = compatibilityPatches[0];
		if (replacement) {
			field = { ...field, value: replacement.value as string | number };
		}
	};

	const saveAnnotations = (annotations: Array<GridContentAnnotation>) => {
		field = { ...field, annotations };
	};
</script>

<div class="max-w-lg rounded border bg-white p-8">
	<GridPrimitiveField
		fieldKey="score"
		{field}
		onSavePatch={savePatch}
		onSaveAnnotations={saveAnnotations}
	/>
	<output aria-label="Last emitted patch" class="mt-4 block text-xs">
		{lastPatch ? JSON.stringify(lastPatch) : 'No patch emitted'}
	</output>
</div>
