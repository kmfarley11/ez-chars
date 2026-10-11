export type PdfPreviewPart = { text: string; match: boolean };

// Match and slice the same normalized display text so ligatures and composed
// Unicode cannot shift highlight offsets. The query is literal, never a regex.
export const createPdfFindPreview = (source: string, query: string) => {
	const text = source.normalize('NFKC');
	const needle = query.trim().normalize('NFKC');
	if (!needle) return undefined;
	const pattern = new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'giu');
	const matches = Array.from(text.matchAll(pattern));
	if (!matches.length) return undefined;
	const first = matches[0];
	const start = Math.max(0, first.index - 45);
	const end = Math.min(text.length, first.index + first[0].length + 75);
	const previewParts: PdfPreviewPart[] = [];
	if (start > 0) previewParts.push({ text: '…', match: false });
	let cursor = start;
	for (const match of matches) {
		if (match.index >= end) break;
		if (match.index > cursor)
			previewParts.push({ text: text.slice(cursor, match.index), match: false });
		const matchEnd = Math.min(end, match.index + match[0].length);
		previewParts.push({ text: text.slice(match.index, matchEnd), match: true });
		cursor = matchEnd;
	}
	if (cursor < end) previewParts.push({ text: text.slice(cursor, end), match: false });
	if (end < text.length) previewParts.push({ text: '…', match: false });
	return {
		occurrences: matches.length,
		preview: previewParts.map((part) => part.text).join(''),
		previewParts
	};
};
