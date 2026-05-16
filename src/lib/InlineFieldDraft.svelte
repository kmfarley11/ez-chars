<script lang="ts">
	import GridPrimitiveField from '$lib/GridPrimitiveField.svelte';
	import type { JSONPatchDocument, JSONPointer } from 'immutable-json-patch';
	import type {
		GridAnnotationAffordance,
		GridAnnotationEditorConfig,
		GridContentAnnotation,
		GridContentField,
		GridEditAffordance,
		GridFieldPatchOperation
	} from '$lib/gridContentTypes';

	type InlineFieldDraftValue = string | number;

	interface Props {
		label: string;
		value: InlineFieldDraftValue;
		path: JSONPointer;
		inputKind?: 'text' | 'number';
		suffix?: string;
		ariaLabel?: string;
		editAffordance?: GridEditAffordance;
		annotationAffordance?: GridAnnotationAffordance;
		annotations?: Array<GridContentAnnotation>;
		annotationEditorConfig?: GridAnnotationEditorConfig;
		patchOperation?: GridFieldPatchOperation;
		// eslint-disable-next-line no-unused-vars
		onSavePatch: (_patch: JSONPatchDocument) => void;
		// eslint-disable-next-line no-unused-vars
		onSaveAnnotations?: (_annotations: Array<GridContentAnnotation>) => void;
	}

	let {
		label,
		value,
		path,
		inputKind = typeof value === 'number' ? 'number' : 'text',
		suffix = '',
		ariaLabel = undefined,
		editAffordance = 'persistent',
		annotationAffordance = 'persistent',
		annotations = [],
		annotationEditorConfig = undefined,
		patchOperation = 'replace',
		onSavePatch,
		onSaveAnnotations = undefined
	}: Props = $props();

	const field = $derived<GridContentField>({
		fieldName: label,
		label: suffix,
		inputKind,
		annotations,
		binding: {
			valuePatchOperation: patchOperation
		},
		capabilities: {
			canEditValue: true,
			canEditAnnotations: onSaveAnnotations !== undefined
		},
		interaction: {
			editAffordance,
			annotationAffordance
		},
		value
	});
</script>

<GridPrimitiveField
	fieldKey={ariaLabel ?? label}
	{field}
	jsonPatchPath={path}
	{annotationEditorConfig}
	onSavePatch={(patch) => onSavePatch(patch)}
	onSaveAnnotations={(nextAnnotations) => onSaveAnnotations?.(nextAnnotations)}
/>
