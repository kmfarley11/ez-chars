<script lang="ts">
	import GridContainer from '$lib/GridContainer.svelte';
	import GridContentAnnotationsDisplay from '$lib/GridContentAnnotationsDisplay.svelte';
	import GridContentAnnotationsEditor from '$lib/GridContentAnnotationsEditor.svelte';
	import GridContainerAuto from '$lib/GridContainerAuto.svelte';
	import { updateGridAnnotationsAtPath, updateGridDataAtPath } from '$lib/characterGridHelpers';
	import { capitalizeFirstLetter } from '$lib/stringFormatters';
	import { displayOrPlaceholder } from '$lib/displayHelpers';
	import type {
		GridContentAnnotation,
		GridContentBindPath,
		GridContentData,
		GridContentField,
		GridContentFieldValue,
		GridContentNestedFields,
		GridContentPatch,
		GridContentPathSegment
	} from '$lib/gridContentTypes';

	interface Props {
		data: GridContentData;
		// eslint-disable-next-line no-unused-vars
		handleEditSave?: (_payload: GridContentData) => void;
		// eslint-disable-next-line no-unused-vars
		handleEditSavePatches?: (_patches: Array<GridContentPatch>) => void;
		handleEditCancel?: () => void;
	}

	let {
		data,
		handleEditSave,
		handleEditSavePatches,
		handleEditCancel = undefined
	}: Props = $props();

	let dialogEl: HTMLDialogElement | undefined;
	let helpDialogEl: HTMLDialogElement | undefined;
	let draftData = $state<GridContentData>({});

	const inferFieldName = (fieldKey: string) => {
		const spaced = fieldKey
			.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
			.replace(/[_-]+/g, ' ')
			.trim();
		return capitalizeFirstLetter(spaced.length > 0 ? spaced : fieldKey);
	};

	const isFieldArray = (value: GridContentFieldValue): value is Array<GridContentField> =>
		Array.isArray(value);

	const isNestedFields = (value: GridContentFieldValue): value is GridContentNestedFields =>
		typeof value === 'object' && value !== null && !Array.isArray(value);

	const shouldRenderField = (field: GridContentField) => !field.editOnly;

	// Ensure every field (including nested ones) has a stable display name before render/edit.
	const normalizeField = (fieldKey: string, field: GridContentField): GridContentField => {
		const normalizedName =
			displayOrPlaceholder(field.fieldName, '').trim() || inferFieldName(fieldKey);
		if (!isFieldArray(field.value) && !isNestedFields(field.value)) {
			return {
				...field,
				fieldName: normalizedName
			};
		}

		if (isFieldArray(field.value)) {
			return {
				...field,
				fieldName: normalizedName,
				value: field.value.map((child, idx) => normalizeField(`item${idx + 1}`, child))
			};
		}

		const normalizedNested: GridContentNestedFields = Object.fromEntries(
			Object.entries(field.value).map(([childKey, childField]) => [
				childKey,
				normalizeField(childKey, childField)
			])
		);
		return {
			...field,
			fieldName: normalizedName,
			value: normalizedNested
		};
	};

	const normalizeData = (source: GridContentData): GridContentData =>
		Object.fromEntries(
			Object.entries(source).map(([fieldKey, field]) => [fieldKey, normalizeField(fieldKey, field)])
		);

	const normalizedData = $derived<GridContentData>(normalizeData(data));

	type HelpAnnotationGroup = {
		key: string;
		title: string;
		joinedLabel?: string;
		annotations: Array<GridContentAnnotation>;
	};

	// Render any field shape generically: primitives, nested objects, and arrays of nested entries.
	const formatFieldValue = (
		field: GridContentField,
		placeholder = '___',
		nestedJoiner = ' / '
	): string => {
		if (!shouldRenderField(field)) return '';
		if (!isFieldArray(field.value) && !isNestedFields(field.value)) {
			return displayOrPlaceholder(field.value, placeholder);
		}

		if (isFieldArray(field.value)) {
			const combined = field.value
				.filter((entry) => shouldRenderField(entry))
				.map((entry) => formatFieldValue(entry, '', ' '))
				.filter((entry) => entry.length > 0)
				.join(' / ');
			return combined.length > 0 ? combined : placeholder;
		}

		const nested = field.value;
		const combined = Object.values(nested)
			.filter((entry) => shouldRenderField(entry))
			.map((entry) => formatFieldValue(entry, '', nestedJoiner))
			.filter((entry) => entry.length > 0)
			.join(nestedJoiner);
		return combined.length > 0 ? combined : placeholder;
	};

	type DisplayPart = { value: string; label?: string };

	const getLabeledDisplayParts = (field: GridContentField): DisplayPart[] | undefined => {
		if (isFieldArray(field.value) || !isNestedFields(field.value)) return undefined;

		const nested = field.value;

		const parts = Object.values(nested)
			.filter((entry) => shouldRenderField(entry))
			.map((entry) => ({
				value: formatFieldValue(entry, ''),
				label: entry.label
			}))
			.filter((entry) => entry.value.length > 0);

		return parts.some((entry) => entry.label) ? parts : undefined;
	};

	const joinLabels = (...labels: Array<string | undefined>): string | undefined => {
		const parts = labels
			.map((label) => displayOrPlaceholder(label, '').trim())
			.filter((label) => label.length > 0);
		if (parts.length === 0) return undefined;
		return parts.join(' / ');
	};

	type LeafInput = {
		path: Array<GridContentPathSegment>;
		field: GridContentField;
		joinedLabel?: string;
		bindPath?: GridContentBindPath;
	};

	// Bind path resolution order: explicit field `bindPath`, then inherited parent bind path + this segment.
	const resolveBindPath = (
		field: GridContentField,
		inheritedBindPath: GridContentBindPath | undefined,
		pathSegment: GridContentPathSegment | undefined
	): GridContentBindPath | undefined => {
		if (field.bindPath && field.bindPath.length > 0) return field.bindPath;
		if (!inheritedBindPath) return undefined;
		if (typeof pathSegment === 'undefined') return inheritedBindPath;
		return [...inheritedBindPath, pathSegment];
	};

	// Flatten nested field trees into editable leaves while carrying UI labels + resolved bind paths.
	const collectLeafInputs = (
		field: GridContentField,
		path: Array<GridContentPathSegment>,
		inheritedLabel?: string,
		inheritedBindPath?: GridContentBindPath,
		pathSegment?: GridContentPathSegment
	): LeafInput[] => {
		const nextLabel = joinLabels(inheritedLabel, field.label);
		const nextBindPath = resolveBindPath(field, inheritedBindPath, pathSegment);
		if (!isFieldArray(field.value) && !isNestedFields(field.value)) {
			return [{ path, field, joinedLabel: nextLabel, bindPath: nextBindPath }];
		}

		if (isFieldArray(field.value)) {
			return field.value.flatMap((childField, idx) =>
				collectLeafInputs(childField, [...path, idx], nextLabel, nextBindPath, idx)
			);
		}

		return Object.entries(field.value).flatMap(([childKey, childField]) =>
			collectLeafInputs(childField, [...path, childKey], nextLabel, nextBindPath, childKey)
		);
	};

	const collectHelpAnnotationGroups = (source: GridContentData): Array<HelpAnnotationGroup> =>
		Object.entries(source).flatMap(([fieldKey, field]) =>
			collectLeafInputs(field, [fieldKey]).flatMap((leaf, idx) => {
				const fieldAnnotations = leaf.field.annotations ?? [];
				if (fieldAnnotations.length === 0) return [];
				const isSameField = field.fieldName === leaf.field.fieldName;
				const title = isSameField
					? field.fieldName
					: `${field.fieldName} / ${leaf.field.fieldName}`;
				return [
					{
						key: `${fieldKey}-${idx}-${leaf.path.join('.')}`,
						title,
						joinedLabel: leaf.joinedLabel,
						annotations: fieldAnnotations
					}
				];
			})
		);

	const helpAnnotationGroups = $derived<Array<HelpAnnotationGroup>>(
		collectHelpAnnotationGroups(normalizedData)
	);

	const closeDialog = () => {
		dialogEl?.close();
	};

	const closeHelpDialog = () => {
		helpDialogEl?.close();
	};

	const onCancel = () => {
		closeDialog();
		handleEditCancel?.();
	};

	const onHelpCancel = () => {
		closeHelpDialog();
	};

	const onOpen = () => {
		draftData = structuredClone(normalizedData);
		dialogEl?.showModal();
	};

	const onHelpOpen = () => {
		helpDialogEl?.showModal();
	};

	const onBackdropClick = (event: MouseEvent) => {
		if (event.target === event.currentTarget) {
			onCancel();
		}
	};

	const onHelpBackdropClick = (event: MouseEvent) => {
		if (event.target === event.currentTarget) {
			onHelpCancel();
		}
	};

	// Convert current draft into atomic write operations for model-level patch handlers.
	const collectPatchesFromData = (source: GridContentData): Array<GridContentPatch> =>
		Object.entries(source).flatMap(([fieldKey, field]) =>
			collectLeafInputs(field, [fieldKey], undefined, undefined, fieldKey).flatMap((leaf) => {
				if (isFieldArray(leaf.field.value) || isNestedFields(leaf.field.value)) return [];
				const patches: Array<GridContentPatch> = [
					{
						path: leaf.bindPath ?? leaf.path,
						value: leaf.field.value
					}
				];
				if (leaf.field.annotationBindPath) {
					patches.push({
						path: leaf.field.annotationBindPath,
						value: leaf.field.annotations ?? []
					});
				}
				return patches;
			})
		);

	const onSubmit = (event: SubmitEvent) => {
		event.preventDefault();
		// Preferred path: emit bind-path patches; fallback preserves legacy payload-based integration.
		if (handleEditSavePatches) {
			handleEditSavePatches(collectPatchesFromData(draftData));
		} else {
			handleEditSave?.(draftData);
		}
		closeDialog();
	};
