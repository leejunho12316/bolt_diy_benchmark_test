---
name: gov-portal
title: 공공 서비스 포털
description: 정부24·KRDS 계열의 정돈된 공공 포털. 흰 카드와 1px 회색 테두리, 블루·네이비 포인트, 높은 정보 밀도.
tags: [공공기관, 포털, 대시보드]
---

# 공공 서비스 포털 UI 스킬 (Gov Portal UI)

이 스킬은 공공 서비스 포털 홈 화면(정부24 리뉴얼 계열, 범정부 UI/UX 디자인시스템(KRDS) 톤)의 시각 언어와 레이아웃을 다른 프로젝트에 그대로 재현하기 위한 명세다.
치수는 약 2430px 폭 캡처(1x, 콘텐츠 컨테이너 1080px)에서 측정한 값이며 `≈`는 근사치다. 수치는 그대로 쓰되 2~4px 수준의 오차는 4px 그리드에 맞춰 반올림한다.

---

## 0. 적용 규칙 (먼저 읽을 것)

1. **브랜드 자산은 복제하지 않는다.** 태극 엠블럼, "정부24" 워드마크, 마스코트 캐릭터, 실제 기관명·공지 문구는 사용하지 않는다. 로고 자리는 프로젝트 자체 로고(또는 `[Logo]` 플레이스홀더), 마스코트 자리는 프로젝트 자체 아바타/아이콘으로 대체한다. 이 스킬이 재현하는 것은 **레이아웃·토큰·컴포넌트 패턴**이다.
2. 모든 색·간격·반경은 **아래 CSS 변수(토큰)** 를 통해서만 사용한다. 하드코딩 금지.
3. 단위는 `rem` 기준(1rem = 16px). "화면크기" 확대 기능이 루트 폰트 크기를 바꿔 전체가 비례 확대되어야 하기 때문이다.
4. 장식은 최소화한다. 그림자는 거의 없고 **1px 테두리 + 배경 톤 차이**로 면을 구분한다. 그라디언트는 검색창 테두리와 프로모 배너에만 쓴다.
5. 포인트 컬러는 **블루 1개 + 네이비 1개**. 그 외 색은 아이콘 일러스트 안에서만 등장한다.
6. 텍스트가 넘치는 모든 카드/리스트 항목은 **1줄 말줄임(ellipsis)** 처리한다.

---

## 1. 디자인 DNA (한 줄 요약)

- **정돈된 공공 서비스 대시보드**: 가운데 고정 폭 컨테이너, 흰 배경 위 흰 카드, 얇은 회색 테두리, 둥근 모서리(16px), 작은 회색 타일들이 격자로 배열됨.
- **정보 밀도 높음, 시각 노이즈 낮음**: 본문 13~15px, 제목 18px 굵게. 색은 거의 회색조, 클릭 유도 지점만 블루.
- **친근한 포인트**: 컬러풀한 플랫 일러스트 아이콘(카테고리), 마스코트가 붙은 알약형 AI 검색창, 일러스트 프로모 배너.
- **시그니처 형태**: 카드 상단 왼쪽이 "폴더 탭"처럼 솟아 있고, 오른쪽 파인 공간(노치)에 원형 이전/다음 버튼이 앉는 **탭형 카드**.

---

## 2. 디자인 토큰

```css
:root {
  /* ── Brand ─────────────────────────────── */
  --color-primary:          #256EF4; /* 로그인 버튼, 링크, 선택 상태, N 배지 */
  --color-primary-hover:    #0B50D0;
  --color-primary-pressed:  #083891;
  --color-primary-5:        #ECF2FE; /* 아주 연한 블루 면 */
  --color-primary-10:       #D8E5FD; /* 연한 블루 테두리 */
  --color-navy:             #0E2A5A; /* ≈ 알림 배너, 활성 칩 */
  --color-navy-ink:         #1C2B4A; /* ≈ 프로모 헤드라인 */

  /* ── Gray scale ────────────────────────── */
  --gray-0:   #FFFFFF;
  --gray-5:   #F4F5F6; /* 타일/리스트 아이템 배경, 푸터 배경 */
  --gray-10:  #E6E8EA; /* 카드 테두리, 구분선 */
  --gray-20:  #CDD1D5; /* 칩 테두리, 유틸 구분자, 아이콘 버튼 테두리 */
  --gray-30:  #B1B8BE; /* 비활성 아이콘 */
  --gray-50:  #6D7882; /* placeholder, 보조 설명 */
  --gray-60:  #58616A; /* 타일 부설명 */
  --gray-70:  #464C53; /* 보조 본문, 공지 일반 항목 */
  --gray-80:  #33363D; /* 유틸 링크 */
  --gray-90:  #1E2124; /* 기본 텍스트, 제목 */

  /* ── Surfaces ──────────────────────────── */
  --bg-page:          #FFFFFF;
  --bg-card:          #FFFFFF;
  --bg-tile:          var(--gray-5);
  --bg-tile-hover:    #EBEDEF;
  --bg-quick-panel:   #EEF4FD; /* ≈ '자주 찾는 서비스' 패널 */
  --border-quick:     #D5E3FA; /* ≈ */
  --bg-footer:        var(--gray-5);
  --bg-promo-from:    #E8F1FE; /* ≈ 프로모 배너 그라디언트 */
  --bg-promo-to:      #D6E8FC;

  /* ── Accent (아이콘/진행바 전용) ─────────── */
  --accent-orange:    #FF7A45; /* ≈ 문서 아이콘, 배너 진행바 */
  --accent-teal:      #2BC0C4; /* ≈ 검색창 그라디언트 시작 */
  --accent-pink:      #F0506E; /* ≈ 하트 아이콘 등 */

  /* ── Border ────────────────────────────── */
  --border-default:   1px solid var(--gray-10);
  --border-strong:    1px solid var(--gray-20);

  /* ── Radius ────────────────────────────── */
  --radius-xs:   4px;   /* 버튼, 알림 배너, N 배지(3px) */
  --radius-sm:   8px;   /* 타일, 리스트 아이템, 링크 버튼 */
  --radius-md:   12px;  /* 카테고리 아이콘 선택 박스 */
  --radius-lg:   16px;  /* 카드, 패널, 프로모 배너 */
  --radius-pill: 999px; /* 검색창, 칩, 원형 버튼 */

  /* ── Spacing (4px grid) ────────────────── */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px; --space-7: 28px; --space-8: 32px;
  --card-padding:   22px;  /* 카드 내부 여백(측정값 22) */
  --grid-gap:       12px;  /* 카드 사이 */
  --column-gap:     24px;  /* 메인 ↔ 사이드 (측정 23) */
  --section-gap:    20px;  /* 큰 블록 사이(배너, 검색, 패널) */

  /* ── Layout ────────────────────────────── */
  --container:      1080px;
  --main-col:       712px;
  --aside-col:      344px;
  --header-h:       81px;
  --gnb-h:          52px;

  /* ── Shadow (거의 쓰지 않음) ──────────────── */
  --shadow-card:    0 1px 2px rgba(16, 24, 40, 0.04);
  --shadow-search:  0 4px 16px rgba(37, 110, 244, 0.10);

  /* ── Motion ───────────────────────────── */
  --ease:           cubic-bezier(0.2, 0, 0, 1);
  --dur-fast:       120ms;
  --dur-base:       200ms;

  /* ── Focus ────────────────────────────── */
  --focus-ring:     0 0 0 2px #fff, 0 0 0 4px var(--color-primary);
}
```

