// Usage: pnpm import-data [fish-id …] (no ids = every fish).
import { readdir, readFile, rename, writeFile } from 'node:fs/promises';
import { fishSchema } from '../src/lib/fish-schema.ts';
import { enrichFish } from './lib/open-data.ts';

const dataDir = new URL('../data/fish/', import.meta.url);
const ids = new Set(process.argv.slice(2));
const files = (await readdir(dataDir)).filter((file) => file.endsWith('.json') && (!ids.size || ids.has(file.slice(0, -5)))).sort();
const unknown = [...ids].filter((id) => !files.includes(`${id}.json`));
if (unknown.length) throw new Error(`No data file for: ${unknown.join(', ')}`);

for (const file of files) {
	try {
		const url = new URL(file, dataDir);
		const fish = fishSchema.parse(JSON.parse(await readFile(url, 'utf8')));
		console.log(`${file.slice(0, -5)} — ${fish.names.scientific}`);
		const out = await enrichFish(fish);
		if (out) {
			fishSchema.parse(out);
			const temporary = new URL(`${file}.tmp`, dataDir);
			await writeFile(temporary, `${JSON.stringify(out, null, 2)}\n`);
			await rename(temporary, url);
		}
	} catch (error) {
		console.error(`  ! ${file}: ${error}`);
		process.exitCode = 1;
	}
	await new Promise((resolve) => setTimeout(resolve, 500));
}
