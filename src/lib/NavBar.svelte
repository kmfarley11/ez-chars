<script>
	import AboutButton from '$lib/AboutButton.svelte';
	import DropDownMenu from '$lib/DropDownMenu.svelte';
	import GitButton from '$lib/GitButton.svelte';
	import HomeButton from '$lib/HomeButton.svelte';
	import MenuItemButton from '$lib/MenuItemButton.svelte';
</script>

<nav class="w-full">
	<div class="grid w-full min-w-0 grid-cols-[auto_1fr_auto] items-center border bg-slate-700 px-1 py-1 text-white">
		<div class="min-w-0">
			<DropDownMenu variant="dark">
				<MenuItemButton onclick={() => alert('todo')}>2014 5e Character</MenuItemButton>
			</DropDownMenu>
		</div>
		<div class="min-w-0 px-1 text-center">
			<a href="/" class="block truncate text-2xl font-bold leading-none tracking-tight md:text-3xl"
				>ez-chars</a
			>
		</div>
		<div class="block" id="navbar-default">
			<ul class="flex flex-row items-center font-medium">
				<li>
					<div class="block rounded-sm">
						<GitButton variant="dark" />
					</div>
				</li>
				<li>
					<div class="block rounded-sm">
						<HomeButton variant="dark" />
					</div>
				</li>
				<li>
					<div class="block rounded-sm">
						<AboutButton variant="dark" />
					</div>
				</li>
			</ul>
		</div>
	</div>
</nav>
