import { describe, expect, it } from 'vitest';
import {
	iucnFromLabel,
	matchVerdict,
	mergeGenerated,
	normaliseState,
	summariseStates,
	type FishFile,
} from '../scripts/lib/open-data';

describe('normaliseState', () => {
	it.each([
		['Sarawak', 'Sarawak'],
		['  sarawak ', 'Sarawak'],
		['Penang', 'Pulau Pinang'],
		['Malacca', 'Melaka'],
		['Negri Sembilan', 'Negeri Sembilan'],
		['Wilayah Persekutuan Kuala Lumpur', 'Kuala Lumpur'],
		['Johore', 'Johor'],
	])('maps %j to %s', (raw, state) => {
		expect(normaliseState(raw)).toBe(state);
	});

	it.each(['Ile de Bornéo', 'Kalimantan', ''])('drops %j', (raw) => {
		expect(normaliseState(raw)).toBeNull();
	});
});

describe('summariseStates', () => {
	it('merges spellings, drops unknown places and sorts by records', () => {
		const facets = [
			{ name: 'Sarawak', count: 42 },
			{ name: 'Pahang', count: 16 },
			{ name: 'Kelantan', count: 8 },
			{ name: 'Terengganu', count: 6 },
			{ name: 'Sabah', count: 3 },
			{ name: 'Perak', count: 2 },
			{ name: 'Ile de Bornéo', count: 1 },
			{ name: 'sarawak', count: 1 },
		];
		expect(summariseStates(facets)).toEqual([
			{ state: 'Sarawak', records: 43 },
			{ state: 'Pahang', records: 16 },
			{ state: 'Kelantan', records: 8 },
			{ state: 'Terengganu', records: 6 },
			{ state: 'Sabah', records: 3 },
			{ state: 'Perak', records: 2 },
		]);
	});

	it('breaks ties alphabetically', () => {
		expect(summariseStates([{ name: 'Perak', count: 1 }, { name: 'Johor', count: 1 }])).toEqual([
			{ state: 'Johor', records: 1 },
			{ state: 'Perak', records: 1 },
		]);
	});
});

describe('iucnFromLabel', () => {
	it.each([
		['least concern', 'LC'],
		['Data Deficient', 'DD'],
		['critically endangered', 'CR'],
		['vulnerable', 'VU'],
	])('maps %j to %s', (label, code) => {
		expect(iucnFromLabel(label)).toBe(code);
	});

	it('returns undefined for unknown or missing labels', () => {
		expect(iucnFromLabel('lower risk')).toBeUndefined();
		expect(iucnFromLabel(undefined)).toBeUndefined();
	});
});

describe('matchVerdict', () => {
	it('accepts an exact match on an accepted name', () => {
		expect(matchVerdict({ usageKey: 1, matchType: 'EXACT', status: 'ACCEPTED' })).toBe('ok');
	});

	it('flags synonyms', () => {
		expect(matchVerdict({ usageKey: 1, matchType: 'EXACT', status: 'SYNONYM' })).toBe('synonym');
	});

	it('rejects fuzzy, higher-rank and missing matches', () => {
		expect(matchVerdict({ usageKey: 1, matchType: 'FUZZY', status: 'ACCEPTED' })).toBe('none');
		expect(matchVerdict({ usageKey: 1, matchType: 'HIGHERRANK', status: 'ACCEPTED' })).toBe('none');
		expect(matchVerdict({ matchType: 'NONE' })).toBe('none');
	});
});

describe('mergeGenerated', () => {
	const fish: FishFile = {
		names: { english: 'Malaysian mahseer', scientific: 'Tor tambroides', malay: 'Kelah' },
		taxonomy: { family: 'Cyprinidae' },
		summary: 'Hand-written summary.',
		iucn: 'DD',
		malaysia: { status: 'native', spots: ['Tasik Kenyir'], states: [{ state: 'Pahang', records: 1 }] },
	};

	it('never touches hand-written fields', () => {
		const out = mergeGenerated(fish, { taxonomy: { order: 'Cypriniformes' }, states: [] });
		expect(out.names).toEqual(fish.names);
		expect(out.summary).toBe('Hand-written summary.');
		expect(out.malaysia?.spots).toEqual(['Tasik Kenyir']);
		expect(out.malaysia?.status).toBe('native');
	});

	it('fills taxonomy and keeps fields the lookup did not return', () => {
		const out = mergeGenerated(fish, { taxonomy: { order: 'Cypriniformes', gbifKey: 2364503, family: undefined } });
		expect(out.taxonomy).toEqual({ family: 'Cyprinidae', order: 'Cypriniformes', gbifKey: 2364503 });
	});

	it('keeps the old IUCN category when the lookup has none', () => {
		expect(mergeGenerated(fish, { taxonomy: {} }).iucn).toBe('DD');
		expect(mergeGenerated(fish, { taxonomy: {}, iucn: 'VU' }).iucn).toBe('VU');
	});

	it('replaces states, removes them when GBIF has none, and keeps them when GBIF failed', () => {
		const newStates = [{ state: 'Sarawak' as const, records: 42 }];
		expect(mergeGenerated(fish, { taxonomy: {}, states: newStates }).malaysia?.states).toEqual(newStates);
		expect(mergeGenerated(fish, { taxonomy: {}, states: [] }).malaysia).not.toHaveProperty('states');
		expect(mergeGenerated(fish, { taxonomy: {} }).malaysia?.states).toEqual([{ state: 'Pahang', records: 1 }]);
	});

	it('does not add a malaysia section on its own', () => {
		const { malaysia: _removed, ...noMalaysia } = fish;
		const out = mergeGenerated(noMalaysia, { taxonomy: {}, states: [{ state: 'Sabah', records: 3 }] });
		expect(out).not.toHaveProperty('malaysia');
	});

	it('does not modify its input', () => {
		const before = structuredClone(fish);
		mergeGenerated(fish, { taxonomy: { family: 'Other' }, iucn: 'CR', states: [] });
		expect(fish).toEqual(before);
	});
});

