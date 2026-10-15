import { describe, expect, it } from 'vitest';
import { fishSchema } from '../src/lib/fish-schema';

const minimal = {
	names: { english: 'Giant snakehead', scientific: 'Channa micropeltes' },
	taxonomy: { family: 'Channidae' },
	water: ['freshwater'],
	uses: ['sport', 'food'],
	summary: 'Large predatory snakehead of Southeast Asian rivers and lakes.',
};

const full = {
	...minimal,
	names: { ...minimal.names, malay: 'Toman', other: ['Red snakehead'] },
	taxonomy: { family: 'Channidae', order: 'Anabantiformes', gbifKey: 2394493, wikidata: 'Q628790' },
	nativeRange: 'Mainland Southeast Asia, the Malay Peninsula, Sumatra and Borneo.',
	iucn: 'LC',
	size: { maxCm: 130, commonCm: 60, maxKg: 20 },
	identify: {
		features: ['Long, rounded body', 'Large mouth with sharp teeth'],
		lookAlikes: [{ id: 'striped-snakehead', difference: 'Haruan stays much smaller.' }],
	},
	habitat: {
		environments: ['reservoir', 'lowland-river'],
		description: 'Still and slow water with plenty of cover.',
		diet: 'Fish, frogs and other small animals.',
	},
	malaysia: {
		status: 'native',
		states: [{ state: 'Perak', records: 5 }],
		spots: ['Tasik Temenggor'],
		rules: 'No special protection.',
	},
	fishing: { season: 'Year-round.', methods: ['casting'], baits: ['Frog lures'], difficulty: 'moderate' },
	eating: 'Eaten fried or in soup.',
	aquarium: { minTankLitres: 1000, tempC: [24, 28], ph: [6, 7.5], temperament: 'aggressive', groupSize: 1 },
	photos: [{ file: 'inat-1.jpg', credit: '(c) A Person', license: 'CC BY', url: 'https://www.inaturalist.org/photos/1' }],
	sources: ['https://www.gbif.org/species/2394493'],
	lastReviewed: '2026-10-13',
};

function errorPaths(data: unknown): string[] {
	const result = fishSchema.safeParse(data);
	return result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'));
}

describe('fishSchema', () => {
	it('accepts an IUCN note next to a category', () => {
		expect(errorPaths({ ...minimal, iucn: 'EX', iucnNote: 'It has since been rediscovered.' })).toEqual([]);
	});

	it('rejects an IUCN note without a category', () => {
		expect(errorPaths({ ...minimal, iucnNote: 'It has since been rediscovered.' })).toContain('iucnNote');
	});

	it('accepts Malay variants in names.malayOther', () => {
		expect(errorPaths({ ...minimal, names: { ...minimal.names, malayOther: ['Toman'] } })).toEqual([]);
	});

	it('rejects blank Malay variants', () => {
		expect(errorPaths({ ...minimal, names: { ...minimal.names, malayOther: [' '] } })).toContain('names.malayOther.0');
	});

	it('accepts a fish with only the required fields', () => {
		expect(errorPaths(minimal)).toEqual([]);
	});

	it('accepts a fully filled fish', () => {
		expect(errorPaths(full)).toEqual([]);
	});

	it.each(['names', 'taxonomy', 'water', 'uses', 'summary'])('requires %s', (key) => {
		const { [key]: _removed, ...rest } = minimal as Record<string, unknown>;
		expect(errorPaths(rest)).toContain(key);
	});

	it('rejects unknown keys so typos fail', () => {
		expect(fishSchema.safeParse({ ...minimal, watter: ['marine'] }).success).toBe(false);
	});

	it('rejects the old water value "saltwater"', () => {
		expect(errorPaths({ ...minimal, water: ['saltwater'] })).toContain('water.0');
	});

	it('rejects an empty water list', () => {
		expect(errorPaths({ ...minimal, water: [] })).toContain('water');
	});

	it('rejects blank text', () => {
		expect(errorPaths({ ...minimal, summary: '   ' })).toContain('summary');
	});

	it('requires sources once lastReviewed is set', () => {
		expect(errorPaths({ ...minimal, lastReviewed: '2026-10-13' })).toContain('sources');
	});

	it('rejects impossible dates', () => {
		expect(errorPaths({ ...full, lastReviewed: '2026-13-01' })).toContain('lastReviewed');
	});

	it('rejects a reversed temperature range', () => {
		expect(errorPaths({ ...full, aquarium: { ...full.aquarium, tempC: [28, 24] } })).toContain('aquarium.tempC');
	});

	it('rejects non-commercial photo licences', () => {
		const photos = [{ ...full.photos[0], license: 'CC BY-NC' }];
		expect(errorPaths({ ...full, photos })).toContain('photos.0.license');
	});

	it('rejects state names outside the official list', () => {
		const malaysia = { ...full.malaysia, states: [{ state: 'Penang', records: 1 }] };
		expect(errorPaths({ ...full, malaysia })).toContain('malaysia.states.0.state');
	});

	it('rejects non-web source links', () => {
		expect(errorPaths({ ...full, sources: ['ftp://example.com/x'] })).toContain('sources.0');
	});
});
