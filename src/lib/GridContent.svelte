<script lang="ts">
	import { capitalizeFirstLetter } from '$lib/stringFormatters';
	import { displayOrPlaceholder } from '$lib/displayHelpers';

	type GridFieldType = 'string' | 'number' | 'array' | 'object' | 'unknown';
	type GridContentFieldObjectValue = Record<string, string | number>;
	type GridContentFieldValue = string | number | GridContentFieldObjectValue;

	type GridContentField = {
		fieldName: string;
		fieldType: GridFieldType;
		value: GridContentFieldValue | GridContentFieldValue[];
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

	const coerceObjectValue = (value: Record<string, unknown>): GridContentFieldObjectValue =>
		Object.fromEntries(
			Object.entries(value).map(([key, item]) => [
				key,
				typeof item === 'number'
					? item
					: typeof item === 'string'
						? item
						: displayOrPlaceholder(item, '')
			])
		);

	const coerceFieldValue = (value: unknown): GridContentField['value'] => {
		if (typeof value === 'number' || typeof value === 'string') return value;
		if (Array.isArray(value)) {
			return value.map((item) => {
				if (typeof item === 'number' || typeof item === 'string') return item;
				if (typeof item === 'object' && item !== null) {
					return coerceObjectValue(item as Record<string, unknown>);
				}
				return displayOrPlaceholder(item, '');
			});
		}
		if (typeof value === 'object' && value !== null) {
			return coerceObjectValue(value as Record<string, unknown>);
		}
		return displayOrPlaceholder(value, '');
	};

	const normalizedData = $derived<GridContentData>(
		data ??
			Object.fromEntries(
				Object.entries(dataObject ?? {}).map(([fieldKey, value]) => [
					fieldKey,
					{
						fieldName: inferFieldName(fieldKey),
						fieldType: inferFieldType(value),
						value: coerceFieldValue(value)
					}
				])
			)
	);

	const formatObjectValue = (obj: GridContentFieldObjectValue, placeholder = '___') => {
		if ('min' in obj && 'max' in obj) {
			return `${displayOrPlaceholder(obj.min, placeholder)}/${displayOrPlaceholder(obj.max, placeholder)}`;
		}
		const values = Object.values(obj)
			.map((v) => displayOrPlaceholder(v, '').trim())
			.filter((v) => v.length > 0);
		return values.length > 0 ? values.join(' ') : placeholder;
	};

	const formatFieldValue = (field: GridContentField, placeholder = '___') => {
		if (Array.isArray(field.value)) {
			const formatted = field.value
				.map((entry) => {
					if (typeof entry === 'object' && entry !== null) {
						return formatObjectValue(entry as GridContentFieldObjectValue, '');
					}
					return displayOrPlaceholder(entry, '');
				})
				.filter((entry) => entry.length > 0);
			return formatted.length > 0 ? formatted.join(' / ') : placeholder;
		}
		if (typeof field.value === 'object' && field.value !== null) {
			return formatObjectValue(field.value as GridContentFieldObjectValue, placeholder);
		}
		return displayOrPlaceholder(field.value, placeholder);
	};

	const parseFieldInput = (fieldKey: string, field: GridContentField, input: string): unknown => {
		const sourceField = normalizedData[fieldKey];
		if (
			typeof sourceField?.value === 'object' &&
			sourceField.value !== null &&
			!Array.isArray(sourceField.value) &&
			'min' in sourceField.value &&
			'max' in sourceField.value
		) {
			const [rawMin = '', rawMax = ''] = input.split('/', 2);
			const toTyped = (raw: string) => {
				const trimmed = raw.trim();
				const asNum = Number(trimmed);
				return trimmed.length > 0 && Number.isFinite(asNum) ? asNum : trimmed;
			};
			return { min: toTyped(rawMin), max: toTyped(rawMax) };
		}
		return input;
	};

	const updateFieldValue = (fieldKey: string, nextValue: unknown) => {
		const currentField = draftData[fieldKey];
		if (!currentField) return;
		draftData = {
			...draftData,
			[fieldKey]: {
				...currentField,
				value: nextValue as GridContentField['value']
			}
		};
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
				{#if Array.isArray(field.value)}
					<div class="space-y-2">
						{#each field.value as entry, idx (idx)}
							{#if typeof entry === 'object' && entry !== null && !Array.isArray(entry)}
								<div class="space-y-1">
									<div class="grid grid-cols-2 gap-2">
										{#each Object.entries(entry) as [entryKey, entryValue] (entryKey)}
											<input
												class="theme-input w-full rounded-md border px-2 py-1"
												type={typeof entryValue === 'number' ? 'number' : 'text'}
												step={typeof entryValue === 'number' ? '1' : undefined}
												value={displayOrPlaceholder(entryValue, '')}
												aria-label={`${field.fieldName} ${idx + 1} ${entryKey}`}
												oninput={(event) => {
													const target = event.currentTarget as HTMLInputElement;
													const next = [...(field.value as GridContentFieldValue[])];
													const current =
														typeof next[idx] === 'object' && next[idx] !== null
															? (next[idx] as GridContentFieldObjectValue)
															: {};
													const parsed = Number(target.value);
													next[idx] = {
														...current,
														[entryKey]:
															typeof entryValue === 'number' && Number.isFinite(parsed)
																? parsed
																: target.value
													};
													updateFieldValue(fieldKey, next);
												}}
											/>
										{/each}
									</div>
									{#if 'label' in entry && displayOrPlaceholder(entry.label, '').trim().length > 0}
										<p class="theme-text-muted text-xs italic">
											{displayOrPlaceholder(entry.label, '')}
										</p>
									{/if}
								</div>
							{:else}
								<input
									class="theme-input w-full rounded-md border px-2 py-1"
									type="text"
									value={displayOrPlaceholder(entry, '')}
									aria-label={`${field.fieldName} ${idx + 1}`}
									oninput={(event) => {
										const target = event.currentTarget as HTMLInputElement;
										const next = [...(field.value as GridContentFieldValue[])];
										next[idx] = target.value;
										updateFieldValue(fieldKey, next);
									}}
								/>
							{/if}
						{/each}
					</div>
				{:else if typeof field.value === 'object' && field.value !== null}
					<div class="grid grid-cols-2 gap-2">
						{#each Object.entries(field.value) as [entryKey, entryValue] (entryKey)}
							<input
								class="theme-input w-full rounded-md border px-2 py-1"
								type={typeof entryValue === 'number' ? 'number' : 'text'}
								step={typeof entryValue === 'number' ? '1' : undefined}
								value={displayOrPlaceholder(entryValue, '')}
								aria-label={`${field.fieldName} ${entryKey}`}
								oninput={(event) => {
									const target = event.currentTarget as HTMLInputElement;
									const current = field.value as GridContentFieldObjectValue;
									const parsed = Number(target.value);
									updateFieldValue(fieldKey, {
										...current,
										[entryKey]:
											typeof entryValue === 'number' && Number.isFinite(parsed)
												? parsed
												: target.value
									});
								}}
							/>
						{/each}
					</div>
				{:else}
					<input
						class="theme-input w-full rounded-md border px-2 py-1"
						type="text"
						value={formatFieldValue(field, '')}
						oninput={(event) => {
							const target = event.currentTarget as HTMLInputElement;
							updateFieldValue(fieldKey, parseFieldInput(fieldKey, field, target.value));
						}}
					/>
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
