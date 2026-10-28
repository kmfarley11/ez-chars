import { beforeEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';
import { installMemoryLocalStorage } from '../../../test-utils/browser';
import { createCharacterExportEnvelope } from '../../../schema/importExport';

vi.mock('$app/env', () => ({ browser: true }));

const storageKey = 'ez-chars.characters.v1';
const original = ' {"version":1,"characters":[{"reviewFixture":"unsupported-original"}]}\n';

describe('character store recovery owner', () => {
	beforeEach(() => {
		vi.resetModules();
		installMemoryLocalStorage();
		localStorage.setItem(storageKey, original);
	});

	it('protects the original across repeated fallback edits, creation, deletion, and reload', async () => {
		const store = await import('../store');
		const baseline = get(store.charsArray);
		store.charsArray.set([...baseline]);
		const temporary = store.createNewCharacter('dnd5e-2024');
		store.deleteCharacterById(temporary.meta.id);
		store.deleteCharacterById(baseline[0].meta.id);
		expect(localStorage.getItem(storageKey)).toBe(original);
		expect(get(store.charsStorageIssue)?.originalData).toBe(original);
		vi.resetModules();
		const reopened = await import('../store');
		expect(get(reopened.charsStorageIssue)?.originalData).toBe(original);
		expect(get(reopened.charsArray)).toHaveLength(baseline.length);
	});

	it('blocks both import modes without mutating temporary or original data', async () => {
		const store = await import('../store');
		const before = get(store.charsArray);
		const envelope = createCharacterExportEnvelope([]);
		for (const mode of ['replace', 'merge-new'] as const) {
			expect(store.importCharacters(envelope, mode)).toBeNull();
			expect(get(store.charsArray)).toBe(before);
			expect(localStorage.getItem(storageKey)).toBe(original);
		}
	});

	it('leaves recovery and original bytes intact when the confirmed reset fails', async () => {
		const store = await import('../store');
		const before = get(store.charsArray);
		const write = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
			throw new Error('quota');
		});
		expect(store.resetRejectedStoredCharacters()).toBe(false);
		expect(get(store.charsArray)).toBe(before);
		expect(get(store.charsStorageIssue)?.originalData).toBe(original);
		expect(localStorage.getItem(storageKey)).toBe(original);
		write.mockRestore();
	});

	it('writes a fresh baseline once before lifting recovery and then resumes persistence', async () => {
		const store = await import('../store');
		const baselineIds = get(store.charsArray).map((c) => c.meta.id);
		store.deleteCharacterById(baselineIds[0]);
		const write = vi.spyOn(localStorage, 'setItem');
		expect(store.resetRejectedStoredCharacters()).toBe(true);
		expect(write).toHaveBeenCalledTimes(1);
		expect(get(store.charsStorageIssue)).toBeNull();
		expect(get(store.charsArray).map((c) => c.meta.id)).toEqual(baselineIds);
		store.deleteCharacterById(baselineIds[0]);
		expect(write).toHaveBeenCalledTimes(2);
		expect(JSON.parse(localStorage.getItem(storageKey)!).characters).toHaveLength(
			baselineIds.length - 1
		);
		expect(store.resetRejectedStoredCharacters()).toBe(false);
		write.mockRestore();
	});
});
