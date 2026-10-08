// Editing state for the start-page wireframe builder.
import { FRAME, GRID, blockDef, defaultProps, type Block, type BlockProps, type BlockType, type Layout, type Page } from './types.ts';
import { MAX_BLOCKS_PER_PAGE, MAX_PAGES, PATH_RE, parseLayout, pruneLinks } from './validate.ts';

const STORAGE_KEY = 'vibe-studio:builder';

const snap = (value: number) => Math.round(value / GRID) * GRID;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function createBlock(type: BlockType, x: number, y: number, props?: BlockProps): Block {
	const { w, h } = blockDef(type).size;
	return { id: crypto.randomUUID(), type, x, y, w, h, props: props ?? defaultProps(type) };
}

/**
 * Every page starts with a full-width header and footer. New pages copy the settings of the
 * home page's header/footer so the site stays consistent.
 */
function chromeBlocks(source?: Page): Block[] {
	const copy = (type: 'header' | 'footer') => {
		const existing = source?.blocks.find((b) => b.type === type);
		return existing ? ($state.snapshot(existing.props) as BlockProps) : undefined;
	};

	return [
		createBlock('header', 0, 0, copy('header')),
		createBlock('footer', 0, FRAME.height - blockDef('footer').size.h, copy('footer'))
	];
}

function emptyLayout(): Layout {
	return { frame: { ...FRAME }, pages: [{ id: crypto.randomUUID(), path: '/', blocks: chromeBlocks() }] };
}

export class Builder {
	layout = $state<Layout>(emptyLayout());
	currentPageId = $state('');
	selectedId = $state<string | null>(null);

	page = $derived(this.layout.pages.find((p) => p.id === this.currentPageId) ?? this.layout.pages[0]);
	selected = $derived(this.page.blocks.find((b) => b.id === this.selectedId) ?? null);
	blockCount = $derived(this.layout.pages.reduce((sum, p) => sum + p.blocks.length, 0));

	constructor() {
		this.currentPageId = this.layout.pages[0].id;
	}

	/** Restores the draft saved in this browser, ignoring anything unreadable. */
	restore() {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);

			if (saved) {
				this.layout = parseLayout(JSON.parse(saved));
				this.currentPageId = this.layout.pages[0].id;
			}
		} catch {
			// Corrupt or unavailable storage: keep the default layout.
		}
	}

	save() {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.layout));
		} catch {
			// Storage blocked (private mode, quota): the draft just won't survive a reload.
		}
	}

	reset() {
		this.layout = emptyLayout();
		this.currentPageId = this.layout.pages[0].id;
		this.selectedId = null;
	}

	addBlock(type: BlockType, x: number, y: number) {
		if (this.page.blocks.length >= MAX_BLOCKS_PER_PAGE) {
			return;
		}

		const { w, h } = blockDef(type).size;
		// Centre the block on the drop point.
		const block = createBlock(type, clamp(snap(x - w / 2), 0, FRAME.width - w), clamp(snap(y - h / 2), 0, FRAME.height - h));

		if (type === 'route') {
			block.props.targetPageId = this.layout.pages.find((p) => p.id !== this.page.id)?.id ?? '';
		}

		this.page.blocks.push(block);
		this.selectedId = block.id;
	}

	moveBlock(block: Block, x: number, y: number) {
		block.x = clamp(snap(x), 0, FRAME.width - block.w);
		block.y = clamp(snap(y), 0, FRAME.height - block.h);
	}

	resizeBlock(block: Block, w: number, h: number) {
		block.w = clamp(snap(w), GRID * 2, FRAME.width - block.x);
		block.h = clamp(snap(h), GRID * 2, FRAME.height - block.y);
	}

	/** Arrow-key nudge: 1px, or one grid step with Shift. */
	nudge(block: Block, dx: number, dy: number) {
		block.x = clamp(block.x + dx, 0, FRAME.width - block.w);
		block.y = clamp(block.y + dy, 0, FRAME.height - block.h);
	}

	removeBlock(id: string) {
		this.page.blocks = this.page.blocks.filter((b) => b.id !== id);

		if (this.selectedId === id) {
			this.selectedId = null;
		}
	}

	selectPage(id: string) {
		this.currentPageId = id;
		this.selectedId = null;
	}

	/** Returns an error message, or null when the page was added. */
	addPage(path: string): string | null {
		const error = this.#checkPath(path);

		if (error) {
			return error;
		}

		if (this.layout.pages.length >= MAX_PAGES) {
			return `페이지는 최대 ${MAX_PAGES}개까지 만들 수 있습니다.`;
		}

		const page: Page = { id: crypto.randomUUID(), path, blocks: chromeBlocks(this.layout.pages[0]) };
		this.layout.pages.push(page);
		this.selectPage(page.id);

		return null;
	}

	renamePage(id: string, path: string): string | null {
		const page = this.layout.pages.find((p) => p.id === id);

		// The home page keeps '/' so the generated app always has an index route.
		if (!page || page.path === path || page.path === '/') {
			return null;
		}

		const error = this.#checkPath(path);

		if (!error) {
			page.path = path;
		}

		return error;
	}

	removePage(id: string) {
		const page = this.layout.pages.find((p) => p.id === id);

		// The home page always exists.
		if (!page || page.path === '/') {
			return;
		}

		this.layout.pages = this.layout.pages.filter((p) => p.id !== id);
		pruneLinks(this.layout);

		if (this.currentPageId === id) {
			this.selectPage(this.layout.pages[0].id);
		}
	}

	#checkPath(path: string) {
		if (!PATH_RE.test(path)) {
			return '경로는 /about 처럼 /로 시작하고 영어 소문자, 숫자, -만 쓸 수 있습니다.';
		}

		if (this.layout.pages.some((p) => p.path === path)) {
			return `${path} 페이지가 이미 있습니다.`;
		}

		return null;
	}
}
