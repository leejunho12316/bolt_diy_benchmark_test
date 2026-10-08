export type ExampleSlug = 'chatbot' | 'excel' | 'build' | 'dashboard' | 'compare';

/** Folder names under design-skills/; each has a matching `.theme-<id>` scope in themes.css. */
export type ExampleDesign = 'nature-green' | 'minimal-mono' | 'neo-brutal' | 'dark-dashboard' | 'warm-editorial';

export interface Example {
	slug: ExampleSlug;
	no: string;
	title: string;
	summary: string;
	design: ExampleDesign;
	/** Korean title from the design skill's SKILL.md. */
	designTitle: string;
}

export const EXAMPLES: Example[] = [
	{
		slug: 'chatbot',
		no: '01',
		title: '현장 문서 AI 챗봇',
		summary: '공정표 · 작업일보를 올리면 현장 질문에 바로 답해 줘요',
		design: 'nature-green',
		designTitle: '내추럴 그린'
	},
	{
		slug: 'excel',
		no: '02',
		title: '엑셀 넣고 바로 질문하기',
		summary: '엑셀을 올리고 말로 물으면 표와 그래프로 답해 줘요 (Text-to-SQL)',
		design: 'minimal-mono',
		designTitle: '미니멀 모노크롬'
	},
	{
		slug: 'build',
		no: '03',
		title: '5분 만에 웹사이트 만들기',
		summary: '말로 요청하고, 만들어지는 과정을 보고, 바로 써 보는 흐름',
		design: 'neo-brutal',
		designTitle: '네오 브루탈리즘'
	},
	{
		slug: 'dashboard',
		no: '04',
		title: '자동 CRM · ERP · 데이터 시각화',
		summary: '흩어진 현장 · 거래처 데이터를 한 화면에 모아 보여줘요',
		design: 'dark-dashboard',
		designTitle: '다크 대시보드'
	},
	{
		slug: 'compare',
		no: '05',
		title: '바이브 코딩 전후 비교',
		summary: '화면 밝게 · CRM 새 버튼 · 손그림으로 화면 만들기, 요청 전후를 비교해요',
		design: 'warm-editorial',
		designTitle: '따뜻한 에디토리얼'
	}
];

/** Web fonts the design skills above name, in one Google Fonts request. */
export const EXAMPLE_FONTS_URL =
	'https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Gowun+Batang:wght@400;700&family=JetBrains+Mono:wght@400;500&family=Noto+Serif+KR:wght@500;700&family=Space+Mono:wght@700&display=swap';

export function findExample(slug: string): Example | undefined {
	return EXAMPLES.find((example) => example.slug === slug);
}
