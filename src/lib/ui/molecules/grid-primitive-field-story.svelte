<script lang="ts">
	import GridPrimitiveField from '$lib/ui/molecules/grid-primitive-field.svelte';
	import type { JSONPatchDocument } from 'immutable-json-patch';
	import type {
		GridContentAnnotation,
		GridContentField,
		GridContentPatch
	} from '$lib/utils/gridContentTypes';

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
			interaction: {
				tier: editAffordance === 'persistent' ? 'runtime' : 'read-first',
				editAffordance,
				annotationAffordance: 'persistent'
			}
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

<div class="theme-panel max-w-lg space-y-3 rounded border p-4">
	<h1 class="font-semibold">Edit-first (Tier 1 Field)</h1>
	<p class="text-sm">
		The production GridPrimitiveField with local example state. Edit the value, Save or Cancel, try
		Escape and keyboard focus, then add a note independently. Use Controls for number/text and the
		viewport toolbar for phone widths. The patch output is diagnostic, not a storage save. Quiet
		Affordance is the low-level hover variant, not the current Tier 2 detail workflow; use Organisms
		/ Read-first Detail for that pattern.
	</p>
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
