import { THREATENED } from './filter';
import {
	ENVIRONMENTS,
	STATES,
	USES,
	WATER,
	type Environment,
	type Fish,
	type Iucn,
	type MalaysiaStatus,
	type State,
	type Use,
	type Water,
} from './fish-schema';
import { ENVIRONMENT_LABEL, USE_LABEL, WATER_LABEL } from './labels';

export const CATEGORY_GROUPS = ['water', 'use', 'habitat', 'state', 'conservation'] as const;
export type CategoryGroup = (typeof CATEGORY_GROUPS)[number];

export const GROUPS: Record<CategoryGroup, { label: string; heading: string; note?: string }> = {
	water: { label: 'Water', heading: 'Water types' },
	use: { label: 'Use', heading: 'Uses' },
	habitat: { label: 'Habitat', heading: 'Habitats' },
	state: {
		label: 'State in Malaysia',
		heading: 'States in Malaysia',
		note: 'Based on open-licence records on GBIF. Few records can mean few surveys, not few fish.',
	},
	conservation: { label: 'Conservation', heading: 'Conservation' },
};

/** A page listing every fish that shares one characteristic, such as a habitat. */
export interface Category {
	group: CategoryGroup;
	/** Web address, e.g. "/habitat/mangroves/". */
	path: string;
	/** Short name for links, as the tag reads on fish pages, e.g. "Mangroves". */
	name: string;
	/** Heading and browser tab title, e.g. "Mangrove fish". */
	title: string;
	/** One or two plain sentences under the title. Also the description Google shows, so at most 160 characters. */
	description: string;
	/** Whether a fish belongs on the page. */
	includes: (fish: Fish) => boolean;
}

const WATER_SLUG: Record<Water, string> = { freshwater: 'freshwater', brackish: 'brackish', marine: 'saltwater' };

const HABITAT_SLUG: Record<Environment, string> = {
	'forest-river': 'forest-rivers',
	'lowland-river': 'lowland-rivers',
	lake: 'lakes',
	reservoir: 'reservoirs',
	'peat-swamp': 'peat-swamps',
	'rice-field': 'rice-fields',
	mangrove: 'mangroves',
	estuary: 'estuaries',
	coastal: 'coastal',
	reef: 'reefs',
	offshore: 'open-ocean',
};

export const waterPath = (water: Water): string => `/water/${WATER_SLUG[water]}/`;
export const usePath = (use: Use): string => `/use/${use}/`;
export const habitatPath = (environment: Environment): string => `/habitat/${HABITAT_SLUG[environment]}/`;
/** States sit under /malaysia/, leaving room for other countries' pages later. */
export const statePath = (state: State): string => `/malaysia/${state.toLowerCase().replaceAll(' ', '-')}/`;
export const THREATENED_PATH = '/threatened/';
/** Under /malaysia/ because a fish is only invasive somewhere, and the data's status is about Malaysia. */
export const INTRODUCED_PATH = '/malaysia/invasive/';

const INTRODUCED: readonly MalaysiaStatus[] = ['introduced', 'invasive'];

/** The page a status badge links to, or undefined when its status has no page. */
export function statusPath(status: MalaysiaStatus): string | undefined {
	return INTRODUCED.includes(status) ? INTRODUCED_PATH : undefined;
}

/** The page an IUCN badge links to, or undefined when its category has no page. */
export function iucnPath(iucn: Iucn): string | undefined {
	return THREATENED.includes(iucn) ? THREATENED_PATH : undefined;
}

interface PageText {
	title: string;
	description: string;
}

const WATER_TEXT: Record<Water, PageText> = {
	freshwater: {
		title: 'Freshwater fish',
		description:
			'Fish of rivers, lakes, swamps and reservoirs, where the water has almost no salt. Many popular aquarium fish come from fresh water.',
	},
	brackish: {
		title: 'Brackish water fish',
		description:
			'Fish of water that is part fresh and part salt, where rivers meet the sea in estuaries and mangroves. Many move between rivers and the sea.',
	},
	marine: {
		title: 'Saltwater fish',
		description:
			"Fish of the sea, from coral reefs and coasts to the open ocean. Malaysia's seas include the Strait of Malacca and the South China, Sulu and Celebes Seas.",
	},
};

