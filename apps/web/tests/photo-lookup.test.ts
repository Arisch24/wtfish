import { describe, expect, it } from 'vitest';
import { makePhotoLookup } from '../src/lib/photo-lookup';

const photoFor = makePhotoLookup({
	'/data/photos/guppy/inat-1.jpg': 'GUPPY-1',
	'/data/photos/betta/inat-2.png': 'BETTA-2',
});

describe('makePhotoLookup', () => {
	it('finds a photo by fish id and file name', () => {
		expect(photoFor('guppy', 'inat-1.jpg')).toBe('GUPPY-1');
		expect(photoFor('betta', 'inat-2.png')).toBe('BETTA-2');
	});

	it('fails loudly, naming the file, when a photo is missing', () => {
		expect(() => photoFor('guppy', 'inat-9.jpg')).toThrow('data/photos/guppy/inat-9.jpg');
	});

	it('does not mix up fish that share a file name', () => {
		expect(() => photoFor('betta', 'inat-1.jpg')).toThrow('data/fish/betta.json');
	});
});
