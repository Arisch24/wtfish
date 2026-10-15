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
			{ quality_grade: 'research', taxon: { name: 'Lates calcarifer' }, photos: [photo(1, 'cc-by'), photo(2, 'cc-by-nc')] },
			{ quality_grade: 'research', taxon: { name: 'Lates calcarifer calcarifer' }, photos: [photo(3, 'cc0')] },
			{ quality_grade: 'research', taxon: { name: 'Lates japonicus' }, photos: [photo(4, 'cc-by')] },
			{ quality_grade: 'research', taxon: null, photos: [photo(5, 'cc-by')] },
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

describe('research grade validation', () => {
	it('rejects casual and needs-identification observations even when API filtering fails', () => {
		const observation = { quality_grade: 'research', taxon: { name: 'Lates calcarifer' }, photos: [{ id: 1, license_code: 'cc-by', attribution: 'Person', url: 'https://static.inaturalist.org/photos/1/square.jpg' }] };
		expect(photosFromObservations([{ ...observation, quality_grade: 'casual' }], 'Lates calcarifer')).toEqual([]);
		expect(photosFromObservations([{ ...observation, quality_grade: 'research' }], 'Lates calcarifer')).toHaveLength(1);
	});
	it('returns none for negative counts', () => {
		expect(pickNew([{ id: 1, license: 'CC0', attribution: 'a', url: 'u' }], [], -1)).toEqual([]);
	});
});

it('prioritises Malaysian licensed observations and still searches globally after a regional outage', async () => {
	const { searchPhotos } = await import('../scripts/lib/photos');
	const calls: URL[] = [];
	const fetcher = async (input: string | URL | Request, init?: RequestInit) => {
		const url = new URL(String(input));
		calls.push(url);
		expect(init?.headers).toMatchObject({ 'User-Agent': 'wtfish-data-import/0.1' });
		expect(url.searchParams.get('quality_grade')).toBe('research');
		expect(url.searchParams.get('photo_license')).toBe('cc0,cc-by,cc-by-sa');
		if (url.searchParams.has('place_id')) throw new Error('regional search failed');
		return Response.json({ results: [{ quality_grade: 'research', taxon: { name: 'Lates calcarifer' }, photos: [{ id: 1, license_code: 'cc0', attribution: 'Person', url: 'https://static.inaturalist.org/photos/1/square.jpg' }] }] });
	};
	expect((await searchPhotos('Lates calcarifer', fetcher, () => {})).map((photo) => photo.id)).toEqual([1]);
	expect(calls[0].searchParams.get('place_id')).toBe('7155');
	expect(calls[1].searchParams.has('place_id')).toBe(false);
});

it('rejects hybrids and arbitrary appended names while retaining genuine subspecies', () => {
	const p = { id: 1, license_code: 'cc0', attribution: 'Person', url: 'https://static.inaturalist.org/photos/1/square.jpg' };
	for (const name of ['Lates calcarifer x Lates japonicus', 'Lates calcarifer × Lates japonicus', 'Lates calcarifer hybrid', 'Lates calcarifer specimen unknown']) {
		expect(photosFromObservations([{ quality_grade: 'research', taxon: { name }, photos: [p] }], 'Lates calcarifer')).toEqual([]);
	}
});

it('deduplicates existing PNG downloads by photo ID', () => {
	expect(photoFileName(42, 'png')).toBe('inat-42.png');
	expect(pickNew([{ id: 42, license: 'CC0', attribution: 'Person', url: 'u' }], ['inat-42.png'], 1)).toEqual([]);
});
