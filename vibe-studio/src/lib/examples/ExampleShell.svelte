<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		notice?: string;
		children: Snippet;
	}

	let { title, notice = '이 화면은 바이브 코딩으로 만든 예시예요. 직접 눌러 보며 써 보세요.', children }: Props = $props();
</script>

<div class="page">
	<header class="site-header">
		<div class="bar">
			<a class="brand" href="/examples"><span class="logo">◆</span> Vibe Studio</a>
			<span class="badge">모범 예시 체험 · {title}</span>
			<a class="back" href="/examples">← 다른 예시</a>
			<a class="login" href="/login">로그인</a>
		</div>
	</header>

	<div class="notice">
		<span>{notice}</span>
		<a href="/login">나도 만들어 보기 →</a>
	</div>

	<main>
		{@render children()}
	</main>
</div>

<style>
	.page {
		min-height: 100vh;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
	}

	.site-header {
		background: var(--panel);
		border-bottom: 1px solid var(--border);
	}

	.bar {
		display: flex;
		align-items: center;
		gap: 1rem;
		height: 64px;
		padding: 0 2rem;
	}

	.brand {
		flex: none;
		font-weight: 700;
		color: var(--text);
		text-decoration: none;
	}

	.logo {
		color: var(--accent);
	}

	.badge {
		padding: 0.25rem 0.6rem;
		border-radius: 4px;
		background: var(--accent-soft);
		color: var(--accent);
		font-size: 0.8rem;
		font-weight: 700;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.back {
		margin-left: auto;
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding: 0 0.5rem;
		color: var(--muted);
		font-weight: 600;
		text-decoration: none;
		white-space: nowrap;
	}

	.back:hover {
		color: var(--text);
	}

	.login {
		display: inline-flex;
		align-items: center;
		min-height: 40px;
		padding: 0 1.1rem;
		border: 1px solid var(--accent);
		border-radius: 8px;
		color: var(--accent);
		font-weight: 700;
		text-decoration: none;
		white-space: nowrap;
	}

	.notice {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.6rem 2rem;
		background: var(--accent);
		color: var(--panel);
		font-size: 0.88rem;
	}

	.notice a {
		margin-left: auto;
		flex: none;
		display: inline-flex;
		align-items: center;
		min-height: 36px;
		padding: 0 0.9rem;
		border-radius: 6px;
		background: var(--panel);
		color: var(--accent);
		font-weight: 700;
		text-decoration: none;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1.5rem 2rem 2.5rem;
		background: var(--bg);
	}

	@media (max-width: 800px) {
		.bar,
		.notice,
		main {
			padding-left: 1rem;
			padding-right: 1rem;
		}

		.badge {
			display: none;
		}

		.notice {
			flex-wrap: wrap;
		}
	}
</style>
