// Wireframe layout built on the start page and handed to the agent with the first request.
// Every block type is described declaratively in BLOCK_DEFS: its settings (fields) drive the
// inspector, validation and the prompt text, so adding a block never needs new UI code.

export const FRAME = { width: 1280, height: 800 } as const;
export const GRID = 8;

export type PropValue = string | number | boolean | string[];
export type BlockProps = Record<string, PropValue>;

export type FieldKind = 'text' | 'textarea' | 'number' | 'select' | 'toggle' | 'page' | 'pages' | 'list';

export interface FieldDef {
	key: string;
	label: string;
	kind: FieldKind;
	default: PropValue;
	options?: { value: string; label: string }[];
	min?: number;
	max?: number;
	placeholder?: string;
	/** Shown in the prompt when a page field is left empty. */
	emptyText?: string;
	/** Hide the field (in the inspector and the prompt) unless this returns true. */
	showIf?: (props: BlockProps) => boolean;
}

export type Look =
	| 'header'
	| 'footer'
	| 'logo'
	| 'link'
	| 'sidebar'
	| 'tabs'
	| 'breadcrumb'
	| 'section'
	| 'divider'
	| 'text'
	| 'image'
	| 'hero'
	| 'grid'
	| 'features'
	| 'list'
	| 'table'
	| 'stats'
	| 'chart'
	| 'quote'
	| 'faq'
	| 'media'
	| 'button'
	| 'form'
	| 'input'
	| 'search'
	| 'chips'
	| 'pagination'
	| 'modal'
	| 'toggle'
	| 'box'
	| 'alert'
	| 'badge';

export type CategoryId = 'structure' | 'content' | 'input' | 'feedback';

export const CATEGORIES: { id: CategoryId; label: string }[] = [
	{ id: 'structure', label: '구조 · 내비게이션' },
	{ id: 'content', label: '콘텐츠' },
	{ id: 'input', label: '입력 · 상호작용' },
	{ id: 'feedback', label: '상태 · 피드백' }
];

export interface BlockDef {
	label: string;
	icon: string;
	category: CategoryId;
	size: { w: number; h: number };
	look: Look;
	fields: FieldDef[];
	/** Field quoted right after the block name in the prompt, e.g. [버튼] "주문하기". */
	primary?: string;
	/** Other blocks placed fully inside this one are described as its contents. */
	container?: boolean;
}

// Field helpers keep the registry below compact.
const text = (key: string, label: string, value = '', placeholder?: string): FieldDef => ({
	key,
	label,
	kind: 'text',
	default: value,
	placeholder
});
const textarea = (key: string, label: string, value = ''): FieldDef => ({ key, label, kind: 'textarea', default: value });
const num = (key: string, label: string, value: number, min: number, max: number): FieldDef => ({
	key,
	label,
	kind: 'number',
	default: value,
	min,
	max
});
const select = (key: string, label: string, options: [string, string][]): FieldDef => ({
	key,
	label,
	kind: 'select',
	default: options[0][0],
	options: options.map(([value, label]) => ({ value, label }))
});
const toggle = (key: string, label: string, value = false): FieldDef => ({ key, label, kind: 'toggle', default: value });
const list = (key: string, label: string, items: string[]): FieldDef => ({ key, label, kind: 'list', default: items });
const page = (key: string, label: string, emptyText?: string): FieldDef => ({
	key,
	label,
	kind: 'page',
	default: '',
	emptyText
});
const pages = (key: string, label: string, showIf?: FieldDef['showIf']): FieldDef => ({
	key,
	label,
	kind: 'pages',
	default: [],
	showIf
});

