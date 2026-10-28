import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { describe, expect, it } from 'vitest';
import { DND5E_2014_SRD_RESOURCE_ID, dnd5e2014ResourceCatalog } from '../dnd5e2014ResourceCatalog';
import { dnd5e2024ResourceCatalog } from '../dnd5e2024-resource-catalog';

const getSrdNoticeInventory = async () => {
	const notices = await readFile(resolve(process.cwd(), 'THIRD_PARTY_NOTICES.md'), 'utf8');
	const row = notices.split('\n').find((line) => line.includes('docs/ext/5e2014/SRD_CC_v5.1.pdf'));
	if (!row) throw new Error('Expected the SRD 5.1 inventory row');
	const columns = row.split('|').map((column) => column.trim());
	const expectedHash = columns[3]?.match(/`([a-f0-9]{64})`/)?.[1];
	const expectedPages = Number(columns[6]);
	if (!expectedHash || !Number.isInteger(expectedPages)) {
		throw new Error('Expected hash and page count in the SRD 5.1 inventory row');
	}
	return { expectedHash, expectedPages };
};

describe('adopted SRD 5.1 integrity', () => {
	it('matches the centralized hash and page inventory with in-range one-based locators', async () => {
		const resource = dnd5e2014ResourceCatalog.resources.find(
			(entry) => entry.id === DND5E_2014_SRD_RESOURCE_ID
		);
		if (!resource?.localAssetPath) throw new Error('Expected the adopted local SRD resource');
		const artifactPath = resolve(process.cwd(), resource.localAssetPath.replace(/^\//, ''));
		const bytes = await readFile(artifactPath);
		const { expectedHash, expectedPages } = await getSrdNoticeInventory();
		expect(createHash('sha256').update(bytes).digest('hex')).toBe(expectedHash);
		expect(resource.pageBasis).toBe('pdf-and-printed-one-based');

		const loadingTask = getDocument({ data: new Uint8Array(bytes) });
		const document = await loadingTask.promise;
		try {
			expect(document.numPages).toBe(expectedPages);
			const pageLocators = dnd5e2014ResourceCatalog.locators.filter(
				(locator) => locator.resourceId === resource.id && locator.kind === 'pdf-page'
			);
			for (const locator of pageLocators) {
				expect(locator.page).toBeGreaterThanOrEqual(1);
				expect(locator.page).toBeLessThanOrEqual(document.numPages);
				await expect(document.getPage(locator.page ?? 0)).resolves.toBeDefined();
			}
		} finally {
			await document.destroy();
		}
	});
});

describe('adopted SRD 5.2.1 contextual destinations', () => {
	it('opens the reviewed section headings in the actual hosted PDF', async () => {
		const resource = dnd5e2024ResourceCatalog.resources[0];
		const bytes = await readFile(
			resolve(process.cwd(), resource.localAssetPath!.replace(/^\//, ''))
		);
		const document = await getDocument({ data: new Uint8Array(bytes) }).promise;
		try {
			for (const [page, heading] of [
				[19, /Character\s*Creation/],
				[28, /Classes/],
				[104, /Spells/]
			] as const) {
				const content = await (await document.getPage(page)).getTextContent();
				const text = content.items.map((item) => ('str' in item ? item.str : '')).join(' ');
				expect(text).toMatch(heading);
			}
		} finally {
			await document.destroy();
		}
	});
});
