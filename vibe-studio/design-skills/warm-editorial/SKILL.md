---
name: warm-editorial
title: 따뜻한 에디토리얼
description: 크림색 종이 질감 배경에 세리프 제목, 테라코타 포인트. 카페·베이커리·매거진·로컬 브랜드에 어울리는 잡지형 레이아웃.
tags: [카페, 매거진, 로컬브랜드]
---

# 따뜻한 에디토리얼 스킬 (Warm Editorial)

종이 잡지를 넘기는 듯한 **따뜻하고 읽기 좋은** 웹을 재현하기 위한 명세다. 결과물은 SvelteKit 앱이며, 토큰은 `src/app.css`의 `:root`에 정의하고 `src/routes/+layout.svelte`에서 import한다. 웹폰트는 `+layout.svelte`의 `<svelte:head>`에서 Google Fonts `<link>`로 불러온다.

---

## 0. 적용 규칙 (먼저 읽을 것)

1. 배경은 순백이 아니라 **크림(`--paper`)**. 순백은 카드 안쪽에만 쓴다.
2. 제목은 **세리프**, 본문은 산세리프. 이 대비가 스타일의 핵심이다.
3. 포인트 색은 **테라코타 1개**. 보조로 올리브를 아주 조금(태그·아이콘) 허용한다.
4. 모서리는 작게(6px), 그림자는 부드럽고 낮게만 쓴다. 네온·형광·그라디언트 금지.
5. 사진은 따뜻한 톤을 전제로 하고, 비율은 4:5(세로) 또는 3:2(가로)로 통일한다. 실제 사진이 없으면 `[사진: 설명]` 플레이스홀더 면(`--paper-2`)으로 둔다.
6. 모든 색·간격·글꼴은 변수로만 참조한다.

---

## 1. 디자인 DNA

- **잡지 펼침면**: 큰 세리프 헤드라인 + 짧은 리드 문단 + 큰 사진, 비대칭 2단.
- **손글씨처럼 느린 리듬**: 행간 넉넉, 문단 폭 좁게, 이탤릭 캡션.
- **시그니처 형태**: 얇은 이중선(━ ─) 섹션 구분, 번호가 붙은 "Issue No." 라벨, 둥근 알약 태그.

---

## 2. 디자인 토큰

```css
:root {
  --paper:      #F7F1E6; /* 페이지 배경(크림) */
  --paper-2:    #EFE6D6; /* 플레이스홀더, 구분 면 */
  --card:       #FFFDF8;
  --ink:        #2B211A; /* 본문(짙은 갈색) */
  --ink-2:      #6B5D52; /* 보조 */
  --line:       #DCCFBC;
  --accent:     #B5562F; /* 테라코타: 링크, 버튼 */
  --accent-ink: #8E3F1F; /* hover/pressed, 작은 텍스트용(대비 확보) */
  --olive:      #6E7445; /* 태그, 아이콘 */
  --danger:     #A3260C;

  --font-serif: "Noto Serif KR", "Nanum Myeongjo", Georgia, serif;
  --font-sans:  "Pretendard Variable", Pretendard, system-ui, sans-serif;

  --space-1: 4px; --space-2: 8px; --space-3: 16px; --space-4: 24px;
  --space-5: 40px; --space-6: 64px; --space-7: 96px;
  --container: 1120px;
  --radius:    6px;
  --radius-pill: 999px;
  --shadow:    0 2px 12px rgba(60, 40, 20, 0.08);
  --dur: 200ms; --ease: cubic-bezier(0.2, 0, 0, 1);
}
```

Google Fonts: `Noto+Serif+KR:wght@500;700`.

---

## 3. 타이포그래피

| 역할 | 크기 / 행간 | 글꼴·굵기 |
|---|---|---|
| Display | 64px / 1.15 | serif 700, 자간 -0.02em |
| H1 | 44px / 1.2 | serif 700 |
| H2 | 30px / 1.3 | serif 600 |
| H3 | 20px / 1.4 | sans 700 |
| Lead | 20px / 1.75 | sans 400, `--ink-2` |
| Body | 17px / 1.8 | sans 400, 최대 폭 38em |
| Caption | 14px / 1.5 | serif italic, `--ink-2` |
| Label | 12px / 1.2 | sans 700, 대문자·숫자, 자간 0.12em, `--accent-ink` |