</script>

<div class="group relative">
	<div
		class="absolute top-0 right-0 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
	>
		<button
			type="button"
			class="theme-btn-light btn rounded-md border p-1 cursor-pointer"
			aria-label="Help"
			title="Help"
			onclick={onHelpOpen}
		>
			<span
				class="inline-block h-4 w-4 text-center text-sm leading-4 font-semibold"
				aria-hidden="true"
			>
				?
			</span>
		</button>
		<button
			type="button"
			class="theme-btn-light btn rounded-md border p-1 cursor-pointer"
			aria-label="Edit"
			title="Edit"
			onclick={onOpen}
		>
			<!-- TODO - consider edits at individual field level rather than group -->
			<svg
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				class="h-4 w-4 stroke-current"
				aria-hidden="true"
			>
				<path d="M12 20h9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
				<path
					d="m16.5 3.5 4 4L7 21H3v-4L16.5 3.5Z"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				></path>
			</svg>
		</button>
	</div>
	<div class="pr-16">
		<GridContainerAuto maxCols={3} classes="gap-2">
			{#each Object.entries(normalizedData) as [fieldKey, field] (fieldKey)}
				{@const labeledParts = getLabeledDisplayParts(field)}
				<GridContainer classes="min-w-0">
					<p class="min-w-0">
						<span data-grid-auto-item class="inline-block">
							<span class="font-semibold">{field.fieldName}:</span>
							{#if labeledParts}
								{#each labeledParts as part, idx (`${fieldKey}-${idx}`)}
									{#if idx > 0}
										<span aria-hidden="true" class="mx-1">/</span>
									{/if}
									{part.value}
									{#if part.label}
										<span class="theme-text-muted text-xs italic">&nbsp;({part.label})</span>
									{/if}
								{/each}
							{:else}
								{formatFieldValue(field)}
							{/if}
							{#if field.label}
								<span class="theme-text-muted text-xs italic"> ({field.label}) </span>
							{/if}
						</span>
					</p>
				</GridContainer>
			{/each}
		</GridContainerAuto>
	</div>
</div>

<dialog
	bind:this={dialogEl}
	class="theme-dialog theme-dialog-backdrop m-auto w-[min(92vw,32rem)] rounded-md border p-0"
	oncancel={onCancel}
	onclick={onBackdropClick}
>
	<form class="flex flex-col gap-3 p-4" onsubmit={onSubmit}>
		<h3 class="text-lg leading-none font-semibold">Edit Meta Fields</h3>
		{#each Object.entries(draftData) as [fieldKey, field] (fieldKey)}
			{@const leafInputs = collectLeafInputs(field, [fieldKey])}
			<div class="space-y-1">
				<p class="font-semibold">
					{field.fieldName}
					{#if field.label}
						<span class="theme-text-muted text-xs italic"> ({field.label}) </span>
					{/if}
				</p>
				<div class="space-y-2">
					{#each leafInputs as leaf, idx (`${fieldKey}-${idx}-${leaf.path.join('.')}`)}
						<div class="space-y-2 rounded-md border px-2 py-2">
							<label class="space-y-1">
								<span class="theme-text-muted text-xs">
									{leaf.field.fieldName}
									{#if leaf.joinedLabel}
										<span class="theme-text-muted text-xs italic"> ({leaf.joinedLabel}) </span>
									{/if}
								</span>
								{#if leaf.field.multiline}
									<textarea
										class="theme-input w-full rounded-md border px-2 py-1 font-mono text-sm"
										rows="5"
										aria-label={`${field.fieldName} ${leaf.field.fieldName}`}
										oninput={(event) => {
											const target = event.currentTarget as HTMLTextAreaElement;
											draftData = updateGridDataAtPath(draftData, leaf.path, target.value);
										}}>{displayOrPlaceholder(leaf.field.value, '')}</textarea
									>
								{:else}
									<input
										class="theme-input w-full rounded-md border px-2 py-1"
										type={typeof leaf.field.value === 'number' ? 'number' : 'text'}
										step={typeof leaf.field.value === 'number' ? '1' : undefined}
										value={displayOrPlaceholder(leaf.field.value, '')}
										aria-label={`${field.fieldName} ${leaf.field.fieldName}`}
										oninput={(event) => {
											const target = event.currentTarget as HTMLInputElement;
											const parsed = Number(target.value);
											const nextValue =
												typeof leaf.field.value === 'number' && Number.isFinite(parsed)
													? parsed
													: target.value;
											draftData = updateGridDataAtPath(draftData, leaf.path, nextValue);
										}}
									/>
								{/if}
							</label>

							{#if leaf.field.annotationBindPath}
								<GridContentAnnotationsEditor
									annotations={leaf.field.annotations ?? []}
									onChange={(nextAnnotations) => {
										draftData = updateGridAnnotationsAtPath(draftData, leaf.path, nextAnnotations);
									}}
								/>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/each}
		<div class="mt-1 flex justify-end gap-2">
			<button
				type="button"
				class="theme-btn-light btn rounded-md border px-3 py-1"
				onclick={onCancel}
			>
				Cancel
			</button>
			<button type="submit" class="theme-btn-dark btn rounded-md border px-3 py-1">Save</button>
		</div>
	</form>
</dialog>

<dialog
	bind:this={helpDialogEl}
	class="theme-dialog theme-dialog-backdrop m-auto w-[min(92vw,32rem)] rounded-md border p-0"
	oncancel={onHelpCancel}
	onclick={onHelpBackdropClick}
>
	<div class="flex flex-col gap-3 p-4">
		<h3 class="text-lg leading-none font-semibold">Help</h3>
		{#if helpAnnotationGroups.length === 0}
			<p class="theme-text-muted text-sm">No field annotations available.</p>
		{:else}
			<div class="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
				{#each helpAnnotationGroups as group (group.key)}
					<div class="space-y-1 rounded-md border px-2 py-2">
						<p class="text-sm font-semibold">
							{group.title}
							{#if group.joinedLabel}
								<span class="theme-text-muted text-xs italic"> ({group.joinedLabel}) </span>
							{/if}
						</p>
						<GridContentAnnotationsDisplay annotations={group.annotations} />
					</div>
				{/each}
			</div>
		{/if}
		<div class="mt-1 flex justify-end">
			<button
				type="button"
				class="theme-btn-light btn rounded-md border px-3 py-1"
				onclick={onHelpCancel}
			>
				Close
			</button>
		</div>
	</div>
</dialog>
