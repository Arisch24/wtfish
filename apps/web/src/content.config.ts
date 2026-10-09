import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

const fish = defineCollection({
	loader: file('data/fish.json'),
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
