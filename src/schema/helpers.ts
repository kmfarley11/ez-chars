import { type ClassLevel } from './system.5e2014';

export function nowIso() {
	return new Date().toISOString();
}

export function createId(): string {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	// Fallback for non-secure contexts (e.g., local network mobile testing over HTTP)
	return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => {
		const num = Number(c);
		return (num ^ ((Math.random() * 16) >> (num / 4))).toString(16);
	});
}

export function totalLevel(classes: ClassLevel[]): number {
	return classes.reduce((sum, c) => sum + (c.level || 0), 0);
}
