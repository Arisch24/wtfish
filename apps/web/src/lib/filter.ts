export interface FilterItem {
	search: string;
	water: string[];
	uses: string[];
	states: string[];
	/** Status in Malaysia, or '' when the fish is not found in Malaysia. */
	status: string;
	/** IUCN category, or '' when unknown. */
	iucn: string;
}

export interface FilterQuery {
	text: string;
	water: string;
	use: string;
	state: string;
	/** '' = anywhere, 'any' = found in Malaysia, otherwise an exact status. */
	status: string;
	threatened: boolean;
}

export const THREATENED: readonly string[] = ['VU', 'EN', 'CR'];

/** Lower-case and drop apostrophes, so "John's", "john’s" and "johns" all match. */
function normalise(text: string): string {
	return text.toLowerCase().replace(/['’]/g, '');
}

/**
 * Text to search for one fish. The site is English-only, so Malay names
 * (`names.malay`, `names.malayOther`) are deliberately left out.
 */
export function searchText(names: { english: string; scientific: string; other?: string[] }): string {
	return normalise([names.english, names.scientific, ...(names.other ?? [])].join(' '));
}

export function matches(item: FilterItem, query: FilterQuery): boolean {
	const words = normalise(query.text).split(/\s+/).filter(Boolean);
	const statusOk = query.status === 'any' ? item.status !== '' : !query.status || item.status === query.status;
	return (
		words.every((word) => item.search.includes(word)) &&
		(!query.water || item.water.includes(query.water)) &&
		(!query.use || item.uses.includes(query.use)) &&
		(!query.state || item.states.includes(query.state)) &&
		statusOk &&
		(!query.threatened || THREATENED.includes(item.iucn))
	);
}
