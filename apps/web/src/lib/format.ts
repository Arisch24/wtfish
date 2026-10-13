const list = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });
const date = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export function listOf(items: string[]): string {
	return list.format(items);
}

export function formatSize(size: { maxCm: number; commonCm?: number; maxKg?: number }): string {
	const max = size.maxKg ? `${size.maxCm} cm and ${size.maxKg} kg` : `${size.maxCm} cm`;
	return size.commonCm ? `Usually ${size.commonCm} cm; up to ${max}` : `Up to ${max}`;
}

export function formatRange([low, high]: [number, number], unit: string): string {
	return low === high ? `${low}${unit}` : `${low}–${high}${unit}`;
}

export function formatDate(iso: string): string {
	return date.format(new Date(`${iso}T00:00:00Z`));
}
