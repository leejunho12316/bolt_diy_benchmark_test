<script lang="ts">
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';
	import { relativeTime } from '#lib/format.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	// The row whose 삭제 button has split into 확인/취소, and the one being deleted right now.
	let confirmingId = $state<string | null>(null);
	let deletingId = $state<string | null>(null);

	async function askDelete(id: string) {
		confirmingId = id;
		await tick();
		document.getElementById(`cancel-${id}`)?.focus();
	}

	async function cancelDelete(id: string) {
		confirmingId = null;
		await tick();
		document.getElementById(`delete-${id}`)?.focus();
	}

	function onConfirmKeydown(event: KeyboardEvent, id: string) {
		if (event.key === 'Escape') {
			cancelDelete(id);
		}
	}

	const { summary } = $derived(data);
</script>

<svelte:head>
	<title>내 프로젝트 · Vibe Studio</title>
</svelte:head>

<div class="page">
	<header class="site-header">
		<div class="container bar">
			<a class="brand" href="/projects"><span class="logo">◆</span> Vibe Studio</a>
			<nav aria-label="주요 메뉴">
				<a href="/examples">AI 따라해보기</a>
				<a href="/projects" aria-current="page">내 프로젝트</a>
			</nav>
		</div>
	</header>

	<main class="container content">
		<div class="intro">
			<h1>내 프로젝트</h1>
		</div>

		<section class="summary" aria-label="요약">
			<div class="card">
				<span class="label">전체 프로젝트</span>
				<span class="value">{summary.projectCount}</span>
				<span class="sub">결과물이 있는 프로젝트 {summary.withResult}개</span>
			</div>
			<div class="card">
				<span class="label">최근 작업</span>
				{#if summary.latest}
					<a class="value latest" href="/chat/{summary.latest.id}">{summary.latest.title}</a>
					<span class="sub">{relativeTime(summary.latest.updatedAt)}</span>
				{:else}
					<span class="value">-</span>
					<span class="sub">아직 작업한 프로젝트가 없습니다</span>
				{/if}
			</div>
		</section>

		<section class="list" aria-labelledby="list-title">
			<div class="list-head">
				<h2 id="list-title">프로젝트 목록</h2>
				<p class="status" role="status">
					{#if form?.deleted}'{form.deleted}' 프로젝트를 삭제했습니다.{:else if form?.error}{form.error}{/if}
				</p>
				<a class="button primary" href="/projects/new">+ 새 프로젝트</a>
			</div>

			{#if data.projects.length === 0}
				<div class="empty">
					<p class="empty-title">아직 프로젝트가 없습니다</p>
					<p>시작 페이지에서 화면을 구성하거나 빈 채팅으로 첫 프로젝트를 만들어 보세요.</p>
					<a class="button primary" href="/projects/new">새 프로젝트 만들기</a>
				</div>
			{:else}
				<div class="table">
					<div class="row head" aria-hidden="true">
						<span>프로젝트</span>
						<span class="right">작업</span>
					</div>
					<ul>
						{#each data.projects as project (project.id)}
							<li class="row">
								<div class="name">
									<h3>{project.title}</h3>
									<p class="meta">
										<span>대화 {project.turns}회</span>
										<span aria-hidden="true">·</span>
										<span>{relativeTime(project.updatedAt)} 작업</span>
										{#if !project.hasResult}
											<span aria-hidden="true">·</span>
											<span class="muted">결과물 없음</span>
										{/if}
									</p>
								</div>
								<div class="right actions">
									<a class="button primary" href="/chat/{project.id}">작업 공간 열기</a>
									<div class="delete-slot">
										{#if confirmingId === project.id}
											<!-- The 삭제 button splits into 확인/취소 so a single click never deletes. -->
											<div class="confirm" role="group" aria-label="'{project.title}' 삭제 확인">
												<form
													method="POST"
													action="?/delete"
													use:enhance={() => {
														deletingId = project.id;
														return async ({ update }) => {
															await update();
															deletingId = null;
															confirmingId = null;
														};
													}}
												>
													<input type="hidden" name="id" value={project.id} />
													<button
														class="button danger"
														disabled={deletingId === project.id}
														aria-label="'{project.title}' 삭제 확인"
														onkeydown={(e) => onConfirmKeydown(e, project.id)}
													>
														{deletingId === project.id ? '삭제 중' : '확인'}
													</button>
												</form>
												<button
													type="button"
													id="cancel-{project.id}"
													class="button ghost"
													disabled={deletingId === project.id}
													onclick={() => cancelDelete(project.id)}
													onkeydown={(e) => onConfirmKeydown(e, project.id)}
												>
													취소
												</button>
											</div>
										{:else}
											<button
												type="button"
												id="delete-{project.id}"
												class="button ghost delete"
												aria-label="'{project.title}' 삭제"
												onclick={() => askDelete(project.id)}
											>
												삭제
											</button>
										{/if}
									</div>
								</div>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</section>
	</main>

	<footer class="site-footer">
		<div class="container">
			<p>입력한 요청과 코드는 Claude(Anthropic API)로 전송됩니다. 프로젝트 데이터는 이 서버의 로컬 DB에 저장됩니다.</p>
		</div>
	</footer>
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

	/* Header */
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

	/* .content, not main: .container's padding shorthand would otherwise win. */
	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2rem;
		padding-top: 1.5rem;
		padding-bottom: 4rem;
	}

	/* Page intro */
	.intro {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--border);
	}

	h1 {
		margin: 0;
		font-size: 1.9rem;
		letter-spacing: -0.02em;
	}

	/* Summary cards */
	.summary {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		min-width: 0;
		padding: 1.4rem 1.5rem;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--panel);
	}

	.label {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--muted);
	}

	.value {
		font-size: 1.8rem;
		font-weight: 700;
		color: var(--text);
		letter-spacing: -0.02em;
		line-height: 1.2;
	}

	.value.latest {
		font-size: 1.2rem;
		color: var(--accent);
		text-decoration: none;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.value.latest:hover {
		text-decoration: underline;
	}

	.sub {
		font-size: 0.82rem;
		color: var(--muted);
	}

	/* Project list */
	.list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.list-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	h2 {
		margin: 0;
		font-size: 1.25rem;
	}

	.table {
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--panel);
		overflow: hidden;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 1.5rem;
		align-items: center;
		padding: 1.1rem 1.5rem;
		border-bottom: 1px solid var(--border);
	}

	li.row:last-child {
		border-bottom: none;
	}

	li.row:hover {
		background: var(--bg);
	}

	.row.head {
		padding-top: 0.7rem;
		padding-bottom: 0.7rem;
		background: var(--bg);
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--muted);
	}

	.right {
		display: flex;
		justify-content: flex-end;
	}

	.name {
		min-width: 0;
	}

	h3 {
		margin: 0 0 0.35rem;
		font-size: 1.02rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem;
		margin: 0;
		font-size: 0.8rem;
		color: var(--muted);
	}

	.muted {
		opacity: 0.8;
	}

	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 40px;
		padding: 0 1rem;
		border-radius: 8px;
		font-size: 0.88rem;
		font-weight: 600;
		text-decoration: none;
		white-space: nowrap;
	}

	.button.primary {
		background: var(--accent);
		color: var(--panel);
	}

	.button.primary:hover {
		filter: brightness(1.08);
	}

	.status {
		margin: 0 auto 0 0.5rem;
		font-size: 0.85rem;
		color: var(--muted);
	}

	.actions {
		gap: 0.5rem;
	}

	/* Fixed width so the 삭제 button and the 확인/취소 pair occupy the same slot. */
	.delete-slot {
		width: 96px;
		flex: none;
	}

	.delete-slot .button {
		min-height: 32px;
		font-size: 0.8rem;
	}

	.delete-slot > .button,
	.confirm {
		width: 100%;
	}

	.confirm {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4px;
		animation: split 0.16s ease-out;
	}

	.confirm form {
		width: 100%;
		min-width: 0;
	}

	.confirm .button {
		width: 100%;
		min-width: 0;
		padding: 0 0.5rem;
	}

	@keyframes split {
		from {
			opacity: 0.4;
			transform: scaleX(0.6);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.confirm {
			animation: none;
		}
	}

	.button {
		font: inherit;
		font-size: 0.88rem;
		font-weight: 600;
		cursor: pointer;
	}

	.button.ghost {
		border: 1px solid var(--border);
		background: var(--panel);
		color: var(--text);
	}

	.button.ghost:hover:not(:disabled) {
		border-color: var(--muted);
	}

	.button.delete {
		color: var(--danger);
	}

	.button.delete:hover {
		border-color: var(--danger);
		background: var(--danger-soft);
	}

	.button.danger {
		border: none;
		background: var(--danger);
		color: white;
	}

	.button:disabled {
		opacity: 0.6;
		cursor: default;
	}

	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 3.5rem 1.5rem;
		border: 1px dashed var(--border);
		border-radius: 12px;
		text-align: center;
		color: var(--muted);
	}

	.empty p {
		margin: 0;
		word-break: keep-all;
	}

	.empty-title {
		color: var(--text);
		font-size: 1.1rem;
		font-weight: 600;
	}

	.empty .button {
		margin-top: 0.75rem;
	}

	/* Footer */
	.site-footer {
		border-top: 1px solid var(--border);
		background: var(--panel);
	}

	.site-footer p {
		margin: 0;
		padding: 1.5rem 0;
		font-size: 0.8rem;
		color: var(--muted);
		word-break: keep-all;
	}

	@media (max-width: 800px) {
		.container {
			padding: 0 1rem;
		}

		.bar {
			gap: 1.25rem;
		}

		.summary {
			grid-template-columns: minmax(0, 1fr);
		}

		.row {
			grid-template-columns: minmax(0, 1fr);
			gap: 0.75rem;
		}

		.row.head {
			display: none;
		}

		.right {
			justify-content: stretch;
		}

		.right > .button {
			flex: 1;
		}
	}
</style>