### 2.1 타이포그래피

- 폰트: `"Pretendard GOV", "Pretendard", -apple-system, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif`
  - CDN: `https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css`
- 기본 자간: `letter-spacing: -0.01em` (한글 밀도 확보). 숫자/영문 단독 텍스트는 0.
- `word-break: keep-all` 필수.

| 토큰 | 크기/행간 | 굵기 | 색 | 사용처 |
|---|---|---|---|---|
| `--fs-display` | 28px / 36px | 800 | navy-ink | 프로모 배너 헤드라인(3줄) |
| `--fs-promo-sub` | 19px / 25px | 700 | primary | 프로모 배너 서브카피 |
| `--fs-nav` | 17px / 24px | 600 | gray-90 | GNB 메뉴 |
| `--fs-title` | 18px / 26px | 700 | gray-90 | 카드 제목(자주 찾는 서비스, 공지사항 등) |
| `--fs-lead` | 17px / 26px | 700 | gray-90 | 로그인 카드 안내문 |
| `--fs-placeholder` | 17px | 400 | gray-50 | 검색 placeholder |
| `--fs-alert` | 15px / 22px | 700 | white | 알림 배너 |
| `--fs-action` | 15px / 22px | 700 | gray-90 | 헤더 액션(통합검색/로그인 등), 로그인 버튼 |
| `--fs-body` | 14px / 20px | 500 | gray-90 | 타일 라벨, 리스트 아이템, 공지(고정) |
| `--fs-body-sm` | 13px / 20px | 400 | gray-70 | 공지(일반), 유틸 링크, 더 보기, 펼쳐보기, 푸터 링크 |
| `--fs-caption` | 12px / 16px | 400~500 | gray-60 | 카테고리 라벨, 칩, 타일 부설명, 링크 버튼 |
| `--fs-footer-info` | 15px / 22px | 400 (라벨 700) | gray-90 | 푸터 콜센터 정보 |

---

## 3. 전체 레이아웃

### 3.1 와이어프레임

