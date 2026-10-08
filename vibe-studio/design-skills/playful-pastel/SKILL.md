---
name: playful-pastel
title: 플레이풀 파스텔
description: 둥근 모서리와 부드러운 파스텔 색, 통통 튀는 버튼. 교육·키즈·취미 커뮤니티처럼 친근함이 중요한 서비스에 적합.
tags: [교육, 키즈, 커뮤니티]
---

# 플레이풀 파스텔 스킬 (Playful Pastel)

**친근하고 즐거운** 인상을 주는 둥글고 부드러운 스타일을 재현하기 위한 명세다. 결과물은 SvelteKit 앱이며, 토큰은 `src/app.css`의 `:root`에 정의하고 `src/routes/+layout.svelte`에서 import한다. 제목용 둥근 글꼴은 `<svelte:head>`에서 Google Fonts로 불러온다.

---

## 0. 적용 규칙 (먼저 읽을 것)

1. 모서리는 크게(16~28px), 버튼은 알약형. 각진 요소를 만들지 않는다.
2. 파스텔 면 색은 4가지(`--peach`, `--mint`, `--sky`, `--lilac`)를 **카드마다 돌아가며** 쓴다. 한 화면에 4가지를 넘지 않는다.
3. 글자는 파스텔 위에서도 읽히도록 **짙은 남보라(`--ink`)**. 파스텔 색을 글자색으로 쓰지 않는다.
4. 장식 도형(원·물결·별)은 배경에 2~3개만, 콘텐츠를 가리지 않게 둔다. 이모지 대신 SVG 도형/일러스트 자리 표시.
5. 모든 색·간격은 변수로만 참조한다.

---

## 1. 디자인 DNA

- **동화책 같은 친근함**: 둥근 제목 글꼴, 큼직한 버튼, 넉넉한 패딩.
- **색으로 구분되는 카드**: 과목·카테고리마다 다른 파스텔 면.
- **시그니처 형태**: 아래쪽에 3px 짙은 "눌림 그림자"가 있는 버튼, 동그란 아이콘 배지, 섹션 사이 물결 구분선.

---

## 2. 디자인 토큰

```css
:root {
  --bg:      #FFFBF5;
  --surface: #FFFFFF;
  --ink:     #2E2A4F; /* 본문·제목 */
  --ink-2:   #5D5880;
  --line:    #ECE6F5;
  --primary: #6C5CE7; /* 주요 버튼·링크 */
  --primary-deep: #4B3CC4; /* 눌림 그림자, hover */
  --peach:   #FFE3D6; --mint: #D8F5E8; --sky: #DCEBFF; --lilac: #EDE3FF;
  --sun:     #FFD45C; /* 별·배지 포인트 */
  --danger:  #D93A5B;

  --font-round: "Jua", "Gowun Dodum", "Pretendard Variable", sans-serif; /* 제목 */
  --font-sans:  "Pretendard Variable", Pretendard, system-ui, sans-serif; /* 본문 */

  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-5: 24px; --space-6: 40px; --space-7: 64px;
  --container: 1120px;
  --radius-sm: 12px; --radius: 20px; --radius-lg: 28px; --radius-pill: 999px;
  --press: 0 3px 0 var(--primary-deep);
  --shadow: 0 10px 30px rgba(108, 92, 231, 0.10);
  --dur: 180ms; --ease: cubic-bezier(0.34, 1.56, 0.64, 1); /* 살짝 튕기는 느낌 */
}
```

Google Fonts: `Jua` 또는 `Gowun+Dodum`.

---

## 3. 타이포그래피

| 역할 | 크기 / 행간 | 글꼴 |
|---|---|---|
| Hero | 52px / 1.2 | round, `--ink` |
| H2 | 32px / 1.3 | round |
| H3 | 20px / 1.4 | round |
| Body | 17px / 1.7 | sans 400 |
| Small | 14px / 1.5 | sans 500, `--ink-2` |
| Button | 16px | sans 700 |

---

## 4. 레이아웃

```
┌ header (bg, h76) ─ 로고(둥근 글꼴) · 메뉴 · [시작하기] ─────────────┐
  hero: 왼쪽 Hero + 설명 + 버튼 2개 / 오른쪽 둥근 일러스트 면(lilac, r28)
  ~ 물결 구분선 ~
  카테고리 카드 4열 (peach / mint / sky / lilac 순환)
  후기 카드 2열 (흰 카드 + 동그란 아바타)
┌ footer (lilac 면, 위쪽 r28) ──────────────────────────────────────┐
```

- 컨테이너 1120px, 좌우 24px, 섹션 간격 64px, 카드 gap 20px.

---

## 5. 컴포넌트

### 5.1 헤더
- 높이 76px, 배경 `--bg`. 로고는 round 글꼴 26px + 동그란 심볼. 메뉴 16px/600.

### 5.2 버튼 (시그니처)
- Primary: `--primary` 배경, 흰 글자, 높이 52px, 좌우 28px, 알약형, `box-shadow: var(--press)`.
- pressed: `translateY(3px)` + 그림자 제거 → 실제로 눌리는 느낌.
- Secondary: 흰 배경, 2px `--line` 테두리, 글자 `--primary`.

### 5.3 카테고리 카드
- 파스텔 면 배경, radius 28px, 패딩 28px. 위에 56px 원형 아이콘 배지(흰 배경), 제목 H3, 설명, 아래 "수업 보기 →".
- hover: `translateY(-4px)` + `--shadow`.

### 5.4 배지 · 칩
- 알약형, 흰 배경 + 2px `--line`, 14px/700. 선택 시 `--primary` 배경 흰 글자.

### 5.5 입력
- 높이 52px, radius 16px, 2px `--line`, 배경 `--surface`. 포커스: 테두리 `--primary` + 4px `--lilac` 링.

### 5.6 표 · 목록
- 표 대신 둥근 카드 목록을 우선한다. 표가 필요하면 행마다 radius 12px 카드처럼, 헤더는 `--lilac` 면.

### 5.7 푸터
- `--lilac` 면, 위쪽 모서리만 28px, 로고·링크·저작권.

---

## 6. 인터랙션 & 상태
- 모든 이동은 `--ease`(살짝 튕김), 200ms 이내. `prefers-reduced-motion`이면 이동 없이 색만 바뀐다.
- 성공 알림: `--mint` 면 + 체크 아이콘. 오류: `--peach` 면 + `--danger` 글자.
- 빈 상태: 큰 둥근 일러스트 자리 + 다정한 문장 + Primary 버튼.

---

## 7. 반응형 · 접근성
- 960px 이하 카드 2열, 600px 이하 1열. Hero 36px, 일러스트는 아래로.
- 파스텔 면 위 글자는 반드시 `--ink`(대비 9:1 이상). 버튼 글자 16px 이상.
- 터치 영역 48px 이상.

---

## 8. 체크리스트
- [ ] 각진 요소가 없고 버튼은 알약형이다.
- [ ] 파스텔 4색이 카드마다 순환하며, 글자는 `--ink`다.
- [ ] 눌림 그림자 버튼과 둥근 아이콘 배지가 있다.
- [ ] 장식 도형이 콘텐츠를 가리지 않는다.
- [ ] 토큰은 `src/app.css`에만 정의됐다.
