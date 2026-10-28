import type { PageLoad } from './$types';
export const load: PageLoad = ({ url }) => ({ id: url.searchParams.get('id')?.trim() ?? null });
