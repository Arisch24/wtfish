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
	/** Shows the label as written instead of in capitals, for a label such as "pH" whose case carries meaning. */
	keepCase?: true;
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
		{ label: 'pH', value: formatRange(aquarium.ph, ''), keepCase: true },
		{ label: 'Temperament', value: TEMPERAMENT_LABEL[aquarium.temperament] },
	];
	if (aquarium.groupSize) tiles.push({ label: 'Group size', value: `${aquarium.groupSize}+` });
	return tiles;
}

export type SectionId =
	| 'how-big'
	| 'where'
	| 'identify'
	| 'habitat'
	| 'before-you-fish'
	| 'catching'
	| 'eating'
	| 'aquarium'
	| 'photos'
	| 'sources';

/** The fish page's sections, in order, grouped into rows of one or two. */
const ROWS: SectionId[][] = [
	['how-big', 'where'],
	['identify', 'habitat'],
	['before-you-fish'],
	['catching', 'eating'],
	['aquarium'],
	['photos'],
	['sources'],
];

function hasSection(fish: Fish, id: SectionId): boolean {
	switch (id) {
		case 'how-big':
			return Boolean(fish.size);
		case 'where':
			return Boolean(fish.malaysia?.states?.length || fish.malaysia?.spots?.length);
		case 'identify':
			return Boolean(fish.identify);
		case 'habitat':
			return Boolean(fish.habitat || fish.nativeRange);
		case 'before-you-fish':
			return Boolean(fish.malaysia?.rules);
		case 'catching': {
			const fishing = fish.fishing;
			return Boolean(fishing && (fishing.season || fishing.methods?.length || fishing.baits?.length || fishing.difficulty));
		}
		case 'eating':
			return Boolean(fish.eating);
		case 'aquarium':
			return Boolean(fish.aquarium);
		case 'photos':
			// The first photo is in the header, so "More photos" needs a second one.
			return (fish.photos?.length ?? 0) > 1;
		case 'sources':
			// Always shown: it says so when a profile has not been fact-checked.
			return true;
	}
}

/** The fish page's sections in rows of one or two, leaving out sections without data. */
export function sectionRows(fish: Fish): SectionId[][] {
	return ROWS.map((row) => row.filter((id) => hasSection(fish, id))).filter((row) => row.length > 0);
}
