---
name: neo-brutal
title: 네오 브루탈리즘
description: 두꺼운 검정 테두리, 원색 면, 어긋난 그림자로 강렬한 인상을 주는 스타일. 이벤트·해커톤·스타트업 홍보 페이지에 적합.
tags: [이벤트, 스타트업, 강렬함]
---

# 네오 브루탈리즘 스킬 (Neo Brutal)

일부러 거칠고 대담하게 보이는 **네오 브루탈리즘** 웹을 재현하기 위한 명세다. 결과물은 SvelteKit 앱이며, 토큰은 `src/app.css`의 `:root`에 정의하고 `src/routes/+layout.svelte`에서 import한다.

---

## 0. 적용 규칙 (먼저 읽을 것)

1. 모든 박스(버튼·카드·입력)는 **2~3px 검정 테두리 + 오른쪽 아래로 어긋난 단색 그림자**(`--shadow`)를 가진다. 블러 그림자 금지.
2. 면 색은 원색 4개(`--yellow`, `--pink`, `--blue`, `--green`) 중에서 고른다. 그라디언트 금지.
3. 모서리는 0 또는 8px 중 하나로 통일한다(이 스킬은 8px).
4. 글자는 항상 검정(`--ink`). 원색 면 위에서도 검정.
5. 기울기(±2°)·스티커 같은 장식은 한 화면에 2개 이하로 절제한다.
6. 모든 색·간격은 변수로만 참조한다.

---

## 1. 디자인 DNA

- **포스터 같은 대담함**: 초대형 굵은 제목, 원색 블록, 검정 윤곽선.
- **촉각적인 버튼**: 누르면 그림자가 사라지며 박스가 그림자 자리로 이동한다.
- **시그니처 형태**: 흐르는 띠 배너(마키), 살짝 기운 스티커 배지, 정보가 칸으로 나뉜 "티켓" 카드.

---

## 2. 디자인 토큰

```css
:root {
  --ink:    #111111;
  --bg:     #FFF8E7; /* 아이보리 */
  --white:  #FFFFFF;
  --yellow: #FFD43B;
  --pink:   #FF7AB6;
  --blue:   #5B8CFF;
  --green:  #4CD08A;
  --danger: #E5383B;

  --font-display: "Black Han Sans", "Pretendard Variable", sans-serif; /* 제목 */
  --font-sans:    "Pretendard Variable", Pretendard, system-ui, sans-serif;
  --font-mono:    "Space Mono", ui-monospace, monospace; /* 라벨·숫자 */

  --border: 3px solid var(--ink);
  --border-thin: 2px solid var(--ink);
  --shadow: 6px 6px 0 var(--ink);
  --shadow-sm: 4px 4px 0 var(--ink);
  --radius: 8px;
  --space-1: 4px; --space-2: 8px; --space-3: 16px; --space-4: 24px; --space-5: 40px; --space-6: 64px;
  --container: 1160px;
  --dur: 100ms;
}
```

Google Fonts: `Black+Han+Sans`, `Space+Mono:wght@700`.

---

## 3. 타이포그래피

| 역할 | 크기 / 행간 | 글꼴 |
|---|---|---|
| Display | 88px / 1.0 | display, 대문자/한글 굵게 |
| H2 | 44px / 1.1 | display |
| H3 | 22px / 1.3 | sans 800 |
| Body | 17px / 1.6 | sans 500 |
| Label | 14px / 1.2 | mono 700, 대문자 |

---

## 4. 레이아웃

```
┌ header: 로고 박스(노랑, 테두리) · 메뉴 · [신청하기] ────────────────┐
  hero: Display 2줄 + 설명 + 버튼 / 오른쪽 기운 스티커("D-12")
  ▶▶ 마키 띠 (검정 배경, 노랑 글자, 위아래 테두리) ▶▶
  카드 3열 (yellow / pink / blue 면) — 각 카드 shadow
  일정 "티켓": 칸으로 나뉜 표 형태
┌ footer (검정 배경, 흰 글자) ───────────────────────────────────────┐
```

- 컨테이너 1160px, 좌우 24px, 섹션 간격 64px, gap 24px(그림자 공간 확보).

---

## 5. 컴포넌트

### 5.1 헤더
- 높이 80px, 하단 `--border`. 로고는 노랑 박스 + 테두리 + `--shadow-sm`. 메뉴는 sans 700 16px, hover 시 밑줄 3px.

### 5.2 버튼 (시그니처)
- 배경 `--yellow`(또는 `--pink`), `--border`, `--shadow`, radius 8px, 높이 56px, 좌우 28px, sans 800 17px.
- hover: `translate(-2px,-2px)` + 그림자 8px. active: `translate(6px,6px)` + 그림자 0.

### 5.3 카드
- 원색 면 + `--border` + `--shadow`, 패딩 28px. 위에 Label(mono), 제목 H3, 설명.

### 5.4 스티커 배지
- 원형 120px 또는 사각, `--pink` 면, `--border`, `rotate(-6deg)`. 큰 숫자 display.

### 5.5 마키 띠
- 검정 배경, 노랑 Label 글자 반복, 위아래 `--border`. CSS `@keyframes` 가로 이동(20s linear infinite). `prefers-reduced-motion`이면 정지.

### 5.6 입력
- 흰 배경, `--border-thin`, radius 8px, 높이 52px. 포커스: `--shadow-sm` 추가(테두리 굵기 유지).

### 5.7 표 ("티켓")
- 바깥 `--border`, 칸 구분 `--border-thin`. 헤더 행은 `--yellow` 면 + mono Label. 시간·숫자 열은 mono.

### 5.8 푸터
- `--ink` 배경, 흰 글자, 위 `--border`. 큰 display 문구 한 줄 + 링크.

---

## 6. 인터랙션 & 상태
- 전환은 짧게(100ms), 이동은 그림자 방향으로만.
- 성공: `--green` 면 박스, 오류: `--danger` 테두리 + 흰 면 + 굵은 글자.
- 로딩: 원색 사각형 3개가 차례로 깜빡이는 표시(단색, 블러 없음).

---

## 7. 반응형 · 접근성
- 900px 이하 카드 1열, Display 52px, 그림자 4px로 축소.
- 원색 면 위 검정 글자 대비 충분(노랑·초록·핑크·블루 모두 4.5:1 이상 확인). 흰 글자 금지.
- 포커스: 3px `--blue` outline, offset 3px(그림자와 구분).

---

## 8. 체크리스트
- [ ] 모든 박스에 검정 테두리 + 어긋난 단색 그림자가 있다.
- [ ] 그라디언트·블러 그림자가 없다.
- [ ] 버튼이 눌릴 때 그림자 방향으로 이동한다.
- [ ] 마키 띠·스티커·티켓 표 중 둘 이상이 있다.
- [ ] 토큰은 `src/app.css`에만 정의됐다.
