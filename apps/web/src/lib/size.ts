export interface TapeTick {
	cm: number;
	label: string;
	/** 0–1 along the tape. */
	position: number;
}

export const PERSON_CM = 170;
export const HAND_CM = 18;

/** Below this length a fish is compared with a hand instead of a person. */
const PERSON_FROM_CM = 50;
const CARD_TAPE_MAX_CM = 500;

/** [scale maximum, tick step] in cm, smallest first. */
const SCALES: [number, number][] = [
	[10, 2],
	[20, 5],
	[50, 10],
	[100, 20],
	[200, 50],
	[300, 100],
	[400, 100],
	[500, 100],
	[600, 100],
	[800, 200],
	[1000, 200],
];

export function lengthLabel(cm: number): string {
	if (cm === 0) return '0';
	return cm < 100 ? `${cm} cm` : `${cm / 100} m`;
}

/** Where a length sits on the card tape: a log scale from 1 cm (0) to 5 m (1). */
export function cardTapePosition(cm: number): number {
	const position = Math.log10(cm) / Math.log10(CARD_TAPE_MAX_CM);
	return Math.min(1, Math.max(0, position));
}

export const CARD_TAPE_TICKS: TapeTick[] = [1, 10, 100, 500].map((cm) => ({
	cm,
	label: lengthLabel(cm),
	position: cardTapePosition(cm),
}));

export interface SizeComparison {
	reference: 'person' | 'hand';
	referenceCm: number;
	scaleMaxCm: number;
	stepCm: number;
	ticks: TapeTick[];
}

/** The linear scale and reference figure for a fish page's "How big?" section. */
export function sizeComparison(maxCm: number): SizeComparison {
	const reference = maxCm >= PERSON_FROM_CM ? 'person' : 'hand';
	const referenceCm = reference === 'person' ? PERSON_CM : HAND_CM;
	const needed = Math.max(maxCm, referenceCm);
	const [scaleMaxCm, stepCm] = SCALES.find(([max]) => max >= needed) ?? [Math.ceil(needed / 500) * 500, 500];
	const ticks: TapeTick[] = [];
	for (let cm = 0; cm <= scaleMaxCm; cm += stepCm) {
		ticks.push({ cm, label: lengthLabel(cm), position: cm / scaleMaxCm });
	}
	return { reference, referenceCm, scaleMaxCm, stepCm, ticks };
}
