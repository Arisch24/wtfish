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

export const USE_SHORT_LABEL: Record<Use, string> = {
	sport: 'Sport',
	food: 'Food',
	aquarium: 'Aquarium',
};

/** Text for a fish's cardboard tag, e.g. "Sport · Food". */
export function useTagText(uses: readonly Use[]): string {
	return uses.map((use) => USE_SHORT_LABEL[use]).join(' · ');
}

export const STATUS_BADGE: Record<MalaysiaStatus, string> = {
	native: 'Native to Malaysia',
	endemic: 'Endemic to Malaysia',
	introduced: 'Introduced to Malaysia',
	invasive: 'Invasive in Malaysia',
};

export const STATUS_SHORT_LABEL: Record<MalaysiaStatus, string> = {
	native: 'Native',
	endemic: 'Endemic',
	introduced: 'Introduced',
	invasive: 'Invasive',
};
