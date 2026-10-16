import { describe, expect, it } from 'vitest';
import {
	CATEGORIES,
	CATEGORY_GROUPS,
	GROUPS,
	INTRODUCED_PATH,
	THREATENED_PATH,
	categoriesWithFish,
	fishIn,
	groupLinks,
	habitatPath,
	iucnPath,
	statePath,
	statusPath,
	usePath,
	waterPath,
	type CategoryGroup,
} from '../src/lib/categories';
import { ENVIRONMENTS, STATES, USES, WATER, type Fish } from '../src/lib/fish-schema';

/** A fish entry shaped like a content collection entry, with only the fields a test needs. */
function entry(english: string, extra: Partial<Fish> = {}): { id: string; data: Fish } {
	return {
		id: english.toLowerCase().replaceAll(' ', '-'),
		data: {
			names: { english, scientific: 'Genus species' },
			taxonomy: { family: 'Family' },
			water: ['freshwater'],
			uses: ['food'],
			summary: 'A fish.',
			...extra,
		},
	};
}

const at = (path: string) => CATEGORIES.find((category) => category.path === path)!;
const ids = (entries: { id: string }[]) => entries.map((e) => e.id);
const pathsIn = (group: CategoryGroup) => CATEGORIES.filter((c) => c.group === group).map((c) => c.path);

