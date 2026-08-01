import { browser } from '$app/environment';
import { asset } from '$app/paths';

export const FULL_2014_SRD_PATH = '/docs/ext/5e2014/SRD_CC_v5.1.pdf';
export const FULL_2014_SRD_HREF = asset(FULL_2014_SRD_PATH);
export const FULL_2014_SRD_URL = browser
	? new URL(FULL_2014_SRD_HREF, window.location.origin).href
	: FULL_2014_SRD_HREF;

export const OFFICIAL_2014_CHAR_SHEET_HREF =
	'https://media.wizards.com/2016/dnd/downloads/5E_CharacterSheet_Fillable.pdf';
