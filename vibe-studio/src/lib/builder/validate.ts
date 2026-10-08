import { FRAME, blockDef, isBlockType, type Block, type BlockProps, type FieldDef, type Layout, type Page, type PropValue } from './types.ts';

export const MAX_PAGES = 10;
export const MAX_BLOCKS_PER_PAGE = 60;
const MAX_TEXT = 500;
const MAX_LIST_ITEMS = 30;
const MAX_LIST_ITEM = 100;
const MIN_SIZE = 16;

export const PATH_RE = /^\/([a-z0-9-]+(\/[a-z0-9-]+)*)?$/;

type Obj = Record<string, unknown>;

const isObj = (value: unknown): value is Obj => typeof value === 'object' && value !== null && !Array.isArray(value);

function str(value: unknown, field: string) {
	if (typeof value !== 'string' || value.length > MAX_TEXT) {
		throw new Error(`${field}: 문자열이 아니거나 너무 깁니다`);
	}

	return value;
}

function num(value: unknown, field: string, min: number, max: number) {
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		throw new Error(`${field}: 숫자가 아닙니다`);
	}

	return Math.round(Math.min(Math.max(value, min), max));
}

/** Coerces one setting to its field kind; anything missing or malformed falls back to the default. */
function parseField(field: FieldDef, value: unknown): PropValue {
	const fallback = Array.isArray(field.default) ? [...field.default] : field.default;

	switch (field.kind) {
		case 'text':
		case 'textarea':
		case 'page':
			return typeof value === 'string' ? value.slice(0, MAX_TEXT) : fallback;
		case 'number':
			return typeof value === 'number' && Number.isFinite(value)
				? Math.round(Math.min(Math.max(value, field.min ?? -Infinity), field.max ?? Infinity))
				: fallback;
		case 'select':
			return typeof value === 'string' && field.options?.some((o) => o.value === value) ? value : fallback;
		case 'toggle':
			return typeof value === 'boolean' ? value : fallback;
		case 'pages':
		case 'list':
			return Array.isArray(value)
				? value
						.filter((item): item is string => typeof item === 'string')
						.slice(0, MAX_LIST_ITEMS)
						.map((item) => item.slice(0, MAX_LIST_ITEM))
				: fallback;
	}
}

function parseBlock(raw: unknown, where: string): Block {
	if (!isObj(raw) || !isObj(raw.props) || !isBlockType(raw.type)) {
		throw new Error(`${where}: 잘못된 블록입니다`);
	}

	const { props } = raw;
	const w = num(raw.w, `${where}.w`, MIN_SIZE, FRAME.width);
	const h = num(raw.h, `${where}.h`, MIN_SIZE, FRAME.height);

	return {
		id: str(raw.id, `${where}.id`),
		type: raw.type,
		w,
		h,
		x: num(raw.x, `${where}.x`, 0, FRAME.width - w),
		y: num(raw.y, `${where}.y`, 0, FRAME.height - h),
		// Unknown keys are dropped, so stored layouts survive changes to a block's fields.
		props: Object.fromEntries(blockDef(raw.type).fields.map((f) => [f.key, parseField(f, props[f.key])])) as BlockProps
	};
}

/** Clears page references (link targets, menus) that point at pages which no longer exist. */
export function pruneLinks(layout: Layout) {
	const pageIds = new Set(layout.pages.map((page) => page.id));

	for (const block of layout.pages.flatMap((page) => page.blocks)) {
		for (const field of blockDef(block.type).fields) {
			const value = block.props[field.key];

			if (field.kind === 'page' && typeof value === 'string' && value && !pageIds.has(value)) {
				block.props[field.key] = '';
			} else if (field.kind === 'pages' && Array.isArray(value)) {
				block.props[field.key] = value.filter((id) => pageIds.has(id));
			}
		}
	}
}

/** Validates untrusted layout JSON (form post or localStorage) and returns a normalized copy. */
export function parseLayout(raw: unknown): Layout {
	if (!isObj(raw) || !Array.isArray(raw.pages) || raw.pages.length === 0 || raw.pages.length > MAX_PAGES) {
		throw new Error('페이지 구성이 올바르지 않습니다');
	}

	const paths = new Set<string>();

	const pages = raw.pages.map((rawPage, i): Page => {
		if (!isObj(rawPage) || !Array.isArray(rawPage.blocks) || rawPage.blocks.length > MAX_BLOCKS_PER_PAGE) {
			throw new Error(`pages[${i}]: 잘못된 페이지입니다`);
		}

		const path = str(rawPage.path, `pages[${i}].path`);

		if (!PATH_RE.test(path) || paths.has(path)) {
			throw new Error(`pages[${i}]: 경로 "${path}"가 올바르지 않거나 중복됩니다`);
		}

		paths.add(path);

		return {
			id: str(rawPage.id, `pages[${i}].id`),
			path,
			blocks: rawPage.blocks.map((block, j) => parseBlock(block, `pages[${i}].blocks[${j}]`))
		};
	});

	if (!paths.has('/')) {
		throw new Error('홈 페이지(/)가 필요합니다');
	}

	const layout = { frame: { ...FRAME }, pages };
	pruneLinks(layout);

	return layout;
}

export function countBlocks(layout: Layout) {
	return layout.pages.reduce((sum, page) => sum + page.blocks.length, 0);
}
