<script lang="ts">
	import { capitalizeFirstLetter } from '$lib/stringFormatters';
	import { displayOrPlaceholder } from '$lib/displayHelpers';
	type GridFieldType = 'string' | 'number' | 'array' | 'object' | 'unknown';

	type GridContentField = {
		fieldName: string;
		fieldType: GridFieldType;
		value: unknown;
	};

	type GridContentData = Record<string, GridContentField>;

	interface Props {
		data?: GridContentData;
		dataObject?: Record<string, unknown>;
		// eslint-disable-next-line no-unused-vars
		handleEditSave: (_payload: GridContentData) => void;
		handleEditCancel?: () => void;
	}

	let {
		data = undefined,
		dataObject = undefined,
		handleEditSave,
		handleEditCancel = undefined
	}: Props = $props();

	let dialogEl: HTMLDialogElement | undefined;
	let draftData = $state<GridContentData>({});

	const inferFieldName = (fieldKey: string) => {
		const spaced = fieldKey
			.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
			.replace(/[_-]+/g, ' ')
			.trim();
		return capitalizeFirstLetter(spaced.length > 0 ? spaced : fieldKey);
	};

	const inferFieldType = (value: unknown): GridFieldType => {
		if (Array.isArray(value)) return 'array';
		if (typeof value === 'string') return 'string';
		if (typeof value === 'number') return 'number';
		if (typeof value === 'object' && value !== null) return 'object';
		return 'unknown';
	};

	const normalizedData = $derived<GridContentData>(
		data ??
			Object.fromEntries(
				Object.entries(dataObject ?? {}).map(([fieldKey, value]) => [
					fieldKey,
					{
						fieldName: inferFieldName(fieldKey),
						fieldType: inferFieldType(value),
						value
					}
				])
			)
	);

	const isMinMaxObject = (value: unknown): value is { min: unknown; max: unknown } =>
		typeof value === 'object' && value !== null && 'min' in value && 'max' in value;
	const isLabeledValueArray = (
		value: unknown
	): value is Array<{ value: unknown; label: unknown }> =>
		Array.isArray(value) &&
		value.every(
			(entry) => typeof entry === 'object' && entry !== null && 'value' in entry && 'label' in entry
		);

	const formatFieldValue = (field: GridContentField, placeholder = '___') => {
		if (isMinMaxObject(field.value)) {
			const minValue = displayOrPlaceholder(field.value.min, placeholder);
			const maxValue = displayOrPlaceholder(field.value.max, placeholder);
			return `${minValue}/${maxValue}`;
		}
		if (isLabeledValueArray(field.value)) {
			const formatted = field.value
				.map((entry) => {
					const valueText = displayOrPlaceholder(entry.value, '').trim();
					const labelText = displayOrPlaceholder(entry.label, '').trim();
					if (valueText.length > 0 && labelText.length > 0) return `${valueText} ${labelText}`;
					return valueText || labelText;
				})
				.filter((entry) => entry.length > 0);
			return formatted.length > 0 ? formatted.join(' / ') : placeholder;
		}
		return displayOrPlaceholder(field.value, placeholder);
	};

	const formatEditableValue = (field: GridContentField, placeholder = '') => {
		if (isLabeledValueArray(field.value)) {
			const valuesOnly = field.value
				.map((entry) => displayOrPlaceholder(entry.value, '').trim())
				.filter((entry) => entry.length > 0);
			return valuesOnly.length > 0 ? valuesOnly.join(' / ') : placeholder;
		}
		return formatFieldValue(field, placeholder);
	};

	const parseFieldInput = (fieldKey: string, field: GridContentField, input: string): unknown => {
		const sourceField = normalizedData[fieldKey];
		const shouldParseMinMax = isMinMaxObject(field.value) || isMinMaxObject(sourceField?.value);
		if (shouldParseMinMax) {
			const [rawMin = '', rawMax = ''] = input.split('/', 2);
			const min = rawMin.trim();
			const max = rawMax.trim();
			const toTyped = (raw: string) => {
				const asNum = Number(raw);
				return raw.length > 0 && Number.isFinite(asNum) ? asNum : raw;
			};
			return { min: toTyped(min), max: toTyped(max) };
		}
		const shouldParseLabeledArray =
			isLabeledValueArray(field.value) || isLabeledValueArray(sourceField?.value);
		if (shouldParseLabeledArray) {
			const source = isLabeledValueArray(sourceField?.value) ? sourceField.value : [];
			const chunks = input
				.split(/[/,\n]/)
				.map((segment) => segment.trim())
				.filter((segment) => segment.length > 0);
			const toTyped = (raw: string) => {
				const asNum = Number(raw);
				return raw.length > 0 && Number.isFinite(asNum) ? asNum : raw;
			};
			if (source.length > 0) {
				return source.map((entry, index) => ({
					label: entry.label,
					value: toTyped(chunks[index] ?? displayOrPlaceholder(entry.value, ''))
				}));
			}
			return chunks.map((chunk) => ({ label: '', value: toTyped(chunk) }));
		}
		return input;
	};

	const closeDialog = () => {
		dialogEl?.close();
	};

	const onCancel = () => {
		closeDialog();
		handleEditCancel?.();
	};

	const onOpen = () => {
		draftData = Object.fromEntries(
			Object.entries(normalizedData).map(([fieldKey, field]) => [
				fieldKey,
				{
					...field
				}
			])
		);
		dialogEl?.showModal();
	};

	const onBackdropClick = (event: MouseEvent) => {
		if (event.target === event.currentTarget) {
			onCancel();
		}
	};

	const onSubmit = (event: SubmitEvent) => {
		event.preventDefault();
		handleEditSave(draftData);
		closeDialog();
	};
</script>

<div class="group relative">
	<button
		type="button"
		class="theme-btn-light btn absolute top-0 right-0 z-10 rounded-md border p-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
		aria-label="Edit"
		title="Edit"
		onclick={onOpen}
	>
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
	<div class="space-y-2 pr-12">
		{#each Object.entries(normalizedData) as [fieldKey, field] (fieldKey)}
			<p>
				<span class="font-semibold">{field.fieldName}:</span>
				{formatFieldValue(field)}
			</p>
		{/each}
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
			<label class="space-y-1">
				<span class="font-semibold">{field.fieldName}</span>
				<input
					class="theme-input w-full rounded-md border px-2 py-1"
					type="text"
					value={formatEditableValue(field, '')}
					oninput={(event) => {
						const target = event.currentTarget as HTMLInputElement;
						draftData = {
							...draftData,
							[fieldKey]: {
								...field,
								value: parseFieldInput(fieldKey, field, target.value)
							}
						};
					}}
				/>
				{#if isLabeledValueArray(field.value)}
					<p class="theme-text-muted text-xs italic">
						{field.value
							.map((entry) => displayOrPlaceholder(entry.label, '').trim())
							.filter((entry) => entry.length > 0)
							.join(' / ')}
					</p>
				{/if}
			</label>
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