---

## 4. 레이아웃

```
┌ header (paper, h80) ─────────────────────────────────────────────┐
│ 브랜드명(serif 26)          메뉴 이야기 방문 문의       [예약하기] │
└─ 이중선 ──────────────────────────────────────────────────────────┘
  ISSUE NO. 07 · 가을 (Label)
  ┌ 7/12 ─────────────────────────┐ ┌ 5/12 ──────────────┐
  │ Display 세리프 헤드라인 2~3줄   │ │ [사진 4:5]          │
  │ Lead 문단                      │ │ 캡션(italic)        │
  │ [버튼] 텍스트링크 →            │ └─────────────────────┘
  └────────────────────────────────┘
  ━━ 섹션 ━━ 3단 카드(사진 3:2 + 제목 + 2줄 설명)
  인용 블록: 큰 세리프 따옴표 + 문장 + 출처
┌ footer (paper-2) 주소·영업시간·SNS ─────────────────────────────────┐
```

- 컨테이너 1120px, 좌우 32px. 12컬럼, gutter 32px.
- 섹션 간격 96px, 섹션 시작에 Label + H2.

---

## 5. 컴포넌트

### 5.1 헤더
- 높이 80px, 배경 `--paper`, 아래에 이중선(2px `--ink` + 4px 간격 + 1px `--line`).
- 로고: 세리프 26px/700. 메뉴: sans 15px/500, 간격 28px. 오른쪽 Primary 버튼.

### 5.2 버튼
- Primary: 배경 `--accent`, 글자 `--card`, 높이 48px, 좌우 24px, radius 6px, 15px/700. hover `--accent-ink`.
- Secondary: 1px `--ink` 테두리, 배경 투명.
- Text link: `--accent-ink`, 밑줄 1px offset 4px, 끝에 → .

### 5.3 카드 (기사·메뉴)
- 배경 `--card`, radius 6px, `--shadow`, 패딩 0(사진 상단 꽉 채움) + 내용 패딩 24px.
- 위에 Label(카테고리), 제목 H3, 설명 2줄 말줄임, 아래 메타(날짜·가격) 14px.

### 5.4 태그
- 알약형, 배경 `--paper-2`, 글자 `--olive`, 13px/600, 높이 28px.

### 5.5 인용 블록
- 세리프 "“" 80px `--accent`, 문장 serif 28px/1.5, 출처 caption.

### 5.6 입력 · 폼
- 배경 `--card`, 1px `--line`, radius 6px, 높이 48px. 포커스 시 테두리 `--accent` + 3px `rgba(181,86,47,.15)` 링.

### 5.7 표 (메뉴판·가격표)
- 행 사이 점선(1px dotted `--line`), 이름은 왼쪽, 가격은 오른쪽 정렬 serif.

### 5.8 푸터
- 배경 `--paper-2`, 3단: 주소/영업시간/SNS. 하단 저작권 13px.

---

## 6. 인터랙션 & 상태
- 카드 hover: 2px 위로, 그림자 약간 진하게. 사진은 scale(1.03).
- 링크 hover: 화살표 4px 이동. 버튼 pressed: `--accent-ink`.
- 로딩: 크림 면 위에 은은한 shimmer(`--paper-2` → `--card`). 빈 상태: serif 이탤릭 문장 + 버튼.

---

## 7. 반응형 · 접근성
- 900px 이하 1단, 사진이 헤드라인 위로. Display 40px.
- 작은 텍스트·링크는 `--accent-ink`로(크림 위 4.5:1). `--accent`는 18px 이상·버튼 배경에만.
- 사진에는 의미 있는 alt, 장식 이미지는 alt="".

---

## 8. 체크리스트
- [ ] 페이지 배경이 크림이고 순백은 카드 안쪽뿐이다.
- [ ] 제목은 세리프, 본문은 산세리프다.
- [ ] 포인트 색이 테라코타 하나로 유지된다.
- [ ] 이중선 구분, Label, 이탤릭 캡션 중 둘 이상이 등장한다.
- [ ] 토큰은 `src/app.css`에만 정의됐다.
