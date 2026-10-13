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

export function searchText(names: { english: string; scientific: string; malay?: string; other?: string[] }): string {
	return [names.english, names.scientific, names.malay, ...(names.other ?? [])]
		.filter(Boolean)
		.join(' ')
		.toLowerCase();
}

export function matches(item: FilterItem, query: FilterQuery): boolean {
	const words = query.text.toLowerCase().split(/\s+/).filter(Boolean);
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