```
┌───────────────────────────── header (white, h81, border-bottom gray-10) ─────────────────────────────┐
│ [LOGO h40]                                 For Foreigners ∨ │ 어린이 ↗ │ 시니어 ↗ │ 지원 ∨ │ 화면크기 ∨ │ ← y≈21
│                                                 ✦ AI비서   ⌕ 통합검색   ⇥ 로그인   👤 회원가입         │ ← y≈53
├───────────────────────────── GNB (white, h52, border-bottom gray-10) ────────────────────────────────┤
│  민원서비스 ∨    혜택알리미 ∨    생활 ∨    정책정보 ∨    고객센터 ∨                                       │
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘
   ↕ 20
┌ 알림 배너 (navy, h36, r4, 컨테이너 전폭) ──────────────────────────────────────────────── ✕ ┐
   ↕ 23
┌──────── main 712 ─────────────────────────────┐ 24 ┌──── aside 344 ──────────────┐
│          (🐰 │ 무엇을 알고 싶으세요?     ⌕)    │    │ 회원가입하고 아래 서비스를   │  ← 검색 top과
│              검색 pill 530×58, 가운데 정렬       │    │ 편리하게 이용하세요.         │    로그인카드 top 동일
│   ↕ 21                                          │    │ [□민원신청]  [□전자증명]      │
│ ┌ 자주 찾는 서비스 (light-blue panel) ‹ › 펼쳐보기┐│    │ [□혜택알리미][□생활정보]      │
│ │ [tile][tile][tile][tile]                      ││    │ [████████ 로그인 ████████]   │
│ │ [tile][tile][tile][tile]                      ││    └─────────────────────────────┘
│ └───────────────────────────────────────────────┘│     ↕ 12
│  ↕ 12                                            │    ┌ 공지사항            더 보기→ ┐
│ ┌탭:가이드┐‹›  ┌탭:원스톱 서비스──────┐ ‹›      │    │ 📌 고정 공지 (bold)          │
│ │ 270     │    │ 430                   │         │    │ 일반 공지…              [N] │
│ │ (o)(o)… │    │ (전체)(칩)(칩)(칩)    │         │    └─────────────────────────────┘
│ │ [item ›]│    │ [tile][tile][tile]    │         │     ↕ 12
│ │ [item ›]│    │ [link↗]   [link↗]     │         │    ┌ 프로모 배너 346×226 ─────────┐
│ │ [item ›]│    └───────────────────────┘         │    │ 헤드라인 28/800 ×3줄  (일러) │
│ │ [item ›]│    ┌탭:혜택알리미──┐                 │    │ 서브카피 19/700 ×2줄          │
│ │ [item ›]│    │ [tile][tile]  │                 │    │   (1/3)(❚❚)(‹)(›)            │
│ └─────────┘    │ [tile][tile]  │                 │    └▬▬▬▬▬▬ 진행바 orange ▬▬▬▬▬▬▬▬┘
│                └───────────────┘                 │
└──────────────────────────────────────────────────┘
   ↕ 17~20
┌─────────── 아코디언 바 (white, h50, 전폭 border-top/bottom) ─────────────────────────────────┐
│ │ 국민소통채널           + │ 디지털증명            + │ 부가서비스            + │            │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
┌─────────── footer (gray-5) ──────────────────────────────────────────────────────────────────┐
│ [LOGO ∨]                                                               (ig)(x)(📢)(blog)     │
│ 콜센터 0000-0000 (…)  │  안내센터 국번없이 000 (…)                                            │
│ ───────────────────────────────────────────────────────────────────────────────────────────  │
│ 개인정보처리방침  이용약관  보안센터  웹 접근성 품질인증 마크 획득        © Organization. All…   │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 그리드 치수

| 영역 | 폭 | 비고 |
|---|---|---|
| 컨테이너 | 1080px, `margin: 0 auto` | 헤더/GNB/본문/아코디언/푸터 모두 같은 좌우 라인 |
| 메인 컬럼 | 712px | |
| 사이드 컬럼 | 344px | 메인과 간격 24px |
| 메인 하단 좌 (생활·가족가이드) | 270px | 우측과 간격 12px |
| 메인 하단 우 (원스톱/혜택알리미) | 430px | 세로로 2장, 간격 12px |

```css
.home-grid {
  display: grid;
  grid-template-columns: var(--main-col) var(--aside-col); /* 712 / 344 */
  column-gap: var(--column-gap);
  align-items: start;
}
.main-lower {
  display: grid;
  grid-template-columns: 270px 1fr;
  gap: var(--grid-gap);
  margin-top: var(--grid-gap);
}
.main-lower__right { display: grid; gap: var(--grid-gap); }
.aside { display: grid; gap: var(--grid-gap); }
```

### 3.3 세로 정렬 규칙 (중요)

- 검색창 상단 = 사이드 로그인 카드 상단.
- 로그인 카드 하단 = '자주 찾는 서비스' 패널 하단 (둘 다 y≈470).
- 공지사항 카드 하단 = 원스톱 서비스 카드 하단 (y≈700).
- 프로모 배너 하단 = 혜택알리미 하단 = 생활·가족가이드 하단 (y≈938).
→ 메인과 사이드의 카드 행 높이를 맞춘다. 구현 시 `grid-template-rows`로 행을 공유하는 3행 그리드(검색+패널 / 원스톱 행 / 혜택 행)를 쓰면 자동 정렬된다:

```css
.home-grid {
  grid-template-columns: 270px 418px 344px;   /* 270 + 12 + 418 = 700 ≈ main, + 24 gap */
  grid-template-areas:
    "top     top     login"
    "guide   onestop notice"
    "guide   benefit promo";
  column-gap: 12px; row-gap: 12px;
}
/* 메인↔사이드 간격만 24px로 벌리려면 login/notice/promo에 margin-left: 12px */
```

---

## 4. 컴포넌트 명세

### 4.1 유틸리티 바 (헤더 1행, 우측 정렬)

- 항목: `외국어 ∨ | 어린이 ↗ | 시니어 ↗ | 지원 ∨ | 화면크기 ∨`
- 폰트 13px / 400 / gray-80. 항목 사이 1px × 12px 세로 구분선(gray-20), 좌우 여백 10px.
- `∨` 드롭다운 chevron 10px, `↗` 새창 아이콘 11px, 텍스트와 간격 3px.
- 새창 링크는 `target="_blank"` + 시각적으로 숨긴 "새 창 열림" 텍스트.
- 드롭다운: 클릭 시 아래로 흰 패널(border gray-10, radius 8, shadow `0 4px 12px rgba(0,0,0,.08)`, 항목 13px, 높이 32).

### 4.2 메인 헤더 (로고 + 주요 액션)

- 높이 81px, `border-bottom: 1px solid var(--gray-10)`.
- 좌측: 로고(높이 40px) — 헤더 전체 높이 기준 세로 중앙. 엠블럼 원형 + 워드마크 구조(자체 로고로 대체).
- 우측 2행(y≈53): `AI비서`, `통합검색`, `로그인`, `회원가입`
  - 15px / 700 / gray-90, 아이콘 16~18px(라인 1.5px) + 텍스트 간격 4px, 항목 간격 24px.
  - AI비서 아이콘은 반짝이/로봇 계열, 통합검색은 돋보기, 로그인은 문으로 들어가는 화살표(→]), 회원가입은 사람+.
- 유틸 바(1행)와 액션(2행)은 오른쪽 끝 라인이 정확히 컨테이너 우측(1080) 기준으로 정렬.

### 4.3 GNB

- 높이 52px, 흰 배경, `border-bottom: 1px solid var(--gray-10)`.
- 메뉴 5개: 17px / 600 / gray-90, 각 메뉴 `padding: 0 14px`, 텍스트 + chevron(12px, 간격 6px). 메뉴 텍스트 시작 x = 컨테이너 좌측 + 14px.
- 메뉴 간 시각적 간격 ≈ 44px (메뉴 폭은 콘텐츠 크기).
- Hover/열림: 텍스트 color primary, 하단에 2px primary 인디케이터(메뉴 텍스트 폭), chevron 180° 회전.
- 메가메뉴: GNB 아래 전폭 흰 패널, 컨테이너 안에 하위 메뉴 다단 배치(그룹 제목 15/700, 항목 14/400 gray-70, 행간 32), 패널 하단 border gray-10 + 약한 그림자.

### 4.4 알림 배너 (Alert Banner)

- 컨테이너 전폭, 높이 36px, `background: var(--color-navy)`, `border-radius: var(--radius-xs)`.
- 패딩 `0 24px`. 좌측 종(bell) 아이콘 14px 흰색, 간격 8px.
- 메시지 15px / 700 / white. 이어서 24px 간격 후 `[자세히 보기]` 13px / 400 / white(투명도 0.9).
- 우측 닫기 ✕ 14px 흰색, 히트 영역 32×32. 닫으면 높이 애니메이션으로 접힘(200ms).
- 역할: `role="region" aria-label="중요 공지"`.

### 4.5 히어로 검색창 (AI 검색 Pill)

- 메인 컬럼 안에서 가운데 정렬. 크기 530 × 58px, `border-radius: var(--radius-pill)`.
- **그라디언트 테두리 2px**: teal(#2BC0C4) → primary(#256EF4) 좌→우.
  ```css
  .hero-search {
    border: 2px solid transparent;
    background:
      linear-gradient(#fff, #fff) padding-box,
      linear-gradient(90deg, var(--accent-teal) 0%, var(--color-primary) 35%, var(--color-primary) 100%) border-box;
    box-shadow: var(--shadow-search);
  }
  ```
- 좌측 마스코트/아바타(약 56×56)가 테두리 왼쪽 위로 살짝 걸쳐 튀어나옴(top −8px, left 18px). → 프로젝트 자체 캐릭터/AI 아이콘으로 대체.
- 입력 텍스트 시작 x ≈ 아바타 우측 + 12px(pill 좌측에서 약 86px). placeholder "안녕하세요. 무엇을 알고 싶으세요?" 형태의 대화체, 17px gray-50.
- 우측 돋보기 22px gray-90, 우측 패딩 24px, 버튼 히트 영역 44×44.
- Focus: 그림자 강화 `0 0 0 4px rgba(37,110,244,.15)`. 입력 시 아래로 자동완성 패널(흰색, radius 16, border gray-10).

### 4.6 자주 찾는 서비스 패널 (Quick Service Panel)

- 크기 712 × ≈180px. `background: var(--bg-quick-panel)`, `border: 1px solid var(--border-quick)`, `radius 16px`, `padding: 22px`.
- 헤더 행: 제목 18/700 좌측. 우측에 원형 이전/다음 버튼(§4.16) 2개(간격 8px) + 16px 간격 + `펼쳐보기 ⊞` (13px gray-80, 그리드 아이콘 12px).
- 헤더 ↔ 타일 간격 16px.
- 타일 그리드: `grid-template-columns: repeat(4, 1fr); gap: 12px 11px;` 2행.
- **타일**: 높이 42px, 흰 배경, `radius 8px`, 테두리 없음, `padding: 0 14px`, 좌측 라벨(14/600 gray-90, ellipsis) + 우측 아이콘 18px.
  - 아이콘 종류로 동작을 구분: 문서발급(주황+파랑 플랫 문서 아이콘), 외부 링크(↗ 라인, primary 색), 신청/작성(연필 플랫 아이콘, 초록).
- Hover: 타일 `box-shadow: inset 0 0 0 1px var(--color-primary)` + 라벨 color primary.
- 이전/다음은 타일 페이지(8개 단위)를 넘기는 캐러셀. '펼쳐보기'는 전체 목록을 펼침(패널 높이 확장).

### 4.7 회원/로그인 카드 (사이드 상단)

- 344 × ≈257px, 흰 배경, `border: var(--border-default)`, radius 16, `padding: 28px 30px`.
- 안내문 2줄: 17/700 행간 26 gray-90. 첫 단어 "회원가입"만 primary 색 + underline(링크).
- 안내문 ↔ 아이콘 그리드 간격 20px.
- 아이콘 그리드 2×2: 열 폭 146px, 행 간격 13px(행 피치 41px).
  - 각 항목: 원형 28px 아이콘 배경(gray-5) 안에 라인 아이콘 16px(gray-80) + 간격 10px + 라벨 14/600 gray-90.
  - 항목: 민원신청(봉투/트레이), 전자증명(문서+배지), 혜택알리미(선물상자), 생활정보(책갈피/캘린더).
- 아이콘 그리드 ↔ 버튼 간격 22px.
- **Primary 버튼**: 폭 100%, 높이 44px, `background: var(--color-primary)`, 흰 글자 15/500, `radius 4px`. Hover primary-hover, Active primary-pressed.
- 로그인 상태일 때는 같은 카드 틀에 사용자 이름 + 요약(신청 건수 등) + 보조 버튼으로 교체.

### 4.8 탭형 카드 (Folder-Tab Card) ★ 시그니처

생활·가족가이드, 원스톱 서비스, 혜택알리미 카드에 공통 적용.

**형태**
```
 ╭──────────────╮        (‹)(›)    ← 노치 영역: 카드 배경 없음, 버튼이 여기 앉음
 │ 제목 ›        ╰──────────────╮
 │                              │
 │           카드 본문            │
 ╰──────────────────────────────╯
```
- 탭(제목 부분): 카드 좌측에서 시작, 폭은 카드에 따라 다름(가이드 193/270, 원스톱 354/430, 혜택알리미 307/430 ≈ 카드 폭의 70~80%).
- 노치 높이: 37px (탭 상단 ~ 본문 우측 상단).
- 모서리: 외곽 16px, 탭→본문으로 꺾이는 안쪽 오목 곡선 16px(inverse radius).
- 노치 안 이전/다음 버튼: 노치 세로 중앙, 카드 우측에서 12px 안쪽.
- 제목: 18/700 gray-90 + `›` chevron 16px(간격 6px). 제목 전체가 해당 섹션 페이지 링크. 탭 상단에서 22px, 좌측 22px.

**구현 (drop-shadow로 합성 외곽선 만들기)**
```html
<section class="tab-card">
  <div class="tab-card__shape">          <!-- 테두리 필터가 걸리는 모양 레이어 -->
    <div class="tab-card__tab"></div>
    <div class="tab-card__body"></div>
  </div>
  <header class="tab-card__head">
    <h2 class="tab-card__title"><a href="#">원스톱 서비스</a></h2>
    <div class="tab-card__ctrl"><!-- 원형 이전/다음 버튼 --></div>
  </header>
  <div class="tab-card__content">…</div>
</section>
```
```css
.tab-card { position: relative; --tab-w: 78%; --notch-h: 37px; --r: 16px; }
.tab-card__shape {
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  /* 1px 테두리를 합성 도형 전체에 두르기 */
  filter:
    drop-shadow(1px 0 0 var(--gray-10)) drop-shadow(-1px 0 0 var(--gray-10))
    drop-shadow(0 1px 0 var(--gray-10)) drop-shadow(0 -1px 0 var(--gray-10));
}
.tab-card__tab {
  position: absolute; left: 0; top: 0;
  width: var(--tab-w); height: calc(var(--notch-h) + var(--r));
  background: var(--bg-card);
  border-radius: var(--r) var(--r) 0 0;
}
/* 탭과 본문 사이 오목 곡선 */
.tab-card__tab::after {
  content: ""; position: absolute; left: 100%; bottom: var(--r);
  width: var(--r); height: var(--r);
  background: radial-gradient(circle at 100% 0, transparent calc(var(--r) - .5px), var(--bg-card) var(--r));
}
.tab-card__body {
  position: absolute; left: 0; right: 0; bottom: 0; top: var(--notch-h);
  background: var(--bg-card);
  border-radius: 0 var(--r) var(--r) var(--r);
}
.tab-card__head, .tab-card__content { position: relative; z-index: 1; }
.tab-card__head {
  display: flex; justify-content: space-between; align-items: flex-start;
  height: var(--notch-h); padding: 22px 12px 0 22px; box-sizing: content-box;
}
.tab-card__ctrl { margin-top: -22px; height: var(--notch-h); display: flex; align-items: center; gap: 8px; }
.tab-card__content { padding: 16px var(--card-padding) var(--card-padding); }
```
- 대안: 복잡하면 SVG `<path>` 배경(viewBox를 JS로 리사이즈) 또는 `mask-image`. 어떤 방식이든 **외곽선은 1px gray-10 하나로 끊김 없이** 이어져야 한다.
- 노치에 버튼이 없는 카드(혜택알리미)도 노치 형태는 유지한다(통일감).

### 4.9 카테고리 아이콘 스크롤러 (생활·가족가이드 상단)

- 가로 스크롤 행, 항목 피치 58px, 넘치는 항목은 카드 우측에서 잘려 보임(스크롤 가능 암시). 스크롤바 숨김, 노치의 ‹ › 버튼으로 이동.
- 항목: 아이콘 박스 48×48 + 간격 8px + 라벨 12/500 gray-70(가운데 정렬, 1줄).
  - 기본: 원형(radius 50%), 배경 gray-5, 중앙에 컬러 플랫 일러스트 24px.
  - 선택: 박스 radius 12px, 흰 배경, `border: 2px solid var(--color-primary)`, 라벨 primary / 600.
- `role="tablist"` + 각 항목 `role="tab" aria-selected`. 선택 시 아래 리스트(§4.10) 교체.

### 4.10 가이드 리스트 (상황별 질문 목록)

- 항목: 높이 53px, 폭 = 카드 내부 전폭, 배경 gray-5, radius 8, `padding: 0 16px 0 14px`, 항목 간격 9px.
- 텍스트 14/400 gray-90, 1줄 ellipsis. 우측 `›` chevron 12px gray-70.
- 리스트 영역은 고정 높이 + `overflow-y: auto`, 얇은 스크롤바(폭 4px, thumb gray-20, radius 2, 트랙 투명, 카드 우측 가장자리 안쪽 3px).
- Hover: 배경 bg-tile-hover, 텍스트 underline 없음, chevron 2px 우측 이동.
- 문구 패턴: "~할 때", "~이 궁금하거나 ~" 처럼 **사용자 상황 서술형**.

### 4.11 필터 칩 (원스톱 서비스 상단)

- 높이 30px, `padding: 0 12px`, radius pill, 12/500, 간격 6px, 가로 스크롤 가능.
- 기본: 흰 배경, `border: 1px solid var(--gray-20)`, 글자 gray-70.
- 활성: `background: var(--color-navy)`, 테두리 동색, 글자 흰색 / 700. 첫 칩은 "전체".
- `role="tablist"` 패턴, 선택 시 아래 타일 필터링.

### 4.12 서비스 타일 (원스톱 / 혜택알리미)

**원스톱 타일 (제목 + 설명)**
- 3열, 간격 9px, 높이 60px, 배경 gray-5, radius 8, `padding: 12px 14px`.
- 제목 14/700 gray-90, 설명 12/400 gray-60, 제목↔설명 간격 4px, 둘 다 ellipsis.
- 칩 행 ↔ 타일 간격 12px.

**혜택알리미 타일 (문장형)**
- 2열 × 2행, 간격 9px, 높이 71px, 배경 gray-5, radius 8, `padding: 0 16px`, 세로 중앙.
- 텍스트 14/400 gray-90, 1줄 ellipsis. 문구는 "급한 생활비, ~", "창업을 준비 중이라면, ~"처럼 대상자 상황으로 시작.

Hover(공통): 배경 bg-tile-hover + `inset 0 0 0 1px var(--gray-20)`.

### 4.13 링크 버튼 (외부 서비스 바로가기)

- 2열, 간격 9px, 높이 32px, 배경 gray-5, radius 8.
- 텍스트 12/500 gray-80 가운데 정렬 + 새창 아이콘 12px(간격 4px).
- 타일 행 ↔ 링크 행 간격 9px.

### 4.14 공지사항 카드 + N 배지

- 344 × ≈217px, 흰 카드, border gray-10, radius 16, padding 22px.
- 헤더: 제목 18/700 / 우측 `더 보기 →` 13/400 gray-70(화살표 12px).
- 헤더 ↔ 목록 간격 14px. 행 피치 30px(행 높이 30, 세로 중앙).
- **고정 공지**: 14/700 gray-90 + 우측 핀 아이콘 14px(채움, gray-90), ellipsis.
- **일반 공지**: 13/400 gray-70, `[기관명] 제목…` 형식, ellipsis. 우측 끝 N 배지.
- **N 배지**: 14×14, radius 3px, primary 배경, 흰 글자 9px / 800 "N", 텍스트와 간격 8px, 항상 행 우측 끝에 정렬(텍스트가 짧아도 우측 정렬).
- 목록은 `<ul>` + `<a>`; 배지에 `aria-label="새 글"`.

### 4.15 프로모 배너 캐러셀

- 344 × 226px, radius 16, `overflow: hidden`, 배경 `linear-gradient(135deg, var(--bg-promo-from), var(--bg-promo-to))`.
- 텍스트 영역 좌측 padding 26px, 상단 26px:
  - 헤드라인 3줄 28/800 navy-ink, 행간 36, 자간 -0.02em.
  - 헤드라인 ↔ 서브카피 12px. 서브카피 2줄 19/700 primary, 행간 25.
- 우측: 3D풍 캐릭터 일러스트(인물+노트북), 장식 오브젝트(기울어진 아이콘 카드, 열기구 등)가 카드 밖으로 잘리게 배치. 텍스트와 겹치지 않도록 우측 45% 영역 사용.
- 컨트롤(하단 중앙, bottom 8px): `1 / 3` 인디케이터 pill(48×20, 흰 배경, border gray-20, 12/500) + 간격 8 + 일시정지(20px 원형, 흰 배경, border gray-20, ❚❚ 8px) + 이전/다음(20px 원형 동일 스타일).
- 하단 진행바: 높이 4px, accent-orange, 자동 전환 시간에 맞춰 0→100% 폭 애니메이션.
- 자동 전환 5~7초. **일시정지 버튼 필수**(자동 재생 콘텐츠 정지 수단), 포커스/hover 시 자동 정지.
- `aria-roledescription="carousel"`, 각 슬라이드 `aria-label="1 / 3"`. 배너 전체가 링크면 이미지 alt에 배너 문구 전체를 넣는다.

### 4.16 원형 이전/다음 버튼

- 크기 28×28, radius 50%, 아이콘 chevron 12px(stroke 1.5).
- **이전(비활성 또는 기본)**: 배경 gray-10 수준의 회색(#E3E5E8), 아이콘 gray-70, 테두리 없음.
- **다음(활성)**: 흰 배경, `border: 1px solid var(--gray-20)`, 아이콘 gray-90.
- 첫 페이지에서는 이전이 회색(disabled), 마지막에서는 다음이 회색이 되는 식으로 **활성=흰색 테두리 / 비활성=회색 채움** 규칙.
- Hover(활성): border gray-50. 버튼에 `aria-label="이전"/"다음"`.

### 4.17 아코디언 바 (하단 확장 메뉴)

- 화면 전폭 흰 띠, 높이 50px, `border-top / border-bottom: 1px solid var(--gray-10)`. 콘텐츠 하단과 간격 17~20px.
- 컨테이너 안에 3열(각 270px), 각 열 좌우에 1px gray-10 세로선(열 사이 공유).
- 열: 라벨 15/400 gray-90, 좌측 padding 22px / 우측에 `+` 아이콘 16px(stroke 1.5, gray-80), 우측 padding 22px.
- 펼침: 해당 열 아래로 링크 목록 패널, `+` → `−`, `aria-expanded`.

### 4.18 푸터

- 배경 gray-5, 상단 padding 38px, 하단 padding 100px 이상(넉넉하게).
- 1행: 좌 로고(40px) + 패밀리사이트 chevron(16px, 간격 6px) / 우 SNS 원형 버튼 4개(36×36, 흰 배경, border gray-20, 아이콘 18px gray-90, 간격 8px).
- 1행 ↔ 2행 간격 28px. 2행: 연락처 15/400 gray-90, 라벨만 700(예: **콜센터** 0000-0000 (…), **안내센터** …), 그룹 사이 `|` 구분.
- 2행 ↔ 구분선 간격 32px, 구분선 1px gray-20.
- 3행(구분선 아래 18px): 좌 링크 13px, 간격 12px — 첫 항목 "개인정보처리방침"만 700 + gray-90(강조 필수 링크), 나머지 400 gray-80. 우 저작권 13/400 gray-70.

---

## 5. 아이콘 & 일러스트 시스템

| 종류 | 스타일 | 크기 | 색 | 사용처 |
|---|---|---|---|---|
| UI 라인 아이콘 | 라인 1.5px, 둥근 끝 (lucide 계열) | 12~20px | gray-80/90 | 헤더, chevron, +, ✕, 새창, 검색 |
| 서비스 플랫 아이콘 | 2~3색 플랫, 살짝 입체 | 18px | 주황·파랑·초록 | 자주 찾는 서비스 타일 |
| 카테고리 일러스트 | 컬러풀 플랫/이모지풍 | 24px (48 박스 안) | 다색 | 생활·가족가이드 카테고리 |
| 원형 배경 아이콘 | 라인 아이콘 + gray-5 원 | 16 / 28 | gray-80 | 로그인 카드 서비스 아이콘 |
| 프로모 일러스트 | 3D 캐릭터 / 소품 | 배너 우측 | 파스텔 | 프로모 배너 |

- 아이콘은 프로젝트 자체 제작 또는 라이선스가 명확한 세트를 쓴다.
- 장식 아이콘은 `aria-hidden="true"`, 의미 있는 단독 아이콘 버튼은 `aria-label` 필수.

---

## 6. 인터랙션 & 상태

| 요소 | Hover | Focus-visible | Active/Selected | Disabled |
|---|---|---|---|---|
| 텍스트 링크 | color primary | focus ring | — | gray-30 |
| GNB 메뉴 | primary + 하단 2px 바 | focus ring | 메가메뉴 열림, chevron 회전 | — |
| 타일/리스트 | bg-tile-hover / 1px 테두리 | focus ring (radius 유지) | — | — |
| Primary 버튼 | primary-hover | focus ring | primary-pressed | gray-10 bg, gray-50 text |
| 칩 | border gray-50 | focus ring | navy fill, white text | — |
| 원형 버튼 | border gray-50 | focus ring | — | 회색 채움 |

- 포커스 링: `outline: none; box-shadow: var(--focus-ring);` 모든 인터랙티브 요소에 동일. 키보드 포커스에서만(`:focus-visible`).
- 전환: `transition: background-color var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease);`
- 큰 움직임(캐러셀 슬라이드, 아코디언)은 `--dur-base`. `prefers-reduced-motion: reduce`이면 모두 0ms, 캐러셀 자동 재생 끔.

---

## 7. 반응형 (원본 캡처 외 영역 – 권장안)

| 구간 | 규칙 |
|---|---|
| ≥ 1200px | 원본 그대로 (컨테이너 1080). |
| 1024~1199px | 컨테이너 `calc(100% - 48px)`, 컬럼을 `minmax(0,2fr) minmax(300px,1fr)`로 유동화. |
| 768~1023px | 1단 전환: 검색 → 자주 찾는 서비스 → 로그인 카드 → 원스톱 → 혜택알리미 → 가이드 → 공지 → 프로모. 사이드 카드는 2열 그리드. GNB는 햄버거 + 전체메뉴 드로어. 유틸 바는 드로어 안으로. |
| < 768px | 컨테이너 좌우 16px. 자주 찾는 서비스 타일 2열, 원스톱 타일 1열(또는 가로 스크롤), 혜택알리미 1열. 탭형 카드 노치 유지(탭 폭 70%). 아코디언 바 세로 스택. 검색창 높이 52, 마스코트 44px. 헤더 높이 56, 액션은 아이콘만. 카드 제목 17px, 프로모 헤드라인 24px. |

---

## 8. 접근성 (공공 서비스 기준)

- `<html lang="ko">`, 최상단 "본문 바로가기" 스킵 링크.
- 랜드마크: `header`, `nav[aria-label="주 메뉴"]`, `main`, `aside`, `footer`.
- 제목 계층: 페이지 `h1`(로고 또는 숨김 제목) → 카드 제목 `h2`.
- **화면크기 조절**: 유틸 바 "화면크기" 메뉴에서 루트 `font-size`를 90/100/110/120/130%로 변경 → rem 기반이라 전체가 비례 확대. 선택값은 쿠키/스토리지에 저장.
- 명도대비: 본문 4.5:1 이상 (gray-50 on white ≈ 4.6:1 → 최소 허용선, 14px 미만 텍스트에는 gray-60 이상 사용).
- 새창 링크: 아이콘 + 숨김 텍스트 "새 창 열림".
- 캐러셀: 일시정지·이전·다음 제공, 키보드로 조작 가능, 현재 위치 텍스트(1 / 3).
- 말줄임된 텍스트는 `title` 속성 또는 툴팁으로 전체 제공.
- 터치 대상 최소 44×44 (시각 크기가 작아도 히트 영역 확장).

---

## 9. 구현 템플릿

### 9.1 HTML 골격

```html
<a class="skip-link" href="#main">본문 바로가기</a>

