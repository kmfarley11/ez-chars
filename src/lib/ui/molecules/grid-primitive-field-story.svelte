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
		editAffordance = 'persistent',
		absent = false,
		initialText = 'Prone\nConcentrating on a spell',
		rejectSaves = false
	}: {
		kind?: 'number' | 'text' | 'boolean' | 'multiline';
		absent?: boolean;
		initialText?: string;
		rejectSaves?: boolean;
		withAnnotation?: boolean;
		editAffordance?: 'persistent' | 'hover';
	} = $props();

	let field = $state<GridContentField>({ fieldName: 'Score', value: 12 });
	let lastPatch = $state<JSONPatchDocument | undefined>(undefined);

	$effect(() => {
		field = {
			fieldName:
				kind === 'number'
					? 'Score'
					: kind === 'boolean'
						? 'Ready'
						: kind === 'multiline'
							? 'Conditions'
							: 'Nickname',
			value:
				kind === 'boolean'
					? false
					: absent && kind !== 'number'
						? ''
						: kind === 'number'
							? 12
							: kind === 'multiline'
								? initialText
								: 'Sparky',
			inputKind: kind === 'multiline' ? 'text' : kind,
			multiline: kind === 'multiline',
			binding: { valuePatchOperation: absent && kind !== 'number' ? 'add' : 'replace' },
			bindPath: ['profile', 'a/b', 'tilde~key'],
			annotationBindPath: ['annotations', 'profile'],
			annotations: withAnnotation
				? [{ id: 'note-1', origin: 'user', kind: 'note', text: 'Remember the bonus.' }]
				: [],
			capabilities: { canEditValue: true, canEditAnnotations: true },
			interaction: {
				tier: kind === 'boolean' || editAffordance === 'persistent' ? 'runtime' : 'read-first',
				editAffordance,
				annotationAffordance: 'persistent'
			}
		};
		lastPatch = undefined;
	});

	const savePatch = (patch: JSONPatchDocument, compatibilityPatches: Array<GridContentPatch>) => {
		if (rejectSaves) throw new Error('This example rejects saves.');
		lastPatch = patch;
		const replacement = compatibilityPatches[0];
		if (replacement) {
			field = {
				...field,
				value: replacement.value as string | number | boolean,
				binding: { valuePatchOperation: 'replace' }
			};
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
		Escape and keyboard focus, then add a note independently. Use Controls for field type and the
		viewport toolbar for phone widths. Boolean toggles save immediately; multiline Enter adds a
		line. Use absent/rejectSaves Controls to check no-op and error behavior. The patch output is
		diagnostic, not a storage save. Quiet Affordance is the low-level hover variant, not the current
		Tier 2 detail workflow; use Organisms / Read-first Detail for that pattern.
	</p>
	{#key `${kind}-${absent}-${editAffordance}`}
		<GridPrimitiveField
			fieldKey="score"
			{field}
			onSavePatch={savePatch}
			onSaveAnnotations={saveAnnotations}
		/>
	{/key}
	<output aria-label="Last emitted patch" class="mt-4 block break-all text-xs">
		{lastPatch ? JSON.stringify(lastPatch) : 'No patch emitted'}
	</output>
</div>
