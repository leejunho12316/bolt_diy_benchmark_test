export const CHATBOT_DOCS = ['공정표_10월.xlsx', '작업일보_1006.pdf', '안전관리계획서.pdf', '시방서_골조.pdf'];

export const CHATBOT_SUGGESTIONS = [
	'이번 주 타설 일정 알려줘',
	'안전 점검 담당자는 누구야?',
	'철근 검측 언제야?',
	'오늘 출역 인원은?'
];

export interface ChatbotAnswer {
	text: string;
	sources: string[];
}

const KNOWLEDGE: { pattern: RegExp; answer: ChatbotAnswer }[] = [
	{
		pattern: /타설|콘크리트|레미콘/,
		answer: {
			text: '3공구 콘크리트 타설은 10월 8일(수) 오전 7시에 예정되어 있어요. 우천 시 9일로 미뤄지며, 펌프카 2대가 배정되어 있습니다.',
			sources: ['공정표_10월.xlsx', '작업일보_1006.pdf']
		}
	},
	{
		pattern: /안전|점검/,
		answer: {
			text: '안전 점검 담당은 안전팀 김OO 과장이에요. 정기 점검은 매주 화요일과 금요일 오전 9시에 진행합니다.',
			sources: ['안전관리계획서.pdf']
		}
	},
	{
		pattern: /철근|배근|검측/,
		answer: {
			text: '지하 2층 기둥 철근 배근 검측은 10월 7일(화) 오후 2시예요. 감리 담당은 박OO 감리원입니다.',
			sources: ['시방서_골조.pdf', '공정표_10월.xlsx']
		}
	},
	{
		pattern: /인원|출역|작업자|몇 명/,
		answer: {
			text: '오늘 출역 인원은 총 128명이에요. 골조 64명, 전기 22명, 설비 18명, 기타 24명입니다.',
			sources: ['작업일보_1006.pdf']
		}
	}
];

const FALLBACK: ChatbotAnswer = {
	text: '올려 둔 문서에서 답을 찾지 못했어요. 다른 표현으로 물어보시거나, 관련 문서를 추가해 주세요.',
	sources: []
};

export function answerQuestion(question: string): ChatbotAnswer {
	return KNOWLEDGE.find((entry) => entry.pattern.test(question))?.answer ?? FALLBACK;
}