<header class="site-header">
  <div class="container site-header__inner">
    <a class="logo" href="/"><img src="/logo.svg" alt="서비스명 홈" height="40"></a>
    <div class="site-header__right">
      <ul class="util-bar">
        <li><button class="util-bar__item" aria-expanded="false">For Foreigners <i class="ic-chevron-down"></i></button></li>
        <li><a class="util-bar__item" href="#" target="_blank">어린이 <i class="ic-external"></i><span class="sr-only">새 창 열림</span></a></li>
        <li><a class="util-bar__item" href="#" target="_blank">시니어 <i class="ic-external"></i><span class="sr-only">새 창 열림</span></a></li>
        <li><button class="util-bar__item" aria-expanded="false">지원 <i class="ic-chevron-down"></i></button></li>
        <li><button class="util-bar__item" aria-expanded="false">화면크기 <i class="ic-chevron-down"></i></button></li>
      </ul>
      <ul class="header-actions">
        <li><a href="#"><i class="ic-ai"></i>AI비서</a></li>
        <li><a href="#"><i class="ic-search"></i>통합검색</a></li>
        <li><a href="#"><i class="ic-login"></i>로그인</a></li>
        <li><a href="#"><i class="ic-user-plus"></i>회원가입</a></li>
      </ul>
    </div>
  </div>
