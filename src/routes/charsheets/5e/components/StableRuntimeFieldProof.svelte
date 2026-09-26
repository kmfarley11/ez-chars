<script lang="ts">
	import GridPrimitiveField from '$components/GridPrimitiveField.svelte';
	import type { GridContentField, GridContentPatch } from '$utils/gridContentTypes';

	interface Props {
		label: string;
		value: number;
		// eslint-disable-next-line no-unused-vars
		onChange: (value: number) => void;
	}

	let { label, value, onChange }: Props = $props();

	const field = $derived<GridContentField>({
		fieldName: label,
		value,
		bindPath: ['proof', label],
		capabilities: { canEditValue: true, canEditAnnotations: false },
		interaction: {
			tier: 'runtime',
			editAffordance: 'persistent',
			annotationAffordance: 'badge'
		},
		inputKind: 'number'
	});

	const save = (_patches: Array<GridContentPatch>): boolean => {
		const next = _patches[0]?.value;
		if (typeof next !== 'number' || !Number.isInteger(next) || next < 0) return false;
		onChange(next);
		return true;
	};
</script>

<GridPrimitiveField
	fieldKey="runtime"
	{field}
	onSavePatch={(_jsonPatch, compatibilityPatches) => save(compatibilityPatches)}
/>
