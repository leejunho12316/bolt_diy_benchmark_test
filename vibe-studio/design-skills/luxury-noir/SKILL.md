---
name: luxury-noir
title: 프리미엄 블랙&골드
description: 깊은 검정 배경에 샴페인 골드와 우아한 세리프. 파인다이닝·호텔·고급 브랜드·프라이빗 예약 서비스에 어울리는 절제된 고급감.
tags: [고급, 예약, 브랜드]
---

# 프리미엄 블랙&골드 스킬 (Luxury Noir)

**절제된 고급감**을 주는 어두운 바탕·골드 포인트 스타일을 재현하기 위한 명세다. 결과물은 SvelteKit 앱이며, 토큰은 `src/app.css`의 `:root`에 정의하고 `src/routes/+layout.svelte`에서 import한다. 세리프 웹폰트는 `<svelte:head>`에서 Google Fonts로 불러온다.

---

## 0. 적용 규칙 (먼저 읽을 것)

1. 배경은 **깊은 검정(`--noir`)**, 포인트는 **샴페인 골드 하나**. 골드는 선·작은 글자·아이콘에만 쓰고 넓은 면에 칠하지 않는다.
2. 제목은 가는 세리프 + 넓은 자간의 대문자 라벨 조합. 굵은 글씨 남용 금지.
3. 여백을 크게 두고 요소 수를 줄인다. 한 화면에 핵심 메시지 하나.
4. 사진은 어둡고 대비가 높은 톤을 전제로 하며, 실제 사진이 없으면 `[사진: 설명]` 면(`--noir-2`)으로 둔다.
5. 움직임은 느리고 부드럽게(400ms 이상의 페이드). 튕김·회전 금지.
6. 모든 색·간격은 변수로만 참조한다.

---

## 1. 디자인 DNA

- **조명이 낮은 라운지**: 검정 위 따뜻한 아이보리 글자, 골드 헤어라인.
- **대칭과 중앙 정렬**: 히어로·섹션 제목은 가운데, 장식선이 양옆으로 뻗는다(── TITLE ──).
- **시그니처 형태**: 골드 1px 테두리의 고스트 버튼, 대문자 라벨(자간 0.3em), 얇은 골드 구분선.

---

## 2. 디자인 토큰

```css
:root {
  color-scheme: dark;
  --noir:    #0D0C0B;
  --noir-2:  #171513; /* 카드·이미지 자리 */
  --noir-3:  #221F1C; /* hover */
  --ivory:   #F2EBDD; /* 본문 */
  --ivory-2: #B8AF9F; /* 보조 */
  --gold:    #C9A96E;
  --gold-2:  #E2C892; /* hover, 강조 글자 */
  --line:    rgba(201, 169, 110, 0.28);
  --danger:  #E07A6A;

  --font-serif: "Cormorant Garamond", "Noto Serif KR", serif;
  --font-sans:  "Pretendard Variable", Pretendard, system-ui, sans-serif;

  --space-1: 4px; --space-2: 8px; --space-3: 16px; --space-4: 24px;
  --space-5: 48px; --space-6: 80px; --space-7: 128px;
  --container: 1120px;
  --radius: 2px;
  --dur: 420ms; --ease: cubic-bezier(0.25, 0.1, 0.25, 1);
}
```

Google Fonts: `Cormorant+Garamond:wght@400;500`, `Noto+Serif+KR:wght@400;500`.

---

## 3. 타이포그래피

| 역할 | 크기 / 행간 | 글꼴 |
|---|---|---|
| Display | 72px / 1.1 | serif 400, `--ivory` |
| H2 | 40px / 1.2 | serif 400 |
| H3 | 22px / 1.4 | serif 500 |
| Body | 16px / 1.9 | sans 300~400, `--ivory-2` |
| Label | 12px / 1 | sans 500, 대문자, 자간 0.3em, `--gold` |
| Price | 20px | serif 500, `--gold-2` |

---

## 4. 레이아웃

```
┌ header (투명, h88, 가운데 로고) ──────────────────────────────────┐
│ MENU  STORY            L U M I È R E (serif)          RESERVE ─ │
└──────────────────────────────────────────────────────────────────┘
  hero (가운데 정렬): Label "SEOUL · SINCE 2014"
                     Display 1~2줄 / Body 1줄 / [고스트 버튼]
  ── 1px gold line ──
  코스 소개: 왼쪽 큰 이미지 6/12 + 오른쪽 텍스트 5/12 (비대칭)
  메뉴: 2열, 이름(serif) …… 가격(gold) 점선 리더
  예약 폼: 가운데 520px, 밑줄형 입력
┌ footer: 가운데 로고 · 주소 · 영업시간 (ivory-2) ──────────────────┐
```

- 컨테이너 1120px, 섹션 간격 128px, 좌우 32px.

---

## 5. 컴포넌트

### 5.1 헤더
- 높이 88px, 배경 투명(스크롤 시 `--noir` + 하단 `--line`). 가운데 로고(serif 28px, 자간 0.2em), 양옆 Label 링크.

### 5.2 버튼
- Ghost(기본): 1px `--gold` 테두리, 글자 `--gold` Label 스타일, 높이 52px, 좌우 36px, radius 2px. hover: 배경 `--gold`, 글자 `--noir`.
- Text: Label + 오른쪽 짧은 선(──) 이 hover 시 길어짐.

### 5.3 섹션 제목
- 가운데 Label, 그 아래 H2, 아래 40px 골드 선(1px).

### 5.4 카드 · 이미지
- `--noir-2` 면, 테두리 없음. 이미지 비율 4:5, hover 시 opacity 0.85 → 1.

### 5.5 메뉴 목록
- 이름(serif H3) + 점선 리더(1px dotted `--line`) + 가격(Price). 설명은 Body 한 줄.

### 5.6 입력 (예약 폼)
- 밑줄형: 하단 1px `--line`, 배경 투명, 글자 `--ivory`, 높이 52px. 포커스 시 밑줄 `--gold`. 라벨은 Label.
- 날짜·인원 선택도 같은 밑줄형 `<select>`.

### 5.7 표
- 세로선 없음, 행 구분 `--line`, 헤더는 Label.

### 5.8 푸터
- 가운데 정렬 로고, 주소·전화·영업시간(Body small), 하단 저작권 Label.

---

## 6. 인터랙션 & 상태
- 페이드·느린 이동(8px 이내), `--dur`. 이미지 확대 금지(opacity만).
- 성공: 골드 선으로 둘러싼 메시지. 오류: `--danger` 글자, 테두리 없이 아래 한 줄.
- 로딩: 골드 가는 선이 좌→우로 채워지는 표시.

---

## 7. 반응형 · 접근성
- 900px 이하 비대칭 2단을 세로로 쌓고, Display 44px, 섹션 간격 80px.
- 본문 `--ivory-2`도 배경 대비 4.5:1 이상(검정 위 #B8AF9F 확인). 골드 글자는 14px 이상·Label에만.
- 포커스: 1px `--gold-2` outline, offset 4px.

---

## 8. 체크리스트
- [ ] 배경이 깊은 검정이고 골드는 선·작은 글자에만 쓰였다.
- [ ] 제목은 세리프, 라벨은 넓은 자간 대문자다.
- [ ] 고스트 골드 버튼과 골드 구분선이 있다.
- [ ] 화면당 핵심 메시지가 하나로 절제돼 있다.
- [ ] 토큰은 `src/app.css`에만 정의됐다.
