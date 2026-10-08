<script lang="ts">
	import { goto } from '$app/navigation';

	// Screen only for now: nothing typed here is sent or stored.
	function enter(event?: SubmitEvent) {
		event?.preventDefault();
		goto('/projects');
	}
</script>

<svelte:head>
	<title>로그인 · Vibe Studio</title>
</svelte:head>

<div class="page">
	<header class="site-header">
		<div class="container bar">
			<a class="brand" href="/examples"><span class="logo">◆</span> Vibe Studio</a>
		</div>
	</header>

	<main>
		<div class="card">
			<div class="intro">
				<h1>로그인</h1>
				<p>로그인하면 내 프로젝트에서 직접 만들어 볼 수 있어요.</p>
			</div>

			<button type="button" class="sso" onclick={() => enter()}>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
				Bizworks 통합 로그인
			</button>

			<div class="divider"><span>또는 아이디로 로그인</span></div>

			<form onsubmit={enter}>
				<label for="login-id">아이디</label>
				<input id="login-id" type="text" autocomplete="username" placeholder="사내 아이디" />
				<label for="login-pw">비밀번호</label>
				<input id="login-pw" type="password" autocomplete="current-password" />
				<label class="check"><input type="checkbox" /> 아이디 저장</label>
				<button type="submit" class="submit">로그인</button>
			</form>

			<p class="help">부트캠프에서 선정되고 개발 권한이 승인된 계정만 프로젝트를 만들 수 있습니다. 계정 문의: [연락처]</p>
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

	main {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 3.5rem 1rem;
	}

	.card {
		width: 100%;
		max-width: 440px;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: 2.5rem;
		border: 1px solid var(--border);
		border-top: 4px solid var(--accent);
		border-radius: 12px;
		background: var(--panel);
		box-shadow: 0 2px 8px rgb(15 23 42 / 0.08);
	}

	.intro {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	h1 {
		margin: 0;
		font-size: 1.75rem;
		letter-spacing: -0.03em;
	}

	.intro p {
		margin: 0;
		line-height: 1.7;
		color: var(--muted);
	}

	.sso,
	.submit {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.6rem;
		min-height: 52px;
		border-radius: 8px;
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	.sso {
		border: 1px solid var(--text);
		background: var(--text);
		color: var(--panel);
	}

	.submit {
		margin-top: 0.4rem;
		border: none;
		background: var(--accent);
		color: var(--panel);
	}

	.sso:hover,
	.submit:hover {
		filter: brightness(1.08);
	}

	.divider {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.82rem;
		color: var(--muted);
	}

	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--border);
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	form > label:not(.check) {
		font-size: 0.88rem;
		font-weight: 700;
	}

	input:not([type='checkbox']) {
		min-height: 48px;
		margin-bottom: 0.5rem;
		padding: 0 0.75rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--panel);
		color: var(--text);
		font: inherit;
	}

	input:focus {
		outline: 2px solid var(--accent-soft);
		border-color: var(--accent);
	}

	.check {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 32px;
		font-size: 0.88rem;
		color: var(--muted);
	}

	.check input {
		width: 18px;
		height: 18px;
		accent-color: var(--accent);
	}

	.help {
		margin: 0;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
		font-size: 0.82rem;
		line-height: 1.7;
		color: var(--muted);
	}

	@media (max-width: 800px) {
		.container {
			padding: 0 1rem;
		}

		.card {
			padding: 1.75rem 1.25rem;
		}
	}
</style>
