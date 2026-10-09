import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const fish = defineCollection({
	loader: glob({ pattern: '*.json', base: './data/fish' }),
	schema: z.object({
		commonName: z.string(),
		scientificName: z.string(),
		family: z.string(),
		category: z.enum(['aquarium', 'game']),
		water: z.enum(['freshwater', 'saltwater', 'brackish', 'migratory']),
		maxLengthCm: z.number().positive(),
		summary: z.string(),
	}),
});

export const collections = { fish };