const USE_TEXT: Record<Use, PageText> = {
	sport: {
		title: 'Sport fish',
		description:
			'Fish that anglers go after for the fight, from snakeheads in rivers to sailfish at sea. Many anglers release what they catch.',
	},
	food: {
		title: 'Food fish',
		description:
			'Fish caught or farmed to eat, from wet-market staples such as mackerel and pomfret to prized river fish.',
	},
	aquarium: {
		title: 'Aquarium fish',
		description:
			'Fish kept in home aquariums, from tiny rasboras and tetras to large arowanas. Malaysia breeds many aquarium fish for sale overseas.',
	},
};

const HABITAT_TEXT: Record<Environment, PageText> = {
	'forest-river': {
		title: 'Forest river fish',
		description:
			'Fish of clear, fast streams under rainforest, often over rocks and gravel. They need clean, shaded water and suffer when forests are cleared.',
	},
	'lowland-river': {
		title: 'Lowland river fish',
		description:
			'Fish of the slow, wide rivers that wind across the plains towards the sea, often with muddy water and soft banks.',
	},
	lake: {
		title: 'Lake fish',
		description:
			'Fish of natural lakes and ponds, where the water is still or slow. Many lake fish also do well in reservoirs.',
	},
	reservoir: {
		title: 'Reservoir fish',
		description:
			'Fish of the lakes made by dams, such as Kenyir in Terengganu and Temenggor in Perak. Many anglers fish them from boats.',
	},
	'peat-swamp': {
		title: 'Peat swamp fish',
		description:
			'Fish of dark, acidic water in swamp forests on deep peat. Many live nowhere else, so they suffer when swamps are drained.',
	},
	'rice-field': {
		title: 'Rice field and canal fish',
		description:
			'Fish of rice fields, irrigation canals and ditches, where the water is shallow and warm. Hardy fish such as snakeheads do well here.',
	},
	mangrove: {
		title: 'Mangrove fish',
		description:
			'Mangroves are coastal forests that flood with each tide. Their roots shelter young fish, which is why many sea fish start life here.',
	},
	estuary: {
		title: 'Estuary fish',
		description:
			'Fish of river mouths, where fresh water mixes with the sea and the saltiness changes with the tide.',
	},
	coastal: {
		title: 'Coastal fish',
		description:
			'Fish of the shallow sea near the shore, over sand, mud and seagrass. Many of the sea fish sold in wet markets are caught here.',
	},
	reef: {
		title: 'Reef fish',
		description:
			"Fish of coral and rocky reefs, among the most colourful in the sea. Malaysia's reefs are mostly around Sabah and the islands off the east coast.",
	},
	offshore: {
		title: 'Open ocean fish',
		description:
			'Fish of the open sea far from shore, such as tuna, marlin and sailfish. Many are fast swimmers that travel long distances.',
	},
};

const STATE_DESCRIPTION: Record<State, string> = {
	Johor:
		'The southern tip of the peninsula, with coasts on both the Strait of Malacca and the South China Sea, and peat swamps inland.',
	Kedah:
		'A state in the northwest of the peninsula, known for its rice fields, with a coast on the Strait of Malacca and the islands of Langkawi.',
	Kelantan:
		'A state in the northeast of the peninsula, drained by the Kelantan River and its forest streams, with a coast on the South China Sea.',
	Melaka:
		'A small state on the Strait of Malacca, with mudflats and mangroves along its coast and the Melaka River running through it.',
	'Negeri Sembilan':
		'A state on the Strait of Malacca between Selangor and Melaka, with hill streams inland and the coast at Port Dickson.',
	Pahang:
		'The largest state on the peninsula, with the long Pahang River, Lake Chini and Lake Bera, and a coast on the South China Sea.',
	Perak:
		'A state on the west of the peninsula, drained by the Perak River, with large reservoirs such as Temenggor and old tin-mining pools.',
	Perlis: "Malaysia's smallest state, in the far northwest by the Thai border, with rice fields and a short coast.",
	'Pulau Pinang':
		'Penang Island and a strip of mainland in the northwest of the peninsula, facing the Strait of Malacca.',
	Sabah:
		'The north of Borneo, with coral reefs, the Kinabatangan River and three seas: the South China Sea, the Sulu Sea and the Celebes Sea.',
	Sarawak:
		"Malaysia's largest state, in northwest Borneo, with the long Rajang River, wide peat swamps and a long South China Sea coast.",
	Selangor:
		'The state around Kuala Lumpur, on the Strait of Malacca, with mangrove coasts, peat swamps and old mining pools.',
	Terengganu:
		'A state on the east coast of the peninsula, with Kenyir Lake, island reefs such as Redang and a long South China Sea coast.',
	'Kuala Lumpur': "Malaysia's capital, a federal territory where the Klang and Gombak rivers meet.",
	// Labuan and Putrajaya have no fish yet. Their pages appear, complete, once one is recorded there.
	Labuan: 'A federal territory of islands off the coast of Sabah, in the South China Sea.',
	Putrajaya: "The federal government's city, a federal territory built around a large man-made lake and wetlands.",
};

