<script lang="ts">
	const STEP_MS = 700;

	const SCENARIOS = [
		{
			no: '01',
			title: '화면을 밝게',
			request: '화면이 좀 밝았으면 좋겠습니다',
			path: '/daily-report',
			steps: ['요청 이해하는 중', '색 바꾸는 중', '글자 잘 보이는지 확인 중'],
			changes: ['어두운 배경 → 밝은 배경', '글자 대비 높임', '상단바 강조색으로']
		},
		{
			no: '02',
			title: 'CRM에 새 버튼',
			request: 'CRM 화면에 견적서 보내기 버튼을 만들어 주세요',
			path: '/crm/clients',
			steps: ['요청 이해하는 중', '버튼 만드는 중', '보내기 동작 연결 중'],
			changes: ['줄마다 견적서 보내기 버튼', '상단에 일괄 보내기 버튼', '누르면 보냄 표시']
		},
		{
			no: '03',
			title: '손그림으로 화면 만들기',
			request: '종이에 그린 이 그림대로 자재 요청 화면을 만들어 주세요',
			path: '/material-request',
			steps: ['그림 읽는 중', '입력칸과 버튼 만드는 중', '목록 연결 중'],
			changes: ['그림의 입력칸 3개 → 실제 입력칸', '요청! → 누르면 목록에 추가', '요청 목록 표']
		}
	];

	const CRM = [
		{ company: '○○건설', contact: '김OO 과장', last: '오늘', status: '견적 요청', tone: 'accent' },
		{ company: '△△전기', contact: '박OO 대리', last: '어제', status: '계약 진행', tone: 'success' },
		{ company: '□□설비', contact: '이OO 부장', last: '3일 전', status: '견적 요청', tone: 'accent' },
		{ company: '◇◇자재', contact: '최OO 차장', last: '2주 전', status: '연락 필요', tone: 'danger' },
		{ company: '☆☆철강', contact: '정OO 과장', last: '5일 전', status: '견적 요청', tone: 'accent' }
	];

	let current = $state(0);
	let showAfter = $state(false);
	let applying = $state(false);
	let applied = $state(0);
	let sent = $state<Record<number, boolean>>({});

	let material = $state({ name: '', qty: '', date: '' });
	let nextId = 3;
	let requests = $state([
		{ id: 1, name: '철근 D13', qty: '5톤', date: '2026-10-08', approved: false },
		{ id: 2, name: '레미콘', qty: '30㎥', date: '2026-10-09', approved: true }
	]);

	const scenario = $derived(SCENARIOS[current]);
	const after = $derived(showAfter && !applying);

	let timers: ReturnType<typeof setTimeout>[] = [];

	function clearTimers() {
		timers.forEach(clearTimeout);
		timers = [];
	}

	$effect(() => clearTimers);

	function pick(i: number) {
		clearTimers();
		current = i;
		showAfter = false;
		applying = false;
		sent = {};
	}

	function view(next: boolean) {
		clearTimers();
		applying = false;
		showAfter = next;
	}

	function apply() {
		if (applying) return;
		clearTimers();
		showAfter = false;
		applying = true;
		applied = 0;

		const steps = scenario.steps.length;
		for (let i = 0; i < steps; i++) {
			timers.push(setTimeout(() => (applied = i + 1), STEP_MS * (i + 1)));
		}
		timers.push(
			setTimeout(() => {
				applying = false;
				showAfter = true;
			}, STEP_MS * steps + 400)
		);
	}

	function addRequest(event: SubmitEvent) {
		event.preventDefault();
		const name = material.name.trim();
		if (!name) return;

		requests.push({ id: nextId++, name, qty: material.qty.trim() || '-', date: material.date || '2026-10-10', approved: false });
		material = { name: '', qty: '', date: '' };
	}
</script>

