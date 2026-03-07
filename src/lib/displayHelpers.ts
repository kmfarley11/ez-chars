export const displayOrPlaceholder = (value: unknown, placeholder = '___'): string => {
	if (value === undefined || value === null) return placeholder;
	if (typeof value === 'string') {
		const trimmed = value.trim();
		return trimmed.length === 0 ? placeholder : trimmed;
	}
	if (Array.isArray(value)) {
		if (value.length === 0) return placeholder;
		const formatted = value
			.map((entry): string => {
				if (entry && typeof entry === 'object' && 'value' in entry && 'label' in entry) {
					const labeled = entry as { value?: unknown; label?: unknown };
					const valueText = displayOrPlaceholder(labeled.value, '').trim();
					const labelText = displayOrPlaceholder(labeled.label, '').trim();
					if (valueText.length > 0 && labelText.length > 0) return `${valueText} ${labelText}`;
					return valueText || labelText;
				}
				if (entry && typeof entry === 'object' && 'name' in entry) {
					const named = entry as { name?: unknown; level?: unknown };
					const name = typeof named.name === 'string' ? named.name.trim() : '';
					const level =
						typeof named.level === 'number' || typeof named.level === 'string'
							? String(named.level).trim()
							: '';
					if (name.length > 0 && level.length > 0) return `${name} ${level}`;
					if (name.length > 0) return name;
				}
				const raw = String(entry).trim();
				return raw.length > 0 ? raw : '';
			})
			.filter((entry) => entry.length > 0);
		return formatted.length > 0 ? formatted.join(' / ') : placeholder;
	}
	return String(value);
};
