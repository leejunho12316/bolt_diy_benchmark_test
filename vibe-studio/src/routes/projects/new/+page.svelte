<script lang="ts">
	import { onMount } from 'svelte';
	import { Builder } from '#lib/builder/builder.svelte.ts';
	import { FRAME, GRID, type BlockType } from '#lib/builder/types.ts';
	import Canvas from '#lib/builder/components/Canvas.svelte';
	import Inspector from '#lib/builder/components/Inspector.svelte';
	import PageTabs from '#lib/builder/components/PageTabs.svelte';
	import Palette from '#lib/builder/components/Palette.svelte';
	import DesignDrawer from '#lib/builder/components/DesignDrawer.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const builder = new Builder();
	let restored = $state(false);
	let drawerOpen = $state(false);
	let startButton: HTMLButtonElement | undefined = $state();

	function closeDrawer() {
		drawerOpen = false;
		startButton?.focus();
	}

	onMount(() => {
		builder.restore();
		restored = true;
	});

	// Keep the draft in this browser so a reload doesn't lose the wireframe.
	$effect(() => {
		if (restored) {
			JSON.stringify(builder.layout);
			builder.save();
		}
	});

	function addAtCenter(type: BlockType) {
		builder.addBlock(type, FRAME.width / 2, FRAME.height / 2);
	}

	function onkeydown(event: KeyboardEvent) {
		const target = event.target as HTMLElement;

		if (drawerOpen) {
			return;
		}

		if (target.closest('input, textarea, select, [contenteditable]')) {
			return;
		}

		const block = builder.selected;

		if (event.key === 'Escape') {
			builder.selectedId = null;
		} else if (block && (event.key === 'Delete' || event.key === 'Backspace')) {
			event.preventDefault();
			builder.removeBlock(block.id);
		} else if (block && event.key.startsWith('Arrow')) {
			event.preventDefault();
			const step = event.shiftKey ? GRID : 1;
			const dx = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0;
			const dy = event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0;
			builder.nudge(block, dx, dy);
		}
	}

	function reset() {
		if (confirm('배치한 블록과 페이지를 모두 지울까요?')) {
			builder.reset();
		}
	}
</script>

<svelte:window {onkeydown} />

<svelte:head>
	<title>새 프로젝트 · Vibe Studio</title>
</svelte:head>

<div class="builder">
	<header>
		<div class="brand"><span class="logo">◆</span> Vibe Studio</div>
		<a class="nav-link" href="/projects">내 프로젝트</a>
		<PageTabs {builder} />
		<div class="actions">
			{#if form?.error}<span class="error" role="alert">{form.error}</span>{/if}
			<button type="button" class="ghost" onclick={reset} disabled={builder.blockCount === 0}>초기화</button>
			<form method="POST" action="?/blank">
				<button class="ghost">빈 채팅으로 시작</button>
			</form>
			<!-- Opens the design drawer; the drawer's own 시작하기 submits the layout with the chosen design. -->
			<button
				type="button"
				class="primary"
				bind:this={startButton}
				disabled={builder.blockCount === 0}
				aria-haspopup="dialog"
				onclick={() => (drawerOpen = true)}
			>
				시작하기
			</button>
		</div>
	</header>

	<Palette onadd={addAtCenter} />
	<Canvas {builder} />
	<Inspector {builder} />
</div>

<DesignDrawer open={drawerOpen} designs={data.designs} layout={JSON.stringify(builder.layout)} onclose={closeDrawer} />

<style>
	.builder {
		display: grid;
		grid-template-columns: 232px minmax(0, 1fr) 272px;
		grid-template-rows: auto minmax(0, 1fr);
		height: 100vh;
		height: 100dvh;
		overflow: hidden;
	}

	header {
		grid-column: 1 / -1;
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.7rem 1rem;
		border-bottom: 1px solid var(--border);
		background: var(--panel);
		min-width: 0;
	}

	.brand {
		flex: none;
		font-weight: 700;
	}

	.nav-link {
		flex: none;
		font-size: 0.88rem;
		font-weight: 600;
		color: var(--muted);
		text-decoration: none;
	}

	.nav-link:hover {
		color: var(--accent);
	}

	.logo {
		color: var(--accent);
	}

	header :global(.tabs) {
		flex: 1;
	}

	.actions {
		flex: none;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.error {
		font-size: 0.8rem;
		color: var(--danger);
	}

	button {
		font: inherit;
		font-size: 0.85rem;
		font-weight: 600;
		padding: 0.5rem 0.9rem;
		border-radius: 8px;
		cursor: pointer;
	}

	button:disabled {
		opacity: 0.4;
		cursor: default;
	}

	.primary {
		border: none;
		background: var(--accent);
		color: var(--panel);
	}

	.ghost {
		border: 1px solid var(--border);
		background: transparent;
		color: var(--text);
	}

	@media (max-width: 800px) {
		.builder {
			grid-template-columns: minmax(0, 1fr);
			grid-template-rows: auto auto minmax(0, 1fr) auto;
		}

		header {
			flex-wrap: wrap;
		}

		header :global(.tabs) {
			order: 3;
			flex-basis: 100%;
		}

		.actions {
			margin-left: auto;
		}

		.builder > :global(.inspector) {
			max-height: 35vh;
		}
	}
</style>