describe('network enrichment', () => {
	const fish: FishFile = { names: { english: 'Barramundi', scientific: 'Lates calcarifer' }, taxonomy: { family: 'Latidae', wikidata: 'Q1' }, malaysia: { status: 'native', states: [{ state: 'Pahang', records: 1 }] }, iucn: 'DD' };
	it('rejects synonyms before any other network request', async () => {
		const { enrichFish } = await import('../scripts/lib/open-data');
		let calls = 0;
		const fetcher = async () => { calls++; return Response.json({ usageKey: 1, matchType: 'EXACT', status: 'SYNONYM' }); };
		expect(await enrichFish(fish, fetcher, () => {})).toBeNull();
		expect(calls).toBe(1);
	});
	it('preserves existing states when occurrences fail and uses only commercial licenses', async () => {
		const { enrichFish } = await import('../scripts/lib/open-data');
		const fetcher = async (input: string | URL | Request) => {
			const url = new URL(String(input));
			if (url.pathname.endsWith('/match')) return Response.json({ usageKey: 1, matchType: 'EXACT', status: 'ACCEPTED', species: 'Lates calcarifer', order: 'Carangiformes' });
			if (url.pathname.endsWith('/search')) {
				expect(url.searchParams.getAll('license')).toEqual(['CC0_1_0', 'CC_BY_4_0']);
				return new Response('', { status: 503 });
			}
			return Response.json({ results: { bindings: [] } });
		};
		const out = await enrichFish(fish, fetcher, () => {});
		expect(out?.taxonomy.order).toBe('Carangiformes');
		expect(out?.malaysia?.states).toEqual(fish.malaysia?.states);
		expect(out?.iucn).toBe('DD');
		expect(out?.taxonomy.wikidata).toBe('Q1');
	});
	it('rejects an exact accepted match for a different species', async () => {
		const { enrichFish } = await import('../scripts/lib/open-data');
		expect(await enrichFish(fish, async () => Response.json({ usageKey: 1, matchType: 'EXACT', status: 'ACCEPTED', species: 'Lates japonicus' }), () => {})).toBeNull();
	});
});

it('records commercial open-data provenance without changing research sources', async () => {
	const { enrichFish } = await import('../scripts/lib/open-data');
	const fish: FishFile = { names: { scientific: 'Lates calcarifer' }, taxonomy: { family: 'Latidae' }, sources: ['https://example.com/research'] };
	const fetcher = async (input: string | URL | Request) => {
		const url = String(input);
		if (url.includes('/match?')) return Response.json({ usageKey: 1, matchType: 'EXACT', status: 'ACCEPTED', species: 'Lates calcarifer' });
		if (url.includes('/search?')) return Response.json({ facets: [] });
		return Response.json({ results: { bindings: [{ item: { value: 'http://www.wikidata.org/entity/Q1' }, statusLabel: { value: 'least concern' } }] } });
	};
	const out = await enrichFish(fish, fetcher, () => {});
	expect(out?.sources).toEqual(['https://example.com/research', 'https://www.gbif.org/species/1', 'https://www.wikidata.org/wiki/Q1']);
	expect(fish.sources).toEqual(['https://example.com/research']);
});

it('keeps successful GBIF states when Wikidata fails, with stable reruns', async () => {
	const { enrichFish } = await import('../scripts/lib/open-data');
	const fish: FishFile = { names: { scientific: 'Lates calcarifer' }, taxonomy: { family: 'Latidae', wikidata: 'Q74411' }, iucn: 'LC', malaysia: { status: 'native' } };
	const fetcher = async (input: string | URL | Request, init?: RequestInit) => {
		expect(init?.headers).toMatchObject({ 'User-Agent': 'wtfish-data-import/0.1' });
		const url = String(input);
		if (url.includes('/match?')) return Response.json({ usageKey: 1, matchType: 'EXACT', status: 'ACCEPTED', species: 'Lates calcarifer' });
		if (url.includes('/search?')) return Response.json({ facets: [{ field: 'STATE_PROVINCE', counts: [{ name: 'Johore', count: 2 }, { name: 'Johor', count: 1 }] }] });
		throw new Error('network unavailable');
	};
	const out = await enrichFish(fish, fetcher, () => {});
	expect(out?.malaysia?.states).toEqual([{ state: 'Johor', records: 3 }]);
	expect(out?.iucn).toBe('LC');
	expect(out?.taxonomy.wikidata).toBe('Q74411');
	expect(await enrichFish(out!, fetcher, () => {})).toEqual(out);
});
