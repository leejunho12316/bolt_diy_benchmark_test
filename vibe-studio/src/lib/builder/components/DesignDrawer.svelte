<script lang="ts">
	import { tick } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import type { DesignSummary } from '#lib/server/design/catalog.ts';

	interface Props {
		open: boolean;
		designs: DesignSummary[];
		/** JSON of the wireframe, posted together with the chosen design. */
		layout: string;
		onclose: () => void;
	}

	let { open, designs, layout, onclose }: Props = $props();

	// '' is the "기본" card (no template); null means nothing picked yet.
	let selected = $state<string | null>(null);
	let submitting = $state(false);
	let panel: HTMLDivElement | undefined = $state();
	let closeButton: HTMLButtonElement | undefined = $state();

	const reducedMotion =
		typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
	const duration = reducedMotion ? 0 : 220;

	$effect(() => {
		if (open) {
			tick().then(() => closeButton?.focus());
		}
	});

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			onclose();
			return;
		}

		// Keep Tab inside the drawer while it is open.
		if (event.key === 'Tab' && panel) {
			// A radio group is a single tab stop: the checked radio, or the first one when none is.
			const radios = [...panel.querySelectorAll<HTMLInputElement>('input[name="design"]')];
			const radioStop = radios.find((r) => r.checked) ?? radios[0];
			const focusable = [...panel.querySelectorAll<HTMLElement>('button:not(:disabled), input[name="design"]')].filter(
				(el) => !(el instanceof HTMLInputElement) || el === radioStop
			);
			const first = focusable[0];
			const last = focusable.at(-1);

			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last?.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first?.focus();
			}
		}
	}
</script>

