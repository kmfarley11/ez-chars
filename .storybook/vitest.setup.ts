import { afterEach, expect, inject } from 'vitest';

declare module 'vitest' {
	interface ProvidedContext {
		'storybook/test-provided': { a11y: boolean };
	}
}

// A passing render alone must never hide an accidentally disabled axe audit.
// The addon attaches its reports after the composed story has finished running.
afterEach(({ task }) => {
	// The pinned addon provides this key for manager-selected test modes.
	// CLI runs default to auditing; an explicit component-only run does not.
	if (inject('storybook/test-provided')?.a11y === false) return;
	const reports = task.meta.reports as Array<{ type: string }> | undefined;
	expect(reports?.some((report) => report.type === 'a11y')).toBe(true);
});
