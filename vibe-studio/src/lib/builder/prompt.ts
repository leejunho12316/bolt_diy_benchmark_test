import { GRID, blockDef, pageFilePath, type Block, type FieldDef, type Layout, type Page } from './types.ts';

// The wireframe is a rough sketch, so everything here is described in relative terms
// (rows, order, alignment, spacing, nesting) and never as coordinates or percentages.

/** Horizontal gap (fraction of the area width) above which neighbours count as far apart. */
const FAR_GAP = 0.2;
/** Vertical gap (fraction of the area height) above which a row is described as well separated. */
const ROW_GAP = 0.15;

interface Area {
	x: number;
	y: number;
	w: number;
	h: number;
}

/** Groups blocks into visual rows: a block joins a row when it overlaps it vertically by half its height. */
export function groupRows(blocks: Block[]): Block[][] {
	const rows: { top: number; bottom: number; blocks: Block[] }[] = [];

	for (const block of [...blocks].sort((a, b) => a.y - b.y || a.x - b.x)) {
		const row = rows.find((r) => {
			const overlap = Math.min(r.bottom, block.y + block.h) - Math.max(r.top, block.y);
			return overlap >= Math.min(block.h, r.bottom - r.top) / 2;
		});

		if (row) {
			row.blocks.push(block);
			row.top = Math.min(row.top, block.y);
			row.bottom = Math.max(row.bottom, block.y + block.h);
		} else {
			rows.push({ top: block.y, bottom: block.y + block.h, blocks: [block] });
		}
	}

	return rows.sort((a, b) => a.top - b.top).map((row) => row.blocks.sort((a, b) => a.x - b.x));
}

const inside = (inner: Area, outer: Area) =>
	inner.x >= outer.x - GRID &&
	inner.y >= outer.y - GRID &&
	inner.x + inner.w <= outer.x + outer.w + GRID &&
	inner.y + inner.h <= outer.y + outer.h + GRID;

/** The smallest container block (section, modal) that fully encloses `block`, if any. */
function parentOf(block: Block, blocks: Block[]) {
	return blocks
		.filter((c) => c !== block && blockDef(c.type).container && inside(block, c) && c.w * c.h > block.w * block.h)
		.sort((a, b) => a.w * a.h - b.w * b.h)[0];
}

function formatField(field: FieldDef, value: unknown, layout: Layout): string | null {
	const pathOf = (id: unknown) => layout.pages.find((p) => p.id === id)?.path;

	switch (field.kind) {
		case 'text':
		case 'textarea':
			return typeof value === 'string' && value.trim() ? `${field.label}: ${JSON.stringify(value.trim())}` : null;
		case 'number':
			return `${field.label} ${value}`;
		case 'select':
			return `${field.label}: ${field.options?.find((o) => o.value === value)?.label ?? value}`;
		case 'toggle':
			return value ? field.label : null;
		case 'page': {
			const path = pathOf(value);
			return path ? `${field.label}: ${path}` : (field.emptyText ?? null);
		}
		case 'pages': {
			const paths = Array.isArray(value) ? value.map(pathOf).filter(Boolean) : [];
			return paths.length ? `${field.label}: ${paths.join(', ')}` : null;
		}
		case 'list': {
			const items = Array.isArray(value) ? value.map((v) => String(v).trim()).filter(Boolean) : [];
			return items.length ? `${field.label}: ${items.join(' / ')}` : null;
		}
	}
}

/** e.g. [카드 목록] "원두 상품" (카드 개수 6, 한 줄 열 수 3) */
export function describeBlock(block: Block, layout: Layout) {
	const def = blockDef(block.type);
	let text = `[${def.label}]`;

	if (def.primary) {
		const field = def.fields.find((f) => f.key === def.primary)!;
		const value = String(block.props[field.key] ?? '').trim();
		// Untouched placeholders ("버튼", "텍스트를 입력하세요") are not real content.
		text += ` ${!value || value === field.default ? '(문구 미정)' : JSON.stringify(value)}`;
	}

	const details = def.fields
		.filter((f) => f.key !== def.primary && (!f.showIf || f.showIf(block.props)))
		.map((f) => formatField(f, block.props[f.key], layout))
		.filter((d): d is string => d !== null);

	return details.length ? `${text} (${details.join(', ')})` : text;
}

