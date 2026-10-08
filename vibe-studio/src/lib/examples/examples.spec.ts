import { describe, expect, it } from 'vitest';
import { EXAMPLES, findExample } from './catalog.ts';
import { answerQuestion } from './chatbot.ts';
import { MATERIAL_ROWS, queryMaterials } from './excel.ts';
import { summarize } from './dashboard.ts';

describe('findExample', () => {
	it('finds every catalogued example by slug', () => {
		for (const example of EXAMPLES) {
			expect(findExample(example.slug)).toBe(example);
		}
	});

	it('returns undefined for an unknown slug', () => {
		expect(findExample('nope')).toBeUndefined();
	});
});

describe('answerQuestion', () => {
	it('answers from the matching document', () => {
		const answer = answerQuestion('이번 주 타설 일정 알려줘');
		expect(answer.text).toContain('10월 8일');
		expect(answer.sources).toEqual(['공정표_10월.xlsx', '작업일보_1006.pdf']);
	});

	it('matches the first topic in knowledge order', () => {
		expect(answerQuestion('오늘 출역 인원은?').sources).toEqual(['작업일보_1006.pdf']);
		expect(answerQuestion('철근 검측 언제야?').sources).toEqual(['시방서_골조.pdf', '공정표_10월.xlsx']);
	});

	it('falls back without sources when nothing matches', () => {
		const answer = answerQuestion('점심 메뉴 뭐야');
		expect(answer.sources).toEqual([]);
		expect(answer.text).toContain('찾지 못했어요');
	});
});

describe('queryMaterials', () => {
	it('groups one material by site, largest first', () => {
		const answer = queryMaterials('현장별 철근 사용량 합계는?');
		expect(answer.bars.map((b) => [b.label, b.value, b.unit])).toEqual([
			['A현장', 42, '톤'],
			['B현장', 27, '톤'],
			['C현장', 18, '톤']
		]);
		expect(answer.bars[0].percent).toBe(100);
		expect(answer.summary).toContain('A현장이 철근을 가장 많이');
		expect(answer.sql).toContain("WHERE 자재 = '철근'");
		expect(answer.rows.every((r) => r.material === '철근')).toBe(true);
	});

	it('groups one site by material with each material unit', () => {
		const answer = queryMaterials('A현장 자재별 사용량');
		expect(answer.bars.map((b) => [b.label, b.value, b.unit])).toEqual([
			['레미콘', 310, '㎥'],
			['거푸집', 60, '장'],
			['철근', 42, '톤']
		]);
		expect(answer.sql).toContain("WHERE 현장 = 'A현장'");
	});

	it('accepts a space between the site letter and 현장', () => {
		expect(queryMaterials('B 현장 철근은 얼마나 썼어?').summary).toBe('B현장의 철근 사용량은 모두 27톤이에요.');
	});

	it('uses every row when the question names neither', () => {
		const answer = queryMaterials('전부 보여줘');
		expect(answer.rows).toHaveLength(MATERIAL_ROWS.length);
		expect(answer.summary).toBe('전체 현장에서 자재별 사용량을 정리했어요.');
	});
});

describe('summarize', () => {
	it('adds up all sites', () => {
		const all = summarize('all');
		expect(all.siteCount).toBe(3);
		expect(all.thisMonth).toBe(20.6);
		expect(all.monthDelta).toBe(3.6);
		expect(all.progress).toBe(44);
		expect(all.openContracts).toBe(6);
		expect(all.partners).toBe(87);
		expect(all.months.map((m) => m.label)).toEqual(['5월', '6월', '7월', '8월', '9월', '10월']);
		expect(all.months[5].percent).toBe(100);
	});

	it('narrows to one site', () => {
		const c = summarize('C현장');
		expect(c.siteCount).toBe(1);
		expect(c.thisMonth).toBe(4.1);
		expect(c.progress).toBe(28);
		expect(c.partners).toBe(24);
	});
});
