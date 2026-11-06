<script lang="ts">
	import GridPrimitiveField from '$lib/ui/molecules/grid-primitive-field.svelte';
	import { isInlineRuntimeField } from '$lib/utils/gridContentHelpers';
	import { commitRuntimeGroupField } from '$lib/utils/fieldDraftHelpers';
	import type { JSONPatchDocument } from 'immutable-json-patch';
	import type {
		GridAnnotationEditorConfig,
		GridContentAnnotation,
		GridContentBindPath,
		GridContentField,
		GridContentPatch
	} from '$lib/utils/gridContentTypes';

	interface Props {
		label: string;
		fields: Array<[string, GridContentField]>;
		displayAlign?: 'left' | 'center';
		annotationEditorConfig?: GridAnnotationEditorConfig;
		onFieldSavePatch?: (
			// eslint-disable-next-line no-unused-vars
			_patch: JSONPatchDocument,
			// eslint-disable-next-line no-unused-vars
			_compatibility: Array<GridContentPatch>
		) => boolean | void;
		// eslint-disable-next-line no-unused-vars
		onSavePatches?: (_patches: Array<GridContentPatch>) => boolean | void;
		onSaveAnnotations?: (
			// eslint-disable-next-line no-unused-vars
			_annotations: Array<GridContentAnnotation>,
			// eslint-disable-next-line no-unused-vars
			_path?: GridContentBindPath
		) => void;
	}

	let {
		label,
		fields,
		displayAlign = 'left',
		annotationEditorConfig = undefined,
		onFieldSavePatch = undefined,
		onSavePatches = undefined,
		onSaveAnnotations = undefined
	}: Props = $props();

	const runtimeFields = $derived(fields.filter(([, field]) => isInlineRuntimeField(field)));

	const saveField = (
		activeKey: string,
		jsonPatch: JSONPatchDocument,
		compatibilityPatches: Array<GridContentPatch>
	): boolean | void =>
		commitRuntimeGroupField(
			runtimeFields,
			activeKey,
			jsonPatch,
			compatibilityPatches,
			onFieldSavePatch,
			onSavePatches
		);
</script>

<section
	class={[
		'theme-panel h-full min-h-20 w-full min-w-0 self-stretch rounded-lg border p-2',
		displayAlign === 'center' ? 'text-center' : 'text-left'
	]}
	aria-label={label}
>
	<p class="theme-text-muted text-xs font-semibold tracking-wide uppercase">{label}</p>
	<div class="mt-1 divide-y divide-[var(--color-surface-border)]">
		{#each runtimeFields as [key, field] (key)}
			<GridPrimitiveField
				fieldKey={key}
				{field}
				{displayAlign}
				contextLabel={label}
				surfaceVariant="nested"
				{annotationEditorConfig}
				onSavePatch={(jsonPatch, compatibilityPatches) =>
					saveField(key, jsonPatch, compatibilityPatches)}
				onSaveAnnotations={(next, path) => onSaveAnnotations?.(next, path)}
			/>
		{/each}
	</div>
</section>
