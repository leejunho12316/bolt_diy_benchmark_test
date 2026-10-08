<script lang="ts">
	const STEPS = ['요청 내용 확인', '올리기 화면 만들기', '확인 목록 만들기', '확인 버튼 연결', '검토'];
	const STEP_MS = 900;
	const FREE_TRIES = 3;

	interface Cert {
		id: number;
		company: string;
		name: string;
		date: string;
		done: boolean;
	}

	let request = $state('협력업체가 안전 교육 이수증을 올리고, 담당자가 확인 완료를 누를 수 있는 페이지 만들어줘.');
	let phase = $state<'idle' | 'building' | 'done'>('idle');
	let step = $state(0);
	let tries = $state(0);
	let gate: HTMLDialogElement;

	let form = $state({ company: '', name: '', date: '' });
	let nextId = 4;
	let certs = $state<Cert[]>([
		{ id: 1, company: '○○건설', name: '김OO', date: '2026-10-02', done: true },
		{ id: 2, company: '△△전기', name: '박OO', date: '2026-10-04', done: false },
		{ id: 3, company: '□□설비', name: '이OO', date: '2026-10-05', done: false }
	]);

	const pending = $derived(certs.filter((c) => !c.done).length);
	const left = $derived(FREE_TRIES - tries);

	let timers: ReturnType<typeof setTimeout>[] = [];

	function clearTimers() {
		timers.forEach(clearTimeout);
		timers = [];
	}

	$effect(() => clearTimers);

	function build() {
		if (phase === 'building') return;

		if (tries >= FREE_TRIES) {
			gate.showModal();
			return;
		}

		clearTimers();
		tries += 1;
		phase = 'building';
		step = 0;

		STEPS.forEach((_, i) => timers.push(setTimeout(() => (step = i + 1), STEP_MS * (i + 1))));
		timers.push(setTimeout(() => (phase = 'done'), STEP_MS * STEPS.length + 300));
	}

	function stepState(i: number) {
		if (phase === 'done' || i < step) return 'done';
		if (phase === 'building' && i === step) return 'current';
		return 'todo';
	}

	function addCert(event: SubmitEvent) {
		event.preventDefault();
		const company = form.company.trim();
		const name = form.name.trim();
		if (!company || !name) return;

		certs.push({ id: nextId++, company, name, date: form.date || '2026-10-06', done: false });
		form = { company: '', name: '', date: '' };
	}
</script>

