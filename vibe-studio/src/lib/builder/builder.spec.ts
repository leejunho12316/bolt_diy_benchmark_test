import { describe, expect, it } from 'vitest';
import { describeBlock, groupRows, layoutToReference } from './prompt.ts';
import { BLOCK_TYPES, CATEGORIES, blockDef, defaultProps, pageFilePath, type Block, type BlockType, type Layout } from './types.ts';
import { parseLayout } from './validate.ts';

const block = (type: BlockType, overrides: Partial<Block> = {}, props: Record<string, unknown> = {}): Block =>
	({
		id: crypto.randomUUID(),
		type,
		x: 0,
		y: 0,
		w: 100,
		h: 40,
		...overrides,
		props: { ...defaultProps(type), ...props }
	}) as Block;

const layoutOf = (...pages: { id: string; path: string; blocks: Block[] }[]): Layout => ({
	frame: { width: 1280, height: 800 },
	pages
});

function sampleLayout(): Layout {
	return layoutOf(
		{
			id: 'home',
			path: '/',
			blocks: [
				block('button', { x: 560, y: 480 }, { label: '주문하기' }),
				block('route', { x: 1100, y: 24 }, { label: '원두 메뉴', targetPageId: 'menu' }),
				block('logo', { x: 32, y: 16 }, { text: '브루하우스' }),
				block('text', { x: 320, y: 360, w: 640 }, { content: '오늘의 커피', variant: 'heading' })
			]
		},
		{ id: 'menu', path: '/menu', blocks: [] }
	);
}

describe('block registry', () => {
	it('puts every block type in a known category with defaults for every field', () => {
		const categories = new Set(CATEGORIES.map((c) => c.id));

		for (const type of BLOCK_TYPES) {
			const def = blockDef(type);
			expect(categories.has(def.category), type).toBe(true);
			expect(Object.keys(defaultProps(type)), type).toEqual(def.fields.map((f) => f.key));

			if (def.primary) {
				expect(def.fields.some((f) => f.key === def.primary), type).toBe(true);
			}
		}
	});

	it('round-trips every block type through validation unchanged', () => {
		const blocks = BLOCK_TYPES.map((type) => block(type));
		const parsed = parseLayout(JSON.parse(JSON.stringify(layoutOf({ id: 'p', path: '/', blocks }))));
		expect(parsed.pages[0].blocks.map((b) => b.props)).toEqual(blocks.map((b) => b.props));
	});
});

describe('groupRows', () => {
	it('groups vertically overlapping blocks into rows, read left to right', () => {
		const rows = groupRows(sampleLayout().pages[0].blocks).map((row) => row.map((b) => b.type));
		expect(rows).toEqual([['logo', 'route'], ['text'], ['button']]);
	});

	it('keeps blocks that only touch vertically in separate rows', () => {
		const rows = groupRows([block('button', { y: 0, h: 40 }), block('button', { y: 40, h: 40 })]);
		expect(rows).toHaveLength(2);
	});
});

describe('pageFilePath', () => {
	it('maps routes to SvelteKit page files', () => {
		expect(pageFilePath('/')).toBe('src/routes/+page.svelte');
		expect(pageFilePath('/menu/latte')).toBe('src/routes/menu/latte/+page.svelte');
	});
});

describe('describeBlock', () => {
	const layout = sampleLayout();

	it('quotes the primary field and lists the other settings', () => {
		const cards = block('cards', {}, { subject: '원두 상품', count: 8, columns: 4 });
		expect(describeBlock(cards, layout)).toBe('[카드 목록] "원두 상품" (카드 개수 8, 한 줄 열 수 4)');
	});

	it('marks untouched default labels as undecided', () => {
		expect(describeBlock(block('button'), layout)).toBe('[버튼] (문구 미정)');
	});

	it('resolves page links to paths', () => {
		expect(describeBlock(block('route', {}, { label: '메뉴 보기', targetPageId: 'menu' }), layout)).toBe(
			'[라우트] "메뉴 보기" (이동할 페이지: /menu)'
		);
		expect(describeBlock(block('route', {}, { label: '메뉴 보기' }), layout)).toBe(
			'[라우트] "메뉴 보기" (이동할 페이지 미정)'
		);
	});

	it('hides fields whose showIf is false', () => {
		const auto = block('header', {}, { brand: '브루하우스', links: ['menu'] });
		expect(describeBlock(auto, layout)).toBe('[헤더] "브루하우스" (모든 페이지를 메뉴로 연결)');

		const manual = block('header', {}, { brand: '브루하우스', autoNav: false, links: ['menu'] });
		expect(describeBlock(manual, layout)).toBe('[헤더] "브루하우스" (메뉴에 넣을 페이지: /menu)');
	});

	it('joins list items', () => {
		const form = block('form', {}, { purpose: '문의하기', fields: ['이름', '연락처'], submit: '보내기' });
		expect(describeBlock(form, layout)).toBe('[입력 폼] "문의하기" (입력 항목: 이름 / 연락처, 제출 버튼 문구: "보내기")');
	});
});

