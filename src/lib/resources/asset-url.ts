import { asset } from '$app/paths';

// Catalog/PDF support files are served by our Vite plugins rather than static/,
// so Kit cannot enumerate their paths. Keep this boundary in one place.
export const resolveAssetUrl = (path: string): string =>
	asset(path.replace(/^\/+/, '') as Parameters<typeof asset>[0]);
