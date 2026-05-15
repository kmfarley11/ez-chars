export class MemoryStorage implements Storage {
	private items = new Map<string, string>();

	get length() {
		return this.items.size;
	}

	clear() {
		this.items.clear();
	}

	getItem(key: string) {
		return this.items.get(key) ?? null;
	}

	key(index: number) {
		return Array.from(this.items.keys())[index] ?? null;
	}

	removeItem(key: string) {
		this.items.delete(key);
	}

	setItem(key: string, value: string) {
		this.items.set(key, value);
	}
}

export const installBrowserTestWindow = (origin = 'http://localhost') => {
	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: {
			location: {
				origin
			}
		}
	});
};

export const installMemoryLocalStorage = () => {
	const storage = new MemoryStorage();
	Object.defineProperty(globalThis, 'localStorage', {
		configurable: true,
		value: storage
	});
	return storage;
};