describe('category list', () => {
	it('has a page for every water type, use, habitat and state, plus two conservation pages', () => {
		expect(pathsIn('water')).toEqual(WATER.map(waterPath));
		expect(pathsIn('use')).toEqual(USES.map(usePath));
		expect(pathsIn('habitat')).toEqual(ENVIRONMENTS.map(habitatPath));
		expect(pathsIn('state')).toEqual(STATES.map(statePath));
		expect(pathsIn('conservation')).toEqual([THREATENED_PATH, INTRODUCED_PATH]);
		expect(CATEGORIES).toHaveLength(35);
	});

	it('lists the groups in order, each with a label and a heading', () => {
		expect(CATEGORY_GROUPS).toEqual(['water', 'use', 'habitat', 'state', 'conservation']);
		expect([...new Set(CATEGORIES.map((c) => c.group))]).toEqual([...CATEGORY_GROUPS]);
		expect(GROUPS.habitat).toEqual({ label: 'Habitat', heading: 'Habitats' });
		expect(GROUPS.state.note).toBe(
			'Based on open-licence records on GBIF. Few records can mean few surveys, not few fish.',
		);
	});

	it.each(CATEGORIES)('$path has a name, a title and a short description', ({ name, title, description }) => {
		expect(name.trim()).not.toBe('');
		expect(title.trim()).not.toBe('');
		// Short enough for Google to show in full under the link.
		expect(description.length).toBeGreaterThanOrEqual(40);
		expect(description.length).toBeLessThanOrEqual(160);
		expect(description).toMatch(/\.$/);
	});

	it('never repeats an address, title or description', () => {
		for (const field of ['path', 'title', 'description'] as const) {
			const values = CATEGORIES.map((c) => c[field]);
			expect(new Set(values).size, field).toBe(values.length);
		}
	});

	it('keeps addresses lower-case and clear of the other pages', () => {
		for (const { path } of CATEGORIES) {
			expect(path).toMatch(/^\/[a-z0-9-]+(\/[a-z0-9-]+)*\/$/);
			expect(path).not.toMatch(/^\/(fish|identify|about|browse)\//);
		}
	});
});

describe('addresses and titles', () => {
	it('names each address in plain words', () => {
		expect(waterPath('marine')).toBe('/water/saltwater/');
		expect(usePath('sport')).toBe('/use/sport/');
		expect(habitatPath('mangrove')).toBe('/habitat/mangroves/');
		expect(habitatPath('rice-field')).toBe('/habitat/rice-fields/');
		expect(habitatPath('offshore')).toBe('/habitat/open-ocean/');
		expect(statePath('Sabah')).toBe('/malaysia/sabah/');
		expect(statePath('Negeri Sembilan')).toBe('/malaysia/negeri-sembilan/');
		expect(THREATENED_PATH).toBe('/threatened/');
		expect(INTRODUCED_PATH).toBe('/malaysia/invasive/');
	});

	it('titles each page after its category', () => {
		expect(at('/water/saltwater/').title).toBe('Saltwater fish');
		expect(at('/use/sport/').title).toBe('Sport fish');
		expect(at('/habitat/mangroves/').title).toBe('Mangrove fish');
		expect(at('/malaysia/kuala-lumpur/').title).toBe('Fish in Kuala Lumpur');
		expect(at(THREATENED_PATH).title).toBe('Threatened fish');
		expect(at(INTRODUCED_PATH).title).toBe('Introduced and invasive fish in Malaysia');
	});

	it('names each page as its tag reads on fish pages', () => {
		expect(at('/water/saltwater/').name).toBe('Saltwater');
		expect(at('/use/sport/').name).toBe('Sport fishing');
		expect(at('/habitat/open-ocean/').name).toBe('Open ocean');
		expect(at('/malaysia/pulau-pinang/').name).toBe('Pulau Pinang');
	});

	it('links a status or IUCN badge only when it has a page', () => {
		expect(statusPath('introduced')).toBe(INTRODUCED_PATH);
		expect(statusPath('invasive')).toBe(INTRODUCED_PATH);
		expect(statusPath('native')).toBeUndefined();
		expect(statusPath('endemic')).toBeUndefined();
		for (const iucn of ['VU', 'EN', 'CR'] as const) expect(iucnPath(iucn), iucn).toBe(THREATENED_PATH);
		for (const iucn of ['LC', 'NT', 'EW', 'EX', 'DD', 'NE'] as const) expect(iucnPath(iucn), iucn).toBeUndefined();
	});
});

describe('fishIn', () => {
	it('lists the fish on a page A–Z by English name', () => {
		const fish = [entry('Tinfoil barb'), entry('Atlantic salmon', { water: ['marine'] }), entry('Giant gourami')];
		expect(ids(fishIn(at('/water/freshwater/'), fish))).toEqual(['giant-gourami', 'tinfoil-barb']);
	});

	it('puts a fish on every page it belongs to', () => {
		const barramundi = entry('Barramundi', {
			water: ['freshwater', 'brackish', 'marine'],
			uses: ['sport', 'food'],
			habitat: { environments: ['mangrove', 'estuary'] },
		});
		const pages = CATEGORIES.filter((category) => fishIn(category, [barramundi]).length > 0).map((c) => c.path);
		expect(pages).toEqual([
			'/water/freshwater/',
			'/water/brackish/',
			'/water/saltwater/',
			'/use/sport/',
			'/use/food/',
			'/habitat/mangroves/',
			'/habitat/estuaries/',
		]);
	});

	it('lists a fish on a state page only when it is recorded there', () => {
		const pomfret = entry('Black pomfret', { malaysia: { status: 'native', states: [{ state: 'Perlis', records: 2 }] } });
		const fish = [pomfret, entry('Guppy')];
		expect(ids(fishIn(at('/malaysia/perlis/'), fish))).toEqual(['black-pomfret']);
		expect(fishIn(at('/malaysia/sabah/'), fish)).toEqual([]);
	});

	it('lists only Vulnerable, Endangered and Critically Endangered fish as threatened', () => {
		const fish = (['LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'EX', 'DD', 'NE'] as const).map((iucn) =>
			entry(`Fish ${iucn}`, { iucn }),
		);
		expect(ids(fishIn(at(THREATENED_PATH), [...fish, entry('Unrated')]))).toEqual(['fish-cr', 'fish-en', 'fish-vu']);
	});

	it('lists introduced and invasive fish, not native or endemic ones', () => {
		const fish = (['native', 'endemic', 'introduced', 'invasive'] as const).map((status) =>
			entry(`Fish ${status}`, { malaysia: { status } }),
		);
		expect(ids(fishIn(at(INTRODUCED_PATH), [...fish, entry('Not in Malaysia')]))).toEqual([
			'fish-introduced',
			'fish-invasive',
		]);
	});
});

describe('categoriesWithFish', () => {
	it('leaves out pages with no fish, keeping the order', () => {
		const snakehead = entry('Striped snakehead', {
			uses: ['sport', 'food'],
			malaysia: { status: 'native', states: [{ state: 'Kuala Lumpur', records: 1 }] },
		});
		expect(categoriesWithFish([snakehead]).map((c) => c.path)).toEqual([
			'/water/freshwater/',
			'/use/sport/',
			'/use/food/',
			'/malaysia/kuala-lumpur/',
		]);
	});
});

describe('groupLinks', () => {
	it("links each page in a group that has fish, with its count", () => {
		const fish = [entry('Guppy', { uses: ['aquarium'] }), entry('Giant gourami', { uses: ['food', 'aquarium'] })];
		expect(groupLinks('use', fish)).toEqual([
			{ path: '/use/food/', name: 'Food', count: 1 },
			{ path: '/use/aquarium/', name: 'Aquarium', count: 2 },
		]);
	});
});