describe('layoutToReference', () => {
	const reference = layoutToReference(sampleLayout());

	it('wraps the description in a reference tag', () => {
		expect(reference.startsWith('<layout_reference>')).toBe(true);
		expect(reference.endsWith('</layout_reference>')).toBe(true);
	});

	it('describes relative placement without coordinates or percentages', () => {
		expect(reference).not.toMatch(/\d+\s*%|\bx\s*\d|\by\s*\d|px/);
		expect(reference).toContain(
			'1. 맨 위 같은 줄: [로고] "브루하우스" — 왼쪽, 멀리 떨어진 오른쪽에 [라우트] "원두 메뉴" (이동할 페이지: /menu) — 오른쪽'
		);
		expect(reference).toContain('2. 그 아래 (윗줄과 간격을 넉넉히 두고): [텍스트] "오늘의 커피" (스타일: 제목) — 가운데, 가로로 넓게');
		expect(reference).toContain('3. 맨 아래: [버튼] "주문하기" — 가운데');
	});

	it('lists every page, including empty ones', () => {
		expect(reference).toContain('## 페이지 / (src/routes/+page.svelte)');
		expect(reference).toContain('## 페이지 /menu (src/routes/menu/+page.svelte)');
		expect(reference).toContain('배치한 요소 없음');
	});

	it('mentions close neighbours as adjacent', () => {
		const text = layoutToReference(
			layoutOf({
				id: 'p',
				path: '/',
				blocks: [block('button', { x: 500, y: 100 }, { label: '가입' }), block('button', { x: 616, y: 100 }, { label: '로그인' })]
			})
		);
		expect(text).toContain('[버튼] "가입" — 가운데, 바로 오른쪽에 [버튼] "로그인" — 가운데');
	});

	it('describes blocks inside a section as its contents', () => {
		const text = layoutToReference(
			layoutOf({
				id: 'p',
				path: '/',
				blocks: [
					block('section', { x: 160, y: 200, w: 960, h: 320 }, { title: '오늘의 원두' }),
					block('cards', { x: 200, y: 260, w: 880, h: 220 }, { subject: '원두 상품' })
				]
			})
		);
		expect(text).toContain('1. 맨 위: [섹션] "오늘의 원두" — 가운데, 가로로 넓게');
		expect(text).toContain('↳ 섹션 안에 배치된 요소:');
		expect(text).toContain('   1. 안쪽 맨 위: [카드 목록] "원두 상품" (카드 개수 6, 한 줄 열 수 3) — 가운데, 너비를 거의 다 차지');
	});
});

describe('parseLayout', () => {
	it('accepts a valid layout and clamps blocks into the frame', () => {
		const layout = sampleLayout();
		layout.pages[0].blocks[0].x = 5000;
		const button = parseLayout(JSON.parse(JSON.stringify(layout))).pages[0].blocks[0];
		expect(button.x).toBe(1280 - button.w);
	});

	it('clears links to pages that do not exist', () => {
		const layout = sampleLayout();
		layout.pages.pop();
		const route = parseLayout(layout).pages[0].blocks.find((b) => b.type === 'route');
		expect(route?.props.targetPageId).toBe('');
	});

	it('fills missing or malformed settings with defaults and drops unknown ones', () => {
		const raw = layoutOf({
			id: 'p',
			path: '/',
			blocks: [{ ...block('cards'), props: { subject: '원두', count: 'many', columns: 99, extra: 'x' } }]
		});
		expect(parseLayout(raw).pages[0].blocks[0].props).toEqual({ subject: '원두', count: 6, columns: 6 });
	});

	it.each([
		['non-object', 'nope'],
		['no pages', { pages: [] }],
		['unknown block type', { pages: [{ id: 'a', path: '/', blocks: [{ id: 'b', type: 'hologram', props: {} }] }] }],
		['invalid path', { pages: [{ id: 'a', path: '/', blocks: [] }, { id: 'b', path: '/../etc', blocks: [] }] }],
		['duplicate path', { pages: [{ id: 'a', path: '/', blocks: [] }, { id: 'b', path: '/', blocks: [] }] }],
		['missing home page', { pages: [{ id: 'a', path: '/about', blocks: [] }] }],
		[
			'non-numeric position',
			{ pages: [{ id: 'a', path: '/', blocks: [{ id: 'b', type: 'button', x: 'a', y: 0, w: 10, h: 10, props: {} }] }] }
		]
	])('rejects %s', (_name, input) => {
		expect(() => parseLayout(input)).toThrow();
	});
});
