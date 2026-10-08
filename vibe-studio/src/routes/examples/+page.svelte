<script lang="ts">
	import { EXAMPLES, type ExampleSlug } from '#lib/examples/catalog.ts';

	const SWIPE_PX = 60;

	let index = $state(0);
	let startX: number | null = null;
	let swiped = false;

	function go(i: number) {
		index = (i + EXAMPLES.length) % EXAMPLES.length;
	}

	function onPointerDown(event: PointerEvent) {
		startX = event.clientX;
		swiped = false;
	}

	function onPointerUp(event: PointerEvent) {
		if (startX === null) return;
		const dx = event.clientX - startX;
		startX = null;

		if (Math.abs(dx) > SWIPE_PX) {
			swiped = true;
			go(index + (dx < 0 ? 1 : -1));
		}
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft') go(index - 1);
		else if (event.key === 'ArrowRight') go(index + 1);
		else return;
		event.preventDefault();
	}

	// A swipe ends on a card link, and a side card only brings itself to the centre.
	function onCardClick(event: MouseEvent, i: number) {
		if (swiped || i !== index) {
			event.preventDefault();
			swiped = false;
			if (i !== index) go(i);
		}
	}
</script>

<svelte:head>
	<title>AI 따라해보기 · Vibe Studio</title>
</svelte:head>

