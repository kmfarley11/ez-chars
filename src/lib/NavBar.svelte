<script>
	import AboutButton from '$lib/AboutButton.svelte';
	import GitButton from '$lib/GitButton.svelte';
	import HomeButton from '$lib/HomeButton.svelte';
	import MenuButton from '$lib/MenuButton.svelte';
	import MenuItemButton from '$lib/MenuItemButton.svelte';

	const appVersion = __APP_VERSION__;
	const gitShortSha = __GIT_SHA__;
	const aboutText = `ez-chars v${appVersion} (${gitShortSha})`;

	const goGit = () => {
		window.open('https://github.com/kmfarley11/ez-chars', '_blank', 'noopener,noreferrer');
	};

	const showAbout = () => {
		alert(aboutText);
	};
</script>

<nav class="w-full">
	<div class="grid w-full min-w-0 grid-cols-[auto_1fr_auto] items-center border bg-slate-700 px-1 py-1 text-white">
		<div class="min-w-0">
			<HomeButton variant="dark" />
		</div>
		<div class="min-w-0 px-1 text-center">
			<a href="/" class="block truncate text-2xl font-bold leading-none tracking-tight md:text-3xl"
				>ez-chars</a
			>
		</div>
		<div class="hidden sm:block" id="navbar-default">
			<ul class="flex flex-row items-center font-medium">
				<li>
					<div class="block rounded-sm">
						<GitButton variant="dark" />
					</div>
				</li>
				<li>
					<div class="block rounded-sm">
						<AboutButton variant="dark" />
					</div>
				</li>
			</ul>
		</div>
		<div class="block sm:hidden" id="navbar-menu">
			<MenuButton variant="dark" align="right">
				<li>
					<MenuItemButton onclick={showAbout} variant="light">About</MenuItemButton>
				</li>
				<li>
					<MenuItemButton onclick={goGit} variant="light">GitHub</MenuItemButton>
				</li>
			</MenuButton>
		</div>
	</div>
</nav>