<div class="compare">
	<section class="scenarios" aria-labelledby="sm-list">
		<h2 id="sm-list">요청을 골라 보세요</h2>
		{#each SCENARIOS as item, i (item.no)}
			<button type="button" class="scenario" aria-pressed={i === current} onclick={() => pick(i)}>
				<span class="no">{item.no}</span>
				<strong>{item.title}</strong>
				<span class="request">“{item.request}”</span>
			</button>
		{/each}
	</section>

	<section class="viewer" aria-labelledby="sm-view">
		<div class="toolbar">
			<h2 id="sm-view">{scenario.title}</h2>
			<div class="toggle" role="group" aria-label="전후 보기">
				<button type="button" aria-pressed={!after} onclick={() => view(false)}>적용 전</button>
				<button type="button" aria-pressed={after} onclick={() => view(true)}>적용 후</button>
			</div>
			<button type="button" class="apply" onclick={apply} disabled={applying}>요청 적용해 보기</button>
		</div>

		<div class="browser">
			<div class="chrome">
				<span class="dot"></span><span class="dot"></span>
				<span class="url">미리보기 · {scenario.path}</span>
				<span class="state" class:after>{applying ? '바꾸는 중' : after ? '적용 후' : '적용 전'}</span>
			</div>

			<div class="screen">
				{#if current === 0}
					<!-- The dark "before" palette is what this scenario fixes, so it is fixed colour on purpose. -->
					<div class="report" class:dark={!after}>
						<div class="report-bar"><strong>현장 작업일보</strong><span>10월 6일 (월)</span></div>
						<div class="report-kpis">
							<div><span>출역 인원</span><strong>48명</strong></div>
							<div><span>진행 공정</span><strong>골조 3층</strong></div>
							<div><span>안전 지적</span><strong>2건</strong></div>
						</div>
						<div class="report-table">
							<div class="head"><span>시간</span><span>작업 내용</span><span>담당</span></div>
							<div><span>07:00</span><span>3층 슬래브 철근 배근</span><span>철근팀</span></div>
							<div><span>10:30</span><span>거푸집 설치 검측</span><span>공무 김OO</span></div>
							<div><span>14:00</span><span>안전 순찰 · 지적 2건 조치</span><span>안전 박OO</span></div>
						</div>
					</div>
				{:else if current === 1}
					<div class="app">
						<div class="app-head">
							<strong>거래처 관리 (CRM)</strong>
							{#if after}<span class="new bulk">+ 견적서 일괄 보내기</span>{/if}
						</div>
						<div class="app-body">
							<div class="crm" class:after>
								<div class="crm-row head">
									<span>거래처</span><span>담당자</span><span>최근 연락</span><span>상태</span>
									{#if after}<span class="center">견적서</span>{/if}
								</div>
								{#each CRM as row, i (row.company)}
									<div class="crm-row">
										<strong>{row.company}</strong>
										<span>{row.contact}</span>
										<span class="muted">{row.last}</span>
										<span class="status {row.tone}">{row.status}</span>
										{#if after}
											<button type="button" class="new send" class:sent={sent[i]} onclick={() => (sent[i] = true)}>
												{sent[i] ? '보냄 ✓' : '견적서 보내기'}
											</button>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					</div>
				{:else if !after}
					<div class="sketch">
						<svg viewBox="0 0 760 500" role="img" aria-label="종이에 손으로 그린 자재 요청 화면 스케치">
							<path d="M22 24 C200 18 560 30 738 22 L742 478 C520 484 220 472 18 480 Z" fill="#ffffff" stroke="#3a3f45" stroke-width="2.5" />
							<path d="M40 44 C260 40 500 48 720 42 L722 96 C500 100 240 92 38 98 Z" fill="none" stroke="#3a3f45" stroke-width="2.5" />
							<text x="60" y="80" font-size="34">자재 요청</text>
							<text x="590" y="80" font-size="26" class="soft">현장명 ▾</text>
							<text x="60" y="140" font-size="26" class="soft">자재명</text>
							<path d="M58 152 C150 149 230 154 300 150 L302 192 C220 195 140 190 56 194 Z" fill="none" stroke="#3a3f45" stroke-width="2" />
							<text x="330" y="140" font-size="26" class="soft">수량</text>
							<path d="M328 152 C380 150 420 154 460 151 L461 192 C420 194 370 190 327 193 Z" fill="none" stroke="#3a3f45" stroke-width="2" />
							<text x="490" y="140" font-size="26" class="soft">필요한 날</text>
							<path d="M488 152 C560 150 610 154 640 151 L642 192 C600 195 540 190 487 193 Z" fill="none" stroke="#3a3f45" stroke-width="2" />
							<path d="M600 214 C640 211 690 215 720 212 L721 254 C690 257 640 252 599 255 Z" fill="#e6e0fb" stroke="#3a3f45" stroke-width="2.5" />
							<text x="628" y="244" font-size="28">요청!</text>
							<path d="M40 284 C300 280 480 288 720 282" fill="none" stroke="#3a3f45" stroke-width="2" />
							<text x="60" y="318" font-size="26" class="soft">요청 목록</text>
							<path d="M56 336 C280 332 500 340 720 334" fill="none" stroke="#8a949e" stroke-width="1.8" />
							<text x="64" y="370" font-size="24">철근 D13 · 5톤 · 10/8</text><text x="600" y="370" font-size="24">대기</text>
							<path d="M56 388 C280 384 500 392 720 386" fill="none" stroke="#8a949e" stroke-width="1.8" />
							<text x="64" y="422" font-size="24">레미콘 · 30㎥ · 10/9</text><text x="600" y="422" font-size="24">승인 ✓</text>
							<path d="M520 222 C470 250 430 300 360 300" fill="none" stroke="#c0392b" stroke-width="2" stroke-dasharray="6 5" />
							<text x="250" y="262" font-size="24" class="note">누르면 아래에 추가</text>
						</svg>
					</div>
				{:else}
					<div class="app">
						<div class="app-head"><strong>자재 요청</strong><span class="site">A현장 ▾</span></div>
						<div class="app-body">
							<form class="add" onsubmit={addRequest}>
								<label>자재명<input bind:value={material.name} placeholder="예: 철근 D13" /></label>
								<label>수량<input bind:value={material.qty} placeholder="5톤" /></label>
								<label>필요한 날<input type="date" bind:value={material.date} /></label>
								<button type="submit">요청</button>
							</form>
							<div class="req-table">
								<div class="req-row head"><span>자재</span><span>수량</span><span>필요한 날</span><span>상태</span></div>
								{#each requests as req (req.id)}
									<div class="req-row">
										<span>{req.name}</span>
										<span>{req.qty}</span>
										<span class="muted">{req.date}</span>
										<span class="status" class:success={req.approved} class:warning={!req.approved}>{req.approved ? '승인' : '대기'}</span>
									</div>
								{/each}
							</div>
						</div>
					</div>
				{/if}

				{#if applying}
					<div class="overlay" aria-live="polite">
						<span>{scenario.steps[Math.min(applied, scenario.steps.length - 1)]}…</span>
						<div class="progress"><span style:width="{(applied / scenario.steps.length) * 100}%"></span></div>
					</div>
				{/if}
			</div>
		</div>

		<div class="changes">
			<strong>바뀐 점</strong>
			{#if after}
				{#each scenario.changes as change (change)}<span class="change">{change}</span>{/each}
			{:else}
				<span class="muted">‘요청 적용해 보기’를 누르거나 ‘적용 후’를 눌러 비교해 보세요</span>
			{/if}
		</div>
	</section>
</div>

<style>
	.compare {
		flex: 1;
		display: grid;
		grid-template-columns: 360px minmax(0, 1fr);
		gap: 1.5rem;
		align-items: start;
	}

	h2 {
		margin: 0;
		font-size: 1.2rem;
	}

	.scenarios {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.scenario {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.5rem;
		padding: 1.1rem;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--panel);
		color: var(--text);
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	.scenario[aria-pressed='true'] {
		border: 2px solid var(--accent);
		padding: calc(1.1rem - 1px);
	}

	.no {
		font-family: ui-monospace, 'Cascadia Code', monospace;
		font-size: 0.8rem;
		color: var(--accent);
	}

	.scenario strong {
		font-size: 1.05rem;
	}

	.request {
		padding: 0.6rem 0.75rem;
		border-radius: 8px;
		background: var(--accent-soft);
		font-size: 0.88rem;
		line-height: 1.6;
	}

	.viewer {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		min-width: 0;
	}

	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem;
	}

	.toggle {
		margin-left: auto;
		display: flex;
		padding: 4px;
		border-radius: 8px;
		background: var(--border);
	}

	.toggle button {
		min-height: 40px;
		padding: 0 1.1rem;
		border: none;
		border-radius: 6px;
		background: transparent;
		color: var(--muted);
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	.toggle button[aria-pressed='true'] {
		background: var(--panel);
		color: var(--accent);
	}

	.apply {
		min-height: 48px;
		padding: 0 1.25rem;
		border: none;
		border-radius: 8px;
		background: var(--accent);
		color: var(--panel);
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	.apply:disabled {
		background: var(--muted);
		cursor: default;
	}

	.browser {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--panel);
		overflow: hidden;
	}

	.chrome {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: var(--bg);
		border-bottom: 1px solid var(--border);
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--border);
	}

	.url {
		flex: 1;
		padding: 0.25rem 0.6rem;
		border: 1px solid var(--border);
		border-radius: 4px;
		background: var(--panel);
		font-family: ui-monospace, 'Cascadia Code', monospace;
		font-size: 0.7rem;
		color: var(--muted);
	}

	.state {
		padding: 0.1rem 0.5rem;
		border-radius: 4px;
		background: var(--border);
		color: var(--muted);
		font-size: 0.75rem;
		font-weight: 700;
	}

	.state.after {
		background: var(--accent-soft);
		color: var(--success);
	}

	.screen {
		position: relative;
		min-height: 560px;
		display: flex;
		flex-direction: column;
	}

	/* Scenario 1: daily report. Pinned to the light theme tokens so "after" reads as bright in dark mode too. */
	.report {
		--panel: #ffffff;
		--bg: #f8fafc;
		--border: #e2e8f0;
		--text: #0f172a;
		--muted: #64748b;
		--accent: #6d28d9;
		flex: 1;
		display: flex;
		flex-direction: column;
		background: var(--panel);
		color: var(--text);
		transition:
			background 0.5s ease,
			color 0.5s ease;
	}

	.report-bar {
		display: flex;
		align-items: center;
		padding: 0.9rem 1.25rem;
		background: var(--accent);
		color: var(--panel);
		transition: background 0.5s ease;
	}

	.report-bar span {
		margin-left: auto;
		font-size: 0.82rem;
	}

	.report-kpis {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.75rem;
		padding: 1.25rem;
	}

	.report-kpis div {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		padding: 1rem;
		border-radius: 8px;
		background: var(--bg);
		transition: background 0.5s ease;
	}

	.report-kpis span {
		font-size: 0.8rem;
		color: var(--muted);
	}

	.report-kpis strong {
		font-size: 1.6rem;
	}

	.report-table {
		margin: 0 1.25rem 1.25rem;
		border-radius: 8px;
		background: var(--bg);
		transition: background 0.5s ease;
	}

	.report-table div {
		display: grid;
		grid-template-columns: 100px minmax(0, 1fr) 120px;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--border);
		font-size: 0.88rem;
	}

	.report-table div:last-child {
		border-bottom: none;
	}

	.report-table .head {
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--muted);
	}

	.report.dark {
		background: #16181b;
		color: #7d848c;
	}

	.report.dark .report-bar {
		background: #0e0f11;
		color: #8a949e;
	}

	.report.dark .report-kpis div,
	.report.dark .report-table {
		background: #202327;
	}

	.report.dark .report-kpis span,
	.report.dark .report-table .head {
		color: #5c636b;
	}

	.report.dark .report-kpis strong {
		color: #8a949e;
	}

	.report.dark .report-table div {
		border-color: #2c3035;
	}

	/* Shared mini-app chrome for scenarios 2 and 3 */
	.app {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.app-head {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.9rem 1.25rem;
		background: var(--accent);
		color: var(--panel);
	}

	.app-head .site {
		margin-left: auto;
		padding: 0.25rem 0.6rem;
		border-radius: 4px;
		background: rgb(255 255 255 / 0.15);
		font-size: 0.82rem;
	}

	.app-body {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.25rem;
	}

	/* Highlights what the request added. */
	.new {
		outline: 3px solid var(--warning);
		outline-offset: 2px;
	}

	.bulk {
		margin-left: auto;
		padding: 0.35rem 0.75rem;
		border-radius: 6px;
		background: var(--panel);
		color: var(--accent);
		font-size: 0.8rem;
		font-weight: 700;
	}

	.crm {
		border-top: 2px solid var(--text);
	}

	.crm-row {
		display: grid;
		grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) 100px 110px;
		gap: 0.75rem;
		align-items: center;
		padding: 0.75rem;
		border-bottom: 1px solid var(--border);
		font-size: 0.88rem;
	}

	.crm.after .crm-row {
		grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) 100px 110px 140px;
	}

	.crm-row.head,
	.req-row.head {
		background: var(--bg);
		font-size: 0.8rem;
		font-weight: 700;
	}

	.center {
		text-align: center;
	}

	.status {
		font-weight: 700;
	}

	.status.accent {
		color: var(--accent);
	}

	.status.success {
		color: var(--success);
	}

	.status.warning {
		color: var(--warning);
	}

	.status.danger {
		color: var(--danger);
	}

	.send {
		justify-self: center;
		min-height: 34px;
		padding: 0 0.75rem;
		border: 1px solid var(--accent);
		border-radius: 6px;
		background: var(--panel);
		color: var(--accent);
		font: inherit;
		font-size: 0.8rem;
		font-weight: 700;
		cursor: pointer;
	}

	.send.sent {
		border-color: var(--success);
		color: var(--success);
	}

	.muted {
		color: var(--muted);
	}

	/* Scenario 3: paper sketch, intentionally paper-coloured in both themes */
	.sketch {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		background: #fbf8ef;
	}

	.sketch svg {
		width: 100%;
		max-width: 760px;
		height: auto;
		font-family: 'Comic Sans MS', 'Segoe Print', cursive;
		fill: #1e2124;
	}

	.sketch .soft {
		fill: #464c53;
	}

	.sketch .note {
		fill: #c0392b;
	}

	.add {
		display: grid;
		grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1.2fr) auto;
		gap: 0.6rem;
		align-items: end;
		padding: 1rem;
		border-radius: 8px;
		background: var(--bg);
	}

	.add label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.8rem;
		font-weight: 700;
	}

	.add input {
		min-height: 40px;
		padding: 0 0.6rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--panel);
		color: var(--text);
		font: inherit;
		font-size: 0.88rem;
		font-weight: 400;
	}

	.add button {
		min-height: 40px;
		padding: 0 1.1rem;
		border: none;
		border-radius: 6px;
		background: var(--accent);
		color: var(--panel);
		font: inherit;
		font-size: 0.88rem;
		font-weight: 700;
		cursor: pointer;
	}

	.req-table {
		border-top: 2px solid var(--text);
	}

	.req-row {
		display: grid;
		grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) 100px;
		gap: 0.75rem;
		padding: 0.75rem;
		border-bottom: 1px solid var(--border);
		font-size: 0.88rem;
	}

	.overlay {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.9rem;
		background: color-mix(in srgb, var(--panel) 86%, transparent);
	}

	.overlay > span {
		font-size: 1.1rem;
		font-weight: 700;
		color: var(--accent);
	}

	.progress {
		width: 280px;
		height: 6px;
		background: var(--border);
	}

	.progress span {
		display: block;
		height: 100%;
		background: var(--accent);
		transition: width 0.4s ease;
	}

	.changes {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem;
		min-height: 36px;
		font-size: 0.88rem;
	}

	.change {
		padding: 0.25rem 0.6rem;
		border-radius: 4px;
		background: var(--accent-soft);
		color: var(--success);
		font-size: 0.8rem;
		font-weight: 700;
	}

	@media (max-width: 1000px) {
		.compare {
			grid-template-columns: 1fr;
		}

		.toggle {
			margin-left: 0;
		}
	}

	@media (max-width: 700px) {
		.add,
		.report-kpis {
			grid-template-columns: 1fr;
		}

		.crm-row,
		.crm.after .crm-row,
		.req-row {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