export const BLOCK_DEFS = {
	// 구조 · 내비게이션
	header: {
		label: '헤더',
		icon: '▔',
		category: 'structure',
		size: { w: 1280, h: 64 },
		look: 'header',
		primary: 'brand',
		fields: [
			text('brand', '사이트 이름', '사이트 이름'),
			toggle('autoNav', '모든 페이지를 메뉴로 연결', true),
			pages('links', '메뉴에 넣을 페이지', (p) => !p.autoNav),
			text('cta', '오른쪽 버튼 문구', '', '예: 로그인'),
			toggle('sticky', '스크롤해도 상단 고정')
		]
	},
	footer: {
		label: '푸터',
		icon: '▁',
		category: 'structure',
		size: { w: 1280, h: 80 },
		look: 'footer',
		primary: 'text',
		fields: [
			text('text', '하단 문구', '© 회사 이름'),
			text('contact', '연락처', '', '예: 02-123-4567'),
			pages('links', '하단 링크')
		]
	},
	logo: {
		label: '로고',
		icon: '◆',
		category: 'structure',
		size: { w: 176, h: 56 },
		look: 'logo',
		primary: 'text',
		fields: [text('text', '로고 텍스트', '로고')]
	},
	route: {
		label: '라우트',
		icon: '↗',
		category: 'structure',
		size: { w: 128, h: 40 },
		look: 'link',
		primary: 'label',
		fields: [text('label', '링크 이름', '메뉴'), page('targetPageId', '이동할 페이지', '이동할 페이지 미정')]
	},
	sidebar: {
		label: '사이드바',
		icon: '▌',
		category: 'structure',
		size: { w: 224, h: 480 },
		look: 'sidebar',
		fields: [list('items', '메뉴 항목', ['대시보드', '목록', '설정'])]
	},
	tabs: {
		label: '탭',
		icon: '⊓',
		category: 'structure',
		size: { w: 480, h: 48 },
		look: 'tabs',
		fields: [list('items', '탭 이름', ['탭 1', '탭 2', '탭 3'])]
	},
	breadcrumb: {
		label: '브레드크럼',
		icon: '›',
		category: 'structure',
		size: { w: 360, h: 32 },
		look: 'breadcrumb',
		fields: [list('items', '경로', ['홈', '카테고리', '현재 페이지'])]
	},
	section: {
		label: '섹션',
		icon: '▢',
		category: 'structure',
		size: { w: 960, h: 320 },
		look: 'section',
		primary: 'title',
		container: true,
		fields: [text('title', '섹션 제목', '섹션 제목'), toggle('emphasis', '배경색으로 강조')]
	},
	divider: {
		label: '구분선 · 여백',
		icon: '─',
		category: 'structure',
		size: { w: 960, h: 24 },
		look: 'divider',
		fields: [select('style', '종류', [['line', '구분선'], ['space', '빈 여백']])]
	},

	// 콘텐츠
	text: {
		label: '텍스트',
		icon: 'T',
		category: 'content',
		size: { w: 480, h: 96 },
		look: 'text',
		primary: 'content',
		fields: [
			select('variant', '스타일', [['body', '본문'], ['heading', '제목']]),
			textarea('content', '내용', '텍스트를 입력하세요')
		]
	},
	image: {
		label: '이미지',
		icon: '▨',
		category: 'content',
		size: { w: 320, h: 200 },
		look: 'image',
		primary: 'description',
		fields: [
			text('description', '이미지 설명', '이미지 설명', '예: 갓 내린 커피 사진'),
			select('ratio', '비율', [['16:9', '16:9'], ['4:3', '4:3'], ['1:1', '정사각형'], ['circle', '원형']])
		]
	},
	hero: {
		label: '히어로 배너',
		icon: '★',
		category: 'content',
		size: { w: 1120, h: 360 },
		look: 'hero',
		primary: 'title',
		fields: [
			text('title', '큰 제목', '큰 제목'),
			textarea('subtitle', '부제', ''),
			text('cta', '버튼 문구', '시작하기'),
			toggle('background', '배경 이미지 사용', true)
		]
	},
	cards: {
		label: '카드 목록',
		icon: '▦',
		category: 'content',
		size: { w: 960, h: 360 },
		look: 'grid',
		primary: 'subject',
		fields: [
			text('subject', '카드 내용', '카드 내용', '예: 원두 상품'),
			num('count', '카드 개수', 6, 1, 24),
			num('columns', '한 줄 열 수', 3, 1, 6)
		]
	},
	features: {
		label: '특징 소개',
		icon: '✦',
		category: 'content',
		size: { w: 960, h: 160 },
		look: 'features',
		fields: [list('items', '특징', ['특징 1', '특징 2', '특징 3'])]
	},
	list: {
		label: '리스트',
		icon: '☰',
		category: 'content',
		size: { w: 360, h: 160 },
		look: 'list',
		fields: [list('items', '항목', ['항목 1', '항목 2', '항목 3']), toggle('ordered', '번호 매기기')]
	},
	table: {
		label: '표',
		icon: '▤',
		category: 'content',
		size: { w: 720, h: 240 },
		look: 'table',
		primary: 'subject',
		fields: [text('subject', '표 내용', '표 내용', '예: 주문 목록'), list('columns', '열 이름', ['이름', '수량', '상태'])]
	},
	stats: {
		label: '통계 숫자',
		icon: '#',
		category: 'content',
		size: { w: 720, h: 120 },
		look: 'stats',
		fields: [list('items', '지표', ['지표 1', '지표 2', '지표 3'])]
	},
	chart: {
		label: '차트',
		icon: '▟',
		category: 'content',
		size: { w: 480, h: 280 },
		look: 'chart',
		primary: 'subject',
		fields: [
			text('subject', '데이터', '차트 데이터', '예: 월별 매출'),
			select('chartType', '종류', [['bar', '막대'], ['line', '선'], ['pie', '원형']])
		]
	},
	testimonial: {
		label: '후기',
		icon: '❝',
		category: 'content',
		size: { w: 720, h: 180 },
		look: 'quote',
		fields: [num('count', '후기 개수', 3, 1, 12)]
	},
	pricing: {
		label: '가격표',
		icon: '₩',
		category: 'content',
		size: { w: 960, h: 320 },
		look: 'grid',
		fields: [list('plans', '요금제', ['베이직', '프로', '엔터프라이즈'])]
	},
	faq: {
		label: 'FAQ',
		icon: '?',
		category: 'content',
		size: { w: 720, h: 200 },
		look: 'faq',
		fields: [list('items', '질문', ['질문 1', '질문 2', '질문 3'])]
	},
	video: {
		label: '동영상',
		icon: '▶',
		category: 'content',
		size: { w: 480, h: 270 },
		look: 'media',
		primary: 'description',
		fields: [text('description', '영상 설명', '영상 설명')]
	},
	map: {
		label: '지도',
		icon: '⌖',
		category: 'content',
		size: { w: 400, h: 240 },
		look: 'media',
		primary: 'address',
		fields: [text('address', '위치', '위치', '예: 서울시 강남구')]
	},

	// 입력 · 상호작용
	button: {
		label: '버튼',
		icon: '▭',
		category: 'input',
		size: { w: 160, h: 48 },
		look: 'button',
		primary: 'label',
		fields: [text('label', '버튼 문구', '버튼'), page('targetPageId', '누르면 이동할 페이지')]
	},
	form: {
		label: '입력 폼',
		icon: '✎',
		category: 'input',
		size: { w: 400, h: 320 },
		look: 'form',
		primary: 'purpose',
		fields: [
			text('purpose', '폼 목적', '폼 목적', '예: 문의하기, 회원가입'),
			list('fields', '입력 항목', ['이름', '이메일', '내용']),
			text('submit', '제출 버튼 문구', '보내기')
		]
	},
	input: {
		label: '입력칸',
		icon: '⌨',
		category: 'input',
		size: { w: 320, h: 64 },
		look: 'input',
		primary: 'label',
		fields: [
			text('label', '항목 이름', '항목 이름'),
			select('inputType', '종류', [
				['text', '텍스트'],
				['email', '이메일'],
				['number', '숫자'],
				['date', '날짜'],
				['password', '비밀번호'],
				['textarea', '여러 줄']
			])
		]
	},
	choice: {
		label: '선택 항목',
		icon: '◉',
		category: 'input',
		size: { w: 320, h: 96 },
		look: 'input',
		primary: 'label',
		fields: [
			text('label', '항목 이름', '항목 이름'),
			select('choiceType', '방식', [['select', '드롭다운'], ['radio', '라디오'], ['checkbox', '체크박스']]),
			list('options', '선택지', ['선택지 1', '선택지 2'])
		]
	},
	search: {
		label: '검색창',
		icon: '⌕',
		category: 'input',
		size: { w: 480, h: 48 },
		look: 'search',
		primary: 'target',
		fields: [text('target', '검색 대상', '검색 대상', '예: 상품')]
	},
	filter: {
		label: '필터 · 정렬 바',
		icon: '⇅',
		category: 'input',
		size: { w: 720, h: 48 },
		look: 'chips',
		fields: [list('items', '기준', ['전체', '카테고리', '최신순'])]
	},
	pagination: {
		label: '페이지네이션',
		icon: '…',
		category: 'input',
		size: { w: 320, h: 40 },
		look: 'pagination',
		fields: []
	},
	modal: {
		label: '모달(팝업)',
		icon: '❐',
		category: 'input',
		size: { w: 400, h: 240 },
		look: 'modal',
		primary: 'title',
		container: true,
		fields: [text('title', '팝업 제목', '팝업 제목'), text('trigger', '여는 버튼', '', '예: 자세히 보기')]
	},
	switch: {
		label: '토글 스위치',
		icon: '◐',
		category: 'input',
		size: { w: 200, h: 40 },
		look: 'toggle',
		primary: 'label',
		fields: [text('label', '설정 이름', '설정 이름', '예: 다크 모드')]
	},
	cart: {
		label: '장바구니',
		icon: '🛒',
		category: 'input',
		size: { w: 320, h: 160 },
		look: 'box',
		fields: [select('mode', '형태', [['summary', '장바구니 요약'], ['quantity', '수량 조절'], ['icon', '아이콘 + 개수']])]
	},
	comments: {
		label: '댓글',
		icon: '💬',
		category: 'input',
		size: { w: 600, h: 240 },
		look: 'quote',
		primary: 'subject',
		fields: [text('subject', '댓글 대상', '댓글 대상', '예: 게시글')]
	},
	upload: {
		label: '파일 업로드',
		icon: '⇪',
		category: 'input',
		size: { w: 400, h: 140 },
		look: 'box',
		primary: 'accept',
		fields: [text('accept', '파일 종류', '파일 종류', '예: 이미지')]
	},

	// 상태 · 피드백
	alert: {
		label: '알림 배너',
		icon: '!',
		category: 'feedback',
		size: { w: 960, h: 48 },
		look: 'alert',
		primary: 'message',
		fields: [
			text('message', '내용', '알림 내용'),
			select('tone', '종류', [['info', '안내'], ['success', '성공'], ['warning', '주의'], ['error', '오류']])
		]
	},
	user: {
		label: '로그인 · 사용자 메뉴',
		icon: '☺',
		category: 'feedback',
		size: { w: 200, h: 48 },
		look: 'box',
		fields: [select('mode', '형태', [['login', '로그인 버튼'], ['profile', '프로필 메뉴']])]
	},
	empty: {
		label: '빈 상태 · 로딩',
		icon: '○',
		category: 'feedback',
		size: { w: 400, h: 200 },
		look: 'box',
		primary: 'message',
		fields: [
			text('message', '안내 문구', '안내 문구'),
			select('state', '상태', [['empty', '데이터 없음'], ['loading', '로딩 중'], ['error', '오류']])
		]
	},
	badge: {
		label: '배지 · 태그',
		icon: '◖',
		category: 'feedback',
		size: { w: 88, h: 32 },
		look: 'badge',
		primary: 'label',
		fields: [text('label', '문구', 'NEW')]
	}
} satisfies Record<string, BlockDef>;

export type BlockType = keyof typeof BLOCK_DEFS;

export const BLOCK_TYPES = Object.keys(BLOCK_DEFS) as BlockType[];

export interface Block {
	id: string;
	type: BlockType;
	x: number;
	y: number;
	w: number;
	h: number;
	props: BlockProps;
}

export interface Page {
	id: string;
	/** URL path such as '/' or '/about'. */
	path: string;
	blocks: Block[];
}

export interface Layout {
	frame: { width: number; height: number };
	pages: Page[];
}

export function blockDef(type: BlockType): BlockDef {
	return BLOCK_DEFS[type];
}

export function isBlockType(value: unknown): value is BlockType {
	return typeof value === 'string' && Object.hasOwn(BLOCK_DEFS, value);
}

export function defaultProps(type: BlockType): BlockProps {
	return Object.fromEntries(
		blockDef(type).fields.map((f) => [f.key, Array.isArray(f.default) ? [...f.default] : f.default])
	);
}

export function pageFilePath(path: string) {
	return path === '/' ? 'src/routes/+page.svelte' : `src/routes${path}/+page.svelte`;
}
