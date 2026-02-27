<script>
	import { resolve } from '$app/paths';
	import AboutButton from '$lib/AboutButton.svelte';
	import GitButton from '$lib/GitButton.svelte';
	import HomeButton from '$lib/HomeButton.svelte';
	import MenuButton from '$lib/MenuButton.svelte';
	import MenuItemButton from '$lib/MenuItemButton.svelte';
	import { setTheme, theme, THEME_OPTIONS } from '$lib/theme';

	const appVersion = __APP_VERSION__;
	const gitShortSha = __GIT_SHA__;
	const aboutText = `ez-chars v${appVersion} (${gitShortSha})`;
	const homeHref = resolve('/');

	const goHome = () => {
		location.href = homeHref;
	};

	const goGit = () => {
		window.open('https://github.com/kmfarley11/ez-chars', '_blank', 'noopener,noreferrer');
	};

	const showAbout = () => {
		alert(aboutText);
	};

</script>

<nav class="w-full">
	<div class="theme-navbar grid w-full min-w-0 grid-cols-[auto_1fr_auto] items-center border px-1 py-1">
		<div class="min-w-0">
			<div class="hidden items-center sm:flex">
				<HomeButton shadingVariant="dark" />
				<GitButton shadingVariant="dark" />
			</div>
			<div class="block sm:hidden">
				<MenuButton shadingVariant="dark" align="left" iconVariant="hamburger">
					<li>
						<MenuItemButton onclick={goHome} shadingVariant="dark">Home</MenuItemButton>
					</li>
					<li>
						<MenuItemButton onclick={goGit} shadingVariant="dark">GitHub</MenuItemButton>
					</li>
				</MenuButton>
			</div>
		</div>
		<div class="min-w-0 px-1 text-center">
			<a href="/" class="block truncate text-2xl font-bold leading-none tracking-tight md:text-3xl"
				>ez-chars</a
			>
		</div>
		<div class="hidden sm:block" id="navbar-default">
			<ul class="flex flex-row items-center font-medium">
				<li>
					<MenuButton
						shadingVariant="dark"
						text="Theme"
						align="right"
						iconVariant="chevron"
					>
						{#each THEME_OPTIONS as option}
							<li>
								<MenuItemButton onclick={() => setTheme(option.id)} shadingVariant="dark">
									{option.label}{$theme === option.id ? ' (active)' : ''}
								</MenuItemButton>
							</li>
						{/each}
					</MenuButton>
				</li>
				<li>
					<div class="block rounded-sm">
						<AboutButton shadingVariant="dark" />
					</div>
				</li>
			</ul>
		</div>
		<div class="block sm:hidden" id="navbar-menu">
			<MenuButton shadingVariant="dark" align="right" iconVariant="kebab">
				<li>
					<MenuItemButton onclick={showAbout} shadingVariant="dark">About</MenuItemButton>
				</li>
				{#each THEME_OPTIONS as option}
					<li>
						<MenuItemButton onclick={() => setTheme(option.id)} shadingVariant="dark">
							Theme: {option.label}{$theme === option.id ? ' (active)' : ''}
						</MenuItemButton>
					</li>
				{/each}
			</MenuButton>
		</div>
	</div>
</nav>
