<script>
	import DropDownMenu from '$lib/DropDownMenu.svelte';
	import GitButton from '$lib/GitButton.svelte';
	import Heading from '$lib/Heading.svelte';
	import HomeButton from '$lib/HomeButton.svelte';
	import MenuItemButton from '$lib/MenuItemButton.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<div>
	<!-- TODO: abstract into navbar? -->
	<nav>
		<div class="flex w-full flex-wrap items-center justify-between border bg-slate-700 text-white">
			<div class="items-center">
				<DropDownMenu variant="dark">
					<MenuItemButton onclick={() => alert('todo')}>2014 5e Character</MenuItemButton>
				</DropDownMenu>
			</div>
			<div class="items-center">
				<Heading variant="md"><a href="/">ez-chars</a></Heading>
			</div>
			<div class="hidden w-full md:block md:w-auto mt-1" id="navbar-default">
				<ul class="flex-row font-medium flex">
					<li>
						<div class="block rounded-sm">
							<GitButton variant="dark"/>
						</div>
					</li>
					<li>
						<div class="block rounded-sm">
							<HomeButton variant="dark" />
						</div>
					</li>
				</ul>
			</div>
		</div>
	</nav>
	{@render children()}
</div>
