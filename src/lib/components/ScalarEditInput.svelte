<script lang="ts">
	import type { SmallEditField } from '$utils/smallEdit';
	interface Props {
		label: string;
		kind: SmallEditField['kind'];
		value: string | boolean;
		options?: Array<string>;
		presentation?: 'focused' | 'structured';
		// eslint-disable-next-line no-unused-vars
		onChange: (value: string | boolean) => void;
	}
	let { label, kind, value, options = [], presentation = 'focused', onChange }: Props = $props();
</script>

{#if kind === 'boolean'}
	<label class="touch-target flex cursor-pointer items-center gap-2">
		<input
			class="theme-input h-4 w-4 rounded border"
			type="checkbox"
			aria-label={label}
			checked={value === true}
			onchange={(event) => onChange(event.currentTarget.checked)}
		/>
		<span
			class:theme-text-muted={presentation === 'structured'}
			class:text-xs={presentation === 'structured'}
			>{presentation === 'structured' ? 'Enabled' : label}</span
		>
	</label>
{:else if kind === 'multiline'}
	<textarea
		aria-label={label}
		class="theme-input w-full rounded-md border px-2 py-1 text-base {presentation === 'structured'
			? 'font-mono md:text-sm'
			: ''}"
		rows={presentation === 'structured' ? 5 : 4}
		value={String(value)}
		oninput={(event) => onChange(event.currentTarget.value)}
	></textarea>
{:else if kind === 'select'}
	<select
		aria-label={label}
		class="theme-input w-full rounded-md border px-2 py-1 text-base {presentation === 'structured'
			? 'md:text-sm'
			: 'touch-target'}"
		value={String(value)}
		onchange={(event) => onChange(event.currentTarget.value)}
	>
		{#each options as option (option)}<option value={option}>{option}</option>{/each}
	</select>
{:else}
	<input
		aria-label={label}
		class="theme-input w-full min-w-0 rounded-md border px-2 py-1 text-base {presentation ===
		'structured'
			? 'md:text-sm'
			: 'touch-target'}"
		type={kind === 'number' ? 'number' : 'text'}
		step={kind === 'number' ? (presentation === 'structured' ? '1' : 'any') : undefined}
		value={String(value)}
		oninput={(event) => onChange(event.currentTarget.value)}
	/>
{/if}
