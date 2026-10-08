<script lang="ts">
	import type { Builder } from '../builder.svelte.ts';
	import { FRAME, blockDef, isBlockType, type Block, type BlockType } from '../types.ts';
	import BlockView from './BlockView.svelte';

	interface Props {
		builder: Builder;
	}

	let { builder }: Props = $props();

	const PADDING = 24;

	let stageWidth = $state(0);
	let stageHeight = $state(0);
	let frameEl: HTMLDivElement | undefined = $state();
	let dropActive = $state(false);

	// Fit the fixed design frame into the available space; never upscale.
	const scale = $derived(
		stageWidth && stageHeight
			? Math.min((stageWidth - PADDING * 2) / FRAME.width, (stageHeight - PADDING * 2) / FRAME.height, 1)
			: 1
	);

	function toFrame(clientX: number, clientY: number) {
		const rect = frameEl!.getBoundingClientRect();
		return { x: (clientX - rect.left) / scale, y: (clientY - rect.top) / scale };
	}

	function blockType(event: DragEvent): BlockType | null {
		const type = event.dataTransfer?.getData('application/x-vibe-block');
		return isBlockType(type) ? type : null;
	}

	function ondragover(event: DragEvent) {
		if (event.dataTransfer?.types.includes('application/x-vibe-block')) {
			event.preventDefault();
			event.dataTransfer.dropEffect = 'copy';
			dropActive = true;
		}
	}

	function ondrop(event: DragEvent) {
		event.preventDefault();
		dropActive = false;
		const type = blockType(event);

		if (type) {
			const { x, y } = toFrame(event.clientX, event.clientY);
			builder.addBlock(type, x, y);
		}
	}

	/** Shared pointer-drag helper for moving and resizing (same capture pattern as the chat resizer). */
	function drag(event: PointerEvent, onmove: (dx: number, dy: number) => void) {
		if (event.button !== 0) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		const handle = event.currentTarget as HTMLElement;
		const startX = event.clientX;
		const startY = event.clientY;
		handle.setPointerCapture(event.pointerId);

		const move = (e: PointerEvent) => onmove((e.clientX - startX) / scale, (e.clientY - startY) / scale);
		const up = () => {
			handle.removeEventListener('pointermove', move);
			handle.removeEventListener('pointerup', up);
			handle.removeEventListener('pointercancel', up);
		};

		handle.addEventListener('pointermove', move);
		handle.addEventListener('pointerup', up);
		handle.addEventListener('pointercancel', up);
	}

	function startMove(event: PointerEvent, block: Block) {
		builder.selectedId = block.id;
		const { x, y } = block;
		drag(event, (dx, dy) => builder.moveBlock(block, x + dx, y + dy));
	}

	function startResize(event: PointerEvent, block: Block) {
		const { w, h } = block;
		drag(event, (dx, dy) => builder.resizeBlock(block, w + dx, h + dy));
	}
</script>

<div
	class="stage"
	role="application"
	aria-label="화면 캔버스"
	bind:clientWidth={stageWidth}
	bind:clientHeight={stageHeight}
	{ondragover}
	ondragleave={() => (dropActive = false)}
	{ondrop}
	onpointerdown={() => (builder.selectedId = null)}
>
	<div class="sizer" style:width="{FRAME.width * scale}px" style:height="{FRAME.height * scale}px">
		<div
			class="frame"
			class:drop-active={dropActive}
			bind:this={frameEl}
			style:width="{FRAME.width}px"
			style:height="{FRAME.height}px"
			style:transform="scale({scale})"
		>
			{#if builder.page.blocks.length === 0}
				<p class="empty"><span>왼쪽 블록을 이곳에 끌어다 놓아 <strong>{builder.page.path}</strong> 화면을 구성하세요</span></p>
			{/if}

			{#each builder.page.blocks as block (block.id)}
				<div
					class="block"
					class:selected={builder.selectedId === block.id}
					class:container={blockDef(block.type).container}
					data-block-id={block.id}
					role="button"
					tabindex="0"
					aria-label="{blockDef(block.type).label} 블록"
					style:left="{block.x}px"
					style:top="{block.y}px"
					style:width="{block.w}px"
					style:height="{block.h}px"
					onpointerdown={(e) => startMove(e, block)}
					onfocus={() => (builder.selectedId = block.id)}
				>
					<BlockView {block} layout={builder.layout} />
					<span class="tag">{blockDef(block.type).label}</span>
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<span class="resize" onpointerdown={(e) => startResize(e, block)}></span>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.stage {
		position: relative;
		display: grid;
		place-items: center;
		min-width: 0;
		min-height: 0;
		overflow: hidden;
		background:
			radial-gradient(circle, var(--border) 1px, transparent 1px) 0 0 / 16px 16px,
			var(--bg);
	}

	.sizer {
		position: relative;
	}

	.frame {
		position: absolute;
		top: 0;
		left: 0;
		transform-origin: top left;
		background: var(--panel);
		border-radius: 12px;
		box-shadow:
			0 1px 3px rgb(0 0 0 / 0.08),
			0 12px 32px rgb(0 0 0 / 0.08);
		outline: 2px dashed transparent;
		outline-offset: 6px;
	}

	.frame.drop-active {
		outline-color: var(--accent);
	}

	.empty {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		margin: 0;
		font-size: 22px;
		color: var(--muted);
		pointer-events: none;
	}

	.block {
		position: absolute;
		z-index: 1;
		cursor: move;
		touch-action: none;
		user-select: none;
		border-radius: 6px;
		outline: 1px dashed var(--border);
	}

	.block:hover {
		outline-color: var(--muted);
	}

	/* Sections and modals sit behind the blocks placed inside them. */
	.block.container {
		z-index: 0;
	}

	.block.selected {
		outline: 2px solid var(--accent);
		z-index: 2;
	}

	.block:focus-visible {
		outline: 2px solid var(--accent);
	}

	.tag {
		position: absolute;
		top: -22px;
		left: -2px;
		padding: 1px 6px;
		border-radius: 4px 4px 0 0;
		background: var(--accent);
		color: var(--panel);
		font-size: 12px;
		display: none;
	}

	.selected .tag {
		display: block;
	}

	.resize {
		position: absolute;
		right: -7px;
		bottom: -7px;
		width: 14px;
		height: 14px;
		border: 2px solid var(--accent);
		border-radius: 3px;
		background: var(--panel);
		cursor: nwse-resize;
		touch-action: none;
		display: none;
	}

	.selected .resize {
		display: block;
	}
</style>
