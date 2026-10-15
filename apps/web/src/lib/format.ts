import type { Fish, PhotoLicense } from './fish-schema';

const list = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });
const date = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export function listOf(items: string[]): string {
	return list.format(items);
}

export type ListPart<T extends string> = { type: 'element'; value: T } | { type: 'literal'; value: string };

/** listOf's text in parts: each item, and the commas and "and" between them, so an item can be a link. */
export function listParts<T extends string>(items: readonly T[]): ListPart<T>[] {
	return list
		.formatToParts(items)
		.map((part): ListPart<T> =>
			part.type === 'element' ? { type: 'element', value: part.value as T } : { type: 'literal', value: part.value },
		);
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

/** The newest `lastReviewed` date among the fish, or undefined if none has been reviewed. */
export function lastUpdated(fish: Pick<Fish, 'lastReviewed'>[]): string | undefined {
	let newest: string | undefined;
	for (const { lastReviewed } of fish) {
		// ISO dates (YYYY-MM-DD) sort correctly as plain strings.
		if (lastReviewed && (!newest || lastReviewed > newest)) newest = lastReviewed;
	}
	return newest;
}

/**
 * Where a photo licence is explained. The stored category does not identify a
 * BY/BY-SA version, so those link to the overview; the credited source page
 * keeps the photo's exact licence.
 */
export function licenseUrl(license: PhotoLicense): string {
	return license === 'CC0'
		? 'https://creativecommons.org/publicdomain/zero/1.0/'
		: 'https://creativecommons.org/share-your-work/cclicenses/';
}
