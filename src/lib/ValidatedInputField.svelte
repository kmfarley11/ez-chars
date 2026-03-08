<script lang="ts">
	interface Props {
		label: string;
		value: string;
		type?: string;
		required?: boolean;
		inputClass?: string;
		// eslint-disable-next-line no-unused-vars
		validator?: (_value: string) => string | undefined;
		// eslint-disable-next-line no-unused-vars
		onValueChange: (_next: string) => void;
	}

	let {
		label,
		value,
		type = 'text',
		required = false,
		inputClass = '',
		validator = undefined,
		onValueChange
	}: Props = $props();

	const validationMessage = $derived(validator ? validator(value) : undefined);
	const hasValidationError = $derived(
		typeof validationMessage === 'string' && validationMessage.trim().length > 0
	);
	const resolvedInputClass = $derived(
		`theme-input w-full rounded-md border px-2 py-1${inputClass ? ` ${inputClass}` : ''}`
	);
</script>

<label class="space-y-1">
	<span class="theme-text-muted text-xs">
		{label}
		{#if required}
			<span class="text-red-600">*</span>
		{/if}
	</span>
	<input
		class={resolvedInputClass}
		{type}
		{required}
		aria-invalid={hasValidationError}
		{value}
		oninput={(event) => {
			const target = event.currentTarget as HTMLInputElement;
			onValueChange(target.value);
		}}
	/>
	{#if hasValidationError}
		<span class="text-red-600 text-xs italic">{validationMessage}</span>
	{/if}
</label>