/** Every category page, in the order they're listed. Only pages with fish are built: see categoriesWithFish. */
export const CATEGORIES: readonly Category[] = [
	...WATER.map(
		(water): Category => ({
			group: 'water',
			path: waterPath(water),
			name: WATER_LABEL[water],
			...WATER_TEXT[water],
			includes: (fish) => fish.water.includes(water),
		}),
	),
	...USES.map(
		(use): Category => ({
			group: 'use',
			path: usePath(use),
			name: USE_LABEL[use],
			...USE_TEXT[use],
			includes: (fish) => fish.uses.includes(use),
		}),
	),
	...ENVIRONMENTS.map(
		(environment): Category => ({
			group: 'habitat',
			path: habitatPath(environment),
			name: ENVIRONMENT_LABEL[environment],
			...HABITAT_TEXT[environment],
			includes: (fish) => fish.habitat?.environments.includes(environment) ?? false,
		}),
	),
	...STATES.map(
		(state): Category => ({
			group: 'state',
			path: statePath(state),
			name: state,
			title: `Fish in ${state}`,
			description: STATE_DESCRIPTION[state],
			includes: (fish) => fish.malaysia?.states?.some((record) => record.state === state) ?? false,
		}),
	),
	{
		group: 'conservation',
		path: THREATENED_PATH,
		name: 'Threatened',
		title: 'Threatened fish',
		description:
			'Fish the IUCN Red List rates as Vulnerable, Endangered or Critically Endangered, so at risk of dying out in the wild. The ratings are worldwide.',
		includes: (fish) => fish.iucn !== undefined && iucnPath(fish.iucn) !== undefined,
	},
	{
		group: 'conservation',
		path: INTRODUCED_PATH,
		name: 'Introduced and invasive',
		title: 'Introduced and invasive fish in Malaysia',
		description:
			'Fish that people brought to Malaysia. Introduced fish live here; invasive ones spread and harm local fish. The same fish can be native in its home range.',
		includes: (fish) => fish.malaysia !== undefined && statusPath(fish.malaysia.status) !== undefined,
	},
];

/** The fish on a category page, A–Z by English name, like the home page. */
export function fishIn<T extends { data: Fish }>(category: Category, fish: readonly T[]): T[] {
	return fish
		.filter((entry) => category.includes(entry.data))
		.sort((a, b) => a.data.names.english.localeCompare(b.data.names.english));
}

/** The category pages to build: every one with at least one fish, in the order of CATEGORIES. */
export function categoriesWithFish(fish: readonly { data: Fish }[]): Category[] {
	return CATEGORIES.filter((category) => fish.some((entry) => category.includes(entry.data)));
}

export interface CategoryLink {
	path: string;
	name: string;
	/** How many fish the page lists. */
	count: number;
}

/** A link to each page in a group that has fish, with its count. */
export function groupLinks(group: CategoryGroup, fish: readonly { data: Fish }[]): CategoryLink[] {
	return categoriesWithFish(fish)
		.filter((category) => category.group === group)
		.map((category) => ({ path: category.path, name: category.name, count: fishIn(category, fish).length }));
}
