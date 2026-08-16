<script lang="ts">
	import { type Snippet } from 'svelte';
	import { twMerge } from 'tailwind-merge';

	type GridCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

	interface Props {
		children?: Snippet;
		cols?: number;
		colsSm?: number;
		colsMd?: number;
		colsLg?: number;
		classes?: string;
	}

	let {
		children = undefined,
		cols = 1,
		colsSm = undefined,
		colsMd = undefined,
		colsLg = undefined,
		classes = undefined
	}: Props = $props();

	type ColCountClassSet = { base: string; sm: string; md: string; lg: string };
	const colCountClassMap: Record<GridCount, ColCountClassSet> = {
		'1': { base: 'grid-cols-1', sm: 'sm:grid-cols-1', md: 'md:grid-cols-1', lg: 'lg:grid-cols-1' },
		'2': { base: 'grid-cols-2', sm: 'sm:grid-cols-2', md: 'md:grid-cols-2', lg: 'lg:grid-cols-2' },
		'3': { base: 'grid-cols-3', sm: 'sm:grid-cols-3', md: 'md:grid-cols-3', lg: 'lg:grid-cols-3' },
		'4': { base: 'grid-cols-4', sm: 'sm:grid-cols-4', md: 'md:grid-cols-4', lg: 'lg:grid-cols-4' },
		'5': { base: 'grid-cols-5', sm: 'sm:grid-cols-5', md: 'md:grid-cols-5', lg: 'lg:grid-cols-5' },
		'6': { base: 'grid-cols-6', sm: 'sm:grid-cols-6', md: 'md:grid-cols-6', lg: 'lg:grid-cols-6' },
		'7': { base: 'grid-cols-7', sm: 'sm:grid-cols-7', md: 'md:grid-cols-7', lg: 'lg:grid-cols-7' },
		'8': { base: 'grid-cols-8', sm: 'sm:grid-cols-8', md: 'md:grid-cols-8', lg: 'lg:grid-cols-8' },
		'9': { base: 'grid-cols-9', sm: 'sm:grid-cols-9', md: 'md:grid-cols-9', lg: 'lg:grid-cols-9' },
		'10': {
			base: 'grid-cols-10',
			sm: 'sm:grid-cols-10',
			md: 'md:grid-cols-10',
			lg: 'lg:grid-cols-10'
		},
		'11': {
			base: 'grid-cols-11',
			sm: 'sm:grid-cols-11',
			md: 'md:grid-cols-11',
			lg: 'lg:grid-cols-11'
		},
		'12': {
			base: 'grid-cols-12',
			sm: 'sm:grid-cols-12',
			md: 'md:grid-cols-12',
			lg: 'lg:grid-cols-12'
		}
	};

	const toGridCount = (value: number | undefined, fallback: GridCount): GridCount => {
		if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
		return Math.max(1, Math.min(12, Math.trunc(value))) as GridCount;
	};

	const toOptionalGridCount = (value: number | undefined): GridCount | undefined => {
		if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
		return toGridCount(value, 1);
	};

	const normalizedCols = $derived(toGridCount(cols, 1));
	const normalizedColsSm = $derived(toOptionalGridCount(colsSm));
	const normalizedColsMd = $derived(toOptionalGridCount(colsMd));
	const normalizedColsLg = $derived(toOptionalGridCount(colsLg));

	const baseClass = $derived(colCountClassMap[normalizedCols].base);
	const smClass = $derived(normalizedColsSm ? colCountClassMap[normalizedColsSm].sm : '');
	const mdClass = $derived(normalizedColsMd ? colCountClassMap[normalizedColsMd].md : '');
	const lgClass = $derived(normalizedColsLg ? colCountClassMap[normalizedColsLg].lg : '');
</script>

<div class={twMerge('grid grid-flow-row gap-2', baseClass, smClass, mdClass, lgClass, classes)}>
	{@render children?.()}
</div>
