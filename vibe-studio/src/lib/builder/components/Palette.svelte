<script lang="ts">
	import { onMount } from 'svelte';
	import { BLOCK_TYPES, CATEGORIES, blockDef, type BlockType, type CategoryId } from '../types.ts';

	interface Props {
		/** Click (or keyboard) fallback for adding a block without dragging. */
		onadd: (type: BlockType) => void;
	}

	let { onadd }: Props = $props();

	const STORAGE_KEY = 'vibe-studio:palette-open';

	let open = $state<Record<CategoryId, boolean>>({ structure: true, content: true, input: false, feedback: false });

	const groups = CATEGORIES.map((category) => ({
		...category,
		types: BLOCK_TYPES.filter((type) => blockDef(type).category === category.id)
	}));

	onMount(() => {
		try {
			const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');

			if (saved && typeof saved === 'object') {
				open = { ...open, ...saved };
			}
		} catch {
			// Keep the defaults.
		}
	});

	function toggle(id: CategoryId) {
		open[id] = !open[id];

		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(open));
		} catch {
			// Not persisted; harmless.
		}
	}

	function ondragstart(event: DragEvent, type: BlockType) {
		event.dataTransfer?.setData('application/x-vibe-block', type);
		event.dataTransfer!.effectAllowed = 'copy';
	}
</script>

<aside class="palette">
	<p class="hint">캔버스로 끌어다 놓거나 클릭해서 추가하세요</p>

	{#each groups as group (group.id)}
		<section class="group">
			<button
				type="button"
				class="group-toggle"
				aria-expanded={open[group.id]}
				aria-controls="palette-{group.id}"
				onclick={() => toggle(group.id)}
			>
				<span class="chevron" class:open={open[group.id]}>▸</span>
				{group.label}
				<span class="count">{group.types.length}</span>
			</button>

			{#if open[group.id]}
				<ul id="palette-{group.id}">
					{#each group.types as type (type)}
						<li>
							<button
								type="button"
								class="item"
								draggable="true"
								data-block-type={type}
								ondragstart={(e) => ondragstart(e, type)}
								onclick={() => onadd(type)}
								title="끌어다 놓거나 클릭해서 추가"
							>
								<span class="icon">{blockDef(type).icon}</span>
								<span class="name">{blockDef(type).label}</span>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	{/each}
</aside>

<style>
	.palette {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		padding: 0.9rem 0.75rem;
		border-right: 1px solid var(--border);
		background: var(--panel);
		min-height: 0;
		overflow-y: auto;
	}

	.hint {
		margin: 0 0.25rem 0.4rem;
		font-size: 0.75rem;
		color: var(--muted);
		word-break: keep-all;
	}

	.group-toggle {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.45rem 0.4rem;
		border: none;
		border-radius: 6px;
		background: transparent;
		color: var(--text);
		font: inherit;
		font-size: 0.82rem;
		font-weight: 600;
		cursor: pointer;
		text-align: left;
	}

	.group-toggle:hover {
		background: var(--bg);
	}

	.chevron {
		display: inline-block;
		width: 0.8rem;
		color: var(--muted);
		transition: transform 0.15s ease;
	}

	.chevron.open {
		transform: rotate(90deg);
	}

	.count {
		margin-left: auto;
		font-size: 0.72rem;
		font-weight: 400;
		color: var(--muted);
	}

	ul {
		list-style: none;
		margin: 0.15rem 0 0.4rem;
		padding: 0;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.35rem;
	}

	.item {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0.5rem 0.25rem;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg);
		color: var(--text);
		font: inherit;
		font-size: 0.74rem;
		cursor: grab;
	}

	.item:hover {
		border-color: var(--accent);
	}

	.item:active {
		cursor: grabbing;
	}

	.icon {
		width: 1.5rem;
		height: 1.5rem;
		display: grid;
		place-items: center;
		border-radius: 6px;
		background: var(--accent-soft);
		color: var(--accent);
		font-weight: 700;
		font-size: 0.8rem;
	}

	.name {
		text-align: center;
		word-break: keep-all;
		line-height: 1.25;
	}

	@media (max-width: 800px) {
		.palette {
			max-height: 38vh;
			border-right: none;
			border-bottom: 1px solid var(--border);
		}

		ul {
			grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
		}
	}
</style>