<div class="build">
	<section class="box request" aria-labelledby="bd-req">
		<span class="label">STEP 1</span>
		<h2 id="bd-req">말로 요청하기</h2>
		<label for="bd-text">만들고 싶은 화면을 적고 만들기를 눌러 보세요.</label>
		<textarea id="bd-text" rows="5" bind:value={request}></textarea>
		<button type="button" class="btn" onclick={build} disabled={phase === 'building'}>
			{phase === 'building' ? '만드는 중…' : phase === 'done' ? '다시 만들기' : '만들기!'}
		</button>
		<p class="free" aria-live="polite">
			<span class="dots" aria-hidden="true">
				{#each { length: FREE_TRIES }, i (i)}<span class:on={i < left}></span>{/each}
			</span>
			{left > 0 ? `로그인 없이 ${left}번 더 만들어 볼 수 있어요` : '무료 체험을 모두 썼어요. 다음부터는 로그인이 필요해요.'}
		</p>
	</section>

	<section class="box steps" aria-labelledby="bd-steps">
		<span class="label">STEP 2</span>
		<h2 id="bd-steps">만드는 과정 지켜보기</h2>
		<ol aria-live="polite">
			{#each STEPS as label, i (label)}
				{@const status = stepState(i)}
				<li class={status}>
					<span class="mark" aria-hidden="true">{status === 'done' ? '✓' : i + 1}</span>
					{status === 'current' ? `${label} 중` : label}
				</li>
			{/each}
		</ol>
	</section>

	<section class="output" aria-labelledby="bd-out">
		<div class="output-head">
			<span class="label">STEP 3</span>
			<h2 id="bd-out">완성된 화면 바로 써 보기</h2>
		</div>
		<div class="browser">
			<div class="chrome">
				<span></span><span></span><span></span>
				<span class="url">/safety-certificates</span>
			</div>

			{#if phase === 'idle'}
				<p class="placeholder">만들기를 누르면 여기에 화면이 만들어져요.</p>
			{:else if phase === 'building'}
				<div class="marquee" aria-hidden="true">
					<div>
						{#each { length: 8 }, i (i)}<span>AI가 만드는 중 ▶</span>{/each}
					</div>
				</div>
				<div class="loading" aria-hidden="true"><span></span><span></span><span></span></div>
				<p class="building">{STEPS[Math.min(step, STEPS.length - 1)]} 중…</p>
			{:else}
				<div class="app">
					<div class="app-head">
						<strong>안전 교육 이수증 확인</strong>
						<span class="sticker">대기 {pending}건</span>
					</div>
					<form class="add" onsubmit={addCert}>
						<label>업체명<input bind:value={form.company} placeholder="○○건설" /></label>
						<label>이름<input bind:value={form.name} placeholder="홍길동" /></label>
						<label>교육일<input type="date" bind:value={form.date} /></label>
						<button type="submit" class="btn small">이수증 올리기</button>
					</form>
					<div class="ticket">
						<div class="row head"><span>업체</span><span>이름</span><span>교육일</span><span>상태</span></div>
						{#each certs as cert (cert.id)}
							<div class="row">
								<span>{cert.company}</span>
								<span>{cert.name}</span>
								<span class="mono">{cert.date}</span>
								{#if cert.done}
									<span class="ok">확인 완료</span>
								{:else}
									<button type="button" class="confirm" onclick={() => (cert.done = true)}>확인 완료 누르기</button>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</section>
</div>

<dialog bind:this={gate} aria-labelledby="bd-gate">
	<span class="label">FREE TRIAL OVER</span>
	<h2 id="bd-gate">무료 체험 {FREE_TRIES}회를 모두 썼어요</h2>
	<p>어떠셨나요? 로그인하면 내 프로젝트에서 원하는 만큼 계속 만들 수 있어요.</p>
	<a class="btn" href="/login">로그인하고 계속 만들기</a>
	<button type="button" class="ghost" onclick={() => gate.close()}>완성된 화면 더 둘러보기</button>
</dialog>

<style>
	/* Design skill: neo-brutal (tokens from .theme-neo-brutal) */
	.build {
		flex: 1;
		display: grid;
		grid-template-columns: 380px minmax(0, 1fr);
		grid-template-areas:
			'request output'
			'steps output';
		gap: 24px;
		align-items: start;
		padding-bottom: 8px;
	}

	.request {
		grid-area: request;
		background: var(--yellow);
	}

	.steps {
		grid-area: steps;
		background: var(--pink);
	}

	.output {
		grid-area: output;
		display: flex;
		flex-direction: column;
		gap: 12px;
		min-width: 0;
	}

	.box {
		display: flex;
		flex-direction: column;
		gap: 14px;
		padding: 24px;
		border: var(--border);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
	}

	.label,
	.mono {
		font-family: var(--font-mono);
		font-weight: 700;
	}

	.label {
		font-size: 14px;
		letter-spacing: 0.04em;
	}

	h2 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 30px;
		font-weight: 400;
		line-height: 1.1;
	}

	label {
		font-size: 15px;
		font-weight: 500;
	}

	textarea,
	input {
		padding: 12px;
		border: var(--border-thin);
		border-radius: var(--radius);
		background: var(--white);
		color: var(--ink);
		font: inherit;
		font-size: 15px;
		font-weight: 500;
		line-height: 1.6;
	}

	textarea {
		resize: vertical;
	}

	textarea:focus,
	input:focus {
		outline: none;
		box-shadow: var(--shadow-sm);
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 56px;
		padding: 0 28px;
		border: var(--border);
		border-radius: var(--radius);
		background: var(--blue);
		color: var(--ink);
		box-shadow: var(--shadow);
		font: inherit;
		font-size: 17px;
		font-weight: 800;
		text-decoration: none;
		cursor: pointer;
		transition:
			transform var(--dur),
			box-shadow var(--dur);
	}

	.btn:hover:not(:disabled) {
		transform: translate(-2px, -2px);
		box-shadow: 8px 8px 0 var(--ink);
	}

	.btn:active:not(:disabled) {
		transform: translate(6px, 6px);
		box-shadow: none;
	}

	.btn:disabled {
		background: var(--white);
		cursor: default;
	}

	.btn.small {
		height: 44px;
		padding: 0 16px;
		font-size: 15px;
		box-shadow: var(--shadow-sm);
	}

	.free {
		margin: 0;
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		font-weight: 700;
	}

	.dots {
		display: flex;
		gap: 4px;
	}

	.dots span {
		width: 14px;
		height: 14px;
		border: var(--border-thin);
		background: var(--white);
	}

	.dots span.on {
		background: var(--ink);
	}

	ol {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	li {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 10px;
		border: var(--border-thin);
		border-radius: var(--radius);
		background: var(--white);
		font-size: 15px;
		font-weight: 700;
		opacity: 0.55;
	}

	.mark {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 26px;
		border: var(--border-thin);
		font-family: var(--font-mono);
		font-size: 13px;
	}

	li.done {
		opacity: 1;
	}

	li.done .mark {
		background: var(--green);
	}

	li.current {
		opacity: 1;
		box-shadow: var(--shadow-sm);
		transform: translate(-2px, -2px);
	}

	li.current .mark {
		background: var(--yellow);
	}

	.output-head {
		display: flex;
		align-items: baseline;
		gap: 12px;
	}

	.browser {
		min-height: 560px;
		display: flex;
		flex-direction: column;
		border: var(--border);
		border-radius: var(--radius);
		background: var(--white);
		box-shadow: var(--shadow);
		overflow: hidden;
	}

	.chrome {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 10px 12px;
		border-bottom: var(--border);
		background: var(--bg);
	}

	.chrome > span:not(.url) {
		width: 14px;
		height: 14px;
		border: var(--border-thin);
		border-radius: 50%;
	}

	.chrome > span:nth-child(1) {
		background: var(--pink);
	}

	.chrome > span:nth-child(2) {
		background: var(--yellow);
	}

	.chrome > span:nth-child(3) {
		background: var(--green);
	}

	.url {
		flex: 1;
		margin-left: 6px;
		padding: 4px 10px;
		border: var(--border-thin);
		border-radius: var(--radius);
		background: var(--white);
		font-family: var(--font-mono);
		font-size: 12px;
		font-weight: 700;
	}

	.placeholder {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0;
		padding: 32px;
		font-family: var(--font-display);
		font-size: 24px;
		text-align: center;
	}

	.marquee {
		overflow: hidden;
		border-bottom: var(--border);
		background: var(--ink);
		color: var(--yellow);
		font-family: var(--font-mono);
		font-size: 14px;
		font-weight: 700;
		white-space: nowrap;
	}

	.marquee div {
		display: inline-flex;
		gap: 32px;
		padding: 10px 0;
		animation: marquee 20s linear infinite;
	}

	@keyframes marquee {
		to {
			transform: translateX(-50%);
		}
	}

	.loading {
		display: flex;
		justify-content: center;
		gap: 12px;
		margin-top: 120px;
	}

	.loading span {
		width: 28px;
		height: 28px;
		border: var(--border-thin);
		animation: blink 0.9s steps(1) infinite;
	}

	.loading span:nth-child(1) {
		background: var(--yellow);
	}

	.loading span:nth-child(2) {
		background: var(--pink);
		animation-delay: 0.3s;
	}

	.loading span:nth-child(3) {
		background: var(--blue);
		animation-delay: 0.6s;
	}

	@keyframes blink {
		50% {
			opacity: 0.2;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.marquee div,
		.loading span {
			animation: none;
		}
	}

	.building {
		margin: 20px;
		font-size: 17px;
		font-weight: 800;
		text-align: center;
	}

	.app {
		display: flex;
		flex-direction: column;
		gap: 20px;
		padding: 20px;
	}

	.app-head {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.app-head strong {
		font-family: var(--font-display);
		font-size: 26px;
		font-weight: 400;
	}

	.sticker {
		margin-left: auto;
		padding: 8px 14px;
		border: var(--border);
		border-radius: var(--radius);
		background: var(--pink);
		font-family: var(--font-mono);
		font-size: 14px;
		font-weight: 700;
		transform: rotate(-4deg);
	}

	.add {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
		gap: 10px;
		align-items: end;
		padding: 16px;
		border: var(--border-thin);
		border-radius: var(--radius);
		background: var(--bg);
	}

	.add label {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-family: var(--font-mono);
		font-size: 13px;
		font-weight: 700;
	}

	.add input {
		height: 44px;
		padding: 0 10px;
		font-family: var(--font-sans);
	}

	.ticket {
		border: var(--border);
		border-radius: var(--radius);
		overflow: hidden;
	}

	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 130px 150px;
		align-items: center;
		border-bottom: var(--border-thin);
		font-size: 15px;
		font-weight: 500;
	}

	.row:last-child {
		border-bottom: none;
	}

	.row > * {
		padding: 10px 12px;
		border-right: var(--border-thin);
	}

	.row > *:last-child {
		border-right: none;
	}

	.row.head {
		background: var(--yellow);
		font-family: var(--font-mono);
		font-size: 13px;
		font-weight: 700;
	}

	.ok {
		align-self: stretch;
		display: flex;
		align-items: center;
		background: var(--green);
		font-weight: 800;
	}

	.confirm {
		margin: 6px;
		padding: 8px 10px;
		border: var(--border-thin);
		border-radius: var(--radius);
		background: var(--white);
		box-shadow: var(--shadow-sm);
		color: var(--ink);
		font: inherit;
		font-size: 13px;
		font-weight: 800;
		cursor: pointer;
	}

	.confirm:active {
		transform: translate(4px, 4px);
		box-shadow: none;
	}

	dialog {
		width: min(460px, calc(100vw - 2rem));
		box-sizing: border-box;
		padding: 28px;
		border: var(--border);
		border-radius: var(--radius);
		background: var(--yellow);
		color: var(--ink);
		box-shadow: var(--shadow);
		font-family: var(--font-sans);
	}

	dialog[open] {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	dialog::backdrop {
		background: rgb(17 17 17 / 0.6);
	}

	dialog p {
		margin: 0;
		font-size: 16px;
		font-weight: 500;
		line-height: 1.6;
	}

	.ghost {
		min-height: 44px;
		border: none;
		background: transparent;
		color: var(--ink);
		font: inherit;
		font-weight: 700;
		text-decoration: underline;
		text-underline-offset: 4px;
		cursor: pointer;
	}

	button:focus-visible,
	a:focus-visible {
		outline: 3px solid var(--blue);
		outline-offset: 3px;
	}

	@media (max-width: 900px) {
		.build {
			grid-template-columns: 1fr;
			grid-template-areas: 'request' 'steps' 'output';
		}

		.add {
			grid-template-columns: 1fr;
		}

		.row {
			grid-template-columns: 1fr 1fr;
		}

		.row > * {
			border-right: none;
		}
	}
</style>
