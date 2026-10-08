---
name: nature-green
title: 내추럴 그린
description: 세이지 그린과 베이지, 유기적인 곡선으로 편안함을 주는 스타일. 친환경 제품·웰니스·요가·로컬 농장 서비스에 적합.
tags: [친환경, 웰니스, 로컬]
---

# 내추럴 그린 스킬 (Nature Green)

**차분하고 건강한** 인상을 주는 자연 친화 스타일을 재현하기 위한 명세다. 결과물은 SvelteKit 앱이며, 토큰은 `src/app.css`의 `:root`에 정의하고 `src/routes/+layout.svelte`에서 import한다.

---

## 0. 적용 규칙 (먼저 읽을 것)

1. 기본 면은 **오트밀 베이지(`--bg`)**, 포인트는 **딥 그린(`--forest`)**. 세이지(`--sage`)는 넓은 면에, 포레스트는 버튼·제목에.
2. 형태는 부드러운 곡선: 모서리 16~24px, 이미지·장식은 **잎·조약돌 같은 비대칭 둥근 모양**(`border-radius: 60% 40% 55% 45% / 50% 60% 40% 50%`)을 허용한다.
3. 채도 높은 색·네온 금지. 상태 색도 톤을 낮춘 버전을 쓴다.
4. 아이콘은 1.75px 둥근 선 아이콘. 이모지 금지.
5. 문장은 짧고 차분하게. 과장된 할인 배지·카운트다운 금지.
6. 모든 색·간격은 변수로만 참조한다.

---

## 1. 디자인 DNA

- **숲속 아침 같은 차분함**: 베이지 바탕, 세이지 면, 짙은 녹색 글자.
- **유기적 형태**: 조약돌 모양 이미지 마스크, 물결 섹션 경계.
- **시그니처 형태**: 둥근 아이콘 + 짧은 문장으로 된 "가치" 3단, 잎 모양 이미지, 알약형 인증 배지(예: "무농약", "재활용 포장").

---

## 2. 디자인 토큰

```css
:root {
  --bg:       #F4EFE6; /* 오트밀 */
  --surface:  #FBF8F2;
  --sage:     #C9D5B9; /* 큰 면 */
  --sage-2:   #E3EAD9; /* 옅은 면, 배지 */
  --forest:   #2F4A36; /* 버튼, 제목 */
  --forest-2: #1F3325; /* hover, 본문 */
  --ink-2:    #5B6B5E; /* 보조 글자 */
  --clay:     #C27C5A; /* 아주 작은 포인트(가격·별점) */
  --line:     #DCD3C3;
  --danger:   #B4513D;

  --font-sans:  "Pretendard Variable", Pretendard, system-ui, sans-serif;
  --font-serif: "Gowun Batang", "Noto Serif KR", serif; /* 제목 */

  --space-1: 4px; --space-2: 8px; --space-3: 16px; --space-4: 24px;
  --space-5: 40px; --space-6: 64px; --space-7: 96px;
  --container: 1140px;
  --radius-sm: 12px; --radius: 18px; --radius-lg: 28px; --radius-pill: 999px;
  --pebble: 60% 40% 55% 45% / 50% 60% 40% 50%;
  --shadow: 0 6px 20px rgba(47, 74, 54, 0.08);
  --dur: 240ms; --ease: cubic-bezier(0.2, 0, 0, 1);
}
```

Google Fonts: `Gowun+Batang:wght@400;700`.

---

## 3. 타이포그래피

| 역할 | 크기 / 행간 | 글꼴 |
|---|---|---|
| Hero | 54px / 1.25 | serif 700, `--forest` |
| H2 | 34px / 1.3 | serif 700 |
| H3 | 19px / 1.45 | sans 700 |
| Body | 17px / 1.8 | sans 400, `--forest-2` |
| Small | 14px / 1.6 | sans 400, `--ink-2` |
| Eyebrow | 14px | sans 600, `--forest`, 앞에 잎 아이콘 |

---

## 4. 레이아웃

```
┌ header (bg, h76): 로고 · 메뉴 · 장바구니 · [구독하기] ─────────────┐
  hero: 왼쪽 Eyebrow + Hero + Body + 버튼 / 오른쪽 조약돌 이미지(sage 면)
  가치 3단: 둥근 아이콘(sage-2 원) + H3 + Small
  ~ 물결 경계 ~ (sage 배경 섹션)
  상품/프로그램 카드 3열
  후기: 큰 따옴표 serif + 이름
┌ footer (forest 배경, bg 글자) ─────────────────────────────────────┐
```

- 컨테이너 1140px, 좌우 24px, 섹션 간격 96px, 카드 gap 24px.

---

## 5. 컴포넌트

### 5.1 헤더
- 높이 76px, 배경 `--bg`. 로고 serif 24px `--forest` + 잎 심볼. 메뉴 15px/500 `--forest-2`.

### 5.2 버튼
- Primary: `--forest` 배경, `--surface` 글자, 높이 50px, 좌우 26px, 알약형, 15px/600. hover `--forest-2`.
- Secondary: 1.5px `--forest` 테두리, 투명 배경.

### 5.3 카드
- `--surface` 배경, radius 18px, `--shadow`. 이미지 radius 14px(위쪽), 인증 배지, 제목, 가격(`--clay`).

### 5.4 배지
- 알약형 `--sage-2` 배경, `--forest` 글자 13px/600, 앞에 작은 잎 아이콘.

### 5.5 입력
- 배경 `--surface`, 1px `--line`, radius 12px, 높이 50px. 포커스: 테두리 `--forest` + 3px `--sage-2` 링.

### 5.6 표
- 둥근 컨테이너(radius 18px) 안의 표, 헤더 `--sage-2` 면, 행 구분 `--line`.

### 5.7 푸터
- `--forest` 배경, `--bg` 글자, 뉴스레터 입력(밝은 면) + 링크 3열.

---

## 6. 인터랙션 & 상태
- 전환 240ms, 카드 hover 시 그림자 진하게 + 이미지 살짝 확대(1.02).
- 성공: `--sage-2` 면 + 잎 체크 아이콘. 오류: `--danger` 글자 + 옅은 면.
- 로딩: 세이지 원 3개가 천천히 커졌다 작아지는 표시.

---

## 7. 반응형 · 접근성
- 960px 이하 1단, 이미지는 히어로 위로. Hero 36px.
- `--forest-2` 본문은 베이지 대비 10:1 이상. `--ink-2`는 보조에만(4.5:1 확인).
- 포커스 2px `--forest` outline, offset 3px.

---

## 8. 체크리스트
- [ ] 베이지 바탕 + 세이지 면 + 포레스트 포인트 구성이다.
- [ ] 유기적인 곡선(조약돌 마스크·물결 경계) 요소가 있다.
- [ ] 채도 높은 색·자극적인 할인 표현이 없다.
- [ ] 가치 3단 또는 인증 배지가 있다.
- [ ] 토큰은 `src/app.css`에만 정의됐다.