{#if open}
	<div class="backdrop" transition:fade={{ duration }} onclick={onclose} aria-hidden="true"></div>

	<div
		class="drawer"
		role="dialog"
		aria-modal="true"
		aria-labelledby="design-drawer-title"
		tabindex="-1"
		bind:this={panel}
		transition:fly={{ x: 48, duration }}
		{onkeydown}
	>
		<header>
			<div>
				<h2 id="design-drawer-title">디자인 선택</h2>
				<p>만들 앱에 적용할 디자인 템플릿을 고르세요. 고른 템플릿의 가이드가 Claude에게 함께 전달됩니다.</p>
			</div>
			<button type="button" class="icon" bind:this={closeButton} onclick={onclose} aria-label="닫기">✕</button>
		</header>

		<form method="POST" action="?/start" onsubmit={() => (submitting = true)}>
			<input type="hidden" name="layout" value={layout} />

			<fieldset class="cards">
				<legend class="sr-only">디자인 템플릿</legend>

				<label class="card" class:selected={selected === ''}>
					<input type="radio" name="design" value="" bind:group={selected} />
					<span class="thumb none" aria-hidden="true">
						<span class="spark">✦</span>
						<span>AI가 요청에 맞춰 결정</span>
					</span>
					<span class="info">
						<span class="title">기본 <small>디자인 지정 안 함</small></span>
						<span class="desc">템플릿 없이 요청 내용과 배치만 보고 Claude가 스타일을 정합니다.</span>
					</span>
					<span class="check" aria-hidden="true">✓</span>
				</label>

				{#each designs as design (design.id)}
					<label class="card" class:selected={selected === design.id}>
						<input type="radio" name="design" value={design.id} bind:group={selected} />
						<img class="thumb" src={design.preview} alt="{design.title} 템플릿을 적용한 예시 화면" loading="lazy" width="640" height="400" />
						<span class="info">
							<span class="title">{design.title}</span>
							<span class="desc">{design.description}</span>
							<span class="tags">
								{#each design.tags as tag (tag)}<span>{tag}</span>{/each}
							</span>
						</span>
						<span class="check" aria-hidden="true">✓</span>
					</label>
				{/each}
			</fieldset>

			<footer>
				<span class="hint" aria-live="polite">
					{#if selected === null}
						템플릿을 하나 선택하세요
					{:else if selected === ''}
						기본(디자인 지정 안 함)으로 시작합니다
					{:else}
						{designs.find((d) => d.id === selected)?.title} 템플릿으로 시작합니다
					{/if}
				</span>
				<button type="button" class="ghost" onclick={onclose}>취소</button>
				<button class="primary" disabled={selected === null || submitting}>
					{submitting ? '시작하는 중…' : '시작하기'}
				</button>
			</footer>
		</form>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 40;
		background: rgb(15 23 42 / 0.45);
	}

	.drawer {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		z-index: 41;
		width: min(760px, 100vw);
		display: flex;
		flex-direction: column;
		background: var(--panel);
		border-left: 1px solid var(--border);
		box-shadow: -16px 0 48px rgb(0 0 0 / 0.18);
		outline: none;
	}

	header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		padding: 1.25rem 1.5rem 1rem;
		border-bottom: 1px solid var(--border);
	}

	h2 {
		margin: 0 0 0.3rem;
		font-size: 1.2rem;
	}

	header p {
		margin: 0;
		font-size: 0.85rem;
		color: var(--muted);
		word-break: keep-all;
	}

	.icon {
		flex: none;
		width: 36px;
		height: 36px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: transparent;
		color: var(--muted);
		font-size: 0.9rem;
		cursor: pointer;
	}

	.icon:hover {
		color: var(--text);
		border-color: var(--muted);
	}

	form {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}

	.cards {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		margin: 0;
		padding: 1.25rem 1.5rem;
		border: none;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		/* Cards clip overflow, which makes their automatic min height 0; without this the
		   scroll container squeezes every row down to the image. */
		grid-auto-rows: max-content;
		gap: 1rem;
		align-content: start;
	}

	.card {
		position: relative;
		display: flex;
		flex-direction: column;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--bg);
		overflow: hidden;
		cursor: pointer;
		transition:
			border-color 0.15s,
			box-shadow 0.15s;
	}

	.card:hover {
		border-color: var(--muted);
	}

	.card.selected {
		border-color: var(--accent);
		box-shadow: 0 0 0 2px var(--accent);
	}

	/* The radio stays in the accessibility tree and keyboard order; the card is its visual. */
	.card input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.card:has(input:focus-visible) {
		outline: 2px solid var(--accent);
		outline-offset: 3px;
	}

	.thumb {
		display: block;
		width: 100%;
		aspect-ratio: 16 / 10;
		height: auto;
		object-fit: cover;
		border-bottom: 1px solid var(--border);
		background: var(--panel);
	}

	.thumb.none {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		background:
			radial-gradient(circle at 30% 30%, var(--accent-soft), transparent 60%),
			var(--panel);
		color: var(--muted);
		font-size: 0.85rem;
	}

	.spark {
		font-size: 1.8rem;
		color: var(--accent);
	}

	.info {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding: 0.85rem 1rem 1rem;
	}

	.title {
		font-weight: 700;
		font-size: 0.98rem;
	}

	.title small {
		margin-left: 0.3rem;
		font-weight: 500;
		font-size: 0.78rem;
		color: var(--muted);
	}

	.desc {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		font-size: 0.82rem;
		line-height: 1.5;
		color: var(--muted);
		word-break: keep-all;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
		margin-top: 0.2rem;
	}

	.tags span {
		padding: 0.1rem 0.5rem;
		border-radius: 999px;
		background: var(--accent-soft);
		color: var(--accent);
		font-size: 0.72rem;
		font-weight: 600;
	}

	.check {
		position: absolute;
		top: 10px;
		right: 10px;
		width: 28px;
		height: 28px;
		display: grid;
		place-items: center;
		border-radius: 50%;
		background: var(--accent);
		color: var(--panel);
		font-weight: 700;
		opacity: 0;
		transform: scale(0.6);
		transition:
			opacity 0.15s,
			transform 0.15s;
	}

	.selected .check {
		opacity: 1;
		transform: none;
	}

	footer {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.9rem 1.5rem;
		border-top: 1px solid var(--border);
		background: var(--panel);
	}

	.hint {
		margin-right: auto;
		font-size: 0.85rem;
		color: var(--muted);
	}

	footer button {
		font: inherit;
		font-size: 0.9rem;
		font-weight: 600;
		height: 42px;
		padding: 0 1.2rem;
		border-radius: 8px;
		cursor: pointer;
	}

	.ghost {
		border: 1px solid var(--border);
		background: transparent;
		color: var(--text);
	}

	.primary {
		border: none;
		background: var(--accent);
		color: var(--panel);
	}

	.primary:disabled {
		opacity: 0.4;
		cursor: default;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}

	@media (max-width: 640px) {
		.cards {
			grid-template-columns: minmax(0, 1fr);
			padding: 1rem;
		}

		header,
		footer {
			padding-left: 1rem;
			padding-right: 1rem;
		}

		.hint {
			display: none;
		}

		footer .primary {
			flex: 1;
		}
	}
</style>
