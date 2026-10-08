<script lang="ts">
	import { tick } from 'svelte';
	import type { Builder } from '../builder.svelte.ts';

	interface Props {
		builder: Builder;
	}

	let { builder }: Props = $props();

	let adding = $state(false);
	let draft = $state('/');
	let error = $state<string | null>(null);
	let inputEl: HTMLInputElement | undefined = $state();

	async function open() {
		adding = true;
		draft = '/';
		error = null;
		await tick();
		inputEl?.focus();
	}

	function submit(event: SubmitEvent) {
		event.preventDefault();
		error = builder.addPage(draft.trim());

		if (!error) {
			adding = false;
		}
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			adding = false;
		}
	}
</script>

<nav class="tabs" aria-label="페이지">
	{#each builder.layout.pages as page (page.id)}
		<button
			type="button"
			class:active={page.id === builder.page.id}
			onclick={() => builder.selectPage(page.id)}
		>
			{page.path}
			{#if page.blocks.length > 0}<span class="count">{page.blocks.length}</span>{/if}
		</button>
	{/each}

	{#if adding}
		<form onsubmit={submit}>
			<input bind:this={inputEl} bind:value={draft} {onkeydown} onblur={() => !draft.trim().slice(1) && (adding = false)} placeholder="/about" aria-label="새 페이지 경로" />
			<button type="submit" class="add">추가</button>
		</form>
		{#if error}<span class="error">{error}</span>{/if}
	{:else}
		<button type="button" class="add" onclick={open} title="페이지 추가">+ 페이지</button>
	{/if}
</nav>

<style>
	.tabs {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		min-width: 0;
		overflow-x: auto;
	}

	button {
		flex: none;
		display: flex;
		align-items: center;
		gap: 0.35rem;
		font: inherit;
		font-size: 0.85rem;
		padding: 0.35rem 0.7rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: var(--bg);
		color: var(--text);
		cursor: pointer;
	}

	button.active {
		border-color: var(--accent);
		background: var(--accent-soft);
		color: var(--accent);
		font-weight: 600;
	}

	.count {
		font-size: 0.7rem;
		color: var(--muted);
	}

	.add {
		border-style: dashed;
		color: var(--muted);
	}

	form {
		display: flex;
		gap: 0.3rem;
		flex: none;
	}

	input {
		width: 8rem;
		font: inherit;
		font-size: 0.85rem;
		padding: 0.3rem 0.6rem;
		border: 1px solid var(--accent);
		border-radius: 999px;
		background: var(--bg);
		color: var(--text);
	}

	.error {
		flex: none;
		font-size: 0.75rem;
		color: var(--danger);
	}
</style>
