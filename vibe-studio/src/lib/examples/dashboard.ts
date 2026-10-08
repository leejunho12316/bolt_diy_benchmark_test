export const DASHBOARD_SITES = ['A현장', 'B현장', 'C현장'] as const;

export type DashboardSite = (typeof DASHBOARD_SITES)[number];
export type SiteFilter = DashboardSite | 'all';

const SITE_DATA: Record<DashboardSite, { months: number[]; progress: number; openContracts: number; partners: number }> = {
	A현장: { months: [5.2, 6.8, 6.1, 8.4, 7.9, 10.2], progress: 62, openContracts: 2, partners: 34 },
	B현장: { months: [3.1, 3.9, 4.4, 5.0, 5.6, 6.3], progress: 41, openContracts: 3, partners: 29 },
	C현장: { months: [2.0, 2.4, 3.1, 2.8, 3.5, 4.1], progress: 28, openContracts: 1, partners: 24 }
};

/** First month in SITE_DATA.months. */
const FIRST_MONTH = 5;

/** Days without contact after which a client is flagged. */
export const LATE_DAYS = 14;

export interface Client {
	id: number;
	name: string;
	site: DashboardSite;
	kind: string;
	days: number;
}

export const INITIAL_CLIENTS: Client[] = [
	{ id: 1, name: '○○건설', site: 'A현장', kind: '골조 협력사', days: 0 },
	{ id: 2, name: '△△전기', site: 'B현장', kind: '전기 협력사', days: 1 },
	{ id: 3, name: '□□설비', site: 'A현장', kind: '설비 협력사', days: 3 },
	{ id: 4, name: '◇◇자재', site: 'C현장', kind: '자재 공급사', days: 16 },
	{ id: 5, name: '☆☆기초', site: 'B현장', kind: '토목 협력사', days: 21 },
	{ id: 6, name: '◎◎도장', site: 'C현장', kind: '마감 협력사', days: 5 }
];

export interface MonthBar {
	label: string;
	/** 억 원 */
	value: number;
	/** Bar height relative to the largest month, 0–100. */
	percent: number;
}

export interface DashboardSummary {
	thisMonth: number;
	monthDelta: number;
	progress: number;
	openContracts: number;
	partners: number;
	siteCount: number;
	months: MonthBar[];
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function summarize(filter: SiteFilter): DashboardSummary {
	const sites = filter === 'all' ? [...DASHBOARD_SITES] : [filter];
	const data = sites.map((s) => SITE_DATA[s]);
	const totals = data[0].months.map((_, i) => round1(data.reduce((sum, d) => sum + d.months[i], 0)));
	const max = Math.max(...totals);

	return {
		thisMonth: totals[totals.length - 1],
		monthDelta: round1(totals[totals.length - 1] - totals[totals.length - 2]),
		progress: Math.round(data.reduce((sum, d) => sum + d.progress, 0) / data.length),
		openContracts: data.reduce((sum, d) => sum + d.openContracts, 0),
		partners: data.reduce((sum, d) => sum + d.partners, 0),
		siteCount: sites.length,
		months: totals.map((value, i) => ({ label: `${FIRST_MONTH + i}월`, value, percent: Math.round((value / max) * 100) }))
	};
}

export function contactLabel(days: number) {
	return days === 0 ? '오늘' : days === 1 ? '어제' : `${days}일 전`;
}
