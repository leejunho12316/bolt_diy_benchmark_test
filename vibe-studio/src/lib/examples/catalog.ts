export type ExampleSlug = 'chatbot' | 'excel' | 'build' | 'dashboard' | 'compare';

export interface Example {
	slug: ExampleSlug;
	no: string;
	title: string;
	summary: string;
}

export const EXAMPLES: Example[] = [
	{ slug: 'chatbot', no: '01', title: '현장 문서 AI 챗봇', summary: '공정표 · 작업일보를 올리면 현장 질문에 바로 답해 줘요' },
	{
		slug: 'excel',
		no: '02',
		title: '엑셀 넣고 바로 질문하기',
		summary: '엑셀을 올리고 말로 물으면 표와 그래프로 답해 줘요 (Text-to-SQL)'
	},
	{ slug: 'build', no: '03', title: '5분 만에 웹사이트 만들기', summary: '말로 요청하고, 만들어지는 과정을 보고, 바로 써 보는 흐름' },
	{
		slug: 'dashboard',
		no: '04',
		title: '자동 CRM · ERP · 데이터 시각화',
		summary: '흩어진 현장 · 거래처 데이터를 한 화면에 모아 보여줘요'
	},
	{
		slug: 'compare',
		no: '05',
		title: '바이브 코딩 전후 비교',
		summary: '화면 밝게 · CRM 새 버튼 · 손그림으로 화면 만들기, 요청 전후를 비교해요'
	}
];

export function findExample(slug: string): Example | undefined {
	return EXAMPLES.find((example) => example.slug === slug);
}
