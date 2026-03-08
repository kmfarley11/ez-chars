import { browser } from '$app/environment';
import { resolve } from '$app/paths';

export const toBaseHref = (pathSuffix: string) => {
	const root = resolve('/');
	return root === '/' ? pathSuffix : `${root}${pathSuffix}`;
};

export const FULL_2014_SRD_HREF = toBaseHref('docs/ext/5e2014/SRD5.1_-_Bookmarked_Full_-_v2.pdf');
export const FULL_2014_SRD_URL = browser
	? new URL(FULL_2014_SRD_HREF, window.location.origin).href
	: FULL_2014_SRD_HREF;

export const OFFICIAL_2014_CHAR_SHEET_HREF =
	'https://media.wizards.com/2016/dnd/downloads/5E_CharacterSheet_Fillable.pdf';
