<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Vibe Studio</title>
</svelte:head>

{@render children()}

<style>
	:global(:root) {
		--bg: #f8fafc;
		--panel: #ffffff;
		--border: #e2e8f0;
		--text: #0f172a;
		--muted: #64748b;
		--accent: #6d28d9;
		--accent-soft: #ede9fe;
		--success: #16a34a;
		--warning: #f59e0b;
		--danger: #dc2626;
		--danger-soft: #fef2f2;
		color-scheme: light;
	}

	@media (prefers-color-scheme: dark) {
		:global(:root) {
			--bg: #0b1120;
			--panel: #111827;
			--border: #1f2937;
			--text: #e5e7eb;
			--muted: #94a3b8;
			--accent: #a78bfa;
			--accent-soft: #2e1065;
			--danger-soft: #2a1215;
			color-scheme: dark;
		}
	}

	:global(html, body) {
		margin: 0;
		height: 100%;
		background: var(--bg);
		color: var(--text);
		font-family:
			'Pretendard',
			system-ui,
			-apple-system,
			'Segoe UI',
			sans-serif;
	}

	:global(*, *::before, *::after) {
		box-sizing: border-box;
	}
</style>
