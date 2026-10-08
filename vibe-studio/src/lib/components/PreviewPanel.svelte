<script lang="ts">
	import type { Workbench } from '#lib/stores/workbench.svelte.ts';

	let { workbench }: { workbench: Workbench } = $props();

	let showLogs = $state(false);

	const statusText = {
		idle: '대기 중',
		booting: '실행 환경 부팅 중',
		installing: '패키지 설치 중',
		starting: '개발 서버 시작 중',
		ready: '실행 중',
		error: '오류'
	} as const;
</script>

<section class="preview">
	<div class="toolbar">
		<span class="status {workbench.status}">
			<span class="dot"></span>
			{statusText[workbench.status]}
		</span>
		<span class="url">{workbench.previewUrl ?? '결과물 미리보기'}</span>
		<button onclick={() => workbench.reloadPreview()} disabled={!workbench.previewUrl} title="새로고침">↻</button>
		<button onclick={() => (showLogs = !showLogs)} class:active={showLogs} title="터미널 로그">터미널</button>
	</div>

	{#if workbench.alert}
		<div class="alert" role="alert">
			<div>
				<strong>{workbench.alert.title}</strong>
				<pre>{workbench.alert.detail}</pre>
			</div>
			<button onclick={() => (workbench.alert = null)} aria-label="닫기">✕</button>
		</div>
	{/if}

	<div class="frame">
		{#if workbench.previewUrl}
			{#key workbench.previewKey}
				<iframe src={workbench.previewUrl} title="결과물 미리보기" allow="clipboard-read; clipboard-write"></iframe>
			{/key}
		{:else}
			<div class="placeholder">
				<div class="spinner" class:hidden={workbench.status === 'error'}></div>
				<p>{statusText[workbench.status]}…</p>
				{#if workbench.status === 'installing'}
					<p class="hint">처음 실행할 때는 패키지 설치에 1분 정도 걸릴 수 있습니다.</p>
				{/if}
			</div>
		{/if}
	</div>

	{#if showLogs}
		<pre class="logs">{workbench.logs.join('\n') || '(출력 없음)'}</pre>
	{/if}
</section>

<style>
	.preview {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-width: 0;
		min-height: 0;
		overflow: hidden;
		background: var(--bg);
	}

	.toolbar {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.55rem 0.8rem;
		border-bottom: 1px solid var(--border);
		background: var(--panel);
		font-size: 0.8rem;
	}

	.status {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		white-space: nowrap;
		color: var(--muted);
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--warning);
	}

	.ready .dot {
		background: var(--success);
	}

	.error .dot {
		background: var(--danger);
	}

	.url {
		flex: 1;
		min-width: 0;
		padding: 0.3rem 0.6rem;
		border-radius: 6px;
		background: var(--bg);
		color: var(--muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-family: ui-monospace, monospace;
	}

	button {
		font: inherit;
		padding: 0.3rem 0.6rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--panel);
		color: var(--text);
		cursor: pointer;
	}

	button:disabled {
		opacity: 0.4;
		cursor: default;
	}

	button.active {
		border-color: var(--accent);
		color: var(--accent);
	}

	.alert {
		display: flex;
		gap: 0.8rem;
		align-items: flex-start;
		padding: 0.6rem 0.8rem;
		background: var(--danger-soft);
		border-bottom: 1px solid var(--border);
		font-size: 0.8rem;
	}

	.alert > div {
		flex: 1;
		min-width: 0;
	}

	.alert pre {
		margin: 0.3rem 0 0;
		max-height: 8rem;
		overflow: auto;
		white-space: pre-wrap;
	}

	.frame {
		flex: 1;
		position: relative;
		min-height: 0;
	}

	iframe {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		border: none;
		background: white;
	}

	.placeholder {
		height: 100%;
		display: grid;
		place-content: center;
		justify-items: center;
		gap: 0.3rem;
		color: var(--muted);
		font-size: 0.9rem;
	}

	.placeholder p {
		margin: 0;
	}

	.hint {
		font-size: 0.8rem;
	}

	.spinner {
		width: 28px;
		height: 28px;
		margin-bottom: 0.6rem;
		border: 3px solid var(--border);
		border-top-color: var(--accent);
		border-radius: 50%;
		animation: spin 0.9s linear infinite;
	}

	.spinner.hidden {
		display: none;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.logs {
		height: 30%;
		min-height: 120px;
		margin: 0;
		padding: 0.6rem 0.8rem;
		overflow: auto;
		border-top: 1px solid var(--border);
		background: #0f172a;
		color: #cbd5e1;
		font-size: 0.75rem;
		line-height: 1.5;
	}
</style>
