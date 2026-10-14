import { describe, expect, it } from 'vitest';
import type { Fish } from '../src/lib/fish-schema';
import { aquariumStats, quickStats } from '../src/lib/fish-page';

const base: Fish = {
	names: { english: 'Indo-Pacific sailfish', scientific: 'Istiophorus platypterus' },
	taxonomy: { family: 'Istiophoridae' },
	water: ['marine'],
	uses: ['sport'],
	summary: 'A billfish.',
};

describe('quickStats', () => {
	it('gives only the family tile a row of its own', () => {
		const tiles = quickStats({ ...base, iucn: 'VU', size: { maxCm: 350, maxKg: 100 }, malaysia: { status: 'native' } });
		expect(tiles.filter((tile) => tile.wide).map((tile) => tile.label)).toEqual(['family']);
	});

	it('lists length, weight, IUCN, status and family in that order', () => {
		const sailfish: Fish = {
			...base,
			taxonomy: { family: 'Istiophoridae', order: 'Perciformes' },
			iucn: 'VU',
			size: { maxCm: 350, maxKg: 100 },
			malaysia: { status: 'native' },
		};
		expect(quickStats(sailfish)).toEqual([
			{ value: '350 cm', label: 'max length' },
			{ value: '100 kg', label: 'max weight' },
			{ value: 'VU', label: 'Vulnerable', alert: true },
			{ value: 'Native', label: 'in Malaysia' },
			{ value: 'Istiophoridae', label: 'family · order Perciformes', wide: true },
		]);
	});

	it('adds the usual length to the length label', () => {
		expect(quickStats({ ...base, size: { maxCm: 100, commonCm: 60 } })[0]).toEqual({
			value: '100 cm',
			label: 'max length · usually 60 cm',
		});
	});

	it('only marks threatened categories', () => {
		const tiles = quickStats({ ...base, iucn: 'LC' });
		expect(tiles[0]).toEqual({ value: 'LC', label: 'Least Concern' });
	});

	it('shows just the family for a minimal fish', () => {
		expect(quickStats(base)).toEqual([{ value: 'Istiophoridae', label: 'family', wide: true }]);
	});
});

describe('aquariumStats', () => {
	it('lists tank, temperature, pH, temperament and group size', () => {
		expect(
			aquariumStats({ minTankLitres: 60, tempC: [24, 28], ph: [6, 7.5], temperament: 'peaceful', groupSize: 6 }),
		).toEqual([
			{ value: '60 L', label: 'minimum tank' },
			{ value: '24–28°C', label: 'temperature' },
			{ value: '6–7.5', label: 'pH' },
			{ value: 'Peaceful', label: 'temperament' },
			{ value: '6+', label: 'group size' },
		]);
	});

	it('leaves out the group size when unknown', () => {
		expect(aquariumStats({ minTankLitres: 200, tempC: [26, 26], ph: [7, 7], temperament: 'aggressive' })).toHaveLength(4);
	});
});
