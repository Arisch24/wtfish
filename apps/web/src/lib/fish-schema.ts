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
			/** Malay and regional variants. Kept for a future multilingual site; never shown or searched. */
			malayOther: z.array(text).optional(),
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