function placement(block: Block, area: Area) {
	const center = (block.x + block.w / 2 - area.x) / area.w;
	const ratio = block.w / area.w;
	const align = center < 1 / 3 ? '왼쪽' : center < 2 / 3 ? '가운데' : '오른쪽';
	const width = ratio >= 0.8 ? ', 너비를 거의 다 차지' : ratio >= 0.45 ? ', 가로로 넓게' : '';

	return `${align}${width}`;
}

/** Describes blocks in `area` row by row; container blocks list their contents indented below. */
function describeArea(blocks: Block[], all: Block[], area: Area, layout: Layout, depth: number): string[] {
	const indent = '   '.repeat(depth);
	const rows = groupRows(blocks);
	const lines: string[] = [];
	let prevBottom = area.y;

	rows.forEach((row, i) => {
		const top = Math.min(...row.map((b) => b.y));
		const position = i === 0 ? '맨 위' : i === rows.length - 1 ? '맨 아래' : '그 아래';
		const spaced = i > 0 && (top - prevBottom) / area.h > ROW_GAP ? ' (윗줄과 간격을 넉넉히 두고)' : '';
		const same = row.length > 1 ? ' 같은 줄' : '';

		const items = row.map((block, j) => {
			const text = `${describeBlock(block, layout)} — ${placement(block, area)}`;

			if (j === 0) {
				return text;
			}

			const prev = row[j - 1];
			const gap = (block.x - (prev.x + prev.w)) / area.w;
			return `${gap > FAR_GAP ? '멀리 떨어진 오른쪽에' : '바로 오른쪽에'} ${text}`;
		});

		lines.push(`${indent}${i + 1}. ${depth > 0 ? '안쪽 ' : ''}${position}${same}${spaced}: ${items.join(', ')}`);

		for (const container of row.filter((b) => blockDef(b.type).container)) {
			const children = all.filter((b) => parentOf(b, all) === container);

			if (children.length > 0) {
				lines.push(`${indent}   ↳ ${blockDef(container.type).label} 안에 배치된 요소:`);
				lines.push(...describeArea(children, all, container, layout, depth + 1));
			}
		}

		prevBottom = Math.max(...row.map((b) => b.y + b.h));
	});

	return lines;
}

function describePage(page: Page, layout: Layout) {
	const lines = [`## 페이지 ${page.path} (${pageFilePath(page.path)})`];

	if (page.blocks.length === 0) {
		lines.push('- 배치한 요소 없음. 다른 페이지와 어울리는 내용으로 채워 주세요.');
		return lines;
	}

	const topLevel = page.blocks.filter((b) => !parentOf(b, page.blocks));
	const frame = { x: 0, y: 0, w: layout.frame.width, h: layout.frame.height };

	return [...lines, ...describeArea(topLevel, page.blocks, frame, layout, 0)];
}

/**
 * Reference text attached to the first request of a chat created from the start page.
 * It tells the agent how the user roughly arranged things, not what to build.
 */
export function layoutToReference(layout: Layout) {
	const lines = [
		'<layout_reference>',
		'사용자가 시작 페이지에서 블록으로 대략적인 화면 배치를 그렸습니다. 아래 요청을 구현할 때 참고하세요.',
		'- 정확한 위치나 크기가 아니라 요소 사이의 상대적인 관계(위아래 순서, 같은 줄 여부, 좌우 순서와 정렬, 간격, 포함 관계)만 반영하세요.',
		'- 사용자의 요청과 배치가 다르면 요청을 우선하세요.',
		'- 나열된 페이지는 모두 만들고, 라우트·메뉴 요소는 실제로 이동하는 링크로 만드세요.',
		'- 여러 페이지에 공통으로 있는 헤더·푸터는 +layout.svelte로 한 번만 구현하세요.'
	];

	for (const page of layout.pages) {
		lines.push('', ...describePage(page, layout));
	}

	lines.push('</layout_reference>');

	return lines.join('\n');
}

/** Short summary for the chat UI, e.g. "페이지 2개 · 요소 5개". */
export function layoutSummary(layout: Layout) {
	const blocks = layout.pages.reduce((sum, page) => sum + page.blocks.length, 0);
	return `페이지 ${layout.pages.length}개 · 요소 ${blocks}개`;
}
