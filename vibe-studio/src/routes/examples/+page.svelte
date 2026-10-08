<script lang="ts">
	import '#lib/examples/themes.css';
	import { EXAMPLES, EXAMPLE_FONTS_URL, type ExampleSlug } from '#lib/examples/catalog.ts';

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
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link rel="stylesheet" href={EXAMPLE_FONTS_URL} crossorigin="anonymous" />
</svelte:head>

<!-- Each preview is a miniature of its example, drawn with that example's design skill tokens. -->

{#snippet chatbotPreview()}
	<div class="pv pv-chat">
		<div class="pv-chat-side">
			<span class="pebble" aria-hidden="true"></span>
			<strong>현장 문서 도우미</strong>
			<span class="doc used">공정표_10월.xlsx</span>
			<span class="doc used">작업일보_1006.pdf</span>
			<span class="doc">안전관리계획서.pdf</span>
		</div>
		<div class="pv-chat-main">
			<p class="bubble me">이번 주 3공구 콘크리트 타설 일정 알려줘</p>
			<p class="bubble bot">
				3공구 타설은 <strong>10월 8일(수) 오전 7시</strong>에 예정되어 있어요. 우천 시 9일로 미뤄집니다.
				<span class="tags"><span>공정표_10월.xlsx</span><span>작업일보_1006.pdf</span></span>
			</p>
			<p class="bubble me">안전 점검 담당자는 누구야?</p>
		</div>
	</div>
{/snippet}

{#snippet excelPreview()}
	<div class="pv pv-mono">
		<span class="mono-meta">FILE · 자재_입출고_2026.xlsx</span>
		<p class="mono-title">현장별 철근 사용량 합계는?</p>
		<div class="mono-grid">
			<table>
				<thead><tr><th>현장</th><th>자재</th><th>수량</th></tr></thead>
				<tbody>
					<tr class="b"><td>A현장</td><td>철근</td><td>42</td></tr>
					<tr class="b"><td>B현장</td><td>철근</td><td>27</td></tr>
					<tr><td>A현장</td><td>레미콘</td><td>310</td></tr>
					<tr class="b"><td>C현장</td><td>철근</td><td>18</td></tr>
				</tbody>
			</table>
			<div class="mono-bars">
				{#each [['01', 'A현장', 100, '42톤'], ['02', 'B현장', 64, '27톤'], ['03', 'C현장', 43, '18톤']] as [no, label, w, value] (label)}
					<div><span class="mono-meta">{no}</span><span>{label}</span><span class="meter"><span style:width="{w}%"></span></span><span>{value}</span></div>
				{/each}
			</div>
		</div>
	</div>
{/snippet}

{#snippet buildPreview()}
	<div class="pv pv-brutal">
		<div class="nb-box yellow">
			<span class="nb-label">STEP 1</span>
			<strong class="nb-title">말로 요청</strong>
			<p>협력업체가 안전 교육 이수증을 올리고, 담당자가 확인하는 페이지 만들어줘</p>
		</div>
		<div class="nb-box pink">
			<span class="nb-label">STEP 2</span>
			<strong class="nb-title">AI가 만드는 중</strong>
			<span class="nb-step done">✓ 요청 내용 확인</span>
			<span class="nb-step done">✓ 올리기 화면 만들기</span>
			<span class="nb-step current">3 확인 화면 만드는 중</span>
		</div>
		<div class="nb-box white">
			<span class="nb-sticker">5분 완성!</span>
			<strong class="nb-title">이수증 확인</strong>
			<span class="nb-row">○○건설 <em class="ok">확인 완료</em></span>
			<span class="nb-row">△△전기 <em>대기</em></span>
			<span class="nb-row">□□설비 <em>대기</em></span>
		</div>
	</div>
{/snippet}

{#snippet dashboardPreview()}
	<div class="pv pv-dark">
		<div class="dd-side">
			<span class="dd-brand">◆ 현장 통합관리</span>
			<span class="dd-menu active">대시보드</span>
			<span class="dd-menu">현장</span>
			<span class="dd-menu">거래처</span>
		</div>
		<div class="dd-main">
			<div class="dd-kpis">
				{#each [['이번 달 기성', '20.6억', '▲ 3.6억'], ['평균 공정률', '44%', ''], ['미결 계약', '6', ''], ['협력업체', '87', '']] as [label, value, badge] (label)}
					<div class="dd-card"><span class="dd-label">{label}</span><strong>{value}</strong>{#if badge}<span class="dd-up">{badge}</span>{/if}</div>
				{/each}
			</div>
			<div class="dd-card dd-chart">
				<span class="dd-label">월별 기성 금액</span>
				<div class="dd-bars">
					{#each [48, 64, 66, 79, 83, 100] as h, i (i)}
						<span class:last={i === 5} style:height="{h}%"></span>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/snippet}

{#snippet comparePreview()}
	<div class="pv pv-editorial">
		<span class="ed-label">REQUEST NO. 01</span>
		<p class="ed-quote">“화면이 좀 밝았으면 좋겠습니다”</p>
		<div class="ed-rule" aria-hidden="true"></div>
		<div class="ed-ba">
			<div class="ed-screen dark">
				<span class="ed-head">현장 작업일보 · 적용 전</span>
				<div class="ed-blocks"><span></span><span></span><span></span></div>
				<div class="ed-lines"><span></span><span></span><span></span></div>
			</div>
			<span class="ed-arrow" aria-hidden="true">→</span>
			<div class="ed-screen light">
				<span class="ed-head">현장 작업일보 · 적용 후</span>
				<div class="ed-blocks"><span></span><span></span><span></span></div>
				<div class="ed-lines"><span></span><span></span><span></span></div>
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
							<div class="preview theme-{example.design}" aria-hidden="true">{@render preview(example.slug)}</div>
							<div class="caption">
								<span class="no">{example.no}</span>
								<span class="text">
									<strong>{example.title}</strong>
									<span>{example.summary}</span>
								</span>
								<span class="design">{example.designTitle}</span>
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
	/* Page chrome uses the app tokens from +layout.svelte. */
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

	.design {
		margin-left: auto;
		flex: none;
		padding: 0.2rem 0.6rem;
		border-radius: 999px;
		background: var(--accent-soft);
		color: var(--accent);
		font-size: 0.75rem;
		font-weight: 700;
	}

	.cta {
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

	/* Previews: everything below reads the theme tokens of the .theme-* scope on .preview. */
	.pv {
		height: 100%;
		box-sizing: border-box;
		font-size: 14px;
	}

	.pv p {
		margin: 0;
	}

	/* nature-green */
	.pv-chat {
		display: grid;
		grid-template-columns: 240px 1fr;
		gap: 20px;
		padding: 24px;
	}

	.pv-chat-side {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 20px;
		border-radius: var(--radius);
		background: var(--sage);
	}

	.pv-chat-side strong {
		font-family: var(--font-serif);
		font-size: 18px;
		color: var(--forest);
	}

	.pebble {
		width: 44px;
		height: 44px;
		border-radius: var(--pebble);
		background: var(--forest);
	}

	.doc {
		padding: 8px 12px;
		border-radius: var(--radius-pill);
		background: var(--surface);
		color: var(--ink-2);
		font-size: 13px;
	}

	.doc.used {
		background: var(--forest);
		color: var(--surface);
		font-weight: 600;
	}

	.pv-chat-main {
		display: flex;
		flex-direction: column;
		gap: 14px;
		padding: 20px;
		border-radius: 28px;
		background: var(--surface);
		box-shadow: var(--shadow);
	}

	.bubble {
		max-width: 80%;
		padding: 12px 16px;
		border-radius: var(--radius);
		line-height: 1.7;
	}

	.bubble.me {
		align-self: flex-end;
		border-bottom-right-radius: 6px;
		background: var(--sage-2);
	}

	.bubble.bot {
		align-self: flex-start;
		border-bottom-left-radius: 6px;
		background: var(--bg);
	}

	.tags {
		display: flex;
		gap: 6px;
		margin-top: 8px;
	}

	.tags span {
		padding: 2px 10px;
		border-radius: var(--radius-pill);
		background: var(--sage-2);
		color: var(--forest);
		font-size: 12px;
		font-weight: 600;
	}

	/* minimal-mono */
	.pv-mono {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 36px 40px;
	}

	.mono-meta {
		font-family: var(--font-mono);
		font-size: 12px;
		letter-spacing: 0.04em;
		color: var(--ink-3);
	}

	.mono-title {
		padding-bottom: 16px;
		border-bottom: 1px solid var(--ink);
		font-size: 36px;
		font-weight: 700;
		letter-spacing: -0.03em;
	}

	.mono-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 40px;
	}

	.pv-mono table {
		border-collapse: collapse;
	}

	.pv-mono th {
		padding: 8px 4px;
		border-bottom: 1px solid var(--ink);
		font-family: var(--font-mono);
		font-size: 12px;
		font-weight: 500;
		color: var(--ink-2);
		text-align: left;
	}

	.pv-mono td {
		padding: 8px 4px;
		border-bottom: 1px solid var(--line);
		color: var(--ink-3);
	}

	.pv-mono tr.b td {
		color: var(--ink);
		font-weight: 700;
	}

	.mono-bars {
		display: flex;
		flex-direction: column;
		border-top: 1px solid var(--line);
	}

	.mono-bars > div {
		display: grid;
		grid-template-columns: 28px 56px 1fr 44px;
		gap: 8px;
		align-items: center;
		min-height: 44px;
		border-bottom: 1px solid var(--line);
	}

	.meter {
		height: 8px;
		background: var(--paper-2);
	}

	.meter span {
		display: block;
		height: 100%;
		background: var(--ink);
	}

	/* neo-brutal */
	.pv-brutal {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 24px;
		padding: 32px 36px 40px;
	}

	.nb-box {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 20px;
		border: var(--border);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
		font-weight: 500;
	}

	.nb-box.yellow {
		background: var(--yellow);
	}

	.nb-box.pink {
		background: var(--pink);
	}

	.nb-box.white {
		background: var(--white);
	}

	.nb-label {
		font-family: var(--font-mono);
		font-size: 13px;
		font-weight: 700;
	}

	.nb-title {
		font-family: var(--font-display);
		font-size: 24px;
		font-weight: 400;
		line-height: 1.1;
	}

	.nb-box p {
		padding: 10px;
		border: var(--border-thin);
		border-radius: var(--radius);
		background: var(--white);
		line-height: 1.6;
	}

	.nb-step {
		padding: 6px 8px;
		border: var(--border-thin);
		border-radius: var(--radius);
		background: var(--white);
		font-weight: 700;
	}

	.nb-step.done {
		background: var(--green);
	}

	.nb-step.current {
		box-shadow: var(--shadow-sm);
	}

	.nb-sticker {
		position: absolute;
		top: -18px;
		right: -10px;
		padding: 8px 12px;
		border: var(--border);
		border-radius: var(--radius);
		background: var(--blue);
		font-family: var(--font-display);
		font-size: 16px;
		transform: rotate(6deg);
	}

	.nb-row {
		display: flex;
		justify-content: space-between;
		padding: 6px 0;
		border-bottom: var(--border-thin);
		font-weight: 700;
	}

	.nb-row em {
		font-style: normal;
		font-family: var(--font-mono);
		font-size: 12px;
	}

	.nb-row em.ok {
		padding: 0 4px;
		background: var(--green);
	}

	/* dark-dashboard */
	.pv-dark {
		display: grid;
		grid-template-columns: 180px 1fr;
	}

	.dd-side {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 20px 12px;
		border-right: 1px solid var(--line);
		background: var(--surface);
	}

	.dd-brand {
		padding: 0 8px 12px;
		font-weight: 700;
		color: var(--accent);
	}

	.dd-menu {
		padding: 8px 12px;
		border-radius: var(--radius-sm);
		color: var(--ink-2);
	}

	.dd-menu.active {
		background: var(--surface-2);
		color: var(--ink);
		box-shadow: inset 3px 0 0 var(--accent);
	}

	.dd-main {
		display: flex;
		flex-direction: column;
		gap: 14px;
		padding: 24px;
	}

	.dd-kpis {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 12px;
	}

	.dd-card {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 14px;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--surface);
	}

	.dd-card strong {
		font-size: 24px;
		font-variant-numeric: tabular-nums;
	}

	.dd-label {
		font-size: 12px;
		font-weight: 600;
		color: var(--ink-2);
	}

	.dd-up {
		align-self: flex-start;
		padding: 1px 6px;
		border-radius: 4px;
		background: rgb(52 211 153 / 0.12);
		color: var(--up);
		font-size: 11px;
		font-weight: 600;
	}

	.dd-chart {
		flex: 1;
	}

	.dd-bars {
		flex: 1;
		display: flex;
		align-items: flex-end;
		gap: 14px;
		padding: 0 8px;
		background: repeating-linear-gradient(to top, var(--line) 0 1px, transparent 1px 40px);
	}

	.dd-bars span {
		flex: 1;
		border-radius: 4px 4px 0 0;
		background: var(--chart-2);
	}

	.dd-bars span.last {
		background: var(--chart-1);
	}

	/* warm-editorial */
	.pv-editorial {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 32px 40px;
	}

	.ed-label {
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.12em;
		color: var(--accent-ink);
	}

	.ed-quote {
		font-family: var(--font-serif);
		font-size: 28px;
		font-weight: 700;
	}

	.ed-rule {
		height: 7px;
		border-top: 2px solid var(--ink);
		border-bottom: 1px solid var(--line);
	}

	.ed-ba {
		flex: 1;
		display: grid;
		grid-template-columns: 1fr 48px 1fr;
		margin-top: 8px;
	}

	.ed-arrow {
		align-self: center;
		text-align: center;
		font-family: var(--font-serif);
		font-size: 28px;
		color: var(--accent);
	}

	.ed-screen {
		display: flex;
		flex-direction: column;
		gap: 12px;
		border-radius: var(--radius);
		overflow: hidden;
		box-shadow: var(--shadow);
	}

	.ed-head {
		padding: 10px 14px;
		font-family: var(--font-serif);
		font-size: 14px;
		font-weight: 700;
	}

	.ed-blocks {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		padding: 0 14px;
	}

	.ed-blocks span {
		height: 52px;
		border-radius: var(--radius);
	}

	.ed-lines {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 0 14px;
	}

	.ed-lines span {
		height: 12px;
	}

	.ed-lines span:last-child {
		width: 70%;
	}

	/* The dark "before" screen is the subject of the demo, not app chrome. */
	.ed-screen.dark {
		background: #16181b;
	}

	.ed-screen.dark .ed-head {
		background: #0e0f11;
		color: #8a949e;
	}

	.ed-screen.dark .ed-blocks span,
	.ed-screen.dark .ed-lines span {
		background: #202327;
	}

	.ed-screen.light {
		background: var(--card);
	}

	.ed-screen.light .ed-head {
		border-bottom: 1px solid var(--line);
		color: var(--ink);
	}

	.ed-screen.light .ed-blocks span {
		background: var(--paper);
	}

	.ed-screen.light .ed-lines span {
		background: var(--paper-2);
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

		.design {
			margin-left: 0;
		}

		.pv-chat,
		.mono-grid,
		.pv-brutal,
		.pv-dark {
			grid-template-columns: 1fr;
		}

		.pv-chat-side,
		.dd-side {
			display: none;
		}

		.pv-mono,
		.pv-brutal,
		.pv-editorial {
			padding: 20px;
		}

		.mono-title {
			font-size: 24px;
		}

		.dd-kpis {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
