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
			const key = String(raw.names?.scientific).trim().toLowerCase();
			expect(seen.get(key), `${id} has the same scientific name as ${seen.get(key)}`).toBeUndefined();
			seen.set(key, id);
		}
	});
});
