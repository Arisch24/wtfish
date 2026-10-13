import { STATES, type Iucn, type State } from '../../src/lib/fish-schema.ts';

const STATE_ALIASES: Record<string, State> = {
	penang: 'Pulau Pinang',
	malacca: 'Melaka',
	johore: 'Johor',
	'negri sembilan': 'Negeri Sembilan',
	'wilayah persekutuan kuala lumpur': 'Kuala Lumpur',
	'federal territory of kuala lumpur': 'Kuala Lumpur',
	'wilayah persekutuan labuan': 'Labuan',
	'federal territory of labuan': 'Labuan',
	'wilayah persekutuan putrajaya': 'Putrajaya',
	'federal territory of putrajaya': 'Putrajaya',
};

export function normaliseState(raw: string): State | null {
	const key = raw.trim().toLowerCase().replace(/\s+/g, ' ');
	return STATES.find((state) => state.toLowerCase() === key) ?? STATE_ALIASES[key] ?? null;
}

export interface StateCount {
	state: State;
	records: number;
}

export function summariseStates(facets: { name: string; count: number }[]): StateCount[] {
	const totals = new Map<State, number>();
	for (const { name, count } of facets) {
		const state = normaliseState(name);
		if (state && Number.isSafeInteger(count) && count > 0) totals.set(state, (totals.get(state) ?? 0) + count);
	}
	return [...totals]
		.map(([state, records]) => ({ state, records }))
		.sort((a, b) => b.records - a.records || a.state.localeCompare(b.state));
}

const IUCN_BY_LABEL: Record<string, Iucn> = {
	'least concern': 'LC',
	'near threatened': 'NT',
	vulnerable: 'VU',
	endangered: 'EN',
	'critically endangered': 'CR',
	'extinct in the wild': 'EW',
	extinct: 'EX',
	'data deficient': 'DD',
	'not evaluated': 'NE',
};

export function iucnFromLabel(label: string | undefined): Iucn | undefined {
	return label ? IUCN_BY_LABEL[label.trim().toLowerCase()] : undefined;
}

export interface GbifMatch {
	usageKey?: number;
	matchType?: string;
	status?: string;
	species?: string;
	family?: string;
	order?: string;
}

export function matchVerdict(match: GbifMatch): 'ok' | 'synonym' | 'none' {
	if (!match.usageKey || match.matchType !== 'EXACT') return 'none';
	if (match.status === 'SYNONYM') return 'synonym';
	return match.status === 'ACCEPTED' ? 'ok' : 'none';
}

export interface FishFile {
	names: { scientific: string; malay?: string; [key: string]: unknown };
	taxonomy: Record<string, unknown>;
	iucn?: string;
	malaysia?: { states?: StateCount[]; [key: string]: unknown };
	[key: string]: unknown;
}

export interface Generated {
	taxonomy: { family?: string; order?: string; gbifKey?: number; wikidata?: string };
	iucn?: Iucn;
	/** undefined = lookup failed (keep old data); [] = no Malaysian records. */
	states?: StateCount[];
}

export function mergeGenerated(fish: FishFile, generated: Generated): FishFile {
	const out = structuredClone(fish);
	for (const [key, value] of Object.entries(generated.taxonomy)) {
		if (value !== undefined) out.taxonomy[key] = value;
	}
	if (generated.iucn) out.iucn = generated.iucn;
	if (out.malaysia && generated.states) {
		if (generated.states.length > 0) out.malaysia.states = generated.states;
		else delete out.malaysia.states;
	}
	return out;
}

import { getJson, type Fetcher } from './http.ts';

interface Occurrences { facets?: { field?: string; counts?: { name: string; count: number }[] }[] }
interface WikidataResult { results: { bindings: { item: { value: string }; statusLabel?: { value: string }; malay?: { value: string } }[] } }

/** A rejected match stops all enrichment. Independent downstream failures keep old fields. */
export async function enrichFish(fish: FishFile, fetcher: Fetcher = fetch, warn: (message: string) => void = console.warn): Promise<FishFile | null> {
	const scientific = fish.names.scientific;
	let match: GbifMatch;
	try {
		match = await getJson<GbifMatch>(`https://api.gbif.org/v1/species/match?name=${encodeURIComponent(scientific)}&strict=true&rank=species`, fetcher);
	} catch (error) {
		warn(`  ! GBIF match failed for "${scientific}": ${error}. Nothing written.`);
		return null;
	}
	const verdict = matchVerdict(match);
	if (verdict !== 'ok' || (match.species && match.species !== scientific)) {
		warn(verdict === 'synonym'
			? `  ! GBIF treats "${scientific}" as a synonym of "${match.species}". Check Catalog of Fishes. Nothing written.`
			: `  ! GBIF has no accepted exact match for "${scientific}" (matchType ${match.matchType}, status ${match.status}, species ${match.species}). Nothing written.`);
		return null;
	}
	const generated: Generated = { taxonomy: { family: match.family, order: match.order, gbifKey: match.usageKey } };
	const params = new URLSearchParams({ taxonKey: String(match.usageKey), country: 'MY', limit: '0', facet: 'stateProvince', facetLimit: '100' });
	params.append('license', 'CC0_1_0');
	params.append('license', 'CC_BY_4_0');
	const query = `SELECT ?item ?statusLabel ?malay WHERE {
		?item wdt:P225 ${JSON.stringify(scientific)} .
		OPTIONAL { ?item wdt:P141 ?status . }
		OPTIONAL { ?item rdfs:label ?malay . FILTER(LANG(?malay) = "ms") }
		SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
	} LIMIT 1`;
	await Promise.all([
		(async () => {
			try {
				const result = await getJson<Occurrences>(`https://api.gbif.org/v1/occurrence/search?${params}`, fetcher);
				const facet = result.facets?.find((facet) => facet.field === 'STATE_PROVINCE' || facet.field === 'stateProvince');
				generated.states = summariseStates(facet?.counts ?? []);
			} catch (error) { warn(`  ! GBIF occurrences failed: ${error}. Existing states retained.`); }
		})(),
		(async () => {
			try {
				const result = await getJson<WikidataResult>(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`, fetcher);
				const row = result.results.bindings[0];
				if (!row) { warn(`  ! No Wikidata item with taxon name "${scientific}".`); return; }
				const id = row.item.value.split('/').pop();
				if (id && /^Q\d+$/.test(id)) generated.taxonomy.wikidata = id;
				generated.iucn = iucnFromLabel(row.statusLabel?.value);
				if (row.malay?.value && row.malay.value.toLowerCase() !== fish.names.malay?.toLowerCase()) {
					warn(`  Wikidata Malay label: "${row.malay.value}" (not applied — check against DOF names)`);
				}
			} catch (error) { warn(`  ! Wikidata failed: ${error}. Existing Wikidata/IUCN values retained.`); }
		})(),
	]);
	if (!fish.malaysia && generated.states?.length) warn(`  GBIF has Malaysian records (${generated.states.map((state) => state.state).join(', ')}) but no malaysia section — add one only with evidence.`);
	const out = mergeGenerated(fish, generated);
	const sources = Array.isArray(out.sources) ? out.sources.filter((source): source is string => typeof source === 'string') : [];
	sources.push(`https://www.gbif.org/species/${match.usageKey}`);
	if (generated.taxonomy.wikidata) sources.push(`https://www.wikidata.org/wiki/${generated.taxonomy.wikidata}`);
	out.sources = [...new Set(sources)];
	return out;
}
