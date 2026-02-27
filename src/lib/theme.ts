import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

export type ThemeName = 'ocean' | 'forest' | 'sunset';
export type ThemeOption = { id: ThemeName; label: string };

export const THEME_OPTIONS: ThemeOption[] = [
	{ id: 'ocean', label: 'Ocean' },
	{ id: 'forest', label: 'Forest' },
	{ id: 'sunset', label: 'Sunset' }
];

export const THEMES: ThemeName[] = THEME_OPTIONS.map((option) => option.id);
export const THEME_STORAGE_KEY = 'ez-chars-theme';
const DEFAULT_THEME: ThemeName = 'ocean';

export const theme: Writable<ThemeName> = writable(DEFAULT_THEME);

const isValidTheme = (value: unknown): value is ThemeName =>
	typeof value === 'string' && THEMES.some((themeName) => themeName === value);

const applyTheme = (value: ThemeName): void => {
	if (typeof document === 'undefined') return;
	document.documentElement.dataset.theme = value;
};

export const setTheme = (value: unknown): void => {
	let nextTheme: ThemeName = DEFAULT_THEME;
	if (isValidTheme(value)) {
		nextTheme = value;
	}
	theme.set(nextTheme);
	applyTheme(nextTheme);
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
	}
};

export const initializeTheme = (): void => {
	let storedTheme: string | null = null;
	if (typeof localStorage !== 'undefined') {
		storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
	}
	setTheme(storedTheme ?? DEFAULT_THEME);
};
