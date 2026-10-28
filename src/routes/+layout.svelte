<script>
	import NavBar from '$lib/components/NavBar.svelte';
	import { onMount } from 'svelte';
	import { initializeTheme } from '$utils/theme';
	import StorageRecoveryNotice from './components/storage-recovery-notice.svelte';
	import NoticeBanner from '$lib/ui/molecules/notice-banner.svelte';
	import '../app.css';

	let { children } = $props();

	onMount(() => {
		initializeTheme();
	});
</script>

<div class="theme-page">
	<NavBar />
	<NoticeBanner title="Pre-Release Playtest" role="alert">
		<p>
			The app is in an active pre-release phase. Data preservation between exports and imports is
			not guaranteed during ongoing updates.
		</p>
		<p>
			Known preview issue: Firefox on macOS may briefly show black areas during rapid
			character-sheet scrolling. If this disrupts play, try another current browser such as Chrome
			or Safari.
		</p>
	</NoticeBanner>
	<StorageRecoveryNotice />
	{@render children()}
</div>
