import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { fishSchema } from './lib/fish-schema';

const fish = defineCollection({
	loader: glob({ pattern: '*.json', base: './data/fish' }),
	schema: fishSchema,
});

export const collections = { fish };