{#snippet chatbotPreview()}
	<div class="pv pv-chat">
		<div class="pv-bar">현장 문서 도우미 <span>현장 문서 32건 학습</span></div>
		<div class="pv-body">
			<p class="bubble me">이번 주 3공구 콘크리트 타설 일정 알려줘</p>
			<p class="bubble bot">
				3공구 타설은 <strong>10월 8일(수) 오전 7시</strong>에 예정되어 있어요. 우천 시 9일로 미뤄지며, 펌프카 2대가 배정되어 있습니다.
				<span class="tags"><span>공정표_10월.xlsx</span><span>작업일보_1006.pdf</span></span>
			</p>
			<p class="bubble me">안전 점검 담당자는 누구야?</p>
		</div>
	</div>
{/snippet}

{#snippet excelPreview()}
	<div class="pv pv-split">
		<div class="pv-col">
			<span class="pv-file">자재_입출고_2026.xlsx</span>
			<table class="pv-table">
				<thead><tr><th>현장</th><th>자재</th><th>수량</th><th>단위</th></tr></thead>
				<tbody>
					<tr><td>A현장</td><td>철근</td><td>42</td><td>톤</td></tr>
					<tr><td>B현장</td><td>철근</td><td>27</td><td>톤</td></tr>
					<tr><td>A현장</td><td>레미콘</td><td>310</td><td>㎥</td></tr>
					<tr><td>C현장</td><td>철근</td><td>18</td><td>톤</td></tr>
					<tr><td>B현장</td><td>거푸집</td><td>120</td><td>장</td></tr>
				</tbody>
			</table>
		</div>
		<div class="pv-col">
			<p class="bubble me">현장별 철근 사용량 합계는?</p>
			<div class="pv-card">
				<span>A현장이 가장 많이 사용했어요.</span>
				{#each [['A현장', 100, '42톤'], ['B현장', 64, '27톤'], ['C현장', 43, '18톤']] as [label, w, value] (label)}
					<div class="pv-barrow"><span>{label}</span><span class="meter"><span style:width="{w}%"></span></span><span>{value}</span></div>
				{/each}
			</div>
		</div>
	</div>
{/snippet}

{#snippet buildPreview()}
	<div class="pv pv-three">
		<div class="pv-card">
			<span class="pv-step">1분 · 말로 요청</span>
			<p class="pv-req">협력업체가 안전 교육 이수증을 올리고, 담당자가 확인하는 페이지 만들어줘</p>
		</div>
		<div class="pv-card">
			<span class="pv-step">3분 · AI가 만드는 중</span>
			<span class="pv-check done">요청 내용 확인</span>
			<span class="pv-check done">올리기 화면 만들기</span>
			<span class="pv-check current">확인 화면 만드는 중</span>
			<span class="pv-check">검토</span>
		</div>
		<div class="pv-card pv-app">
			<span class="pv-apphead">안전 교육 이수증 확인</span>
			<span class="pv-row">○○건설 · 김OO <em class="ok">확인 완료</em></span>
			<span class="pv-row">△△전기 · 박OO <em class="wait">확인 대기</em></span>
			<span class="pv-row">□□설비 · 이OO <em class="wait">확인 대기</em></span>
			<span class="pv-done">5분 · 완성</span>
		</div>
	</div>
{/snippet}

{#snippet dashboardPreview()}
	<div class="pv pv-dash">
		<div class="pv-kpis">
			{#each [['진행 현장', '14'], ['이번 달 기성', '38.2억'], ['미결 계약', '6'], ['협력업체', '87']] as [label, value] (label)}
				<div class="pv-card"><span class="pv-label">{label}</span><strong>{value}</strong></div>
			{/each}
		</div>
		<div class="pv-dashrow">
			<div class="pv-card">
				<span class="pv-label">월별 기성 금액</span>
				<div class="pv-chart">
					{#each [40, 55, 48, 70, 62, 88] as h, i (i)}
						<span class:last={i === 5} style:height="{h}%"></span>
					{/each}
				</div>
			</div>
			<div class="pv-card">
				<span class="pv-label">거래처 최근 연락</span>
				<span class="pv-row">○○건설 <em>오늘</em></span>
				<span class="pv-row">△△전기 <em>어제</em></span>
				<span class="pv-row">□□설비 <em>3일 전</em></span>
				<span class="pv-row">◇◇자재 <em class="late">2주 전 · 연락 필요</em></span>
			</div>
		</div>
	</div>
{/snippet}

{#snippet comparePreview()}
	<div class="pv pv-compare">
		<p class="pv-quote">“화면이 좀 밝았으면 좋겠습니다”</p>
		<div class="pv-ba">
			<div class="pv-screen dark">
				<span class="pv-apphead">현장 작업일보 · 적용 전</span>
				<div class="pv-blocks"><span></span><span></span><span></span></div>
				<div class="pv-lines"><span></span><span></span><span></span></div>
			</div>
			<span class="pv-arrow" aria-hidden="true">→</span>
			<div class="pv-screen light">
				<span class="pv-apphead">현장 작업일보 · 적용 후</span>
				<div class="pv-blocks"><span></span><span></span><span></span></div>
				<div class="pv-lines"><span></span><span></span><span></span></div>
			</div>
		</div>
	</div>
{/snippet}

{#snippet preview(slug: ExampleSlug)}
	{#if slug === 'chatbot'}{@render chatbotPreview()}
	{:else if slug === 'excel'}{@render excelPreview()}
	{:else if slug === 'build'}{@render buildPreview()}
	{:else if slug === 'dashboard'}{@render dashboardPreview()}
	{:else}{@render comparePreview()}
	{/if}
{/snippet}

<div class="page">
	<header class="site-header">
		<div class="container bar">
			<a class="brand" href="/examples"><span class="logo">◆</span> Vibe Studio</a>
			<nav aria-label="주요 메뉴">
				<a href="/examples" aria-current="page">AI 따라해보기</a>
				<a href="/projects">내 프로젝트</a>
			</nav>
		</div>
	</header>

	<main>
		<div class="intro">
			<h1>AI 따라해보기</h1>
			<p>코딩을 몰라도 이런 것을 만들 수 있어요. 예시를 눌러 직접 써 보세요.</p>
		</div>

		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<section class="carousel" aria-roledescription="carousel" aria-label="모범 예시" onkeydown={onKeydown}>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="viewport" onpointerdown={onPointerDown} onpointerup={onPointerUp} onpointercancel={() => (startX = null)}>
				<div class="track" style:--index={index}>
					{#each EXAMPLES as example, i (example.slug)}
						<a
							class="card"
							class:current={i === index}
							href="/examples/{example.slug}"
							aria-label="예시 {i + 1}. {example.title} 직접 써 보기"
							tabindex={i === index ? 0 : -1}
							draggable="false"
							onclick={(e) => onCardClick(e, i)}
						>
							<div class="preview" aria-hidden="true">{@render preview(example.slug)}</div>
							<div class="caption">
								<span class="no">{example.no}</span>
								<span class="text">
									<strong>{example.title}</strong>
									<span>{example.summary}</span>
								</span>
								<span class="cta">직접 써 보기 →</span>
							</div>
						</a>
					{/each}
				</div>
			</div>

			<div class="controls">
				<button type="button" class="arrow" aria-label="이전 예시" onclick={() => go(index - 1)}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
				</button>
				<div class="dots">
					{#each EXAMPLES as example, i (example.slug)}
						<button
							type="button"
							class="dot"
							aria-label="{i + 1}번 예시: {example.title}"
							aria-pressed={i === index}
							onclick={() => go(i)}
						><span></span></button>
					{/each}
				</div>
				<button type="button" class="arrow" aria-label="다음 예시" onclick={() => go(index + 1)}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
				</button>
			</div>
		</section>

		<div class="container login-row">
			<a class="login" href="/login">로그인 →</a>
		</div>
	</main>
</div>

<style>
	.page {
		min-height: 100vh;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
	}

	.container {
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
	}

	.site-header {
		background: var(--panel);
		border-bottom: 1px solid var(--border);
	}

	.bar {
		display: flex;
		align-items: center;
		gap: 2.5rem;
		height: 64px;
	}

	.brand {
		font-weight: 700;
		color: var(--text);
		text-decoration: none;
	}

	.logo {
		color: var(--accent);
	}

	.site-header nav {
		display: flex;
		gap: 1.75rem;
		height: 100%;
	}

	.site-header nav a {
		display: flex;
		align-items: center;
		border-bottom: 3px solid transparent;
		padding-top: 3px;
		color: var(--muted);
		font-weight: 600;
		text-decoration: none;
	}

	.site-header nav a:hover {
		color: var(--text);
	}

	.site-header nav a[aria-current='page'] {
		color: var(--accent);
		border-bottom-color: var(--accent);
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2rem;
		padding: 3rem 0 2.5rem;
		overflow: hidden;
	}

	.intro {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 0 1rem;
		text-align: center;
	}

	.intro h1 {
		margin: 0;
		font-size: 2.5rem;
		letter-spacing: -0.03em;
	}

	.intro p {
		margin: 0;
		font-size: 1.05rem;
		color: var(--muted);
	}

	/* Carousel */
	.carousel {
		--card: min(960px, calc(100vw - 2rem));
		--gap: 24px;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.viewport {
		overflow: hidden;
		touch-action: pan-y;
		cursor: grab;
	}

	.track {
		display: flex;
		gap: var(--gap);
		padding-left: calc(50% - var(--card) / 2);
		transform: translateX(calc(var(--index) * (var(--card) + var(--gap)) * -1));
		transition: transform 0.35s ease;
	}

	.card {
		flex: none;
		width: var(--card);
		display: flex;
		flex-direction: column;
		border: 1px solid var(--border);
		border-radius: 12px;
		overflow: hidden;
		background: var(--panel);
		color: var(--text);
		text-decoration: none;
		opacity: 0.45;
		transition: opacity 0.35s ease;
		user-select: none;
	}

	.card.current {
		opacity: 1;
	}

	.card:focus-visible {
		outline: 3px solid var(--accent);
		outline-offset: 2px;
	}

	.preview {
		height: 400px;
		background: var(--bg);
		overflow: hidden;
	}

	.caption {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.1rem 1.6rem;
		border-top: 1px solid var(--border);
	}

	.no {
		font-family: ui-monospace, 'Cascadia Code', monospace;
		color: var(--accent);
	}

	.text {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}

	.text strong {
		font-size: 1.2rem;
	}

	.text span {
		font-size: 0.88rem;
		color: var(--muted);
	}

	.cta {
		margin-left: auto;
		flex: none;
		font-weight: 700;
		color: var(--accent);
	}

	.controls {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
	}

	.arrow {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border: 1px solid var(--border);
		border-radius: 22px;
		background: var(--panel);
		color: var(--text);
		cursor: pointer;
	}

	.arrow:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.dots {
		display: flex;
		gap: 4px;
	}

	.dot {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 44px;
		padding: 0;
		border: none;
		background: transparent;
		cursor: pointer;
	}

	.dot span {
		width: 8px;
		height: 8px;
		border-radius: 4px;
		background: var(--border);
		transition: width 0.25s ease;
	}

	.dot[aria-pressed='true'] span {
		width: 24px;
		background: var(--accent);
	}

	.login-row {
		display: flex;
		justify-content: flex-end;
	}

	.login {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 160px;
		min-height: 52px;
		padding: 0 1.75rem;
		border-radius: 8px;
		background: var(--accent);
		color: var(--panel);
		font-size: 1.05rem;
		font-weight: 700;
		text-decoration: none;
	}

	.login:hover {
		filter: brightness(1.08);
	}

	/* Static previews inside the cards */
	.pv {
		height: 100%;
		box-sizing: border-box;
		font-size: 0.9rem;
	}

	.pv p {
		margin: 0;
	}

	.pv-card {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding: 1rem;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--panel);
	}

	.bubble {
		max-width: 70%;
		padding: 0.75rem 1rem;
		border-radius: 10px;
		line-height: 1.7;
	}

	.bubble.me {
		align-self: flex-end;
		background: var(--accent-soft);
	}

	.bubble.bot {
		align-self: flex-start;
		border: 1px solid var(--border);
		background: var(--panel);
	}

	.tags {
		display: flex;
		gap: 0.4rem;
		margin-top: 0.6rem;
	}

	.tags span {
		padding: 0.1rem 0.5rem;
		border-radius: 4px;
		background: var(--accent-soft);
		color: var(--accent);
		font-size: 0.75rem;
		font-weight: 700;
	}

	.pv-chat {
		display: flex;
		flex-direction: column;
	}

	.pv-bar {
		display: flex;
		padding: 0.85rem 1.5rem;
		background: var(--accent);
		color: var(--panel);
		font-weight: 700;
	}

	.pv-bar span {
		margin-left: auto;
		font-size: 0.75rem;
		font-weight: 400;
	}

	.pv-body {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
		padding: 1.5rem;
	}

	.pv-split {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	.pv-col {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1.5rem;
	}

	.pv-col:first-child {
		border-right: 1px solid var(--border);
	}

	.pv-file {
		font-weight: 700;
		color: var(--success);
	}

	.pv-table {
		border-collapse: collapse;
		background: var(--panel);
		border: 1px solid var(--border);
		font-size: 0.82rem;
	}

	.pv-table th,
	.pv-table td {
		padding: 0.5rem;
		text-align: left;
		border-top: 1px solid var(--border);
	}

	.pv-table th {
		background: var(--accent-soft);
	}

	.pv-barrow {
		display: grid;
		grid-template-columns: 56px 1fr 44px;
		gap: 0.5rem;
		align-items: center;
	}

	.meter {
		height: 14px;
	}

	.meter span {
		display: block;
		height: 100%;
		background: var(--accent);
	}

	.pv-three {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1.25rem;
		padding: 2rem;
	}

	.pv-step {
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--accent);
	}

	.pv-req {
		padding: 0.75rem;
		border-radius: 8px;
		background: var(--accent-soft);
		line-height: 1.7;
	}

	.pv-check {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--muted);
	}

	.pv-check::before {
		content: '';
		width: 16px;
		height: 16px;
		border-radius: 50%;
		border: 2px solid var(--border);
	}

	.pv-check.done {
		color: var(--text);
	}

	.pv-check.done::before {
		border-color: var(--success);
		background: var(--success);
	}

	.pv-check.current {
		color: var(--accent);
		font-weight: 700;
	}

	.pv-check.current::before {
		border-color: var(--accent);
	}

	.pv-app {
		padding: 0;
		overflow: hidden;
	}

	.pv-apphead {
		padding: 0.6rem 0.9rem;
		background: var(--accent);
		color: var(--panel);
		font-size: 0.8rem;
		font-weight: 700;
	}

	.pv-row {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.35rem 0;
		border-bottom: 1px solid var(--border);
		font-size: 0.82rem;
	}

	.pv-app .pv-row {
		margin: 0 0.9rem;
	}

	.pv-row em {
		font-style: normal;
		color: var(--muted);
	}

	.pv-row em.ok {
		color: var(--success);
		font-weight: 700;
	}

	.pv-row em.wait {
		color: var(--warning);
		font-weight: 700;
	}

	.pv-row em.late {
		color: var(--danger);
		font-weight: 700;
	}

	.pv-done {
		margin: auto 0.9rem 0.9rem;
		padding: 0.5rem;
		border-radius: 6px;
		background: var(--accent);
		color: var(--panel);
		font-size: 0.8rem;
		font-weight: 700;
		text-align: center;
	}

	.pv-dash {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.5rem;
	}

	.pv-kpis {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0.75rem;
	}

	.pv-kpis strong {
		font-size: 1.5rem;
	}

	.pv-label {
		font-size: 0.78rem;
		font-weight: 700;
		color: var(--muted);
	}

	.pv-dashrow {
		flex: 1;
		display: grid;
		grid-template-columns: 1.4fr 1fr;
		gap: 0.75rem;
	}

	.pv-chart {
		flex: 1;
		display: flex;
		align-items: flex-end;
		gap: 0.6rem;
	}

	.pv-chart span {
		flex: 1;
		background: var(--accent-soft);
	}

	.pv-chart span.last {
		background: var(--accent);
	}

	.pv-compare {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.75rem;
	}

	.pv-quote {
		align-self: center;
		padding: 0.6rem 1.1rem;
		border-radius: 10px;
		background: var(--accent-soft);
		font-size: 1rem;
	}

	.pv-ba {
		flex: 1;
		display: grid;
		grid-template-columns: 1fr 48px 1fr;
		align-items: stretch;
	}

	.pv-arrow {
		align-self: center;
		text-align: center;
		font-size: 1.6rem;
		color: var(--accent);
	}

	.pv-screen {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		border-radius: 10px;
		overflow: hidden;
	}

	/* The dark "before" screen is the subject of the demo, not app chrome. */
	.pv-screen.dark {
		background: #16181b;
	}

	.pv-screen.dark .pv-apphead {
		background: #0e0f11;
		color: #8a949e;
	}

	.pv-screen.light {
		border: 1px solid var(--border);
		background: var(--panel);
	}

	.pv-blocks {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
		padding: 0 0.9rem;
	}

	.pv-blocks span {
		height: 56px;
		border-radius: 6px;
	}

	.pv-lines {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0 0.9rem;
	}

	.pv-lines span {
		height: 14px;
	}

	.pv-lines span:last-child {
		width: 70%;
	}

	.dark .pv-blocks span,
	.dark .pv-lines span {
		background: #202327;
	}

	.light .pv-blocks span,
	.light .pv-lines span {
		background: var(--bg);
	}

	@media (max-width: 800px) {
		.container {
			padding: 0 1rem;
		}

		.bar {
			gap: 1.25rem;
		}

		.intro h1 {
			font-size: 1.9rem;
		}

		.preview {
			height: 300px;
		}

		.caption {
			flex-wrap: wrap;
			padding: 1rem;
		}

		.cta {
			margin-left: 0;
		}

		.pv-split,
		.pv-three,
		.pv-dashrow {
			grid-template-columns: 1fr;
		}

		.pv-kpis {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
