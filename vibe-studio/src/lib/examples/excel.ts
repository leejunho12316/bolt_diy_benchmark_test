export interface MaterialRow {
	date: string;
	site: string;
	material: string;
	qty: number;
	unit: string;
}

const row = (date: string, site: string, material: string, qty: number, unit: string): MaterialRow => ({
	date,
	site,
	material,
	qty,
	unit
});

export const MATERIAL_ROWS: MaterialRow[] = [
	row('10-01', 'A현장', '철근', 18, '톤'),
	row('10-01', 'B현장', '레미콘', 140, '㎥'),
	row('10-02', 'A현장', '레미콘', 180, '㎥'),
	row('10-02', 'C현장', '철근', 10, '톤'),
	row('10-03', 'B현장', '철근', 15, '톤'),
	row('10-03', 'A현장', '거푸집', 60, '장'),
	row('10-04', 'C현장', '레미콘', 90, '㎥'),
	row('10-04', 'A현장', '철근', 24, '톤'),
	row('10-05', 'B현장', '거푸집', 120, '장'),
	row('10-05', 'C현장', '철근', 8, '톤'),
	row('10-06', 'B현장', '철근', 12, '톤'),
	row('10-06', 'A현장', '레미콘', 130, '㎥')
];

export const EXCEL_SUGGESTIONS = ['현장별 철근 사용량 합계는?', 'A현장 자재별 사용량', 'B현장 철근은 얼마나 썼어?', '레미콘 현장별 합계'];

const MATERIALS = ['철근', '레미콘', '거푸집'];
const SITES = ['A현장', 'B현장', 'C현장'];

export interface MaterialBar {
	label: string;
	value: number;
	unit: string;
	/** Bar length relative to the largest group, 0–100. */
	percent: number;
}

export interface MaterialAnswer {
	question: string;
	summary: string;
	sql: string;
	bars: MaterialBar[];
	/** Rows that were read to answer the question. */
	rows: MaterialRow[];
}

const unitOf = (material: string) => MATERIAL_ROWS.find((r) => r.material === material)?.unit ?? '';

/** Picks a material and/or site out of the question and aggregates the sheet the way the generated SQL would. */
export function queryMaterials(question: string): MaterialAnswer {
	const material = MATERIALS.find((m) => question.includes(m));
	// "A 현장" with a space counts too.
	const site = SITES.find((s) => question.includes(s) || question.includes(`${s[0]} 현장`));

	const rows = MATERIAL_ROWS.filter((r) => (!material || r.material === material) && (!site || r.site === site));

	let key: 'site' | 'material' | 'date';
	let sql: string;

	if (material && !site) {
		key = 'site';
		sql = `SELECT 현장, SUM(수량)\nFROM 자재_입출고\nWHERE 자재 = '${material}'\nGROUP BY 현장;`;
	} else if (site && !material) {
		key = 'material';
		sql = `SELECT 자재, SUM(수량)\nFROM 자재_입출고\nWHERE 현장 = '${site}'\nGROUP BY 자재;`;
	} else if (site && material) {
		key = 'date';
		sql = `SELECT 일자, 수량\nFROM 자재_입출고\nWHERE 현장 = '${site}' AND 자재 = '${material}';`;
	} else {
		key = 'material';
		sql = 'SELECT 자재, SUM(수량)\nFROM 자재_입출고\nGROUP BY 자재;';
	}

	const totals = new Map<string, number>();
	for (const r of rows) {
		totals.set(r[key], (totals.get(r[key]) ?? 0) + r.qty);
	}

	const groups = [...totals].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
	const max = groups[0]?.value ?? 1;
	const unit = (label: string) => (material ? unitOf(material) : key === 'material' ? unitOf(label) : '');
	const sum = groups.reduce((total, g) => total + g.value, 0);

	let summary: string;
	if (groups.length === 0) {
		summary = '조건에 맞는 행이 없어요.';
	} else if (material && !site) {
		summary = `${groups[0].label}이 ${material}을 가장 많이 사용했어요 (${groups[0].value}${unit('')}). 전체 ${sum}${unit('')}.`;
	} else if (site && material) {
		summary = `${site}의 ${material} 사용량은 모두 ${sum}${unit('')}이에요.`;
	} else {
		summary = `${site ? `${site}에서` : '전체 현장에서'} 자재별 사용량을 정리했어요.`;
	}

	return {
		question,
		summary,
		sql,
		bars: groups.map((g) => ({ label: g.label, value: g.value, unit: unit(g.label), percent: Math.round((g.value / max) * 100) })),
		rows
	};
}
