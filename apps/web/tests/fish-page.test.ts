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
	it('gives only the family a row of its own', () => {
		const tiles = quickStats({ ...base, iucn: 'VU', size: { maxCm: 350, maxKg: 100 }, malaysia: { status: 'native' } });
		expect(tiles.filter((tile) => tile.wide).map((tile) => tile.label)).toEqual(['Family']);
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
			{ label: 'Max length', value: '350 cm' },
			{ label: 'Max weight', value: '100 kg' },
			{ label: 'IUCN', value: 'VU', note: 'Vulnerable', alert: true },
			{ label: 'In Malaysia', value: 'Native' },
			{ label: 'Family', value: 'Istiophoridae', note: 'order Perciformes', wide: true },
		]);
	});

	it('notes the usual length under the maximum', () => {
		expect(quickStats({ ...base, size: { maxCm: 100, commonCm: 60 } })[0]).toEqual({
			label: 'Max length',
			value: '100 cm',
			note: 'usually 60 cm',
		});
	});

	it('only marks threatened categories', () => {
		const tiles = quickStats({ ...base, iucn: 'LC' });
		expect(tiles[0]).toEqual({ label: 'IUCN', value: 'LC', note: 'Least Concern' });
	});

	it('shows just the family for a minimal fish', () => {
		expect(quickStats(base)).toEqual([{ label: 'Family', value: 'Istiophoridae', wide: true }]);
	});
});

describe('aquariumStats', () => {
	it('lists tank, temperature, pH, temperament and group size', () => {
		expect(
			aquariumStats({ minTankLitres: 60, tempC: [24, 28], ph: [6, 7.5], temperament: 'peaceful', groupSize: 6 }),
		).toEqual([
			{ label: 'Minimum tank', value: '60 L' },
			{ label: 'Temperature', value: '24–28°C' },
			{ label: 'pH', value: '6–7.5' },
			{ label: 'Temperament', value: 'Peaceful' },
			{ label: 'Group size', value: '6+' },
		]);
	});

	it('leaves out the group size when unknown', () => {
		expect(aquariumStats({ minTankLitres: 200, tempC: [26, 26], ph: [7, 7], temperament: 'aggressive' })).toHaveLength(4);
	});
});
