import { THREATENED } from './filter';
import type { Fish } from './fish-schema';
import { formatRange } from './format';
import { IUCN_LABEL, STATUS_SHORT_LABEL, TEMPERAMENT_LABEL } from './labels';

export interface StatTile {
	/** Short name shown above the value, e.g. "Max length". */
	label: string;
	value: string;
	/** Small text under the value, e.g. "usually 60 cm". */
	note?: string;
	/** Shown in the alert colour, e.g. a threatened IUCN category. */
	alert?: true;
	/** Takes a row of its own below 1024px, so a long value such as a family name never breaks mid-word. */
	wide?: true;
}

/** The stats strip under a fish's header, in page order. */
export function quickStats(fish: Fish): StatTile[] {
	const tiles: StatTile[] = [];
	if (fish.size) {
		tiles.push({
			label: 'Max length',
			value: `${fish.size.maxCm} cm`,
			...(fish.size.commonCm ? { note: `usually ${fish.size.commonCm} cm` } : {}),
		});
		if (fish.size.maxKg) tiles.push({ label: 'Max weight', value: `${fish.size.maxKg} kg` });
	}
	if (fish.iucn) {
		tiles.push({
			label: 'IUCN',
			value: fish.iucn,
			note: IUCN_LABEL[fish.iucn],
			...(THREATENED.includes(fish.iucn) ? { alert: true as const } : {}),
		});
	}
	if (fish.malaysia) tiles.push({ label: 'In Malaysia', value: STATUS_SHORT_LABEL[fish.malaysia.status] });
	tiles.push({
		label: 'Family',
		value: fish.taxonomy.family,
		...(fish.taxonomy.order ? { note: `order ${fish.taxonomy.order}` } : {}),
		wide: true,
	});
	return tiles;
}

export function aquariumStats(aquarium: NonNullable<Fish['aquarium']>): StatTile[] {
	const tiles: StatTile[] = [
		{ label: 'Minimum tank', value: `${aquarium.minTankLitres} L` },
		{ label: 'Temperature', value: formatRange(aquarium.tempC, '°C') },
		{ label: 'pH', value: formatRange(aquarium.ph, '') },
		{ label: 'Temperament', value: TEMPERAMENT_LABEL[aquarium.temperament] },
	];
	if (aquarium.groupSize) tiles.push({ label: 'Group size', value: `${aquarium.groupSize}+` });
	return tiles;
}
