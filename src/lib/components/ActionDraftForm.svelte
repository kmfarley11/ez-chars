<script lang="ts">
	// The form uses a draft object that matches the subset of RuntimeAction we allow editing
	export type ActionDraft = {
		name: string;
		timing?: 'action' | 'bonusAction' | 'reaction' | 'free' | 'other';
		category?: 'attack' | 'effect' | 'other';
		target?: string;
		notes?: string;
	};

	interface Props {
		draft: ActionDraft;
		error?: string;
		// eslint-disable-next-line no-unused-vars
		onChange?: (_nextDraft: ActionDraft) => void;
	}

	let { draft, error, onChange }: Props = $props();

	const updateField = <K extends keyof ActionDraft>(field: K, value: ActionDraft[K]) => {
		onChange?.({ ...draft, [field]: value });
	};

	const timings = [
		{ value: 'action', label: 'Action' },
		{ value: 'bonusAction', label: 'Bonus Action' },
		{ value: 'reaction', label: 'Reaction' },
		{ value: 'free', label: 'Free' },
		{ value: 'other', label: 'Other' }
	];

	const categories = [
		{ value: 'attack', label: 'Attack' },
		{ value: 'effect', label: 'Effect' },
		{ value: 'other', label: 'Other' }
	];
</script>

<div class="flex flex-col gap-4">
	<label class="flex flex-col gap-1">
		<span class="text-sm font-semibold">Name</span>
		<input
			type="text"
			class="theme-input touch-target rounded-md border px-3 py-1.5 {error
				? 'border-red-500 outline-red-500'
				: ''}"
			value={draft.name}
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error ? 'name-error-msg' : undefined}
			oninput={(e) => updateField('name', e.currentTarget.value)}
			required
		/>
		{#if error}
			<span
				id="name-error-msg"
				class="text-xs font-semibold text-red-600 dark:text-red-400"
				role="alert">{error}</span
			>
		{/if}
	</label>

	<div class="flex flex-col gap-4 sm:flex-row sm:gap-4">
		<label class="flex flex-1 flex-col gap-1">
			<span class="text-sm font-semibold">Timing</span>
			<select
				class="theme-input touch-target rounded-md border px-3 py-1.5"
				value={draft.timing ?? ''}
				onchange={(e) =>
					updateField(
						'timing',
						e.currentTarget.value ? (e.currentTarget.value as ActionDraft['timing']) : undefined
					)}
			>
				<option value="">None</option>
				{#each timings as { value, label } (value)}
					<option {value}>{label}</option>
				{/each}
			</select>
		</label>

		<label class="flex flex-1 flex-col gap-1">
			<span class="text-sm font-semibold">Category</span>
			<select
				class="theme-input touch-target rounded-md border px-3 py-1.5"
				value={draft.category ?? ''}
				onchange={(e) =>
					updateField(
						'category',
						e.currentTarget.value ? (e.currentTarget.value as ActionDraft['category']) : undefined
					)}
			>
				<option value="">None</option>
				{#each categories as { value, label } (value)}
					<option {value}>{label}</option>
				{/each}
			</select>
		</label>
	</div>

	<label class="flex flex-col gap-1">
		<span class="text-sm font-semibold">Target</span>
		<input
			type="text"
			class="theme-input touch-target rounded-md border px-3 py-1.5"
			value={draft.target ?? ''}
			oninput={(e) => updateField('target', e.currentTarget.value || undefined)}
			placeholder="e.g., 1 creature, Self, etc."
		/>
	</label>

	<label class="flex flex-col gap-1">
		<span class="text-sm font-semibold">Notes</span>
		<textarea
			class="theme-input touch-target rounded-md border px-3 py-1.5 font-mono text-sm"
			rows="3"
			value={draft.notes ?? ''}
			oninput={(e) => updateField('notes', e.currentTarget.value || undefined)}
		></textarea>
	</label>
</div>
