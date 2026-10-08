---
name: dark-dashboard
title: 다크 대시보드
description: 어두운 배경에 데이터가 또렷하게 보이는 관리자 화면. 사이드바, KPI 카드, 차트, 데이터 표 중심의 업무용 대시보드.
tags: [대시보드, 관리자, 데이터]
---

# 다크 대시보드 스킬 (Dark Dashboard)

장시간 보는 **업무용 데이터 화면**을 어두운 테마로 재현하기 위한 명세다. 결과물은 SvelteKit 앱이며, 토큰은 `src/app.css`의 `:root`에 정의하고 `src/routes/+layout.svelte`에서 import한다. 공통 셸(사이드바·상단바)은 `+layout.svelte`에 둔다.

---

## 0. 적용 규칙 (먼저 읽을 것)

1. 배경은 순흑(#000)이 아니라 **짙은 남색 계열**. 면은 3단계 밝기(`--bg` < `--surface` < `--surface-2`)로만 구분한다.
2. 포인트는 **시안 1개**(`--accent`). 차트는 정해진 5색 팔레트(`--chart-1~5`)만 쓴다.
3. 숫자는 `font-variant-numeric: tabular-nums`로 자릿수를 맞춘다.
4. 그림자 대신 1px `--line`과 면 밝기 차이로 경계를 만든다.
5. 데이터가 없을 때는 0이나 가짜 숫자를 만들지 말고 `[값]`/빈 상태 컴포넌트를 쓴다.
6. 모든 색·간격은 변수로만 참조한다.

---

## 1. 디자인 DNA

- **관제실 같은 집중감**: 어두운 바탕 위 밝은 숫자, 색은 의미가 있을 때만.
- **고정 셸 + 스크롤 콘텐츠**: 왼쪽 사이드바 240px, 상단바 64px 고정.
- **시그니처 형태**: 상단 KPI 카드 4개(작은 증감 배지 포함), 넓은 차트 카드, 줄무늬 없는 촘촘한 데이터 표.

---

## 2. 디자인 토큰

```css
:root {
  color-scheme: dark;
  --bg:         #0B1020;
  --surface:    #121A2E;
  --surface-2:  #1A2440; /* hover, 선택 행, 입력 배경 */
  --line:       #243050;
  --ink:        #E6EAF5;
  --ink-2:      #A3ADC8;
  --ink-3:      #6B7699;
  --accent:     #22D3EE; /* 활성 메뉴, 링크, 주요 버튼 */
  --accent-ink: #0B1020; /* accent 위 글자 */
  --up:         #34D399;
  --down:       #F87171;
  --warn:       #FBBF24;
  --chart-1: #22D3EE; --chart-2: #818CF8; --chart-3: #34D399; --chart-4: #FBBF24; --chart-5: #F472B6;

  --font-sans: "Pretendard Variable", Pretendard, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px; --space-5: 24px; --space-6: 32px;
  --sidebar: 240px; --topbar: 64px;
  --radius-sm: 6px; --radius: 10px; --radius-lg: 14px;
  --dur: 140ms; --ease: cubic-bezier(0.2, 0, 0, 1);
}
```

---

## 3. 타이포그래피

| 역할 | 크기 / 행간 | 굵기 |
|---|---|---|
| Page title | 22px / 1.3 | 700 |
| Card title | 14px / 1.4 | 600, `--ink-2` |
| KPI value | 30px / 1.1 | 700, tabular-nums |
| Body | 14px / 1.55 | 400 |
| Table | 13px / 1.4 | 400, 숫자 열 tabular-nums 오른쪽 정렬 |
| Caption | 12px / 1.4 | 500, `--ink-3` |

---

## 4. 레이아웃

```
┌ sidebar 240 ─┐┌ topbar 64: 페이지 제목 · 기간 선택 · 검색 · 알림 · 프로필 ─────┐
│ ◆ 서비스명    │├──────────────────────────────────────────────────────────────┤
│ ▣ 대시보드(활성)│ [KPI][KPI][KPI][KPI]   (4열, gap 16)                        │
│ ☰ 주문        ││ ┌ 차트 카드 (8/12) ───────────┐ ┌ 목록 카드 (4/12) ─┐        │
│ ☰ 고객        ││ │ 막대/선 차트               │ │ 최근 활동 5개      │        │
│ ☰ 상품        ││ └────────────────────────────┘ └───────────────────┘        │
│ ⚙ 설정       ││ ┌ 데이터 표 (12/12) ─ 필터 칩 · 검색 · 페이지네이션 ───┐        │
└──────────────┘└──────────────────────────────────────────────────────────────┘
```

- 콘텐츠 패딩 24px, 카드 gap 16px, 12컬럼 그리드.

---

## 5. 컴포넌트

### 5.1 사이드바
- 배경 `--surface`, 오른쪽 1px `--line`. 메뉴 항목 높이 40px, radius 6px, 14px/500 `--ink-2`.
- 활성: 배경 `--surface-2`, 글자 `--ink`, 왼쪽에 아이콘 `--accent`. 섹션 라벨 11px 대문자 `--ink-3`.

### 5.2 상단바
- 높이 64px, 배경 `--bg`, 하단 1px. 왼쪽 페이지 제목, 오른쪽 기간 세그먼트(오늘/7일/30일), 아이콘 버튼(36px).

### 5.3 KPI 카드
- `--surface`, 1px `--line`, radius 10px, 패딩 18px.
- 라벨(card title) → 값(KPI value) → 증감 배지(▲ 4.2% `--up` 배경 12% 투명도, ▼ `--down`).

### 5.4 차트 카드
- 제목 + 범례(작은 점) + 차트 영역. 격자선 1px `--line` 점선, 축 글자 12px `--ink-3`.
- SVG로 직접 그리거나 가벼운 라이브러리 사용. 색은 `--chart-*`만.

### 5.5 버튼
- Primary: `--accent` 배경, `--accent-ink` 글자, 높이 36px, radius 6px, 13px/600.
- Ghost: 투명 배경, 1px `--line`, hover `--surface-2`.

### 5.6 입력 · 필터
- 배경 `--surface-2`, 1px `--line`, 높이 36px, radius 6px. 포커스 1px `--accent` + 2px 링(accent 25%).
- 필터 칩: 알약형, 선택 시 `--accent` 테두리·글자.

### 5.7 데이터 표
- 헤더 12px/600 `--ink-3` 대문자 느낌, 배경 `--surface`. 행 높이 44px, 구분 1px `--line`, hover `--surface-2`.
- 상태 열은 작은 점 + 글자(완료 `--up`, 대기 `--warn`, 취소 `--down`).

---

## 6. 인터랙션 & 상태
- 전환 140ms, 색·배경만 바꾼다. 차트 툴팁은 `--surface-2` 카드.
- 로딩: 카드 안 스켈레톤(`--surface-2` 블록 shimmer). 빈 상태: 선 아이콘 + 한 줄 + Ghost 버튼.
- 오류: 카드 상단에 `--down` 1px 테두리 + 메시지.

---

## 7. 반응형 · 접근성
- 1100px 이하 KPI 2열, 차트·목록 세로 쌓기. 768px 이하 사이드바는 오버레이 드로어(`<button aria-expanded>`로 토글).
- 본문 `--ink`/`--ink-2`는 배경 대비 4.5:1 이상 유지. 상태는 색만이 아니라 글자로도 표시.
- 표는 `<table>`·`<th scope>` 사용, 숫자는 오른쪽 정렬.

---

## 8. 체크리스트
- [ ] 배경이 순흑이 아닌 남색 계열 3단계 면으로 구성됐다.
- [ ] 포인트는 시안 하나, 차트는 지정 팔레트만 쓴다.
- [ ] 숫자에 tabular-nums가 적용됐다.
- [ ] 사이드바·상단바가 `+layout.svelte`의 공통 셸이다.
- [ ] 토큰은 `src/app.css`에만 정의됐다.
