import type { PhotoLicense } from '../../src/lib/fish-schema.ts';

export interface InatPhoto {
	id: number;
	license: PhotoLicense;
	attribution: string;
	url: string;
}

export interface InatObservation {
	quality_grade?: string;
	taxon?: { name?: string; rank?: string } | null;
	photos?: { id: number; license_code: string | null; attribution: string; url: string }[];
}

export function toLicense(code: string | null | undefined): PhotoLicense | null {
	switch (code) {
		case 'cc0':
			return 'CC0';
		case 'cc-by':
			return 'CC BY';
		case 'cc-by-sa':
			return 'CC BY-SA';
		default:
			return null;
	}
}

export function photosFromObservations(observations: InatObservation[], scientific: string): InatPhoto[] {
	const photos: InatPhoto[] = [];
	for (const observation of observations) {
		if (observation.quality_grade !== 'research') continue;
		const name = observation.taxon?.name ?? '';
		const suffix = name.startsWith(`${scientific} `) ? name.slice(scientific.length + 1) : '';
		const subspecies = /^[a-z][a-z-]+$/.test(suffix) && !['x', 'hybrid', 'unknown'].includes(suffix)
			&& (!observation.taxon?.rank || observation.taxon.rank === 'subspecies');
		if (name !== scientific && !subspecies) continue;
		if (observation.taxon?.rank === 'hybrid') continue;
		for (const photo of observation.photos ?? []) {
			const license = toLicense(photo.license_code);
			if (license && Number.isSafeInteger(photo.id) && photo.id > 0 && photo.attribution?.trim() && /^https:\/\//.test(photo.url)) photos.push({ id: photo.id, license, attribution: photo.attribution, url: photo.url });
		}
	}
	return photos;
}

export function photoFileName(photoId: number, extension: 'jpg' | 'png' = 'jpg'): string {
	return `inat-${photoId}.${extension}`;
}

export function largeUrl(url: string): string {
	return url.replace(/\/square(\.\w+)/, '/large$1');
}

export function pickNew(photos: InatPhoto[], existingFiles: string[], count: number): InatPhoto[] {
	const seen = new Set(existingFiles.map((file) => file.replace(/\.(jpg|jpeg|png|webp)$/, '')));
	const picked: InatPhoto[] = [];
	for (const photo of photos) {
		if (picked.length >= count) break;
		const file = `inat-${photo.id}`;
		if (seen.has(file)) continue;
		seen.add(file);
		picked.push(photo);
	}
	return picked;
}

import { getJson, type Fetcher } from './http.ts';

/** Malaysian observations take priority; a regional lookup outage still permits global results. */
export async function searchPhotos(scientific: string, fetcher: Fetcher = fetch, warn: (message: string) => void = console.warn): Promise<InatPhoto[]> {
	const candidates: InatPhoto[] = [];
	for (const place of [7155, undefined]) {
		const params = new URLSearchParams({ taxon_name: scientific, photo_license: 'cc0,cc-by,cc-by-sa', quality_grade: 'research', order_by: 'votes', per_page: '30' });
		if (place) params.set('place_id', String(place));
		try {
			const result = await getJson<{ results: InatObservation[] }>(`https://api.inaturalist.org/v1/observations?${params}`, fetcher);
			candidates.push(...photosFromObservations(result.results, scientific));
		} catch (error) { warn(`  ! iNaturalist ${place ? 'Malaysia' : 'global'} search failed: ${error}`); }
	}
	return candidates;
}
