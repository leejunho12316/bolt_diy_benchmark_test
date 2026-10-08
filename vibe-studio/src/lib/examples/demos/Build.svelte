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
	<section class="panel" aria-labelledby="bd-req">
		<h2 id="bd-req">1. 말로 요청하기</h2>
		<label for="bd-text">만들고 싶은 화면을 적고 만들기를 눌러 보세요.</label>
		<textarea id="bd-text" rows="5" bind:value={request}></textarea>
		<button type="button" class="primary" onclick={build} disabled={phase === 'building'}>
			{phase === 'building' ? '만드는 중…' : phase === 'done' ? '다시 만들기' : '만들기'}
		</button>
		<p class="free" aria-live="polite">
			<span class="dots" aria-hidden="true">
				{#each { length: FREE_TRIES }, i (i)}<span class:on={i < left}></span>{/each}
			</span>
			{left > 0 ? `로그인 없이 ${left}번 더 만들어 볼 수 있어요` : '무료 체험을 모두 썼어요. 다음부터는 로그인이 필요해요.'}
		</p>

		<h2>2. 만드는 과정 지켜보기</h2>
		<ol aria-live="polite">
			{#each STEPS as label, i (label)}
				{@const status = stepState(i)}
				<li class={status}>
					<span class="mark" aria-hidden="true">{status === 'done' ? '✓' : ''}</span>
					{status === 'current' ? `${label} 중` : label}
				</li>
			{/each}
		</ol>
	</section>

	<section class="output" aria-labelledby="bd-out">
		<h2 id="bd-out">3. 완성된 화면 바로 써 보기</h2>
		<div class="browser">
			<div class="chrome">
				<span></span><span></span>
				<span class="url">미리보기 · /safety-certificates</span>
			</div>

			{#if phase === 'idle'}
				<p class="placeholder">만들기를 누르면 여기에 화면이 만들어져요.</p>
			{:else if phase === 'building'}
				<div class="skeleton" aria-hidden="true">
					<span style:width="40%" style:height="36px"></span>
					<span style:height="120px"></span>
					<span style:height="44px"></span>
					<span style:height="44px"></span>
				</div>
				<p class="building">{STEPS[Math.min(step, STEPS.length - 1)]} 중…</p>
			{:else}
				<div class="app">
					<div class="app-head">
						<strong>안전 교육 이수증 확인</strong>
						<span>확인 대기 {pending}건</span>
					</div>
					<div class="app-body">
						<form class="add" onsubmit={addCert}>
							<label>업체명<input bind:value={form.company} placeholder="○○건설" /></label>
							<label>이름<input bind:value={form.name} placeholder="홍길동" /></label>
							<label>교육일<input type="date" bind:value={form.date} /></label>
							<button type="submit" class="primary small">이수증 올리기</button>
						</form>
						<div class="table">
							<div class="row head"><span>업체</span><span>이름</span><span>교육일</span><span class="center">상태</span></div>
							{#each certs as cert (cert.id)}
								<div class="row">
									<span>{cert.company}</span>
									<span>{cert.name}</span>
									<span class="muted">{cert.date}</span>
									{#if cert.done}
										<span class="center ok">확인 완료</span>
									{:else}
										<button type="button" class="center confirm" onclick={() => (cert.done = true)}>확인 완료 누르기</button>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/if}
		</div>
	</section>
</div>

<dialog bind:this={gate} aria-labelledby="bd-gate">
	<h2 id="bd-gate">무료 체험 {FREE_TRIES}회를 모두 썼어요</h2>
	<p>어떠셨나요? 로그인하면 내 프로젝트에서 원하는 만큼 계속 만들 수 있어요.</p>
	<a class="primary" href="/login">로그인하고 계속 만들기</a>
	<button type="button" class="ghost" onclick={() => gate.close()}>완성된 화면 더 둘러보기</button>
</dialog>

<style>
	.build {
		flex: 1;
		display: grid;
		grid-template-columns: 400px minmax(0, 1fr);
		gap: 1.5rem;
		align-items: start;
	}

	.panel {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.25rem;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--panel);
	}

	h2 {
		margin: 0;
		font-size: 1.2rem;
	}

	.panel h2:not(:first-child) {
		margin-top: 0.5rem;
	}

	label {
		font-size: 0.88rem;
		color: var(--muted);
	}

	textarea,
	input {
		padding: 0.75rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--panel);
		color: var(--text);
		font: inherit;
		line-height: 1.6;
	}

	textarea {
		resize: vertical;
	}

	textarea:focus,
	input:focus {
		outline: 2px solid var(--accent-soft);
		border-color: var(--accent);
	}

	.primary {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 52px;
		border: none;
		border-radius: 8px;
		background: var(--accent);
		color: var(--panel);
		font: inherit;
		font-weight: 700;
		text-decoration: none;
		cursor: pointer;
	}

	.primary:disabled {
		background: var(--muted);
		cursor: default;
	}

	.primary.small {
		min-height: 40px;
		padding: 0 1rem;
		font-size: 0.88rem;
	}

	.free {
		margin: -0.4rem 0 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.88rem;
		color: var(--muted);
	}

	.dots {
		display: flex;
		gap: 4px;
	}

	.dots span {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--border);
	}

	.dots span.on {
		background: var(--accent);
	}

	ol {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	li {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		color: var(--muted);
	}

	.mark {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		border: 2px solid var(--border);
		border-radius: 50%;
		color: var(--panel);
		font-size: 0.75rem;
	}

	li.done {
		color: var(--text);
	}

	li.done .mark {
		border-color: var(--success);
		background: var(--success);
	}

	li.current {
		color: var(--accent);
		font-weight: 700;
	}

	li.current .mark {
		border: 3px solid var(--accent);
	}

	.output {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		min-width: 0;
	}

	.browser {
		min-height: 560px;
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

	.chrome > span:not(.url) {
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

	.placeholder {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0;
		padding: 2rem;
		color: var(--muted);
		text-align: center;
	}

	.skeleton {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
		padding: 1.5rem 1.5rem 0;
	}

	.skeleton span {
		border-radius: 6px;
		background: var(--bg);
		animation: pulse 1.2s ease-in-out infinite;
	}

	@keyframes pulse {
		50% {
			opacity: 0.5;
		}
	}

	.building {
		margin: 0.9rem 1.5rem;
		font-weight: 700;
		color: var(--accent);
	}

	.app-head {
		display: flex;
		align-items: center;
		padding: 0.9rem 1.25rem;
		background: var(--accent);
		color: var(--panel);
	}

	.app-head span {
		margin-left: auto;
		font-size: 0.82rem;
	}

	.app-body {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.25rem;
	}

	.add {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
		gap: 0.5rem;
		align-items: end;
		padding: 0.9rem;
		border-radius: 8px;
		background: var(--bg);
	}

	.add label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--text);
	}

	.add input {
		min-height: 40px;
		padding: 0 0.6rem;
		font-size: 0.88rem;
		font-weight: 400;
	}

	.table {
		border-top: 2px solid var(--text);
	}

	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 120px 140px;
		gap: 0.75rem;
		align-items: center;
		padding: 0.6rem 0.75rem;
		border-bottom: 1px solid var(--border);
		font-size: 0.88rem;
	}

	.row.head {
		background: var(--bg);
		font-size: 0.8rem;
		font-weight: 700;
	}

	.muted {
		color: var(--muted);
	}

	.center {
		justify-self: center;
	}

	.ok {
		color: var(--success);
		font-size: 0.8rem;
		font-weight: 700;
	}

	.confirm {
		min-height: 36px;
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

	dialog {
		width: min(440px, calc(100vw - 2rem));
		box-sizing: border-box;
		padding: 2rem;
		border: none;
		border-top: 4px solid var(--accent);
		border-radius: 12px;
		background: var(--panel);
		color: var(--text);
		box-shadow: 0 8px 24px rgb(0 0 0 / 0.2);
	}

	dialog[open] {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	dialog::backdrop {
		background: rgb(15 23 42 / 0.55);
	}

	dialog h2 {
		font-size: 1.3rem;
	}

	dialog p {
		margin: 0;
		line-height: 1.7;
		color: var(--muted);
	}

	.ghost {
		min-height: 44px;
		border: none;
		background: transparent;
		color: var(--muted);
		font: inherit;
		cursor: pointer;
	}

	@media (max-width: 900px) {
		.build {
			grid-template-columns: 1fr;
		}

		.add {
			grid-template-columns: 1fr;
		}

		.row {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
