import { type ClassLevel } from './system.5e2014';

export function nowIso() {
	return new Date().toISOString();
}

export function createId(): string {
	return crypto.randomUUID();
}

export function totalLevel(classes: ClassLevel[]): number {
	return classes.reduce((sum, c) => sum + (c.level || 0), 0);
}