</header>

<nav class="gnb" aria-label="주 메뉴">
  <ul class="container gnb__list">
    <li><button class="gnb__item" aria-expanded="false">민원서비스 <i class="ic-chevron-down"></i></button></li>
    <!-- … -->
  </ul>
</nav>

<main id="main" class="container home">
  <div class="alert-banner" role="region" aria-label="중요 공지">
    <i class="ic-bell" aria-hidden="true"></i>
    <strong>공지 메시지</strong>
    <a href="#">[자세히 보기]</a>
    <button class="alert-banner__close" aria-label="공지 닫기"><i class="ic-close"></i></button>
  </div>

  <div class="home-grid">
    <div class="area-top">
      <form class="hero-search" role="search">
        <img class="hero-search__avatar" src="/avatar.png" alt="">
        <input type="search" placeholder="안녕하세요. 무엇을 알고 싶으세요?" aria-label="검색어">
        <button aria-label="검색"><i class="ic-search"></i></button>
      </form>
      <section class="quick-panel"><!-- §4.6 --></section>
    </div>
    <section class="card login-card area-login"><!-- §4.7 --></section>
    <section class="tab-card area-guide"><!-- §4.8~4.10 --></section>
    <section class="tab-card area-onestop"><!-- §4.11~4.13 --></section>
    <section class="tab-card area-benefit"><!-- §4.12 --></section>
    <section class="card notice-card area-notice"><!-- §4.14 --></section>
    <section class="promo area-promo"><!-- §4.15 --></section>
  </div>
