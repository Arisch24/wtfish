# Malaysia Fish Profiles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the 27 thin fish entries into rich, sourced profiles and add 42 Malaysian fish, with search and filters built for Malaysian users.

**Architecture:** One JSON file per fish in `apps/web/data/fish/`, validated by a zod schema shared by the Astro content collection, the tests and the data scripts. Two Node scripts fill machine-derivable fields (GBIF + Wikidata taxonomy, IUCN category, Malaysian states) and download openly-licensed iNaturalist photos; everything else is researched by hand in batches. Pages hide any section a fish has no data for.

**Tech Stack:** Astro 7.3 (content layer, `glob()` loader), `astro/zod` (zod 4.6), Vitest 5.0.2, Node 22.23 (runs `.ts` scripts directly via built-in type stripping), pnpm 12.

**Spec:** `docs/superpowers/specs/2026-10-13-malaysia-fish-profiles-design.md`

## Execution record

Implemented on the existing stacked feature branch. Verification was
consolidated after all research batches: 364 tests, 70 pages, and a browser
audit of all 69 profiles. See
`docs/research/2026-10-13-implementation-verification.md` for evidence,
source-backed taxonomy corrections, skipped imports and deliberately
unfilled optional fields. The commits consolidate the work into a buildable
feature rather than preserving intermediate batch states.

## Global Constraints

- All paths are relative to `apps/web/` unless they start with `docs/` or say "repo root".
- Package manager is pnpm — never npm or yarn. The only new dependency is `vitest@5.0.2` (exact, dev).
- Work on branch `feat/malaysia-fish-profiles`. It is stacked on `refactor/fish-per-file` (which is not yet in `main`), so merging it into `main` brings both. Never merge, rebase or push without the user's approval.
- Commit messages follow Conventional Commits (husky + commitlint enforce it). Never use `--no-verify`.
- Every source must allow commercial use. Never copy from FishBase (CC BY-NC) and never call the IUCN Red List API.
- Scripts send `User-Agent: wtfish-data-import/0.1` and no personal data (no email addresses).
- Required fish fields are exactly: `names.english`, `names.scientific`, `taxonomy.family`, `water`, `uses`, `summary`.
- Fish ids (filenames) come from the English name in lowercase kebab-case; fall back to the scientific name when there is no English name or two fish would share one.
- Page text is English; Malay names appear as data, not UI translation.
- `.astro` files use tabs (match the existing files).

## Review Focus

- **A fish with only the six required fields** (all 27 existing fish after migration) must render with no empty headings, no "undefined" text, and a "Not yet fact-checked" label — pinned in Task 2 Step 9.
- **Searching by Malay name, in any letter case, with extra spaces or words out of order** must find the fish — pinned in Task 1 `tests/filter.test.ts`.
- **A scientific name GBIF treats as a synonym, or doesn't match exactly,** must not write any taxonomy or states — pinned in Task 3 `matchVerdict` tests and the script's skip path.
- **Re-running the import** must never overwrite hand-written fields, and a failed lookup must not erase previously imported data — pinned in Task 3 `mergeGenerated` tests.
- **Non-commercial photos (CC BY-NC etc.) and photos of a different species** must never be saved — pinned in Task 4 `photos` tests and the schema's licence enum (Task 1).

---

### Task 1: Test runner, fish schema and page helpers

**Files:**
- Modify: `package.json` (devDependency + `test` script)
- Create: `src/lib/fish-schema.ts`
- Create: `src/lib/format.ts`
- Create: `src/lib/labels.ts`
- Create: `src/lib/filter.ts`
- Test: `tests/fish-schema.test.ts`, `tests/format.test.ts`, `tests/filter.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `src/lib/fish-schema.ts`: `fishSchema` (zod schema), `type Fish`, constant arrays `WATER`, `USES`, `MALAYSIA_STATUS`, `ENVIRONMENTS`, `IUCN`, `METHODS`, `DIFFICULTY`, `TEMPERAMENT`, `PHOTO_LICENSES`, `STATES`, and their element types `Water`, `Use`, `MalaysiaStatus`, `Environment`, `Iucn`, `Method`, `Difficulty`, `Temperament`, `PhotoLicense`, `State`.
  - `src/lib/format.ts`: `listOf(items: string[]): string`, `formatSize(size: { maxCm: number; commonCm?: number; maxKg?: number }): string`, `formatRange(range: [number, number], unit: string): string`, `formatDate(iso: string): string`.
  - `src/lib/labels.ts`: `WATER_LABEL`, `USE_LABEL`, `STATUS_LABEL`, `ENVIRONMENT_LABEL`, `IUCN_LABEL`, `METHOD_LABEL`, `DIFFICULTY_LABEL`, `TEMPERAMENT_LABEL` — each `Record<ThatType, string>`.
  - `src/lib/filter.ts`: `interface FilterItem { search: string; water: string[]; uses: string[]; states: string[]; status: string; iucn: string }`, `interface FilterQuery { text: string; water: string; use: string; state: string; status: string; threatened: boolean }`, `searchText(names): string`, `matches(item: FilterItem, query: FilterQuery): boolean`, `THREATENED`.

- [ ] **Step 0: Switch to the feature branch**

The branch already exists and already contains this plan and its spec. Run from the repo root:

```bash
git switch feat/malaysia-fish-profiles
git status --short
git log --oneline -3
cd apps/web
```

Expected: no modified tracked files (an untracked `.impeccable/` is fine); the log shows the `docs: add malaysia fish profiles design and plan` commit on top of `1e6e98f refactor(web): store each fish in its own JSON file`. If `1e6e98f` is missing, stop and ask the user.

All later commands run from `apps/web/`.

- [ ] **Step 1: Install Vitest and add the test script**

```bash
pnpm add -D -E vitest@5.0.2
pnpm pkg set scripts.test="vitest run"
```

Expected: `package.json` has `"vitest": "5.0.2"` under `devDependencies` and `"test": "vitest run"` under `scripts`.

- [ ] **Step 2: Write the failing schema tests**

Create `tests/fish-schema.test.ts`:

```ts
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
```

- [ ] **Step 3: Run the schema tests to see them fail**

Run: `pnpm test tests/fish-schema.test.ts`
Expected: FAIL — `Failed to resolve import "../src/lib/fish-schema"`.

- [ ] **Step 4: Write the schema**

Create `src/lib/fish-schema.ts`:

```ts
import { z } from 'astro/zod';

