import { THREATENED } from './filter';
import type { Fish } from './fish-schema';
import { formatRange } from './format';
import { IUCN_LABEL, STATUS_SHORT_LABEL, TEMPERAMENT_LABEL } from './labels';

export interface StatTile {
	value: string;
	label: string;
	/** Shown in the alert colour, e.g. a threatened IUCN category. */
	alert?: true;
}

/** The quick-stats row under a fish's summary, in page order. */
export function quickStats(fish: Fish): StatTile[] {
	const tiles: StatTile[] = [];
	if (fish.size) {
		const usually = fish.size.commonCm ? ` · usually ${fish.size.commonCm} cm` : '';
		tiles.push({ value: `${fish.size.maxCm} cm`, label: `max length${usually}` });
		if (fish.size.maxKg) tiles.push({ value: `${fish.size.maxKg} kg`, label: 'max weight' });
	}
	if (fish.iucn) {
		tiles.push({
			value: fish.iucn,
			label: IUCN_LABEL[fish.iucn],
			...(THREATENED.includes(fish.iucn) ? { alert: true as const } : {}),
		});
	}
	if (fish.malaysia) tiles.push({ value: STATUS_SHORT_LABEL[fish.malaysia.status], label: 'in Malaysia' });
	const order = fish.taxonomy.order ? ` · order ${fish.taxonomy.order}` : '';
	tiles.push({ value: fish.taxonomy.family, label: `family${order}` });
	return tiles;
}

export function aquariumStats(aquarium: NonNullable<Fish['aquarium']>): StatTile[] {
	const tiles: StatTile[] = [
		{ value: `${aquarium.minTankLitres} L`, label: 'minimum tank' },
		{ value: formatRange(aquarium.tempC, '°C'), label: 'temperature' },
		{ value: formatRange(aquarium.ph, ''), label: 'pH' },
		{ value: TEMPERAMENT_LABEL[aquarium.temperament], label: 'temperament' },
	];
	if (aquarium.groupSize) tiles.push({ value: `${aquarium.groupSize}+`, label: 'group size' });
	return tiles;
}