</main>

<div class="accordion-bar"><!-- §4.17 --></div>
<footer class="site-footer"><!-- §4.18 --></footer>
```

### 9.2 핵심 CSS

```css
*, *::before, *::after { box-sizing: border-box; }
html { font-size: 100%; }
body {
  margin: 0; background: var(--bg-page); color: var(--gray-90);
  font-family: "Pretendard GOV", "Pretendard", -apple-system, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
  font-size: 0.875rem; line-height: 1.43; letter-spacing: -0.01em; word-break: keep-all;
  -webkit-font-smoothing: antialiased;
}
a { color: inherit; text-decoration: none; }
button { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; }
:focus-visible { outline: none; box-shadow: var(--focus-ring); }
.container { width: var(--container); max-width: calc(100% - 32px); margin: 0 auto; }
.ellipsis { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

/* Header */
.site-header { border-bottom: var(--border-default); background: #fff; }
.site-header__inner { height: var(--header-h); display: flex; align-items: center; justify-content: space-between; }
.site-header__right { display: flex; flex-direction: column; align-items: flex-end; gap: 14px; }
.util-bar { display: flex; list-style: none; margin: 0; padding: 0; font-size: 0.8125rem; color: var(--gray-80); }
.util-bar li + li::before { content: ""; display: inline-block; width: 1px; height: 12px; background: var(--gray-20); margin: 0 10px; vertical-align: -1px; }
.header-actions { display: flex; gap: 24px; list-style: none; margin: 0; padding: 0; font-size: 0.9375rem; font-weight: 700; }
.header-actions a { display: inline-flex; align-items: center; gap: 4px; }

/* GNB */
.gnb { border-bottom: var(--border-default); background: #fff; }
.gnb__list { display: flex; gap: 16px; height: var(--gnb-h); list-style: none; padding: 0; }
.gnb__item { height: 100%; padding: 0 14px; font-size: 1.0625rem; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; position: relative; }
.gnb__item:hover, .gnb__item[aria-expanded="true"] { color: var(--color-primary); }
.gnb__item[aria-expanded="true"]::after { content: ""; position: absolute; left: 14px; right: 14px; bottom: -1px; height: 2px; background: var(--color-primary); }

/* Alert */
.alert-banner {
  margin-top: var(--section-gap); height: 36px; padding: 0 24px; border-radius: var(--radius-xs);
  background: var(--color-navy); color: #fff; display: flex; align-items: center; gap: 8px; font-size: 0.9375rem;
}
.alert-banner a { margin-left: 16px; font-size: 0.8125rem; opacity: .9; }
.alert-banner__close { margin-left: auto; color: #fff; width: 32px; height: 32px; }

/* Cards */
.card { background: var(--bg-card); border: var(--border-default); border-radius: var(--radius-lg); padding: var(--card-padding); box-shadow: var(--shadow-card); }
.card__title { font-size: 1.125rem; line-height: 1.625rem; font-weight: 700; margin: 0; }

/* Search */
.hero-search { position: relative; width: 530px; max-width: 100%; height: 58px; margin: 0 auto; border-radius: var(--radius-pill); display: flex; align-items: center; padding: 0 24px 0 86px; /* + gradient border §4.5 */ }
.hero-search__avatar { position: absolute; left: 18px; top: -8px; width: 56px; height: 56px; }
.hero-search input { flex: 1; border: 0; outline: 0; font-size: 1.0625rem; background: transparent; }
.hero-search input::placeholder { color: var(--gray-50); }

/* Quick panel */
.quick-panel { margin-top: 21px; background: var(--bg-quick-panel); border: 1px solid var(--border-quick); border-radius: var(--radius-lg); padding: var(--card-padding); }
.quick-panel__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px 11px; margin-top: 16px; }
.quick-tile { height: 42px; padding: 0 14px; background: #fff; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: space-between; gap: 8px; font-weight: 600; transition: box-shadow var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease); }
.quick-tile:hover { box-shadow: inset 0 0 0 1px var(--color-primary); color: var(--color-primary); }

/* Tiles & lists */
.tile { background: var(--bg-tile); border-radius: var(--radius-sm); transition: background-color var(--dur-fast) var(--ease); }
.tile:hover { background: var(--bg-tile-hover); }
.guide-item { composes: tile; height: 53px; padding: 0 16px 0 14px; display: flex; align-items: center; justify-content: space-between; }
.guide-list { display: grid; gap: 9px; max-height: 300px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--gray-20) transparent; }

/* Chips */
.chip { height: 30px; padding: 0 12px; border-radius: var(--radius-pill); border: 1px solid var(--gray-20); background: #fff; color: var(--gray-70); font-size: 0.75rem; font-weight: 500; }
.chip[aria-selected="true"] { background: var(--color-navy); border-color: var(--color-navy); color: #fff; font-weight: 700; }

/* Round nav button */
.round-btn { width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; background: #fff; border: 1px solid var(--gray-20); color: var(--gray-90); }
.round-btn:disabled { background: #E3E5E8; border-color: transparent; color: var(--gray-70); cursor: default; }

/* Primary button */
.btn-primary { width: 100%; height: 44px; border-radius: var(--radius-xs); background: var(--color-primary); color: #fff; font-size: 0.9375rem; font-weight: 500; }
.btn-primary:hover { background: var(--color-primary-hover); }
.btn-primary:active { background: var(--color-primary-pressed); }

/* Notice */
.notice-list { list-style: none; margin: 14px 0 0; padding: 0; }
.notice-list li { height: 30px; display: flex; align-items: center; gap: 8px; }
.notice-list a { flex: 1; min-width: 0; font-size: 0.8125rem; color: var(--gray-70); }
.notice-list .is-pinned a { font-size: 0.875rem; font-weight: 700; color: var(--gray-90); }
.badge-new { flex: none; width: 14px; height: 14px; border-radius: 3px; background: var(--color-primary); color: #fff; font-size: 9px; font-weight: 800; display: grid; place-items: center; }

/* Accordion bar */
.accordion-bar { margin-top: 18px; border-top: var(--border-default); border-bottom: var(--border-default); background: #fff; }
.accordion-bar__inner { display: grid; grid-template-columns: repeat(3, 270px); }
.accordion-bar__btn { height: 50px; padding: 0 22px; display: flex; align-items: center; justify-content: space-between; font-size: 0.9375rem; border-left: var(--border-default); }
.accordion-bar__btn:last-child { border-right: var(--border-default); }

/* Footer */
.site-footer { background: var(--bg-footer); padding: 38px 0 100px; }
.site-footer__info { margin-top: 28px; font-size: 0.9375rem; }
.site-footer__info b { font-weight: 700; }
.site-footer__bottom { margin-top: 32px; padding-top: 18px; border-top: 1px solid var(--gray-20); display: flex; justify-content: space-between; font-size: 0.8125rem; color: var(--gray-70); }
.site-footer__bottom a:first-child { font-weight: 700; color: var(--gray-90); }

@media (prefers-reduced-motion: reduce) { * { transition-duration: 0ms !important; animation-duration: 0ms !important; } }
```
(`composes`는 CSS Modules 문법. 일반 CSS에서는 `.tile` 클래스를 함께 붙인다.)

### 9.3 프레임워크별 적용 메모

- **Tailwind**: §2 토큰을 `theme.extend.colors / borderRadius / spacing / fontSize`에 등록하고 클래스명을 토큰명으로 쓴다(예: `bg-tile`, `rounded-card`, `text-title`). 탭형 카드는 컴포넌트 CSS(@layer components)로 분리.
- **React/Vue**: `TabCard`, `QuickTile`, `ServiceTile`, `GuideItem`, `Chip`, `RoundNavButton`, `NoticeList`, `PromoCarousel`, `AccordionBar`를 독립 컴포넌트로 만들고, 카드 콘텐츠는 props(title, href, items)로 주입.
- 데이터는 하드코딩하지 말고 배열로 분리(자주 찾는 서비스 8개 단위 페이지, 공지 5개, 프로모 3장).

---

## 10. 최종 체크리스트

- [ ] 컨테이너 1080px, 헤더·GNB·본문·아코디언·푸터의 좌우 라인이 모두 일치한다.
- [ ] 검색창 top = 로그인 카드 top, 패널/카드 하단 라인이 §3.3대로 맞는다.
- [ ] 카드 radius 16 / 타일 radius 8 / 버튼·알림 radius 4 / 칩·검색 pill.
- [ ] 면 구분은 1px gray-10 테두리 + gray-5 타일. 그림자는 사실상 없음.
- [ ] 포인트 색은 primary 블루 + navy만 사용, 다른 색은 아이콘 내부에만.
- [ ] 탭형 카드의 외곽선이 탭↔본문 오목 곡선까지 끊김 없이 이어진다.
- [ ] 원형 버튼: 활성=흰색+테두리, 비활성=회색 채움.
- [ ] 모든 1줄 텍스트 ellipsis, `word-break: keep-all`.
- [ ] 키보드 포커스 링, 스킵 링크, 캐러셀 일시정지, 새창 안내, rem 기반 화면크기 확대.
- [ ] 실제 기관 엠블럼·워드마크·마스코트·기관명을 쓰지 않았다(자체 자산으로 대체).

### Do / Don't

| Do | Don't |
|---|---|
| 회색 타일을 격자로 촘촘히 배열 | 큰 여백의 마케팅형 히어로 |
| 사용자 상황 서술형 문구("~할 때") | 기능명만 나열한 짧은 라벨 남발 |
| 제목 18/700 + chevron으로 섹션 링크 | 제목마다 다른 색/크기 |
| 1px 테두리, 낮은 대비의 면 구분 | 진한 그림자, 카드마다 다른 배경색 |
| 블루는 CTA·링크·선택 상태에만 | 블루를 장식/배경 면으로 넓게 사용 |
