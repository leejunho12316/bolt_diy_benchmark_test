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
		{ company: '△△전기', contact: '박OO 대리', last: '어제', status: '계약 진행', tone: 'olive' },
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
		<span class="label">BEFORE · AFTER</span>
		<h2 id="sm-list">요청을 골라 보세요</h2>
		<div class="rule" aria-hidden="true"></div>
		{#each SCENARIOS as item, i (item.no)}
			<button type="button" class="scenario" aria-pressed={i === current} onclick={() => pick(i)}>
				<span class="label">REQUEST NO. {item.no}</span>
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

		<div class="frame">
			<div class="chrome">
				<span class="url">{scenario.path}</span>
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
							<path d="M22 24 C200 18 560 30 738 22 L742 478 C520 484 220 472 18 480 Z" fill="#fffdf8" stroke="#3a3f45" stroke-width="2.5" />
							<path d="M40 44 C260 40 500 48 720 42 L722 96 C500 100 240 92 38 98 Z" fill="none" stroke="#3a3f45" stroke-width="2.5" />
							<text x="60" y="80" font-size="34">자재 요청</text>
							<text x="590" y="80" font-size="26" class="soft">현장명 ▾</text>
							<text x="60" y="140" font-size="26" class="soft">자재명</text>
							<path d="M58 152 C150 149 230 154 300 150 L302 192 C220 195 140 190 56 194 Z" fill="none" stroke="#3a3f45" stroke-width="2" />
							<text x="330" y="140" font-size="26" class="soft">수량</text>
							<path d="M328 152 C380 150 420 154 460 151 L461 192 C420 194 370 190 327 193 Z" fill="none" stroke="#3a3f45" stroke-width="2" />
							<text x="490" y="140" font-size="26" class="soft">필요한 날</text>
							<path d="M488 152 C560 150 610 154 640 151 L642 192 C600 195 540 190 487 193 Z" fill="none" stroke="#3a3f45" stroke-width="2" />
							<path d="M600 214 C640 211 690 215 720 212 L721 254 C690 257 640 252 599 255 Z" fill="#efe6d6" stroke="#3a3f45" stroke-width="2.5" />
							<text x="628" y="244" font-size="28">요청!</text>
							<path d="M40 284 C300 280 480 288 720 282" fill="none" stroke="#3a3f45" stroke-width="2" />
							<text x="60" y="318" font-size="26" class="soft">요청 목록</text>
							<path d="M56 336 C280 332 500 340 720 334" fill="none" stroke="#8a949e" stroke-width="1.8" />
							<text x="64" y="370" font-size="24">철근 D13 · 5톤 · 10/8</text><text x="600" y="370" font-size="24">대기</text>
							<path d="M56 388 C280 384 500 392 720 386" fill="none" stroke="#8a949e" stroke-width="1.8" />
							<text x="64" y="422" font-size="24">레미콘 · 30㎥ · 10/9</text><text x="600" y="422" font-size="24">승인 ✓</text>
							<path d="M520 222 C470 250 430 300 360 300" fill="none" stroke="#b5562f" stroke-width="2" stroke-dasharray="6 5" />
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
										<span class="status" class:olive={req.approved} class:accent={!req.approved}>{req.approved ? '승인' : '대기'}</span>
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
			<span class="label">WHAT CHANGED</span>
			{#if after}
				{#each scenario.changes as change (change)}<span class="change">{change}</span>{/each}
			{:else}
				<em class="caption">‘요청 적용해 보기’를 누르거나 ‘적용 후’를 눌러 비교해 보세요</em>
			{/if}
		</div>
	</section>
</div>

<style>
	/* Design skill: warm-editorial (tokens from .theme-warm-editorial) */
	.compare {
		flex: 1;
		display: grid;
		grid-template-columns: 340px minmax(0, 1fr);
		gap: 40px;
		align-items: start;
		padding: 8px 0 16px;
	}

	.label {
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.12em;
		color: var(--accent-ink);
	}

	h2 {
		margin: 0;
		font-family: var(--font-serif);
		font-size: 30px;
		font-weight: 600;
		line-height: 1.3;
	}

	.rule {
		height: 7px;
		border-top: 2px solid var(--ink);
		border-bottom: 1px solid var(--line);
	}

	.scenarios {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.scenario {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
		padding: 20px 24px;
		border: 1px solid transparent;
		border-radius: var(--radius);
		background: var(--card);
		box-shadow: var(--shadow);
		color: var(--ink);
		font: inherit;
		text-align: left;
		cursor: pointer;
		transition:
			transform var(--dur),
			box-shadow var(--dur);
	}

	.scenario:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 18px rgba(60, 40, 20, 0.12);
	}

	.scenario[aria-pressed='true'] {
		border-color: var(--accent);
	}

	.scenario strong {
		font-size: 20px;
		font-weight: 700;
	}

	.request {
		font-family: var(--font-serif);
		font-size: 16px;
		font-style: italic;
		line-height: 1.6;
		color: var(--ink-2);
	}

	.viewer {
		display: flex;
		flex-direction: column;
		gap: 16px;
		min-width: 0;
	}

	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
	}

	.toggle {
		margin-left: auto;
		display: flex;
		padding: 4px;
		border-radius: var(--radius-pill);
		background: var(--paper-2);
	}

	.toggle button {
		height: 40px;
		padding: 0 18px;
		border: none;
		border-radius: var(--radius-pill);
		background: transparent;
		color: var(--ink-2);
		font: inherit;
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
	}

	.toggle button[aria-pressed='true'] {
		background: var(--card);
		color: var(--accent-ink);
		box-shadow: var(--shadow);
	}

	.apply {
		height: 48px;
		padding: 0 24px;
		border: none;
		border-radius: var(--radius);
		background: var(--accent);
		color: var(--card);
		font: inherit;
		font-size: 15px;
		font-weight: 700;
		cursor: pointer;
		transition: background var(--dur);
	}

	.apply:hover:not(:disabled) {
		background: var(--accent-ink);
	}

	.apply:disabled {
		background: var(--ink-2);
		cursor: default;
	}

	.frame {
		display: flex;
		flex-direction: column;
		border-radius: var(--radius);
		background: var(--card);
		box-shadow: var(--shadow);
		overflow: hidden;
	}

	.chrome {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		border-bottom: 1px solid var(--line);
	}

	.url {
		flex: 1;
		font-family: var(--font-serif);
		font-size: 14px;
		font-style: italic;
		color: var(--ink-2);
	}

	.state {
		height: 28px;
		display: inline-flex;
		align-items: center;
		padding: 0 12px;
		border-radius: var(--radius-pill);
		background: var(--paper-2);
		color: var(--ink-2);
		font-size: 13px;
		font-weight: 600;
	}

	.state.after {
		color: var(--olive);
	}

	.screen {
		position: relative;
		min-height: 560px;
		display: flex;
		flex-direction: column;
	}

	/* Scenario 1: daily report */
	.report {
		flex: 1;
		display: flex;
		flex-direction: column;
		background: var(--card);
		color: var(--ink);
		transition:
			background 0.5s ease,
			color 0.5s ease;
	}

	.report-bar {
		display: flex;
		align-items: center;
		padding: 16px 24px;
		border-bottom: 1px solid var(--line);
		transition: background 0.5s ease;
	}

	.report-bar strong {
		font-family: var(--font-serif);
		font-size: 22px;
	}

	.report-bar span {
		margin-left: auto;
		font-size: 14px;
		color: var(--ink-2);
	}

	.report-kpis {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 16px;
		padding: 24px;
	}

	.report-kpis div {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 18px;
		border-radius: var(--radius);
		background: var(--paper);
		transition: background 0.5s ease;
	}

	.report-kpis span {
		font-size: 13px;
		color: var(--ink-2);
	}

	.report-kpis strong {
		font-family: var(--font-serif);
		font-size: 28px;
		color: var(--accent-ink);
	}

	.report-table {
		margin: 0 24px 24px;
		transition: background 0.5s ease;
	}

	.report-table div {
		display: grid;
		grid-template-columns: 100px minmax(0, 1fr) 120px;
		gap: 12px;
		padding: 12px 4px;
		border-bottom: 1px dotted var(--line);
		font-size: 15px;
	}

	.report-table .head {
		border-bottom: 1px solid var(--ink);
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.12em;
		color: var(--accent-ink);
	}

	.report.dark {
		background: #16181b;
		color: #7d848c;
	}

	.report.dark .report-bar {
		background: #0e0f11;
		border-color: #2c3035;
	}

	.report.dark .report-bar span,
	.report.dark .report-kpis span,
	.report.dark .report-table .head {
		color: #5c636b;
	}

	.report.dark .report-kpis div {
		background: #202327;
	}

	.report.dark .report-kpis strong {
		color: #8a949e;
	}

	.report.dark .report-table div {
		border-color: #2c3035;
	}

	/* Mini apps for scenarios 2 and 3 */
	.app {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.app-head {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px 24px;
		border-bottom: 2px solid var(--ink);
	}

	.app-head strong {
		font-family: var(--font-serif);
		font-size: 22px;
	}

	.app-head .site {
		margin-left: auto;
		padding: 4px 12px;
		border-radius: var(--radius-pill);
		background: var(--paper-2);
		color: var(--olive);
		font-size: 13px;
		font-weight: 600;
	}

	.app-body {
		display: flex;
		flex-direction: column;
		gap: 20px;
		padding: 20px 24px;
	}

	/* Highlights what the request added. */
	.new {
		outline: 2px dashed var(--accent);
		outline-offset: 3px;
	}

	.bulk {
		margin-left: auto;
		padding: 6px 14px;
		border-radius: var(--radius);
		background: var(--accent);
		color: var(--card);
		font-size: 13px;
		font-weight: 700;
	}

	.crm-row {
		display: grid;
		grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) 100px 110px;
		gap: 12px;
		align-items: center;
		padding: 12px 4px;
		border-bottom: 1px dotted var(--line);
		font-size: 15px;
	}

	.crm.after .crm-row {
		grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) 100px 110px 140px;
	}

	.crm-row.head,
	.req-row.head {
		border-bottom: 1px solid var(--ink);
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.12em;
		color: var(--accent-ink);
	}

	.center {
		text-align: center;
	}

	.muted {
		color: var(--ink-2);
	}

	.status {
		font-weight: 700;
	}

	.status.accent {
		color: var(--accent-ink);
	}

	.status.olive {
		color: var(--olive);
	}

	.status.danger {
		color: var(--danger);
	}

	.send {
		justify-self: center;
		height: 34px;
		padding: 0 12px;
		border: 1px solid var(--ink);
		border-radius: var(--radius);
		background: transparent;
		color: var(--ink);
		font: inherit;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
	}

	.send.sent {
		border-color: var(--olive);
		background: var(--paper-2);
		color: var(--olive);
	}

	/* Scenario 3: paper sketch */
	.sketch {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
		background: var(--paper);
	}

	.sketch svg {
		width: 100%;
		max-width: 760px;
		height: auto;
		font-family: 'Comic Sans MS', 'Segoe Print', cursive;
		fill: var(--ink);
	}

	.sketch .soft {
		fill: var(--ink-2);
	}

	.sketch .note {
		fill: var(--accent);
	}

	.add {
		display: grid;
		grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1.2fr) auto;
		gap: 12px;
		align-items: end;
		padding: 18px;
		border-radius: var(--radius);
		background: var(--paper);
	}

	.add label {
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-size: 13px;
		font-weight: 700;
	}

	.add input {
		height: 48px;
		padding: 0 12px;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--card);
		color: var(--ink);
		font: inherit;
		font-size: 15px;
		font-weight: 400;
	}

	.add input:focus {
		outline: none;
		border-color: var(--accent);
		box-shadow: 0 0 0 3px rgba(181, 86, 47, 0.15);
	}

	.add button {
		height: 48px;
		padding: 0 24px;
		border: none;
		border-radius: var(--radius);
		background: var(--accent);
		color: var(--card);
		font: inherit;
		font-size: 15px;
		font-weight: 700;
		cursor: pointer;
	}

	.req-row {
		display: grid;
		grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) 100px;
		gap: 12px;
		padding: 12px 4px;
		border-bottom: 1px dotted var(--line);
		font-size: 15px;
	}

	.overlay {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 14px;
		background: rgb(247 241 230 / 0.88);
	}

	.overlay > span {
		font-family: var(--font-serif);
		font-size: 22px;
		font-style: italic;
		color: var(--accent-ink);
	}

	.progress {
		width: 280px;
		height: 4px;
		background: var(--line);
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
		gap: 10px;
		min-height: 36px;
	}

	.change {
		height: 28px;
		display: inline-flex;
		align-items: center;
		padding: 0 12px;
		border-radius: var(--radius-pill);
		background: var(--paper-2);
		color: var(--olive);
		font-size: 13px;
		font-weight: 600;
	}

	.caption {
		font-family: var(--font-serif);
		font-size: 14px;
		color: var(--ink-2);
	}

	button:focus-visible {
		outline: 2px solid var(--accent-ink);
		outline-offset: 3px;
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
