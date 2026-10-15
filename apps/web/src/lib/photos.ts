import type { ImageMetadata } from 'astro';
import { makePhotoLookup } from './photo-lookup';

// Eager imports let Astro resize every photo with sharp at build time.
const modules = import.meta.glob<ImageMetadata>('/data/photos/*/*.{jpg,jpeg,png,webp}', {
	eager: true,
	import: 'default',
});

export const photoFor = makePhotoLookup(modules);
