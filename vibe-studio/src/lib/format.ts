const rtf = new Intl.RelativeTimeFormat('ko', { numeric: 'auto' });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
	['year', 365 * 24 * 60 * 60 * 1000],
	['month', 30 * 24 * 60 * 60 * 1000],
	['week', 7 * 24 * 60 * 60 * 1000],
	['day', 24 * 60 * 60 * 1000],
	['hour', 60 * 60 * 1000],
	['minute', 60 * 1000]
];

/** e.g. "3시간 전", "어제", "방금" */
export function relativeTime(timestamp: number, now = Date.now()) {
	const diff = timestamp - now;

	for (const [unit, ms] of UNITS) {
		if (Math.abs(diff) >= ms) {
			// Truncate so 59.6 minutes reads "59분 전", never "60분 전".
			return rtf.format(Math.trunc(diff / ms), unit);
		}
	}

	return '방금';
}
