<script>
	import DialogButton from './DialogButton.svelte';
	let { shadingVariant = 'light' } = $props();

	const appVersion = __APP_VERSION__;
	const gitShortSha = __GIT_SHA__;
	const aboutText = `ez-chars v${appVersion} (${gitShortSha})`;
	const noticesHref = 'https://github.com/kmfarley11/ez-chars/blob/main/THIRD_PARTY_NOTICES.md';
	const extAttributionHref = '/docs/ext/Readme.md';
	const ccByHref = 'https://creativecommons.org/licenses/by/4.0/';
</script>

<DialogButton {shadingVariant} title={aboutText} ariaLabel="About ez-chars">
	{#snippet children()}
		<svg
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			class="inline-block h-6 w-6 stroke-current"
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="9" stroke-width="1.5"></circle>
			<path d="M9.75 9.25a2.25 2.25 0 1 1 3.5 1.86c-.78.52-1.25 1-1.25 2.14" stroke-width="1.5"
			></path>
			<circle cx="12" cy="16.75" r="1" fill="currentColor" stroke="none"></circle>
		</svg>
	{/snippet}
	{#snippet dialogContent()}
		<div class="space-y-3 px-1 py-1 text-sm">
			<div class="border-b pb-2">
				<h3 class="text-lg leading-none font-bold tracking-tight">ez-chars</h3>
				<p class="theme-text-muted mt-2">{aboutText}</p>
			</div>
			<p>⚠️DISCLAIMER: this app is super WIP⚠️</p>
			<p>Source code license: MIT.</p>
			<p>
				Included SRD assets are attributed under
				<a class="theme-link underline" href={ccByHref} target="_blank" rel="noreferrer"
					>CC BY 4.0</a
				>.
			</p>
			<p>
				Full notices:
				<a class="theme-link underline" href={noticesHref} target="_blank" rel="noreferrer"
					>THIRD_PARTY_NOTICES.md</a
				>
			</p>
			<p>
				Ext docs attribution:
				<a class="theme-link underline" href={extAttributionHref} target="_blank" rel="noreferrer"
					>docs/ext/Readme.md</a
				>
			</p>
		</div>
	{/snippet}
</DialogButton>
