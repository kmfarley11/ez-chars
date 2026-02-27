<script>
	import DialogButton from './DialogButton.svelte';
	let { variant = 'light' } = $props();

	const appVersion = __APP_VERSION__;
	const gitShortSha = __GIT_SHA__;
	const aboutText = `ez-chars v${appVersion} (${gitShortSha})`;
</script>

<DialogButton {variant} title={aboutText} ariaLabel="About ez-chars">
	{#snippet children()}
		<svg
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			class="inline-block h-6 w-6 stroke-current"
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="9" stroke-width="1.5"></circle>
			<path d="M9.75 9.25a2.25 2.25 0 1 1 3.5 1.86c-.78.52-1.25 1-1.25 2.14" stroke-width="1.5"></path>
			<circle cx="12" cy="16.75" r="1" fill="currentColor" stroke="none"></circle>
		</svg>
	{/snippet}
	{#snippet dialogContent()}
		<p class="text-sm">
			{aboutText}
		</p>
	{/snippet}
</DialogButton>
