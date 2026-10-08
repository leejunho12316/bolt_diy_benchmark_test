<script lang="ts">
	import { blockDef, type Block, type Layout } from '../types.ts';

	interface Props {
		block: Block;
		layout: Layout;
	}

	let { block, layout }: Props = $props();

	const def = $derived(blockDef(block.type));
	const p = $derived(block.props);

	const s = (key: string) => String(p[key] ?? '');
	const n = (key: string, fallback: number) => (typeof p[key] === 'number' ? (p[key] as number) : fallback);
	const items = (key: string) => (Array.isArray(p[key]) ? (p[key] as string[]) : []);
	const pathOf = (id: unknown) => layout.pages.find((page) => page.id === id)?.path;

	// Header menu: every page when autoNav is on, otherwise the chosen ones.
	const navPaths = $derived(
		block.type === 'header'
			? (p.autoNav ? layout.pages.map((page) => page.path) : items('links').map(pathOf).filter(Boolean))
			: []
	);
	const primary = $derived(def.primary ? s(def.primary) : def.label);
</script>

<!-- Wireframe rendering only: the real look is up to the agent. -->
<div class="view look-{def.look}">
	{#if def.look === 'header'}
		<strong class="clip">◆ {s('brand')}</strong>
		<nav>
			{#each navPaths as path (path)}<span>{path}</span>{/each}
		</nav>
		{#if s('cta')}<span class="pill">{s('cta')}</span>{/if}
	{:else if def.look === 'footer'}
		<span class="clip">{s('text')}</span>
		<span class="muted clip">{s('contact')}</span>
	{:else if def.look === 'logo'}
		<span class="mark">◆</span><strong class="clip">{s('text')}</strong>
	{:else if def.look === 'link'}
		<span class="clip">{s('label')}</span>
		<small>{pathOf(p.targetPageId) ?? '연결 없음'}</small>
	{:else if def.look === 'sidebar'}
		{#each items('items') as item, i (i)}<span class="side-item" class:first={i === 0}>{item}</span>{/each}
	{:else if def.look === 'tabs'}
		{#each items('items') as item, i (i)}<span class="tab" class:first={i === 0}>{item}</span>{/each}
	{:else if def.look === 'breadcrumb'}
		<span class="clip">{items('items').join('  ›  ')}</span>
	{:else if def.look === 'section'}
		<span class="section-title">{s('title')}</span>
	{:else if def.look === 'divider'}
		{#if p.style === 'line'}<hr />{:else}<span class="muted">여백</span>{/if}
	{:else if def.look === 'text'}
		<span class="text" class:heading={p.variant === 'heading'}>{s('content')}</span>
	{:else if def.look === 'image' || def.look === 'media'}
		<span class="media-icon">{def.icon}</span>
		<span class="muted clip">{primary}</span>
	{:else if def.look === 'hero'}
		<strong class="hero-title">{s('title')}</strong>
		{#if s('subtitle')}<span class="muted">{s('subtitle')}</span>{/if}
		<span class="pill">{s('cta')}</span>
	{:else if def.look === 'grid'}
		{@const cells = block.type === 'pricing' ? items('plans') : Array.from({ length: n('count', 6) }, () => '')}
		{@const columns = block.type === 'pricing' ? Math.max(cells.length, 1) : n('columns', 3)}
		<div class="grid" style:grid-template-columns="repeat({columns}, 1fr)">
			{#each cells as cell, i (i)}<span class="cell">{cell}</span>{/each}
		</div>
	{:else if def.look === 'features' || def.look === 'stats'}
		{#each items('items') as item, i (i)}
			<span class="feature">
				<b>{def.look === 'stats' ? '123' : '✦'}</b>
				<span class="clip">{item}</span>
			</span>
		{/each}
	{:else if def.look === 'list'}
		{#each items('items') as item, i (i)}
			<span class="clip">{p.ordered ? `${i + 1}.` : '•'} {item}</span>
		{/each}
	{:else if def.look === 'table'}
		<div class="table" style:grid-template-columns="repeat({Math.max(items('columns').length, 1)}, 1fr)">
			{#each items('columns') as column, i (i)}<b class="clip">{column}</b>{/each}
			{#each Array.from({ length: items('columns').length * 3 }) as _, i (i)}<span></span>{/each}
		</div>
	{:else if def.look === 'chart'}
		<div class="bars">
			{#each [40, 70, 55, 90, 65] as height, i (i)}<span style:height="{height}%"></span>{/each}
		</div>
	{:else if def.look === 'quote'}
		<span class="mark">❝</span><span class="muted clip">{primary}</span>
	{:else if def.look === 'faq'}
		{#each items('items') as item, i (i)}<span class="faq-row clip">{item} <i>▾</i></span>{/each}
	{:else if def.look === 'button'}
		<span class="clip">{s('label')}</span>
	{:else if def.look === 'form'}
		<b class="clip">{s('purpose')}</b>
		{#each items('fields') as field, i (i)}<span class="field clip">{field}</span>{/each}
		<span class="pill">{s('submit')}</span>
	{:else if def.look === 'input'}
		<small class="clip">{s('label')}</small>
		<span class="field"></span>
	{:else if def.look === 'search'}
		<span class="field search-field clip">⌕ {primary} 검색</span>
	{:else if def.look === 'chips'}
		{#each items('items') as item, i (i)}<span class="chip">{item}</span>{/each}
	{:else if def.look === 'pagination'}
		{#each ['‹', '1', '2', '3', '›'] as label (label)}<span class="chip">{label}</span>{/each}
	{:else if def.look === 'modal'}
		<b class="clip">{s('title')}</b><span class="close">✕</span>
	{:else if def.look === 'toggle'}
		<span class="switch"></span><span class="clip">{s('label')}</span>
	{:else if def.look === 'alert'}
		<span>!</span><span class="clip">{s('message')}</span>
	{:else if def.look === 'badge'}
		<span class="clip">{s('label')}</span>
	{:else}
		<span class="media-icon">{def.icon}</span>
		<span class="clip">{def.primary ? primary : def.label}</span>
	{/if}
</div>

<style>
	.view {
		width: 100%;
		height: 100%;
		overflow: hidden;
		font-size: 14px;
		color: var(--text);
	}

	.clip {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.muted {
		color: var(--muted);
	}

	/* Short labels in rows must not wrap letter by letter when a block is squeezed. */
	.tab,
	.chip,
	.side-item,
	.pill,
	.look-header nav span {
		flex: none;
		white-space: nowrap;
	}

	.pill {
		flex: none;
		padding: 6px 14px;
		border-radius: 999px;
		background: var(--accent);
		color: var(--panel);
		font-size: 13px;
		font-weight: 600;
	}

	.mark {
		color: var(--accent);
	}

	/* Row-shaped blocks */
	.look-header,
	.look-footer,
	.look-logo,
	.look-tabs,
	.look-chips,
	.look-pagination,
	.look-toggle,
	.look-alert,
	.look-modal {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 0 16px;
	}

	.look-header {
		justify-content: space-between;
		border-bottom: 1px solid var(--border);
		background: var(--bg);
	}

	.look-header nav {
		display: flex;
		gap: 16px;
		color: var(--muted);
		overflow: hidden;
	}

	.look-footer {
		justify-content: space-between;
		border-top: 1px solid var(--border);
		background: var(--bg);
		color: var(--muted);
	}

	.look-logo {
		gap: 10px;
		font-size: 22px;
	}

	.look-link {
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 0 10px;
		color: var(--accent);
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 4px;
	}

	.look-link small {
		font-size: 11px;
		font-weight: 400;
		color: var(--muted);
		text-decoration: none;
	}

	.look-sidebar {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 12px;
		background: var(--bg);
		border-right: 1px solid var(--border);
	}

	.side-item {
		padding: 8px 10px;
		border-radius: 6px;
		color: var(--muted);
	}

	.side-item.first {
		background: var(--accent-soft);
		color: var(--accent);
	}

	.look-tabs {
		gap: 4px;
		padding: 0;
		border-bottom: 1px solid var(--border);
	}

	.tab {
		padding: 10px 14px;
		color: var(--muted);
	}

	.tab.first {
		color: var(--accent);
		border-bottom: 2px solid var(--accent);
	}

	.look-breadcrumb {
		display: flex;
		align-items: center;
		padding: 0 8px;
		color: var(--muted);
		font-size: 13px;
	}

	.look-section {
		padding: 12px 16px;
		border: 1.5px dashed var(--border);
		border-radius: 10px;
	}

	.section-title {
		font-weight: 700;
		color: var(--muted);
	}

	.look-divider {
		display: grid;
		place-items: center;
	}

	.look-divider hr {
		width: 100%;
		border: none;
		border-top: 1px solid var(--muted);
	}

	.look-text .text {
		display: block;
		padding: 6px 8px;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		word-break: keep-all;
		line-height: 1.5;
		font-size: 16px;
		color: var(--muted);
	}

	.look-text .text.heading {
		font-size: 32px;
		font-weight: 800;
		line-height: 1.25;
		color: var(--text);
	}

	/* Placeholder boxes */
	.look-image,
	.look-media,
	.look-box,
	.look-quote {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 8px;
		border-radius: 8px;
		background: repeating-linear-gradient(45deg, var(--bg), var(--bg) 10px, transparent 10px, transparent 20px);
		border: 1px solid var(--border);
		text-align: center;
	}

	.media-icon {
		font-size: 28px;
		color: var(--muted);
	}

	.look-hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		padding: 24px;
		border-radius: 12px;
		background: linear-gradient(135deg, var(--accent-soft), var(--bg));
		text-align: center;
	}

	.hero-title {
		font-size: 34px;
	}

	.grid,
	.table {
		display: grid;
		gap: 10px;
		width: 100%;
		height: 100%;
		padding: 4px;
	}

	.cell {
		display: grid;
		place-items: center;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg);
		font-weight: 600;
		min-height: 0;
	}

	.look-features,
	.look-stats {
		display: flex;
		align-items: stretch;
		gap: 12px;
	}

	.feature {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6px;
		border: 1px solid var(--border);
		border-radius: 8px;
	}

	.feature b {
		font-size: 22px;
		color: var(--accent);
	}

	.look-list,
	.look-faq,
	.look-form,
	.look-input {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 8px;
	}

	.table {
		gap: 0;
		border: 1px solid var(--border);
		border-radius: 8px;
		grid-auto-rows: 1fr;
	}

	.table > * {
		padding: 6px 8px;
		border-bottom: 1px solid var(--border);
	}

	.bars {
		display: flex;
		align-items: flex-end;
		gap: 10%;
		width: 100%;
		height: 100%;
		padding: 12px 12px 0;
		border-bottom: 1px solid var(--muted);
	}

	.bars span {
		flex: 1;
		border-radius: 4px 4px 0 0;
		background: var(--accent-soft);
		border: 1px solid var(--accent);
	}

	.faq-row {
		display: flex;
		justify-content: space-between;
		padding: 8px 10px;
		border: 1px solid var(--border);
		border-radius: 6px;
	}

	.look-button {
		display: grid;
		place-items: center;
		padding: 0 12px;
		border-radius: 8px;
		background: var(--accent);
		color: var(--panel);
		font-size: 16px;
		font-weight: 600;
	}

	.look-form {
		border: 1px solid var(--border);
		border-radius: 10px;
	}

	.look-form .pill {
		align-self: flex-start;
	}

	.field {
		min-height: 32px;
		padding: 6px 10px;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--bg);
		color: var(--muted);
	}

	.look-input .field {
		flex: 1;
	}

	.look-search {
		display: flex;
	}

	.search-field {
		flex: 1;
		max-height: 48px;
		border-radius: 24px;
	}

	.chip {
		padding: 5px 12px;
		border: 1px solid var(--border);
		border-radius: 999px;
		color: var(--muted);
		font-size: 13px;
	}

	.look-pagination {
		justify-content: center;
		gap: 6px;
	}

	.look-modal {
		align-items: flex-start;
		justify-content: space-between;
		padding: 14px 16px;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--panel);
		box-shadow: 0 10px 30px rgb(0 0 0 / 0.15);
	}

	.close {
		color: var(--muted);
	}

	.switch {
		flex: none;
		width: 38px;
		height: 22px;
		border-radius: 999px;
		background: var(--accent);
		position: relative;
	}

	.switch::after {
		content: '';
		position: absolute;
		right: 3px;
		top: 3px;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: white;
	}

	.look-alert {
		border-radius: 8px;
		background: var(--accent-soft);
		color: var(--accent);
		font-weight: 600;
	}

	.look-badge {
		display: grid;
		place-items: center;
		padding: 0 8px;
		border-radius: 999px;
		background: var(--accent);
		color: var(--panel);
		font-size: 12px;
		font-weight: 700;
	}
</style>
