<script lang="ts">
	import type { Builder } from '../builder.svelte.ts';
	import { blockDef, pageFilePath, type Block, type FieldDef } from '../types.ts';

	interface Props {
		builder: Builder;
	}

	let { builder }: Props = $props();

	let pathDraft = $state('');
	let pathError = $state<string | null>(null);

	// Reset the path field whenever another page is shown.
	$effect(() => {
		pathDraft = builder.page.path;
		pathError = null;
	});

	function commitPath() {
		pathError = builder.renamePage(builder.page.id, pathDraft.trim());

		if (pathError) {
			pathDraft = builder.page.path;
		}
	}

	const visibleFields = (block: Block) =>
		blockDef(block.type).fields.filter((f) => !f.showIf || f.showIf(block.props));

	const str = (block: Block, field: FieldDef) => String(block.props[field.key] ?? '');
	const items = (block: Block, field: FieldDef) => {
		const value = block.props[field.key];
		return Array.isArray(value) ? value : [];
	};

	function setList(block: Block, field: FieldDef, raw: string) {
		block.props[field.key] = raw.split('\n').map((line) => line.trim()).filter(Boolean);
	}

	function togglePage(block: Block, field: FieldDef, pageId: string, on: boolean) {
		const current = items(block, field).filter((id) => id !== pageId);
		block.props[field.key] = on ? [...current, pageId] : current;
	}

	function setNumber(block: Block, field: FieldDef, raw: string) {
		const value = Number(raw);

		if (Number.isFinite(value)) {
			block.props[field.key] = Math.min(Math.max(Math.round(value), field.min ?? -Infinity), field.max ?? Infinity);
		}
	}
</script>

<aside class="inspector">
	{#if builder.selected}
		{@const block = builder.selected}
		<h2><span class="icon">{blockDef(block.type).icon}</span> {blockDef(block.type).label}</h2>

		{#each visibleFields(block) as field (field.key)}
			{#if field.kind === 'toggle'}
				<label class="check">
					<input
						type="checkbox"
						checked={Boolean(block.props[field.key])}
						onchange={(e) => (block.props[field.key] = e.currentTarget.checked)}
					/>
					{field.label}
				</label>
			{:else if field.kind === 'pages'}
				<fieldset>
					<legend>{field.label}</legend>
					{#each builder.layout.pages as page (page.id)}
						<label class="check">
							<input
								type="checkbox"
								checked={items(block, field).includes(page.id)}
								onchange={(e) => togglePage(block, field, page.id, e.currentTarget.checked)}
							/>
							{page.path}
						</label>
					{/each}
				</fieldset>
			{:else}
				<label>
					{field.label}
					{#if field.kind === 'text'}
						<input
							value={str(block, field)}
							placeholder={field.placeholder}
							maxlength="200"
							oninput={(e) => (block.props[field.key] = e.currentTarget.value)}
						/>
					{:else if field.kind === 'textarea'}
						<textarea
							rows="5"
							maxlength="500"
							value={str(block, field)}
							oninput={(e) => (block.props[field.key] = e.currentTarget.value)}
						></textarea>
					{:else if field.kind === 'number'}
						<input
							type="number"
							min={field.min}
							max={field.max}
							value={str(block, field)}
							onchange={(e) => setNumber(block, field, e.currentTarget.value)}
						/>
					{:else if field.kind === 'select'}
						<select value={str(block, field)} onchange={(e) => (block.props[field.key] = e.currentTarget.value)}>
							{#each field.options ?? [] as option (option.value)}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
					{:else if field.kind === 'page'}
						<select value={str(block, field)} onchange={(e) => (block.props[field.key] = e.currentTarget.value)}>
							<option value="">선택 안 함</option>
							{#each builder.layout.pages as page (page.id)}
								<option value={page.id}>{page.path}</option>
							{/each}
						</select>
					{:else if field.kind === 'list'}
						<textarea
							rows="4"
							value={items(block, field).join('\n')}
							onchange={(e) => setList(block, field, e.currentTarget.value)}
						></textarea>
						<small>한 줄에 하나씩 입력</small>
					{/if}
				</label>
			{/if}
		{/each}

		{#if visibleFields(block).some((f) => f.kind === 'page' || f.kind === 'pages')}
			<p class="hint">페이지는 상단 탭의 + 버튼으로 추가합니다.</p>
		{/if}

		<p class="meta">위치 {block.x}, {block.y} · 크기 {block.w}×{block.h}</p>
		<button type="button" class="danger" onclick={() => builder.removeBlock(block.id)}>블록 삭제</button>
	{:else}
		<h2>페이지 설정</h2>
		<label>
			경로
			<input
				bind:value={pathDraft}
				onblur={commitPath}
				onkeydown={(e) => e.key === 'Enter' && commitPath()}
				disabled={builder.page.path === '/'}
			/>
		</label>
		{#if pathError}
			<p class="error">{pathError}</p>
		{/if}
		<p class="hint">생성 파일: <code>{pageFilePath(builder.page.path)}</code></p>
		<p class="hint">블록 {builder.page.blocks.length}개 · 블록을 클릭하면 내용을 편집할 수 있습니다.</p>

		{#if builder.page.path !== '/'}
			<button type="button" class="danger" onclick={() => builder.removePage(builder.page.id)}>페이지 삭제</button>
		{/if}
	{/if}
</aside>

<style>
	.inspector {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
		padding: 1rem;
		border-left: 1px solid var(--border);
		background: var(--panel);
		min-height: 0;
		overflow-y: auto;
	}

	h2 {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		margin: 0;
		font-size: 0.95rem;
	}

	.icon {
		width: 1.4rem;
		height: 1.4rem;
		display: grid;
		place-items: center;
		border-radius: 6px;
		background: var(--accent-soft);
		color: var(--accent);
		font-size: 0.8rem;
	}

	label,
	fieldset {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-size: 0.8rem;
		color: var(--muted);
	}

	fieldset {
		margin: 0;
		padding: 0.5rem 0.7rem 0.6rem;
		border: 1px solid var(--border);
		border-radius: 6px;
	}

	legend {
		padding: 0 0.25rem;
	}

	label.check {
		flex-direction: row;
		align-items: center;
		gap: 0.45rem;
		color: var(--text);
		font-size: 0.85rem;
	}

	input:not([type='checkbox']),
	select,
	textarea {
		font: inherit;
		font-size: 0.9rem;
		padding: 0.5rem 0.6rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--bg);
		color: var(--text);
	}

	input[type='checkbox'] {
		accent-color: var(--accent);
	}

	textarea {
		resize: vertical;
	}

	input:focus,
	select:focus,
	textarea:focus {
		outline: 2px solid var(--accent-soft);
		border-color: var(--accent);
	}

	small,
	.hint,
	.meta {
		margin: 0;
		font-size: 0.75rem;
		color: var(--muted);
		word-break: keep-all;
		overflow-wrap: anywhere;
	}

	.error {
		margin: 0;
		font-size: 0.78rem;
		color: var(--danger);
	}

	.danger {
		align-self: flex-start;
		font: inherit;
		font-size: 0.82rem;
		padding: 0.45rem 0.8rem;
		border: 1px solid var(--danger);
		border-radius: 6px;
		background: transparent;
		color: var(--danger);
		cursor: pointer;
	}

	.danger:hover {
		background: var(--danger-soft);
	}

	@media (max-width: 800px) {
		.inspector {
			border-left: none;
			border-top: 1px solid var(--border);
		}
	}
</style>