export const WATER = ['freshwater', 'brackish', 'marine'] as const;
export const USES = ['sport', 'food', 'aquarium'] as const;
export const MALAYSIA_STATUS = ['native', 'endemic', 'introduced', 'invasive'] as const;
export const ENVIRONMENTS = [
	'forest-river',
	'lowland-river',
	'lake',
	'reservoir',
	'peat-swamp',
	'rice-field',
	'mangrove',
	'estuary',
	'coastal',
	'reef',
	'offshore',
] as const;
export const IUCN = ['LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'EX', 'DD', 'NE'] as const;
export const METHODS = ['casting', 'jigging', 'trolling', 'fly', 'bottom-bait', 'popping', 'float'] as const;
export const DIFFICULTY = ['easy', 'moderate', 'hard'] as const;
export const TEMPERAMENT = ['peaceful', 'semi-aggressive', 'aggressive'] as const;
export const PHOTO_LICENSES = ['CC0', 'CC BY', 'CC BY-SA'] as const;
export const STATES = [
	'Johor',
	'Kedah',
	'Kelantan',
	'Melaka',
	'Negeri Sembilan',
	'Pahang',
	'Perak',
	'Perlis',
	'Pulau Pinang',
	'Sabah',
	'Sarawak',
	'Selangor',
	'Terengganu',
	'Kuala Lumpur',
	'Labuan',
	'Putrajaya',
] as const;

export type Water = (typeof WATER)[number];
export type Use = (typeof USES)[number];
export type MalaysiaStatus = (typeof MALAYSIA_STATUS)[number];
export type Environment = (typeof ENVIRONMENTS)[number];
export type Iucn = (typeof IUCN)[number];
export type Method = (typeof METHODS)[number];
export type Difficulty = (typeof DIFFICULTY)[number];
export type Temperament = (typeof TEMPERAMENT)[number];
export type PhotoLicense = (typeof PHOTO_LICENSES)[number];
export type State = (typeof STATES)[number];

const text = z.string().trim().min(1);
const webUrl = z.url({ protocol: /^https?$/ });
const range = z
	.tuple([z.number(), z.number()])
	.refine(([low, high]) => low <= high, 'range must be [low, high]');

export const fishSchema = z
	.strictObject({
		names: z.strictObject({
			english: text,
			scientific: text,
			malay: text.optional(),
			other: z.array(text).optional(),
		}),
		taxonomy: z.strictObject({
			family: text,
			order: text.optional(),
			gbifKey: z.number().int().positive().optional(),
			wikidata: z.string().regex(/^Q\d+$/).optional(),
		}),
		water: z.array(z.enum(WATER)).min(1),
		uses: z.array(z.enum(USES)).min(1),
		summary: text,
		nativeRange: text.optional(),
		iucn: z.enum(IUCN).optional(),
		size: z
			.strictObject({
				maxCm: z.number().positive(),
				commonCm: z.number().positive().optional(),
				maxKg: z.number().positive().optional(),
			})
			.optional(),
		identify: z
			.strictObject({
				features: z.array(text).min(1),
				lookAlikes: z.array(z.strictObject({ id: text, difference: text })).optional(),
			})
			.optional(),
		habitat: z
			.strictObject({
				environments: z.array(z.enum(ENVIRONMENTS)).min(1),
				description: text.optional(),
				diet: text.optional(),
			})
			.optional(),
		malaysia: z
			.strictObject({
				status: z.enum(MALAYSIA_STATUS),
				states: z
					.array(z.strictObject({ state: z.enum(STATES), records: z.number().int().positive() }))
					.optional(),
				spots: z.array(text).optional(),
				rules: text.optional(),
			})
			.optional(),
		fishing: z
			.strictObject({
				season: text.optional(),
				methods: z.array(z.enum(METHODS)).optional(),
				baits: z.array(text).optional(),
				difficulty: z.enum(DIFFICULTY).optional(),
			})
			.optional(),
		eating: text.optional(),
		aquarium: z
			.strictObject({
				minTankLitres: z.number().positive(),
				tempC: range,
				ph: range,
				temperament: z.enum(TEMPERAMENT),
				groupSize: z.number().int().positive().optional(),
			})
			.optional(),
		photos: z
			.array(
				z.strictObject({
					file: z.string().regex(/^[a-z0-9-]+\.(jpg|jpeg|png|webp)$/),
					credit: text,
					license: z.enum(PHOTO_LICENSES),
					url: webUrl,
				}),
			)
			.optional(),
		sources: z.array(webUrl).optional(),
		lastReviewed: z.iso.date().optional(),
	})
	.refine((fish) => !fish.lastReviewed || (fish.sources?.length ?? 0) > 0, {
		message: 'a reviewed fish (lastReviewed set) must list at least one source',
		path: ['sources'],
	});

export type Fish = z.infer<typeof fishSchema>;
```

- [ ] **Step 5: Run the schema tests to see them pass**

Run: `pnpm test tests/fish-schema.test.ts`
Expected: PASS, 17 tests.

- [ ] **Step 6: Write the failing format and filter tests**

Create `tests/format.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { formatDate, formatRange, formatSize, listOf } from '../src/lib/format';

describe('listOf', () => {
	it('returns a single item unchanged', () => {
		expect(listOf(['Freshwater'])).toBe('Freshwater');
	});

	it('joins two items with "and"', () => {
		expect(listOf(['Sport fishing', 'Food'])).toBe('Sport fishing and Food');
	});

	it('joins three items with commas and "and"', () => {
		expect(listOf(['Freshwater', 'Brackish', 'Saltwater'])).toBe('Freshwater, Brackish, and Saltwater');
	});
});

describe('formatSize', () => {
	it('shows only the maximum length', () => {
		expect(formatSize({ maxCm: 100 })).toBe('Up to 100 cm');
	});

	it('adds the maximum weight', () => {
		expect(formatSize({ maxCm: 100, maxKg: 20 })).toBe('Up to 100 cm and 20 kg');
	});

	it('leads with the common length', () => {
		expect(formatSize({ maxCm: 100, commonCm: 50, maxKg: 20 })).toBe('Usually 50 cm; up to 100 cm and 20 kg');
	});
});

describe('formatRange', () => {
	it('shows a range with a unit', () => {
		expect(formatRange([24, 28], '°C')).toBe('24–28°C');
	});

	it('collapses equal ends', () => {
		expect(formatRange([7, 7], '')).toBe('7');
	});
});

describe('formatDate', () => {
	it('formats an ISO date in British style', () => {
		expect(formatDate('2026-10-13')).toBe('13 October 2026');
	});
});
```

Create `tests/filter.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { matches, searchText, type FilterItem, type FilterQuery } from '../src/lib/filter';

const toman: FilterItem = {
	search: searchText({
		english: 'Giant snakehead',
		scientific: 'Channa micropeltes',
		malay: 'Toman',
		other: ['Red snakehead'],
	}),
	water: ['freshwater'],
	uses: ['sport', 'food'],
	states: ['Perak', 'Negeri Sembilan'],
	status: 'native',
	iucn: 'LC',
};

const temoleh: FilterItem = {
	search: searchText({ english: "Jullien's golden carp", scientific: 'Probarbus jullieni', malay: 'Temoleh' }),
	water: ['freshwater'],
	uses: ['food'],
	states: ['Pahang'],
	status: 'native',
	iucn: 'CR',
};

const goldfish: FilterItem = {
	search: searchText({ english: 'Goldfish', scientific: 'Carassius auratus' }),
	water: ['freshwater'],
	uses: ['aquarium'],
	states: [],
	status: '',
	iucn: '',
};

const any: FilterQuery = { text: '', water: '', use: '', state: '', status: '', threatened: false };

describe('matches', () => {
	it('matches everything with an empty query', () => {
		expect([toman, temoleh, goldfish].every((fish) => matches(fish, any))).toBe(true);
	});

	it('finds a fish by its Malay name in any case', () => {
		expect(matches(toman, { ...any, text: 'TOMAN' })).toBe(true);
		expect(matches(goldfish, { ...any, text: 'TOMAN' })).toBe(false);
	});

	it('finds a fish by other names', () => {
		expect(matches(toman, { ...any, text: 'red snake' })).toBe(true);
	});

	it('ignores extra spaces and word order', () => {
		expect(matches(toman, { ...any, text: '  micropeltes   channa ' })).toBe(true);
	});

	it('requires every word to match', () => {
		expect(matches(toman, { ...any, text: 'toman goldfish' })).toBe(false);
	});

	it('filters by use', () => {
		expect(matches(goldfish, { ...any, use: 'aquarium' })).toBe(true);
		expect(matches(toman, { ...any, use: 'aquarium' })).toBe(false);
	});

	it('filters by water', () => {
		expect(matches(toman, { ...any, water: 'marine' })).toBe(false);
	});

	it('filters by state, including names with spaces', () => {
		expect(matches(toman, { ...any, state: 'Negeri Sembilan' })).toBe(true);
		expect(matches(temoleh, { ...any, state: 'Negeri Sembilan' })).toBe(false);
	});

	it('"any" status keeps only fish found in Malaysia', () => {
		expect(matches(toman, { ...any, status: 'any' })).toBe(true);
		expect(matches(goldfish, { ...any, status: 'any' })).toBe(false);
	});

	it('filters by an exact status', () => {
		expect(matches(toman, { ...any, status: 'introduced' })).toBe(false);
	});

	it('"threatened" keeps only VU, EN and CR fish', () => {
		expect(matches(temoleh, { ...any, threatened: true })).toBe(true);
		expect(matches(toman, { ...any, threatened: true })).toBe(false);
		expect(matches(goldfish, { ...any, threatened: true })).toBe(false);
	});
});
```

- [ ] **Step 7: Run them to see them fail**

Run: `pnpm test tests/format.test.ts tests/filter.test.ts`
Expected: FAIL — `Failed to resolve import "../src/lib/format"` and `"../src/lib/filter"`.

- [ ] **Step 8: Write the helpers**

Create `src/lib/format.ts`:

```ts
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
```

Create `src/lib/filter.ts`:

```ts
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
```

Create `src/lib/labels.ts`:

```ts
import type { Difficulty, Environment, Iucn, MalaysiaStatus, Method, Temperament, Use, Water } from './fish-schema';

export const WATER_LABEL: Record<Water, string> = {
	freshwater: 'Freshwater',
	brackish: 'Brackish',
	marine: 'Saltwater',
};

export const USE_LABEL: Record<Use, string> = {
	sport: 'Sport fishing',
	food: 'Food',
	aquarium: 'Aquarium',
};

export const STATUS_LABEL: Record<MalaysiaStatus, string> = {
	native: 'Native',
	endemic: 'Endemic (found only in Malaysia)',
	introduced: 'Introduced',
	invasive: 'Invasive (introduced and spreading)',
};

export const ENVIRONMENT_LABEL: Record<Environment, string> = {
	'forest-river': 'Forest rivers',
	'lowland-river': 'Lowland rivers',
	lake: 'Lakes',
	reservoir: 'Reservoirs',
	'peat-swamp': 'Peat swamps',
	'rice-field': 'Rice fields and canals',
	mangrove: 'Mangroves',
	estuary: 'Estuaries',
	coastal: 'Coastal waters',
	reef: 'Reefs',
	offshore: 'Open ocean',
};

export const IUCN_LABEL: Record<Iucn, string> = {
	LC: 'Least Concern',
	NT: 'Near Threatened',
	VU: 'Vulnerable',
	EN: 'Endangered',
	CR: 'Critically Endangered',
	EW: 'Extinct in the Wild',
	EX: 'Extinct',
	DD: 'Data Deficient',
	NE: 'Not Evaluated',
};

export const METHOD_LABEL: Record<Method, string> = {
	casting: 'Lure casting',
	jigging: 'Jigging',
	trolling: 'Trolling',
	fly: 'Fly fishing',
	'bottom-bait': 'Bottom bait',
	popping: 'Popping',
	float: 'Float fishing',
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
	easy: 'Easy',
	moderate: 'Moderate',
	hard: 'Hard',
};

export const TEMPERAMENT_LABEL: Record<Temperament, string> = {
	peaceful: 'Peaceful',
	'semi-aggressive': 'Semi-aggressive',
	aggressive: 'Aggressive',
};
```

- [ ] **Step 9: Run all tests to see them pass**

Run: `pnpm test`
Expected: PASS — 3 files, 37 tests.

- [ ] **Step 10: Confirm the site still builds**

Run: `pnpm build`
Expected: `28 page(s) built` (nothing uses the new modules yet).

- [ ] **Step 11: Commit**

```bash
git add package.json pnpm-lock.yaml src/lib tests
git commit -m "feat(web): add fish data schema and page helpers"
```

---

### Task 2: Move the site onto the new schema

**Files:**
- Modify: `data/fish/*.json` (all 27, via a one-off migration)
- Modify: `data/fish/README.md`
- Modify: `src/content.config.ts`
- Modify: `src/pages/index.astro` (full rewrite)
- Modify: `src/pages/fish/[id].astro` (full rewrite)
- Test: `tests/data.test.ts`

**Interfaces:**
- Consumes: everything Task 1 produces.
- Produces: the `fish` content collection typed by `fishSchema`; photo URLs `/photos/<fish-id>/<file>`; the research rules in `data/fish/README.md` that Tasks 5–11 follow.

- [ ] **Step 1: Write the failing data tests**

Create `tests/data.test.ts`:

```ts
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { z } from 'astro/zod';
import { describe, expect, it } from 'vitest';
import { fishSchema } from '../src/lib/fish-schema';

const dataDir = new URL('../data/fish/', import.meta.url);
const fish = readdirSync(dataDir)
	.filter((file) => file.endsWith('.json'))
	.map((file) => ({
		id: file.slice(0, -'.json'.length),
		raw: JSON.parse(readFileSync(new URL(file, dataDir), 'utf8')),
	}));
const ids = new Set(fish.map((f) => f.id));

describe('fish data files', () => {
	it('contains fish', () => {
		expect(fish.length).toBeGreaterThan(0);
	});

	it.each(fish)('$id passes the schema', ({ raw }) => {
		const result = fishSchema.safeParse(raw);
		expect(result.success, result.success ? '' : z.prettifyError(result.error)).toBe(true);
	});

	it.each(fish)('$id has a lowercase kebab-case filename', ({ id }) => {
		expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
	});

	it.each(fish)('$id look-alikes point at other fish that exist', ({ id, raw }) => {
		for (const lookAlike of raw.identify?.lookAlikes ?? []) {
			expect(ids.has(lookAlike.id), `"${lookAlike.id}" has no data file`).toBe(true);
			expect(lookAlike.id).not.toBe(id);
		}
	});

	it.each(fish)('$id photos exist on disk', ({ id, raw }) => {
		for (const photo of raw.photos ?? []) {
			const path = new URL(`../public/photos/${id}/${photo.file}`, import.meta.url);
			expect(existsSync(path), `missing public/photos/${id}/${photo.file}`).toBe(true);
		}
	});

	it('no two fish share a scientific name', () => {
		const seen = new Map<string, string>();
		for (const { id, raw } of fish) {
			const key = String(raw.names?.scientific).toLowerCase();
			expect(seen.get(key), `${id} has the same scientific name as ${seen.get(key)}`).toBeUndefined();
			seen.set(key, id);
		}
	});
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm test tests/data.test.ts`
Expected: FAIL — 27 "passes the schema" failures, e.g. `✖ Unrecognized keys: "commonName", "scientificName", …`.

- [ ] **Step 3: Migrate the 27 files (one-off, not committed as a script)**

```bash
node -e '
const fs = require("fs");
const dir = "data/fish";
const WATER = { freshwater: ["freshwater"], saltwater: ["marine"], brackish: ["brackish"] };
const MIGRATORY = { "atlantic-salmon": ["freshwater", "marine"], barramundi: ["freshwater", "brackish", "marine"] };
const USES = { game: ["sport"], aquarium: ["aquarium"] };
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
  const id = file.replace(/\.json$/, "");
  const old = JSON.parse(fs.readFileSync(`${dir}/${file}`, "utf8"));
  const water = old.water === "migratory" ? MIGRATORY[id] : WATER[old.water];
  if (!water || !USES[old.category]) throw new Error(`no mapping for ${id}`);
  const next = {
    names: { english: old.commonName, scientific: old.scientificName },
    taxonomy: { family: old.family },
    water,
    uses: USES[old.category],
    summary: old.summary,
    size: { maxCm: old.maxLengthCm },
  };
  fs.writeFileSync(`${dir}/${file}`, JSON.stringify(next, null, 2) + "\n");
}
console.log("migrated");
'
cat data/fish/barramundi.json
```

Expected: `migrated`, and `barramundi.json` is:

```json
{
  "names": {
    "english": "Barramundi",
    "scientific": "Lates calcarifer"
  },
  "taxonomy": {
    "family": "Latidae"
  },
  "water": [
    "freshwater",
    "brackish",
    "marine"
  ],
  "uses": [
    "sport"
  ],
  "summary": "Hard-fighting predator of the Indo-West Pacific that moves between rivers, estuaries and the sea. Most start life male and later become female.",
  "size": {
    "maxCm": 200
  }
}
```

No `sources` or `lastReviewed` — these entries were written from memory and must show "Not yet fact-checked" until a research batch reviews them.

- [ ] **Step 4: Run the data tests to see them pass**

Run: `pnpm test`
Expected: PASS — all files, including 27 × 4 data checks.

- [ ] **Step 5: Point the content collection at the shared schema**

Replace `src/content.config.ts` with:

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { fishSchema } from './lib/fish-schema';

const fish = defineCollection({
	loader: glob({ pattern: '*.json', base: './data/fish' }),
	schema: fishSchema,
});

export const collections = { fish };
```

- [ ] **Step 6: Rewrite the directory page**

Replace `src/pages/index.astro` with:

```astro
---
import { getCollection, type CollectionEntry } from 'astro:content';
import Base from '../layouts/Base.astro';
import { searchText, type FilterItem } from '../lib/filter';
import { STATES } from '../lib/fish-schema';
import { USE_LABEL, WATER_LABEL } from '../lib/labels';

const fish = (await getCollection('fish')).sort((a, b) =>
	a.data.names.english.localeCompare(b.data.names.english),
);

const recordedStates = STATES.filter((state) =>
	fish.some((f) => f.data.malaysia?.states?.some((s) => s.state === state)),
);

function filterItem(data: CollectionEntry<'fish'>['data']): FilterItem {
	return {
		search: searchText(data.names),
		water: data.water,
		uses: data.uses,
		states: data.malaysia?.states?.map((s) => s.state) ?? [],
		status: data.malaysia?.status ?? '',
		iucn: data.iucn ?? '',
	};
}
---

<Base title="wtfish: fish directory">
	<h1>Fish directory</h1>
	<form id="filters" class="filters">
		<input
			name="q"
			type="search"
			placeholder="Search English, Malay or scientific name…"
			aria-label="Search fish"
		/>
		<select name="water" aria-label="Water">
			<option value="">Any water</option>
			{Object.entries(WATER_LABEL).map(([value, label]) => <option value={value}>{label}</option>)}
		</select>
		<select name="use" aria-label="Use">
			<option value="">Any use</option>
			{Object.entries(USE_LABEL).map(([value, label]) => <option value={value}>{label}</option>)}
		</select>
		<select name="status" aria-label="Status in Malaysia">
			<option value="">Anywhere</option>
			<option value="any">Found in Malaysia</option>
			<option value="native">Native to Malaysia</option>
			<option value="endemic">Only in Malaysia (endemic)</option>
			<option value="introduced">Introduced to Malaysia</option>
			<option value="invasive">Invasive in Malaysia</option>
		</select>
		{
			recordedStates.length > 0 && (
				<select name="state" aria-label="Malaysian state">
					<option value="">Any state</option>
					{recordedStates.map((state) => (
						<option value={state}>{state}</option>
					))}
				</select>
			)
		}
		<label class="check"><input type="checkbox" name="threatened" /> Threatened only</label>
	</form>
	<p id="count" class="count" aria-live="polite">{fish.length} fish</p>
	<p id="empty" hidden>No fish match your search.</p>
	<ul class="grid">
		{
			fish.map(({ id, data }) => (
				<li data-filter={JSON.stringify(filterItem(data))}>
					<a href={`/fish/${id}/`}>
						<span class="name">{data.names.english}</span>
						{data.names.malay && <span class="malay">{data.names.malay}</span>}
						<span class="sci">{data.names.scientific}</span>
						<span class="tags">{data.water.map((w) => WATER_LABEL[w]).join(' · ')}</span>
					</a>
				</li>
			))
		}
	</ul>
</Base>

<script>
	import { matches, type FilterItem, type FilterQuery } from '../lib/filter';

	const form = document.querySelector<HTMLFormElement>('#filters')!;
	const count = document.querySelector<HTMLParagraphElement>('#count')!;
	const empty = document.querySelector<HTMLParagraphElement>('#empty')!;
	const cards = [...document.querySelectorAll<HTMLLIElement>('.grid li')].map((li) => ({
		li,
		item: JSON.parse(li.dataset.filter!) as FilterItem,
	}));

	function apply() {
		const data = new FormData(form);
		const value = (name: string) => String(data.get(name) ?? '');
		const query: FilterQuery = {
			text: value('q'),
			water: value('water'),
			use: value('use'),
			state: value('state'),
			status: value('status'),
			threatened: data.get('threatened') === 'on',
		};
		let shown = 0;
		for (const { li, item } of cards) {
			const ok = matches(item, query);
			li.hidden = !ok;
			if (ok) shown++;
		}
		count.textContent = `${shown} fish`;
		empty.hidden = shown > 0;
	}

	form.addEventListener('input', apply);
	form.addEventListener('submit', (event) => event.preventDefault());
	apply();
</script>

<style>
	.filters {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		align-items: center;
	}
	input[type='search'],
	select {
		font: inherit;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		background: var(--surface);
		color: var(--text);
	}
	input[type='search'] {
		flex: 1 1 100%;
	}
	.check {
		display: flex;
		gap: 0.375rem;
		align-items: center;
	}
	.count {
		color: var(--muted);
		margin: 0.75rem 0;
	}
	.grid {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
		gap: 0.75rem;
	}
	.grid li[hidden] {
		display: none;
	}
	.grid a {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		height: 100%;
		padding: 1rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 0.75rem;
		color: var(--text);
		text-decoration: none;
	}
	.grid a:hover {
		border-color: var(--accent);
	}
	.name {
		font-weight: 600;
	}
	.malay {
		color: var(--accent);
	}
	.sci {
		font-style: italic;
		color: var(--muted);
	}
	.tags {
		margin-top: 0.5rem;
		font-size: 0.85rem;
		color: var(--muted);
	}
</style>
```

- [ ] **Step 7: Rewrite the fish page**

Replace `src/pages/fish/[id].astro` with:

```astro
---
import { getCollection, type CollectionEntry } from 'astro:content';
import Base from '../../layouts/Base.astro';
import { formatDate, formatRange, formatSize, listOf } from '../../lib/format';
import {
	DIFFICULTY_LABEL,
	ENVIRONMENT_LABEL,
	IUCN_LABEL,
	METHOD_LABEL,
	STATUS_LABEL,
	TEMPERAMENT_LABEL,
	USE_LABEL,
	WATER_LABEL,
} from '../../lib/labels';

export async function getStaticPaths() {
	const fish = await getCollection('fish');
	const nameById = Object.fromEntries(fish.map((f) => [f.id, f.data.names.english]));
	return fish.map((entry) => ({ params: { id: entry.id }, props: { entry, nameById } }));
}

interface Props {
	entry: CollectionEntry<'fish'>;
	nameById: Record<string, string>;
}

const { entry, nameById } = Astro.props;
const f = entry.data;
const photoSrc = (file: string) => `/photos/${entry.id}/${file}`;
const [hero, ...morePhotos] = f.photos ?? [];

const facts: [string, string][] = [
	['Water', listOf(f.water.map((w) => WATER_LABEL[w]))],
	['Uses', listOf(f.uses.map((u) => USE_LABEL[u]))],
];
if (f.malaysia) facts.push(['In Malaysia', STATUS_LABEL[f.malaysia.status]]);
if (f.iucn) facts.push(['IUCN Red List', IUCN_LABEL[f.iucn]]);
if (f.size) facts.push(['Size', formatSize(f.size)]);
facts.push(['Family', f.taxonomy.order ? `${f.taxonomy.family} (order ${f.taxonomy.order})` : f.taxonomy.family]);

const states = f.malaysia?.states ?? [];
const spots = f.malaysia?.spots ?? [];
const gbifRecords = states.reduce((sum, s) => sum + s.records, 0);
const fishing = f.fishing;
const hasFishing = Boolean(
	fishing && (fishing.season || fishing.methods?.length || fishing.baits?.length || fishing.difficulty),
);
---

<Base title={`${f.names.english} (${f.names.scientific}) | wtfish`} description={f.summary}>
	<p><a href="/">← All fish</a></p>

	<header class="intro">
		<h1>{f.names.english}</h1>
		<p class="sci">{f.names.scientific}</p>
		{f.names.malay && <p class="malay">Malay: <strong>{f.names.malay}</strong></p>}
		{f.names.other?.length ? <p class="aka">Also called {listOf(f.names.other)}</p> : null}
		{!f.lastReviewed && <p class="badge">Not yet fact-checked</p>}
	</header>

	{
		hero && (
			<figure class="hero">
				<img src={photoSrc(hero.file)} alt={`${f.names.english} (${f.names.scientific})`} />
				<figcaption>
					{hero.credit} · <a href={hero.url}>{hero.license}</a>
				</figcaption>
			</figure>
		)
	}

	<p class="summary">{f.summary}</p>

	<dl class="pairs card">
		{
			facts.map(([label, value]) => (
				<>
					<dt>{label}</dt>
					<dd>{value}</dd>
				</>
			))
		}
	</dl>

	{
		f.identify && (
			<section>
				<h2>How to identify</h2>
				<ul>
					{f.identify.features.map((feature) => (
						<li>{feature}</li>
					))}
				</ul>
				{f.identify.lookAlikes?.length ? (
					<>
						<h3>Look-alikes</h3>
						<ul>
							{f.identify.lookAlikes.map((l) => (
								<li>
									<a href={`/fish/${l.id}/`}>{nameById[l.id]}</a>: {l.difference}
								</li>
							))}
						</ul>
					</>
				) : null}
			</section>
		)
	}

	{
		(f.habitat || f.nativeRange) && (
			<section>
				<h2>Habitat</h2>
				{f.habitat && (
					<p class="chips">
						{f.habitat.environments.map((e) => (
							<span>{ENVIRONMENT_LABEL[e]}</span>
						))}
					</p>
				)}
				{f.habitat?.description && <p>{f.habitat.description}</p>}
				{f.nativeRange && (
					<p>
						<strong>Native range:</strong> {f.nativeRange}
					</p>
				)}
				{f.habitat?.diet && (
					<p>
						<strong>Diet:</strong> {f.habitat.diet}
					</p>
				)}
			</section>
		)
	}

	{
		(states.length > 0 || spots.length > 0) && (
			<section>
				<h2>Where in Malaysia</h2>
				{states.length > 0 && (
					<>
						<p>Recorded in {listOf(states.map((s) => s.state))}.</p>
						<p class="note">
							Based on {gbifRecords} open-licence records on{' '}
							{f.taxonomy.gbifKey ? (
								<a href={`https://www.gbif.org/species/${f.taxonomy.gbifKey}`}>GBIF</a>
							) : (
								'GBIF'
							)}
							. Few records can mean few surveys, not few fish.
						</p>
					</>
				)}
				{spots.length > 0 && (
					<>
						<h3>Well-known spots</h3>
						<ul>
							{spots.map((spot) => (
								<li>{spot}</li>
							))}
						</ul>
					</>
				)}
			</section>
		)
	}

	{
		hasFishing && fishing && (
			<section>
				<h2>Catching it</h2>
				<dl class="pairs">
					{fishing.season && (
						<>
							<dt>Season</dt>
							<dd>{fishing.season}</dd>
						</>
					)}
					{fishing.methods?.length ? (
						<>
							<dt>Methods</dt>
							<dd>{listOf(fishing.methods.map((m) => METHOD_LABEL[m]))}</dd>
						</>
					) : null}
					{fishing.baits?.length ? (
						<>
							<dt>Baits and lures</dt>
							<dd>{listOf(fishing.baits)}</dd>
						</>
					) : null}
					{fishing.difficulty && (
						<>
							<dt>Difficulty</dt>
							<dd>{DIFFICULTY_LABEL[fishing.difficulty]}</dd>
						</>
					)}
				</dl>
			</section>
		)
	}

	{
		f.malaysia?.rules && (
			<section class="rules">
				<h2>Rules and conservation</h2>
				<p>{f.malaysia.rules}</p>
				<p class="note">
					Rules change and differ by state. Check with your state Fisheries Office before you fish.
					{f.lastReviewed && ` Last checked ${formatDate(f.lastReviewed)}.`}
				</p>
			</section>
		)
	}

	{
		f.eating && (
			<section>
				<h2>Eating</h2>
				<p>{f.eating}</p>
			</section>
		)
	}

	{
		f.aquarium && (
			<section>
				<h2>Aquarium care</h2>
				<dl class="pairs">
					<dt>Minimum tank</dt>
					<dd>{f.aquarium.minTankLitres} litres</dd>
					<dt>Temperature</dt>
					<dd>{formatRange(f.aquarium.tempC, '°C')}</dd>
					<dt>pH</dt>
					<dd>{formatRange(f.aquarium.ph, '')}</dd>
					<dt>Temperament</dt>
					<dd>{TEMPERAMENT_LABEL[f.aquarium.temperament]}</dd>
					{f.aquarium.groupSize && (
						<>
							<dt>Keep in groups of</dt>
							<dd>{f.aquarium.groupSize} or more</dd>
						</>
					)}
				</dl>
			</section>
		)
	}

	{
		morePhotos.length > 0 && (
			<section>
				<h2>More photos</h2>
				<div class="gallery">
					{morePhotos.map((photo) => (
						<figure>
							<img src={photoSrc(photo.file)} alt={`${f.names.english} (${f.names.scientific})`} loading="lazy" />
							<figcaption>
								{photo.credit} · <a href={photo.url}>{photo.license}</a>
							</figcaption>
						</figure>
					))}
				</div>
			</section>
		)
	}

	<footer class="sources">
		{
			f.sources?.length ? (
				<>
					<h2>Sources</h2>
					<ul>
						{f.sources.map((source) => (
							<li>
								<a href={source}>{source}</a>
							</li>
						))}
					</ul>
				</>
			) : null
		}
		<p class="note">
			{f.lastReviewed ? `Last reviewed ${formatDate(f.lastReviewed)}.` : 'This profile has not been fact-checked yet.'}
		</p>
	</footer>
</Base>

<style>
	h1 {
		margin-bottom: 0;
	}
	.sci {
		margin-top: 0.25rem;
		font-style: italic;
		color: var(--muted);
	}
	.malay,
	.aka {
		margin: 0.25rem 0;
	}
	.badge {
		display: inline-block;
		padding: 0.125rem 0.5rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		font-size: 0.85rem;
		color: var(--muted);
	}
	.hero {
		margin: 1rem 0;
	}
	.hero img,
	.gallery img {
		width: 100%;
		aspect-ratio: 3 / 2;
		object-fit: cover;
		border-radius: 0.75rem;
		background: var(--border);
	}
	figcaption,
	.note {
		font-size: 0.85rem;
		color: var(--muted);
	}
	.summary {
		font-size: 1.1rem;
	}
	.card {
		padding: 1rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 0.75rem;
	}
	.pairs {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 0.5rem 1.5rem;
		max-width: 40rem;
	}
	dt {
		color: var(--muted);
	}
	dd {
		margin: 0;
	}
	section {
		margin-top: 2rem;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}
	.chips span {
		padding: 0.125rem 0.625rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		font-size: 0.9rem;
	}
	.gallery {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
		gap: 0.75rem;
	}
	.gallery figure {
		margin: 0;
	}
	.sources {
		margin-top: 2.5rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}
	.sources a {
		overflow-wrap: anywhere;
	}
	@media (max-width: 30rem) {
		.pairs {
			grid-template-columns: 1fr;
			gap: 0.125rem;
		}
		dd {
			margin-bottom: 0.5rem;
		}
	}
</style>
```

- [ ] **Step 8: Rewrite `data/fish/README.md` with the data and research rules**

Replace `data/fish/README.md` with:

```markdown
# Fish data

One file per fish. The filename is the fish's id and URL:
`giant-snakehead.json` → `/fish/giant-snakehead/`.

- Filenames: the English name in lowercase, words joined by `-`. If the fish
  has no English name, or two fish would share one, use the scientific name
  (`betta-persephone.json`).
- Fields and allowed values are defined in `src/lib/fish-schema.ts`. The
  build and `pnpm test` fail on a missing required field, an unknown field
  or an invalid value.
- Required: `names.english`, `names.scientific`, `taxonomy.family`, `water`,
  `uses`, `summary`. Everything else is optional; empty sections are hidden.

## Filled by scripts — don't edit by hand

- `pnpm import-data <id…>` — `taxonomy` (family, order, gbifKey, wikidata),
  `iucn`, and `malaysia.states` (only if a `malaysia` section exists).
- `pnpm fetch-photos <id> [count]` — `photos` and the files in
  `public/photos/<id>/`.

## Research rules

1. Every fact must come from a source listed in `sources`. Spots, seasons,
   baits and methods need two independent sources.
2. Write in our own words. Never paste text from a source.
3. Never copy from FishBase (non-commercial licence) or the IUCN Red List
   website or API. Use them only to double-check.
4. Malay names: prefer Department of Fisheries (DOF) and DBP lists over
   Wikidata. Put regional names in `names.other` with the region in
   brackets, e.g. `"Empurau (Sarawak)"`.
5. Check the scientific name against Catalog of Fishes. If `import-data`
   warns about a synonym, fix `names.scientific` and run it again.
6. `malaysia.rules` must name the law or authority and come from a
   government page, or a news report quoting one.
7. Add a `malaysia` section only when the fish lives in Malaysian waters
   (native, endemic, introduced or invasive).
8. If a fact can't be sourced, leave the field out.
9. `identify.lookAlikes` may only point at fish that already have a file.
10. When done, set `lastReviewed` to today's date (`YYYY-MM-DD`).

## Photos

- Run `pnpm fetch-photos <id> 3` first (iNaturalist, research-grade,
  CC0 / CC BY / CC BY-SA only, Malaysian observations first).
- If it finds none, search Wikimedia Commons. Use only CC0, CC BY or
  CC BY-SA files. Save to `public/photos/<id>/commons-<short-name>.jpg` and
  add `{ "file", "credit": "<author> / Wikimedia Commons", "license",
  "url": "<Commons file page>" }`.
- Open every photo and confirm it shows the right species. If not, delete the
  file and its entry.
- Never edit a photo file (no overlays, colour changes or crops saved to the
  file). Display cropping in CSS is fine.
```

- [ ] **Step 9: Build and check every section renders, and empty ones hide**

Create a temporary fully-filled fish:

```bash
cat > data/fish/zz-render-check.json <<'EOF'
{
  "names": { "english": "Render check", "scientific": "Testus checkus", "malay": "Ikan ujian", "other": ["Check fish"] },
  "taxonomy": { "family": "Testidae", "order": "Testiformes", "gbifKey": 1, "wikidata": "Q1" },
  "water": ["freshwater", "brackish"],
  "uses": ["sport", "food", "aquarium"],
  "summary": "Temporary fish used to check page rendering.",
  "nativeRange": "Nowhere.",
  "iucn": "VU",
  "size": { "maxCm": 100, "commonCm": 50, "maxKg": 20 },
  "identify": { "features": ["Feature one"], "lookAlikes": [{ "id": "goldfish", "difference": "Different." }] },
  "habitat": { "environments": ["reservoir", "peat-swamp"], "description": "Habitat text.", "diet": "Diet text." },
  "malaysia": { "status": "endemic", "states": [{ "state": "Negeri Sembilan", "records": 3 }], "spots": ["Spot one"], "rules": "Rules text." },
  "fishing": { "season": "Season text.", "methods": ["casting", "fly"], "baits": ["Bait one"], "difficulty": "hard" },
  "eating": "Eating text.",
  "aquarium": { "minTankLitres": 200, "tempC": [24, 28], "ph": [6, 7.5], "temperament": "peaceful", "groupSize": 6 },
  "photos": [
    { "file": "inat-1.jpg", "credit": "(c) Hero Person", "license": "CC BY", "url": "https://www.inaturalist.org/photos/1" },
    { "file": "inat-2.jpg", "credit": "(c) Second Person", "license": "CC0", "url": "https://www.inaturalist.org/photos/2" }
  ],
  "sources": ["https://example.com/source"],
  "lastReviewed": "2026-10-13"
}
EOF
pnpm build
P=dist/fish/zz-render-check/index.html
for t in 'Ikan ujian' 'Also called' 'inat-1.jpg' 'Vulnerable' 'Usually 50 cm' 'How to identify' 'Look-alikes' 'Goldfish' 'Peat swamps' 'Where in Malaysia' 'Negeri Sembilan' 'Well-known spots' 'Catching it' 'Lure casting and Fly fishing' 'Rules and conservation' 'Last checked 13 October 2026' 'Eating' 'Aquarium care' '24–28°C' 'More photos' 'inat-2.jpg' 'Sources' 'Last reviewed 13 October 2026'; do
  grep -q "$t" "$P" && echo "ok       $t" || echo "MISSING  $t"
done
grep -q 'Not yet fact-checked' "$P" && echo "UNEXPECTED badge on reviewed fish" || echo "ok       no badge"
```

Expected: build succeeds with `29 page(s) built`; every line starts with `ok`.

Then check an unreviewed fish shows the label and no empty sections:

```bash
G=dist/fish/goldfish/index.html
grep -q 'Not yet fact-checked' "$G" && echo "ok       badge" || echo "MISSING  badge"
for t in 'How to identify' 'Habitat' 'Where in Malaysia' 'Catching it' 'Rules and conservation' 'Eating' 'Aquarium care' 'More photos' '<h2>Sources'; do
  grep -q "$t" "$G" && echo "UNEXPECTED  $t" || echo "ok       hidden: $t"
done
grep -rl --include='*.html' 'undefined' dist/ && echo "FOUND 'undefined' above" || echo "ok       no 'undefined' in any page"
grep -o 'data-filter=' dist/index.html | wc -l
```

Expected: every line starts with `ok`; the last line prints `28`.

Remove the temporary fish and rebuild:

```bash
rm data/fish/zz-render-check.json
pnpm build && pnpm test
```

Expected: `28 page(s) built`; all tests PASS.

- [ ] **Step 10: Check the filters in a browser**

Run `pnpm preview`, open the printed URL, and check:
- typing `carassius` leaves only Goldfish; the count reads `1 fish`;
- choosing "Saltwater" hides Goldfish and shows Mahi-mahi;
- choosing "Found in Malaysia" shows "No fish match your search." (no fish has a `malaysia` section yet);
- a fish page at phone width (≈390px) has no horizontal scrolling.

Stop the preview server.

- [ ] **Step 11: Commit**

```bash
git add data/fish src/content.config.ts src/pages tests/data.test.ts
git commit -m "feat(web): move fish data to the richer profile schema"
```

---

### Task 3: Open-data import script (GBIF + Wikidata)

**Files:**
- Create: `scripts/lib/open-data.ts`
- Create: `scripts/import-open-data.ts`
- Modify: `package.json` (`import-data` script)
- Test: `tests/open-data.test.ts`
- Modify (by running the script): `data/fish/*.json`

**Interfaces:**
- Consumes: `STATES`, `type State`, `type Iucn` from `src/lib/fish-schema.ts`.
- Produces: `pnpm import-data [id…]` (no ids = every fish). Pure helpers in `scripts/lib/open-data.ts`: `normaliseState(raw: string): State | null`, `summariseStates(facets: { name: string; count: number }[]): StateCount[]`, `iucnFromLabel(label: string | undefined): Iucn | undefined`, `matchVerdict(match: GbifMatch): 'ok' | 'synonym' | 'none'`, `mergeGenerated(fish: FishFile, generated: Generated): FishFile`.

- [ ] **Step 1: Write the failing tests**

Create `tests/open-data.test.ts`:

```ts
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
```

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm test tests/open-data.test.ts`
Expected: FAIL — `Failed to resolve import "../scripts/lib/open-data"`.

- [ ] **Step 3: Write the helpers**

Create `scripts/lib/open-data.ts`:

```ts
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
		if (state) totals.set(state, (totals.get(state) ?? 0) + count);
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
```

- [ ] **Step 4: Run the tests to see them pass**

Run: `pnpm test tests/open-data.test.ts`
Expected: PASS.

- [ ] **Step 5: Write the script**

Create `scripts/import-open-data.ts`:

```ts
// Fills machine-derivable fish fields from GBIF and Wikidata.
// Usage: pnpm import-data [fish-id …]   (no ids = every fish)
import { readdir, readFile, writeFile } from 'node:fs/promises';
import {
	iucnFromLabel,
	matchVerdict,
	mergeGenerated,
	summariseStates,
	type FishFile,
	type GbifMatch,
	type Generated,
	type StateCount,
} from './lib/open-data.ts';

const DATA_DIR = new URL('../data/fish/', import.meta.url);
const HEADERS = { 'User-Agent': 'wtfish-data-import/0.1', Accept: 'application/json' };

async function getJson(url: string): Promise<any> {
	const res = await fetch(url, { headers: HEADERS });
	if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
	return res.json();
}

async function fromGbif(scientific: string): Promise<{ taxonomy: Generated['taxonomy']; states: StateCount[] } | null> {
	const match: GbifMatch = await getJson(
		`https://api.gbif.org/v1/species/match?name=${encodeURIComponent(scientific)}`,
	);
	const verdict = matchVerdict(match);
	if (verdict === 'synonym') {
		console.warn(
			`  ! GBIF treats "${scientific}" as a synonym of "${match.species}". Check Catalog of Fishes and fix names.scientific. Taxonomy and states not written.`,
		);
		return null;
	}
	if (verdict === 'none') {
		console.warn(
			`  ! GBIF has no accepted exact match for "${scientific}" (matchType ${match.matchType}, status ${match.status}). Taxonomy and states not written.`,
		);
		return null;
	}
	const params = new URLSearchParams({
		taxonKey: String(match.usageKey),
		country: 'MY',
		limit: '0',
		facet: 'stateProvince',
		facetLimit: '100',
	});
	params.append('license', 'CC0_1_0');
	params.append('license', 'CC_BY_4_0');
	const occurrences = await getJson(`https://api.gbif.org/v1/occurrence/search?${params}`);
	const facets: { name: string; count: number }[] = occurrences.facets?.[0]?.counts ?? [];
	return {
		taxonomy: { family: match.family, order: match.order, gbifKey: match.usageKey },
		states: summariseStates(facets),
	};
}

async function fromWikidata(scientific: string) {
	const query = `SELECT ?item ?statusLabel ?malay WHERE {
		?item wdt:P225 ${JSON.stringify(scientific)} .
		OPTIONAL { ?item wdt:P141 ?status . }
		OPTIONAL { ?item rdfs:label ?malay . FILTER(LANG(?malay) = "ms") }
		SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
	} LIMIT 1`;
	const json = await getJson(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`);
	const row = json.results.bindings[0];
	if (!row) {
		console.warn(`  ! No Wikidata item with taxon name "${scientific}".`);
		return null;
	}
	return {
		wikidata: String(row.item.value).split('/').pop(),
		iucn: iucnFromLabel(row.statusLabel?.value),
		malay: row.malay?.value as string | undefined,
	};
}

const only = new Set(process.argv.slice(2));
const files = (await readdir(DATA_DIR)).filter(
	(file) => file.endsWith('.json') && (only.size === 0 || only.has(file.slice(0, -5))),
);
const unknown = [...only].filter((id) => !files.includes(`${id}.json`));
if (unknown.length > 0) {
	console.error(`No data file for: ${unknown.join(', ')}`);
	process.exit(1);
}

for (const file of files) {
	const url = new URL(file, DATA_DIR);
	const fish: FishFile = JSON.parse(await readFile(url, 'utf8'));
	const scientific = fish.names.scientific;
	console.log(`${file.slice(0, -5)} — ${scientific}`);

	const [gbif, wiki] = await Promise.all([fromGbif(scientific), fromWikidata(scientific)]);
	const generated: Generated = {
		taxonomy: { ...gbif?.taxonomy, wikidata: wiki?.wikidata },
		iucn: wiki?.iucn,
		states: gbif?.states,
	};

	if (wiki?.malay && wiki.malay.toLowerCase() !== fish.names.malay?.toLowerCase()) {
		console.log(`  Wikidata Malay label: "${wiki.malay}" (not applied — check against DOF names)`);
	}
	if (gbif && !fish.malaysia && gbif.states.length > 0) {
		console.log(
			`  GBIF has Malaysian records (${gbif.states.map((s) => s.state).join(', ')}) but the file has no "malaysia" section — add one if the fish lives in Malaysia.`,
		);
	}

	await writeFile(url, `${JSON.stringify(mergeGenerated(fish, generated), null, 2)}\n`);
	await new Promise((resolve) => setTimeout(resolve, 500));
}
```

```bash
pnpm pkg set scripts.import-data="node scripts/import-open-data.ts"
```

- [ ] **Step 6: Try it on two fish and inspect the changes**

```bash
pnpm import-data goldfish barramundi
git diff data/fish/goldfish.json data/fish/barramundi.json
```

Expected: no stack trace. `barramundi` prints a `Wikidata Malay label: "siakap putih"` line and a `GBIF has Malaysian records (…)` line. The diff for each file adds only `taxonomy.order`, `taxonomy.gbifKey`, `taxonomy.wikidata` (e.g. `"Q74411"` for barramundi) and `iucn`, and may change `taxonomy.family`; nothing else changes.

Then prove a re-run changes nothing:

```bash
git add data/fish/goldfish.json data/fish/barramundi.json
pnpm import-data goldfish barramundi
git diff --quiet data/fish/goldfish.json data/fish/barramundi.json && echo UNCHANGED || echo CHANGED
git restore --staged data/fish/goldfish.json data/fish/barramundi.json
```

Expected: `UNCHANGED`. (Staging the first run lets `git diff` compare the second run against it; the last line unstages so Step 9's first commit stays script-only.)

- [ ] **Step 7: Prove a bad scientific name writes nothing**

```bash
cp data/fish/goldfish.json /tmp/goldfish.bak
node -e 'const fs=require("fs");const p="data/fish/goldfish.json";const f=JSON.parse(fs.readFileSync(p));f.names.scientific="Carassius auratuss";fs.writeFileSync(p,JSON.stringify(f,null,2)+"\n")'
pnpm import-data goldfish
node -e 'const f=require("./data/fish/goldfish.json");console.log(JSON.stringify(f.taxonomy))'
cp /tmp/goldfish.bak data/fish/goldfish.json
```

Expected: a `! GBIF has no accepted exact match for "Carassius auratuss" (matchType FUZZY …)` warning; the printed taxonomy equals what it was before the run (same `gbifKey`). The last command restores the file.

- [ ] **Step 8: Run it for every fish, then test and build**

```bash
pnpm import-data
pnpm test && pnpm build
```

Expected: one block per fish; read every `!` warning. For each synonym warning, write the fish id and the accepted name in the commit message body; they are fixed in that fish's research batch (Tasks 7, 8, 10 or 11), not here. Tests PASS; `28 page(s) built`.

- [ ] **Step 9: Commit**

```bash
git add package.json scripts tests/open-data.test.ts
git commit -m "feat(web): add GBIF and Wikidata import script"
git add data/fish
git commit -m "chore(web): import taxonomy and IUCN status for existing fish"
```

---

### Task 4: iNaturalist photo script

**Files:**
- Create: `scripts/lib/photos.ts`
- Create: `scripts/fetch-photos.ts`
- Modify: `package.json` (`fetch-photos` script)
- Test: `tests/photos.test.ts`

**Interfaces:**
- Consumes: `type PhotoLicense` from `src/lib/fish-schema.ts`; photo URL convention `/photos/<fish-id>/<file>` from Task 2.
- Produces: `pnpm fetch-photos <fish-id> [total=3]`. Pure helpers: `toLicense(code): PhotoLicense | null`, `photosFromObservations(observations, scientific): InatPhoto[]`, `photoFileName(photoId: number): string`, `largeUrl(url: string): string`, `pickNew(photos: InatPhoto[], existingFiles: string[], count: number): InatPhoto[]`.

- [ ] **Step 1: Write the failing tests**

Create `tests/photos.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { largeUrl, photoFileName, photosFromObservations, pickNew, toLicense } from '../scripts/lib/photos';

describe('toLicense', () => {
	it.each([
		['cc0', 'CC0'],
		['cc-by', 'CC BY'],
		['cc-by-sa', 'CC BY-SA'],
	])('allows %s', (code, license) => {
		expect(toLicense(code)).toBe(license);
	});

	it.each(['cc-by-nc', 'cc-by-nd', 'cc-by-nc-sa', null, undefined])('rejects %s', (code) => {
		expect(toLicense(code)).toBeNull();
	});
});

describe('photosFromObservations', () => {
	const photo = (id: number, license_code: string | null) => ({
		id,
		license_code,
		attribution: `(c) Person ${id}`,
		url: `https://inaturalist-open-data.s3.amazonaws.com/photos/${id}/square.jpg`,
	});

	it('keeps open photos of the species and its subspecies only', () => {
		const observations = [
			{ taxon: { name: 'Lates calcarifer' }, photos: [photo(1, 'cc-by'), photo(2, 'cc-by-nc')] },
			{ taxon: { name: 'Lates calcarifer calcarifer' }, photos: [photo(3, 'cc0')] },
			{ taxon: { name: 'Lates japonicus' }, photos: [photo(4, 'cc-by')] },
			{ taxon: null, photos: [photo(5, 'cc-by')] },
		];
		expect(photosFromObservations(observations, 'Lates calcarifer').map((p) => [p.id, p.license])).toEqual([
			[1, 'CC BY'],
			[3, 'CC0'],
		]);
	});
});

describe('largeUrl', () => {
	it.each([
		[
			'https://inaturalist-open-data.s3.amazonaws.com/photos/123/square.jpg',
			'https://inaturalist-open-data.s3.amazonaws.com/photos/123/large.jpg',
		],
		[
			'https://static.inaturalist.org/photos/123/square.jpeg?1700000000',
			'https://static.inaturalist.org/photos/123/large.jpeg?1700000000',
		],
	])('turns %s into the large size', (input, output) => {
		expect(largeUrl(input)).toBe(output);
	});
});

describe('pickNew', () => {
	const p = (id: number) => ({ id, license: 'CC BY' as const, attribution: 'a', url: 'u' });

	it('skips photos already saved and duplicates, up to the count', () => {
		const picked = pickNew([p(1), p(2), p(2), p(3), p(4)], [photoFileName(1)], 2);
		expect(picked.map((x) => x.id)).toEqual([2, 3]);
	});

	it('returns nothing for a count of zero or less', () => {
		expect(pickNew([p(1)], [], 0)).toEqual([]);
	});
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm test tests/photos.test.ts`
Expected: FAIL — `Failed to resolve import "../scripts/lib/photos"`.

- [ ] **Step 3: Write the helpers**

Create `scripts/lib/photos.ts`:

```ts
import type { PhotoLicense } from '../../src/lib/fish-schema.ts';

export interface InatPhoto {
	id: number;
	license: PhotoLicense;
	attribution: string;
	url: string;
}

interface InatObservation {
	taxon?: { name?: string } | null;
	photos?: { id: number; license_code: string | null; attribution: string; url: string }[];
}

export function toLicense(code: string | null | undefined): PhotoLicense | null {
	switch (code) {
		case 'cc0':
			return 'CC0';
		case 'cc-by':
			return 'CC BY';
		case 'cc-by-sa':
			return 'CC BY-SA';
		default:
			return null;
	}
}

export function photosFromObservations(observations: InatObservation[], scientific: string): InatPhoto[] {
	const photos: InatPhoto[] = [];
	for (const observation of observations) {
		const name = observation.taxon?.name ?? '';
		if (name !== scientific && !name.startsWith(`${scientific} `)) continue;
		for (const photo of observation.photos ?? []) {
			const license = toLicense(photo.license_code);
			if (license) photos.push({ id: photo.id, license, attribution: photo.attribution, url: photo.url });
		}
	}
	return photos;
}

export function photoFileName(photoId: number): string {
	return `inat-${photoId}.jpg`;
}

export function largeUrl(url: string): string {
	return url.replace(/\/square(\.\w+)/, '/large$1');
}

export function pickNew(photos: InatPhoto[], existingFiles: string[], count: number): InatPhoto[] {
	const seen = new Set(existingFiles);
	const picked: InatPhoto[] = [];
	for (const photo of photos) {
		if (picked.length >= count) break;
		const file = photoFileName(photo.id);
		if (seen.has(file)) continue;
		seen.add(file);
		picked.push(photo);
	}
	return picked;
}
```

- [ ] **Step 4: Run the tests to see them pass**

Run: `pnpm test tests/photos.test.ts`
Expected: PASS.

- [ ] **Step 5: Write the script**

Create `scripts/fetch-photos.ts`:

```ts
// Downloads openly-licensed, research-grade iNaturalist photos for one fish.
// Usage: pnpm fetch-photos <fish-id> [total photos, default 3]
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { largeUrl, photoFileName, photosFromObservations, pickNew } from './lib/photos.ts';

const MALAYSIA_PLACE_ID = 7155;
const HEADERS = { 'User-Agent': 'wtfish-data-import/0.1' };

const [id, totalArg = '3'] = process.argv.slice(2);
const total = Number(totalArg);
if (!id || !Number.isInteger(total) || total < 1) {
	console.error('Usage: pnpm fetch-photos <fish-id> [total photos, default 3]');
	process.exit(1);
}

const dataUrl = new URL(`../data/fish/${id}.json`, import.meta.url);
const fish = JSON.parse(await readFile(dataUrl, 'utf8'));
const scientific: string = fish.names.scientific;
const photos: { file: string; credit: string; license: string; url: string }[] = fish.photos ?? [];

if (photos.length >= total) {
	console.log(`${id}: already has ${photos.length} photo(s).`);
	process.exit(0);
}

async function search(placeId?: number) {
	const params = new URLSearchParams({
		taxon_name: scientific,
		photo_license: 'cc0,cc-by,cc-by-sa',
		quality_grade: 'research',
		order_by: 'votes',
		per_page: '30',
	});
	if (placeId) params.set('place_id', String(placeId));
	const res = await fetch(`https://api.inaturalist.org/v1/observations?${params}`, { headers: HEADERS });
	if (!res.ok) throw new Error(`iNaturalist ${res.status} ${res.statusText}`);
	return photosFromObservations((await res.json()).results, scientific);
}

const candidates = [...(await search(MALAYSIA_PLACE_ID)), ...(await search())];
const picked = pickNew(
	candidates,
	photos.map((p) => p.file),
	total - photos.length,
);
if (picked.length === 0) {
	console.log(`${id}: no new openly-licensed iNaturalist photos. Try Wikimedia Commons — see data/fish/README.md.`);
	process.exit(0);
}

const dir = new URL(`../public/photos/${id}/`, import.meta.url);
await mkdir(dir, { recursive: true });
for (const photo of picked) {
	const res = await fetch(largeUrl(photo.url), { headers: HEADERS });
	if (!res.ok) throw new Error(`Download failed (${res.status}) for photo ${photo.id}`);
	const file = photoFileName(photo.id);
	await writeFile(new URL(file, dir), Buffer.from(await res.arrayBuffer()));
	photos.push({ file, credit: photo.attribution, license: photo.license, url: `https://www.inaturalist.org/photos/${photo.id}` });
	console.log(`${id}: saved ${file} (${photo.license}) — ${photo.attribution}`);
}

fish.photos = photos;
await writeFile(dataUrl, `${JSON.stringify(fish, null, 2)}\n`);
console.log(`${id}: now has ${photos.length} photo(s). Open each one and confirm it shows the right fish.`);
```

```bash
pnpm pkg set scripts.fetch-photos="node scripts/fetch-photos.ts"
```

- [ ] **Step 6: Try it on one fish**

```bash
pnpm fetch-photos giant-trevally 2
ls public/photos/giant-trevally/
pnpm test && pnpm build
```

Expected: two `saved inat-<n>.jpg (CC …)` lines; two `.jpg` files listed; tests PASS (the data test confirms both files exist); build succeeds. Open both images and confirm they show a giant trevally. Then run `pnpm preview` and check `/fish/giant-trevally/` shows the large photo with credit, a "More photos" section, and still says "Not yet fact-checked".

Run it again: `pnpm fetch-photos giant-trevally 2` → Expected: `giant-trevally: already has 2 photo(s).`

- [ ] **Step 7: Commit**

```bash
git add package.json scripts tests/photos.test.ts data/fish/giant-trevally.json public/photos/giant-trevally
git commit -m "feat(web): add iNaturalist photo fetch script"
```

---

### Task 5: Research batch 1 — Malaysian freshwater natives (part 1)

**Files:**
- Create: `data/fish/<id>.json` for the 8 ids below
- Create: `public/photos/<id>/*` (where photos exist)

**Interfaces:**
- Consumes: schema (Task 1), research rules in `data/fish/README.md` (Task 2), `pnpm import-data` (Task 3), `pnpm fetch-photos` (Task 4).
- Produces: these 8 fish ids, which later batches may use as look-alikes.

| id | English | Malay | Scientific | Research leads |
|---|---|---|---|---|
| malaysian-mahseer | Malaysian mahseer | Kelah | *Tor tambroides* | Terengganu Inland Fisheries Regulations 1988 + Kenyir Kelah Sanctuary (catch-and-release); Perak kelah sanctuary at Sungai Tiang; *Tor* taxonomy is disputed — check Catalog of Fishes; **no** iNaturalist photos — use Commons |
| hampala-barb | Hampala barb | Sebarau | *Hampala macrolepidota* | IGFA name "Hampala barb", also "jungle perch"; spoons and split-tail flies; DOF restocks it |
| giant-snakehead | Giant snakehead | Toman | *Channa micropeltes* | Spots: Royal Belum / Temenggor (Perak), Air Ganda (Perak), Beris (Kedah), Kenyir — one source puts Kenyir in Pahang; it is in Terengganu, so cross-check every spot |
| striped-snakehead | Striped snakehead | Haruan | *Channa striata* | Common food fish, farmed since the 1990s; traditional use in soups |
| julliens-golden-carp | Jullien's golden carp | Temoleh | *Probarbus jullieni* | Wikidata gives CR; Perak lists it as threatened in Sungai Perak; DOF restocking |
| asian-arowana | Asian arowana | Kelisa | *Scleropages formosus* | CITES Appendix I (captive-bred trade needs certificates); Perak kelisa sanctuary at Bukit Merah; Wikidata gives EN; `uses` likely `aquarium` only |
| sultan-fish | Sultan fish | Jelawat | *Leptobarbus hoevenii* | Wild stocks depleted; first native fish bred in captivity (1980s); up to ~60 cm per one source — find a second |
| asian-redtail-catfish | Asian redtail catfish | Baung | *Hemibagrus nemurus* | Don't confuse with banned *Hemibagrus wyckioides* (Task 7); DOF restocks *baung sungai* |

- [ ] **Step 1: Write each file**

For each id, create `data/fish/<id>.json` following every rule in `data/fish/README.md`. Start from the required fields plus a `malaysia` section; add every other section you can source:

```json
{
  "names": { "english": "Giant snakehead", "scientific": "Channa micropeltes", "malay": "Toman" },
  "taxonomy": { "family": "Channidae" },
  "water": ["freshwater"],
  "uses": ["sport", "food"],
  "summary": "Two or three sentences in our own words.",
  "malaysia": { "status": "native" },
  "sources": ["https://…"],
  "lastReviewed": "2026-10-13"
}
```

Use today's date for `lastReviewed`. Use the research leads in the table as starting points only — each needs a source.

- [ ] **Step 2: Import open data**

```bash
pnpm import-data malaysian-mahseer hampala-barb giant-snakehead striped-snakehead julliens-golden-carp asian-arowana sultan-fish asian-redtail-catfish
```

Expected: no `!` warnings. For a synonym or no-match warning, check Catalog of Fishes, fix `names.scientific`, and rerun for that id. Compare each printed Wikidata Malay label with the `malay` you chose; change yours only if a DOF or DBP source supports it.

- [ ] **Step 3: Fetch photos**

```bash
for id in malaysian-mahseer hampala-barb giant-snakehead striped-snakehead julliens-golden-carp asian-arowana sultan-fish asian-redtail-catfish; do pnpm fetch-photos "$id" 3; done
```

For each fish that reports no photos, follow the Wikimedia Commons steps in `data/fish/README.md`. Open every saved photo and delete any that shows the wrong fish.

- [ ] **Step 4: Test and build**

Run: `pnpm test && pnpm build`
Expected: all tests PASS; `36 page(s) built`.

- [ ] **Step 5: Review each page**

Run `pnpm preview` and open each of the 8 pages. For each, confirm:
- no "Not yet fact-checked" label;
- every fact on the page can be traced to a link under "Sources";
- spots, seasons, baits and methods each have two sources;
- rules text names a law or authority;
- photo credits are present.

Then on the directory page confirm "Found in Malaysia" now shows these 8 fish and the state filter lists their states.

- [ ] **Step 6: Commit**

```bash
git add data/fish public/photos
git commit -m "feat(web): add malaysian freshwater fish profiles (batch 1)"
```

---

### Task 6: Research batch 2 — Malaysian freshwater natives (part 2)

**Files:**
- Create: `data/fish/<id>.json` for the 8 ids below
- Create: `public/photos/<id>/*` (where photos exist)

**Interfaces:**
- Consumes: as Task 5; may use Task 5's ids as look-alikes (e.g. `soro-brook-carp` ↔ `hampala-barb`, `malaysian-mahseer`).
- Produces: these 8 fish ids.

| id | English | Malay | Scientific | Research leads |
|---|---|---|---|---|
| tinfoil-barb | Tinfoil barb | Lampam sungai | *Barbonymus schwanenfeldii* | One of DOF's five most-released species; also an aquarium fish |
| soro-brook-carp | Soro brook carp | Tengas | *Neolissochilus soroides* | Abundant but not yet commercial; look-alike for kelah |
| climbing-perch | Climbing perch | Puyu | *Anabas testudineus* | Breathes air; DOF restocks it |
| wallago-catfish | Wallago | Tapah | *Wallago leeri* ⚠ | Peninsular population may be *W. leeri* rather than *W. attu* — settle via Catalog of Fishes |
| giant-featherback | Giant featherback | Belida | *Chitala lopis* ⚠ | Confirm which *Chitala* is native to Malaysia; *C. ornata* is introduced |
| pangasius-nasutus | Pangasius nasutus | Patin buah | *Pangasius nasutus* ⚠ | Native patin; don't confuse with farmed patin sangkar (Task 7); find an English name — if one exists, rename the file |
| giant-gourami | Giant gourami | Kaloi | *Osphronemus goramy* ⚠ | Whether native or introduced in Peninsular Malaysia is unclear — set `malaysia.status` from a source |
| three-spot-gourami | Three-spot gourami | Sepat benang | *Trichopodus trichopterus* | Rice-field and swamp fish; aquarium use |

- [ ] **Step 1: Write each file**

For each id, create `data/fish/<id>.json` following every rule in `data/fish/README.md`. Start from:

```json
{
  "names": { "english": "Tinfoil barb", "scientific": "Barbonymus schwanenfeldii", "malay": "Lampam sungai" },
  "taxonomy": { "family": "Cyprinidae" },
  "water": ["freshwater"],
  "uses": ["sport", "food", "aquarium"],
  "summary": "Two or three sentences in our own words.",
  "malaysia": { "status": "native" },
  "sources": ["https://…"],
  "lastReviewed": "2026-10-13"
}
```

If research renames a fish (new English name for `pangasius-nasutus`, or a different species for a ⚠ row), rename the file to match the rules in `data/fish/README.md`.

- [ ] **Step 2: Import open data**

```bash
pnpm import-data tinfoil-barb soro-brook-carp climbing-perch wallago-catfish giant-featherback pangasius-nasutus giant-gourami three-spot-gourami
```

Expected: no `!` warnings (use renamed ids if any changed). Fix synonyms as in the README and rerun.

- [ ] **Step 3: Fetch photos**

```bash
for id in tinfoil-barb soro-brook-carp climbing-perch wallago-catfish giant-featherback pangasius-nasutus giant-gourami three-spot-gourami; do pnpm fetch-photos "$id" 3; done
```

Commons fallback for any fish with none; open and check every photo.

- [ ] **Step 4: Test and build**

Run: `pnpm test && pnpm build`
Expected: all tests PASS; `44 page(s) built`.

- [ ] **Step 5: Review each page**

Run `pnpm preview`; for each of the 8 pages confirm: no "Not yet fact-checked" label; every fact traceable to a listed source; two sources for spots, seasons, baits and methods; rules name a law or authority; photo credits present. Add back-links: if a fish here is a look-alike of a Task 5 fish, add it to that fish's `identify.lookAlikes` too.

- [ ] **Step 6: Commit**

```bash
git add data/fish public/photos
git commit -m "feat(web): add malaysian freshwater fish profiles (batch 2)"
```

---

### Task 7: Research batch 3 — introduced fish and estuary fish

**Files:**
- Create: `data/fish/<id>.json` for 9 new ids below
- Modify: `data/fish/barramundi.json` (rewrite to full profile)
- Create: `public/photos/<id>/*`

**Interfaces:**
- Consumes: as Task 5; may link look-alikes to Tasks 5–6 ids.
- Produces: these 10 fish ids.

| id | English | Malay | Scientific | Research leads |
|---|---|---|---|---|
| butterfly-peacock-bass | Butterfly peacock bass | Ikan raja | *Cichla ocellaris* ⚠ | Four *Cichla* species in Malaysia (2021 review) — confirm which is most common; introduced 1990s; hotspots Rawang and Semenyih reservoirs; not recorded in Kelantan or Borneo as of 2021; `status: invasive` |
| nile-tilapia | Nile tilapia | Tilapia | *Oreochromis niloticus* | Introduced; major farmed fish |
| iridescent-shark | Iridescent shark | Patin sangkar | *Pangasianodon hypophthalmus* | Introduced, farmed in cages |
| north-african-catfish | North African catfish | Keli Afrika | *Clarias gariepinus* | Introduced; check invasive status |
| pirapitinga | Pirapitinga | Pacu | *Piaractus brachypomus* | Stocked in ponds such as Empangan Air Kuning (catch-and-release) |
| hemibagrus-wyckioides | Hemibagrus wyckioides | Baung ekor merah | *Hemibagrus wyckioides* | Banned under the Fisheries (Amendment) Regulations 2024 from 1 July 2024 — confirm text; English name clashes with *H. nemurus*, hence the scientific id |
| barramundi | Barramundi | Siakap | *Lates calcarifer* | **Existing file — rewrite it fully**; Wikidata Malay label is "siakap putih"; look-alike: mangrove-jack |
| mangrove-jack | Mangrove jack | Siakap merah | *Lutjanus argentimaculatus* | Also called *kakap merah* |
| johns-snapper | John's snapper | Jenahak | *Lutjanus johnii* | Sources disagree whether *jenahak* is golden snapper — settle with DOF list |
| fourfinger-threadfin | Fourfinger threadfin | Kurau | *Eleutheronema tetradactylum* ⚠ | Prized food fish; confirm *kurau* applies to this species |

- [ ] **Step 1: Write each file**

Create the 9 new files and rewrite `barramundi.json`, following every rule in `data/fish/README.md`. Start new files from:

```json
{
  "names": { "english": "Nile tilapia", "scientific": "Oreochromis niloticus", "malay": "Tilapia" },
  "taxonomy": { "family": "Cichlidae" },
  "water": ["freshwater"],
  "uses": ["food", "sport"],
  "summary": "Two or three sentences in our own words.",
  "malaysia": { "status": "introduced" },
  "sources": ["https://…"],
  "lastReviewed": "2026-10-13"
}
```

For `barramundi.json`, keep its existing `taxonomy` (imported in Task 3) and `size`, replace the old summary with a sourced one, add `names.malay`, a `malaysia` section and all other sections you can source.

- [ ] **Step 2: Import open data**

```bash
pnpm import-data butterfly-peacock-bass nile-tilapia iridescent-shark north-african-catfish pirapitinga hemibagrus-wyckioides barramundi mangrove-jack johns-snapper fourfinger-threadfin
```

Expected: no `!` warnings; fix synonyms and rerun.

- [ ] **Step 3: Fetch photos**

```bash
for id in butterfly-peacock-bass nile-tilapia iridescent-shark north-african-catfish pirapitinga hemibagrus-wyckioides barramundi mangrove-jack johns-snapper fourfinger-threadfin; do pnpm fetch-photos "$id" 3; done
```

Commons fallback for any fish with none; open and check every photo.

- [ ] **Step 4: Test and build**

Run: `pnpm test && pnpm build`
Expected: all tests PASS; `53 page(s) built`.

- [ ] **Step 5: Review each page**

Run `pnpm preview`; for each of the 10 pages confirm: no "Not yet fact-checked" label; every fact traceable to a listed source; two sources for spots, seasons, baits and methods; rules name a law or authority; photo credits present. On the directory, "Invasive in Malaysia" lists at least `butterfly-peacock-bass`.

- [ ] **Step 6: Commit**

```bash
git add data/fish public/photos
git commit -m "feat(web): add introduced and estuary fish profiles (batch 3)"
```

---

### Task 8: Research batch 4 — Malaysian marine sport fish

**Files:**
- Create: `data/fish/<id>.json` for 7 new ids below
- Modify: `data/fish/giant-trevally.json` (rewrite to full profile; keep its photos from Task 4)
- Create: `public/photos/<id>/*`

**Interfaces:**
- Consumes: as Task 5.
- Produces: these 8 fish ids.

| id | English | Malay | Scientific | Research leads |
|---|---|---|---|---|
| indo-pacific-sailfish | Indo-Pacific sailfish | Layaran | *Istiophorus platypterus* | Rompin (Pahang); season sources disagree (Mar–Nov / Apr–Oct, peak Jul–Oct) — show the range and say sources vary; mostly catch-and-release |
| giant-trevally | Giant trevally | Gerepuh | *Caranx ignobilis* | **Existing file — rewrite it, keep `photos`**; regional names *ebek*, *cupak*; Wikidata's "bagat mamung" is doubtful — don't use without a source |
| talang-queenfish | Talang queenfish | Talang | *Scomberoides commersonnianus* | Rompin and Seribuat islands |
| narrow-barred-spanish-mackerel | Narrow-barred Spanish mackerel | Tenggiri batang | *Scomberomorus commerson* | Wikidata gives NT; major food fish too |
| hound-needlefish | Hound needlefish | Todak | *Tylosurus crocodilus* ⚠ | Confirm *todak* species; known for injuring people by leaping |
| cobia | Cobia | Aruan tasik ⚠ | *Rachycentron canadum* | Confirm Malay name |
| brown-marbled-grouper | Brown-marbled grouper | Kerapu harimau | *Epinephelus fuscoguttatus* | Farmed in Malaysia; demersal stocks down sharply (DOF) |
| giant-grouper | Giant grouper | Kerapu kertang | *Epinephelus lanceolatus* | Largest reef bony fish; check protection status |

- [ ] **Step 1: Write each file**

Create the 7 new files and rewrite `giant-trevally.json` (keeping its `photos` and imported `taxonomy`), following every rule in `data/fish/README.md`. Start new files from:

```json
{
  "names": { "english": "Cobia", "scientific": "Rachycentron canadum", "malay": "Aruan tasik" },
  "taxonomy": { "family": "Rachycentridae" },
  "water": ["marine"],
  "uses": ["sport", "food"],
  "summary": "Two or three sentences in our own words.",
  "malaysia": { "status": "native" },
  "sources": ["https://…"],
  "lastReviewed": "2026-10-13"
}
```

East-coast seasons must mention the November–February northeast monsoon.

- [ ] **Step 2: Import open data**

```bash
pnpm import-data indo-pacific-sailfish giant-trevally talang-queenfish narrow-barred-spanish-mackerel hound-needlefish cobia brown-marbled-grouper giant-grouper
```

Expected: no `!` warnings; fix synonyms and rerun.

- [ ] **Step 3: Fetch photos**

```bash
for id in indo-pacific-sailfish giant-trevally talang-queenfish narrow-barred-spanish-mackerel hound-needlefish cobia brown-marbled-grouper giant-grouper; do pnpm fetch-photos "$id" 3; done
```

Commons fallback for any fish with none; open and check every photo.

- [ ] **Step 4: Test and build**

Run: `pnpm test && pnpm build`
Expected: all tests PASS; `60 page(s) built`.

- [ ] **Step 5: Review each page**

Run `pnpm preview`; for each of the 8 pages confirm: no "Not yet fact-checked" label; every fact traceable to a listed source; two sources for spots, seasons, baits and methods; rules name a law or authority; photo credits present.

- [ ] **Step 6: Commit**

```bash
git add data/fish public/photos
git commit -m "feat(web): add malaysian marine sport fish profiles (batch 4)"
```

---

### Task 9: Research batch 5 — market fish and native aquarium fish

**Files:**
- Create: `data/fish/<id>.json` for the 10 ids below
- Create: `public/photos/<id>/*`

**Interfaces:**
- Consumes: as Task 5.
- Produces: these 10 fish ids.

| id | English | Malay | Scientific | Research leads |
|---|---|---|---|---|
| indian-mackerel | Indian mackerel | Kembung | *Rastrelliger kanagurta* | Everyday market fish |
| black-pomfret | Black pomfret | Bawal hitam | *Parastromateus niger* | Distinguish from silver pomfret (*bawal tambak*) and white pomfret (*bawal putih*) |
| yellowstripe-scad | Yellowstripe scad | Selar kuning | *Selaroides leptolepis* | Market fish |
| kawakawa | Kawakawa | Tongkol ⚠ | *Euthynnus affinis* | One source maps *tongkol* to skipjack — settle with DOF list before using the name |
| humphead-wrasse | Humphead wrasse | Mameng | *Cheilinus undulatus* | Endangered; CITES Appendix II; DOF reports very low abundance; `uses: ["food"]` (live reef-fish trade) — put current legal limits in `malaysia.rules` |
| harlequin-rasbora | Harlequin rasbora | Seluang ⚠ | *Trigonostigma heteromorpha* | Peat swamps; "seluang" may be a generic name — omit `malay` if no specific source; Borneo populations may be a different species |
| chocolate-gourami | Chocolate gourami | — | *Sphaerichthys osphromenoides* | Near Threatened (Malay Mail 2025); peat swamps |
| betta-persephone | Betta persephone | — | *Betta persephone* ⚠ | Endemic — confirm range and IUCN category |
| penang-betta | Penang betta | — | *Betta pugnax* | Confirm English name and range |
| dwarf-rasbora | Dwarf rasbora | — | *Boraras maculatus* | Native; peat swamp |

- [ ] **Step 1: Write each file**

Create each file following every rule in `data/fish/README.md`. Start from:

```json
{
  "names": { "english": "Harlequin rasbora", "scientific": "Trigonostigma heteromorpha" },
  "taxonomy": { "family": "Danionidae" },
  "water": ["freshwater"],
  "uses": ["aquarium"],
  "summary": "Two or three sentences in our own words.",
  "malaysia": { "status": "native" },
  "sources": ["https://…"],
  "lastReviewed": "2026-10-13"
}
```

Aquarium fish should get an `aquarium` section; market fish should get `eating`.

- [ ] **Step 2: Import open data**

```bash
pnpm import-data indian-mackerel black-pomfret yellowstripe-scad kawakawa humphead-wrasse harlequin-rasbora chocolate-gourami betta-persephone penang-betta dwarf-rasbora
```

Expected: no `!` warnings; fix synonyms and rerun.

- [ ] **Step 3: Fetch photos**

```bash
for id in indian-mackerel black-pomfret yellowstripe-scad kawakawa humphead-wrasse harlequin-rasbora chocolate-gourami betta-persephone penang-betta dwarf-rasbora; do pnpm fetch-photos "$id" 3; done
```

Commons fallback for any fish with none; open and check every photo.

- [ ] **Step 4: Test and build**

Run: `pnpm test && pnpm build`
Expected: all tests PASS; `70 page(s) built`.

- [ ] **Step 5: Review each page**

Run `pnpm preview`; for each of the 10 pages confirm: no "Not yet fact-checked" label; every fact traceable to a listed source; aquarium numbers (tank, temperature, pH) have a source; photo credits present. On the directory, "Threatened only" lists at least `humphead-wrasse` and `julliens-golden-carp`.

- [ ] **Step 6: Commit**

```bash
git add data/fish public/photos
git commit -m "feat(web): add market and native aquarium fish profiles (batch 5)"
```

---

### Task 10: Research batch 6 — rewrite the 13 existing aquarium fish

**Files:**
- Modify: `data/fish/<id>.json` for the 13 ids below
- Create: `public/photos/<id>/*`

**Interfaces:**
- Consumes: as Task 5; any synonym warnings recorded in Task 3's commit message.
- Produces: no new ids; these 13 fish lose the "Not yet fact-checked" label.

Ids: `clown-anemonefish`, `neon-tetra`, `cardinal-tetra`, `betta`, `guppy`, `zebra-danio`, `bronze-corydoras`, `freshwater-angelfish`, `discus`, `oscar`, `goldfish`, `palette-surgeonfish`, `mandarinfish`.

Research leads: the current summaries were written from memory — verify or replace every sentence. `guppy` and `goldfish` may be established or sold in Malaysia — add a `malaysia` section only with a source (status `introduced` or `invasive`). `mandarinfish` taxonomy may have moved to *Neosynchiropus*. `palette-surgeonfish` occurs on Malaysian reefs — add `malaysia` (`native`) if sourced.

- [ ] **Step 1: Rewrite each file**

For each id, keep the imported `taxonomy`, `iucn` and any `photos`; rewrite `summary` from sources; add `nativeRange`, `identify`, `habitat`, `aquarium` (required for these fish), `size` checked against a source, `sources` and `lastReviewed`, following every rule in `data/fish/README.md`.

- [ ] **Step 2: Import open data**

```bash
pnpm import-data clown-anemonefish neon-tetra cardinal-tetra betta guppy zebra-danio bronze-corydoras freshwater-angelfish discus oscar goldfish palette-surgeonfish mandarinfish
```

Expected: no `!` warnings; fix synonyms and rerun.

- [ ] **Step 3: Fetch photos**

```bash
for id in clown-anemonefish neon-tetra cardinal-tetra betta guppy zebra-danio bronze-corydoras freshwater-angelfish discus oscar goldfish palette-surgeonfish mandarinfish; do pnpm fetch-photos "$id" 3; done
```

Commons fallback for any fish with none; open and check every photo (aquarium-bred colour forms are fine for aquarium species).

- [ ] **Step 4: Test and build**

Run: `pnpm test && pnpm build`
Expected: all tests PASS; `70 page(s) built`.

- [ ] **Step 5: Review each page**

Run `pnpm preview`; for each of the 13 pages confirm: no "Not yet fact-checked" label; every fact traceable to a listed source; aquarium numbers sourced; photo credits present.

- [ ] **Step 6: Commit**

```bash
git add data/fish public/photos
git commit -m "feat(web): fact-check and expand existing aquarium fish (batch 6)"
```

---

### Task 11: Research batch 7 — rewrite the 12 remaining existing game fish

**Files:**
- Modify: `data/fish/<id>.json` for the 12 ids below
- Create: `public/photos/<id>/*`

**Interfaces:**
- Consumes: as Task 5; any synonym warnings recorded in Task 3's commit message.
- Produces: no new ids; after this task no fish shows "Not yet fact-checked".

Ids: `largemouth-bass`, `bluegill`, `rainbow-trout`, `atlantic-salmon`, `northern-pike`, `walleye`, `common-carp`, `red-drum`, `tarpon`, `mahi-mahi`, `yellowfin-tuna`, `blue-marlin`.

Research leads: the current summaries were written from memory — verify or replace every sentence. `largemouth-bass` naming is disputed (*Micropterus salmoides* vs *M. nigricans*). `common-carp` is introduced in Malaysia. `mahi-mahi` and `yellowfin-tuna` (*aya sirip kuning*) occur in Malaysian waters — add `malaysia` sections if sourced. `blue-marlin` is the Atlantic species; the Indo-Pacific blue marlin (*Makaira mazara*) is the one in Malaysian waters — note it in the summary, don't change the species.

- [ ] **Step 1: Rewrite each file**

For each id, keep the imported `taxonomy`, `iucn` and any `photos`; rewrite `summary` from sources; add `nativeRange`, `identify`, `habitat`, `fishing`, `size` checked against a source, `eating` where relevant, `sources` and `lastReviewed`, following every rule in `data/fish/README.md`.

- [ ] **Step 2: Import open data**

```bash
pnpm import-data largemouth-bass bluegill rainbow-trout atlantic-salmon northern-pike walleye common-carp red-drum tarpon mahi-mahi yellowfin-tuna blue-marlin
```

Expected: no `!` warnings; fix synonyms and rerun.

- [ ] **Step 3: Fetch photos**

```bash
for id in largemouth-bass bluegill rainbow-trout atlantic-salmon northern-pike walleye common-carp red-drum tarpon mahi-mahi yellowfin-tuna blue-marlin; do pnpm fetch-photos "$id" 3; done
```

Commons fallback for any fish with none; open and check every photo.

- [ ] **Step 4: Test, build and confirm nothing is left unreviewed**

```bash
pnpm test && pnpm build
grep -l 'Not yet fact-checked' dist/fish/*/index.html | wc -l
```

Expected: all tests PASS; `70 page(s) built`; the count prints `0`.

- [ ] **Step 5: Review each page**

Run `pnpm preview`; for each of the 12 pages confirm: every fact traceable to a listed source; two sources for spots, seasons, baits and methods; photo credits present.

- [ ] **Step 6: Commit**

```bash
git add data/fish public/photos
git commit -m "feat(web): fact-check and expand existing game fish (batch 7)"
```
