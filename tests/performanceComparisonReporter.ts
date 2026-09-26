import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

type FrameStats = {
	frameCount: number;
	averageFps: number;
	overVsyncBudgetRate: number;
	droppedFrameRate: number;
};

type EngineSummary = {
	sampleCount: number;
	samples: Array<FrameStats>;
	median: FrameStats;
};

type PersistedSummary = {
	generatedAt: string;
	engines: Record<string, EngineSummary>;
};

const annotationType = 'scroll-frame-baseline';
const reportPath = resolve('performance-results/scroll-frame-comparison.json');

const round = (value: number): number => Number(value.toFixed(4));

const median = (values: Array<number>): number => {
	const sorted = [...values].sort((left, right) => left - right);
	const middle = Math.floor(sorted.length / 2);
	if (sorted.length % 2 === 1) return sorted[middle];
	return (sorted[middle - 1] + sorted[middle]) / 2;
};

const summarize = (samples: Array<FrameStats>): EngineSummary => ({
	sampleCount: samples.length,
	samples: samples.map((sample) => ({
		frameCount: sample.frameCount,
		averageFps: round(sample.averageFps),
		overVsyncBudgetRate: round(sample.overVsyncBudgetRate),
		droppedFrameRate: round(sample.droppedFrameRate)
	})),
	median: {
		frameCount: round(median(samples.map((sample) => sample.frameCount))),
		averageFps: round(median(samples.map((sample) => sample.averageFps))),
		overVsyncBudgetRate: round(median(samples.map((sample) => sample.overVsyncBudgetRate))),
		droppedFrameRate: round(median(samples.map((sample) => sample.droppedFrameRate)))
	}
});

const readPreviousSummary = (): PersistedSummary | undefined => {
	if (!existsSync(reportPath)) return undefined;
	try {
		return JSON.parse(readFileSync(reportPath, 'utf8')) as PersistedSummary;
	} catch {
		return undefined;
	}
};

class PerformanceComparisonReporter implements Reporter {
	private readonly samplesByProject = new Map<string, Array<FrameStats>>();

	onTestEnd(test: TestCase, result: TestResult): void {
		const annotation = result.annotations.find((candidate) => candidate.type === annotationType);
		if (!annotation?.description) return;

		const stats = JSON.parse(annotation.description) as FrameStats;
		const samples = this.samplesByProject.get(test.parent.project()?.name ?? 'unknown') ?? [];
		samples.push(stats);
		this.samplesByProject.set(test.parent.project()?.name ?? 'unknown', samples);
	}

	onEnd(): void {
		const engines = Object.fromEntries(
			[...this.samplesByProject.entries()].map(([project, samples]) => [
				project,
				summarize(samples)
			])
		);
		const previous = readPreviousSummary();
		const report = {
			generatedAt: new Date().toISOString(),
			measurement: 'requestAnimationFrame cadence during deterministic document scrolling',
			policy: {
				chromium: 'gating: average FPS >= 55 and dropped-frame rate <= 0.05',
				firefox: 'comparative only; headed profiling owns paint/compositor conclusions'
			},
			engines,
			previous:
				previous === undefined
					? undefined
					: {
							generatedAt: previous.generatedAt,
							medians: Object.fromEntries(
								Object.entries(previous.engines).map(([project, summary]) => [
									project,
									summary.median
								])
							)
						}
		};

		mkdirSync(dirname(reportPath), { recursive: true });
		writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

		console.log('\nScroll-frame comparison (median of serialized samples)');
		for (const [project, summary] of Object.entries(engines)) {
			console.log(
				`${project}: ${summary.median.averageFps.toFixed(2)} FPS, ` +
					`${(summary.median.droppedFrameRate * 100).toFixed(2)}% dropped-frame intervals`
			);
		}
		console.log(`Report: ${reportPath}`);
	}
}

export default PerformanceComparisonReporter;
