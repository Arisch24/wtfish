// Usage: pnpm fetch-photos <fish-id> [total photos, default 3].
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { fishSchema } from '../src/lib/fish-schema.ts';
import { HEADERS } from './lib/http.ts';
import { largeUrl, photoFileName, pickNew, searchPhotos } from './lib/photos.ts';

const [id, totalArg = '3', ...extra] = process.argv.slice(2);
const total = Number(totalArg);
if (!id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || !Number.isSafeInteger(total) || total < 1 || extra.length) {
	throw new Error('Usage: pnpm fetch-photos <fish-id> [total photos, default 3]');
}
const dataUrl = new URL(`../data/fish/${id}.json`, import.meta.url);
const fish = fishSchema.parse(JSON.parse(await readFile(dataUrl, 'utf8')));
const photos = fish.photos ?? [];
if (photos.length >= total) {
	console.log(`${id}: already has ${photos.length} photo(s).`);
} else {
	const candidates = await searchPhotos(fish.names.scientific);
	const picked = pickNew(candidates, photos.map((photo) => photo.file), total - photos.length);
	if (!picked.length) console.log(`${id}: no new openly-licensed iNaturalist photos. Try Wikimedia Commons — see data/fish/README.md.`);
	const dir = new URL(`../public/photos/${id}/`, import.meta.url);
	if (picked.length) await mkdir(dir, { recursive: true });
	for (const photo of picked) {
		try {
			const response = await fetch(largeUrl(photo.url), { headers: HEADERS, signal: AbortSignal.timeout(30_000) });
			if (!response.ok) throw new Error(`Download failed (${response.status}) for photo ${photo.id}`);
			const bytes = Buffer.from(await response.arrayBuffer());
			// iNaturalist may return HTML errors with HTTP 200; never save those as photos.
			const jpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
			const png = bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
			if (!jpeg && !png) throw new Error(`Photo ${photo.id} is not a JPEG or PNG`);
			const file = photoFileName(photo.id, png ? 'png' : 'jpg');
			await writeFile(new URL(file, dir), bytes);
			photos.push({ file, credit: photo.attribution, license: photo.license, url: `https://www.inaturalist.org/photos/${photo.id}` });
			fish.photos = photos;
			fishSchema.parse(fish);
			// Persist each successful download so a later download failure doesn't orphan it.
			const temporary = new URL(`${id}.json.tmp`, new URL('../data/fish/', import.meta.url));
			await writeFile(temporary, `${JSON.stringify(fish, null, 2)}\n`);
			await rename(temporary, dataUrl);
			console.log(`${id}: saved ${file} (${photo.license}) — ${photo.attribution}`);
		} catch (error) {
			console.error(`  ! ${error}`);
			process.exitCode = 1;
		}
	}
	console.log(`${id}: now has ${photos.length} photo(s). Open each one and confirm it shows the right fish.`);
}
