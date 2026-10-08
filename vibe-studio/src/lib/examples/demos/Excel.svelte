<script lang="ts">
	import { EXCEL_SUGGESTIONS, MATERIAL_ROWS, queryMaterials } from '../excel.ts';

	let question = $state(EXCEL_SUGGESTIONS[0]);
	let draft = $state('');

	const result = $derived(queryMaterials(question));

	function ask(text: string) {
		const q = text.trim();
		if (!q) return;
		question = q;
		draft = '';
	}
</script>

<div class="excel">
	<section class="panel sheet" aria-labelledby="xl-file">
		<div class="file">
			<span class="xl" aria-hidden="true">X</span>
			<h2 id="xl-file">자재_입출고_2026.xlsx</h2>
			<span class="count">{MATERIAL_ROWS.length}행</span>
		</div>
		<div class="table-wrap">
			<table>
				<thead>
					<tr>
						<th scope="col">일자</th>
						<th scope="col">현장</th>
						<th scope="col">자재</th>
						<th scope="col" class="num">수량</th>
						<th scope="col">단위</th>
					</tr>
				</thead>
				<tbody>
					{#each MATERIAL_ROWS as row, i (i)}
						<tr class:used={result.rows.includes(row)}>
							<td class="muted">{row.date}</td>
							<td>{row.site}</td>
							<td>{row.material}</td>
							<td class="num">{row.qty}</td>
							<td class="muted">{row.unit}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="hint">질문에 쓰인 행은 강조되어 표시돼요.</p>
	</section>

	<div class="side">
		<section class="panel ask" aria-labelledby="xl-ask">
			<h2 id="xl-ask">엑셀에게 물어보기</h2>
			<form
				onsubmit={(e) => {
					e.preventDefault();
					ask(draft);
				}}
			>
				<input aria-label="질문 입력" placeholder="예: 현장별 철근 사용량 합계는?" bind:value={draft} />
				<button type="submit">질문하기</button>
			</form>
			<div class="chips">
				{#each EXCEL_SUGGESTIONS as suggestion (suggestion)}
					<button type="button" aria-pressed={question === suggestion} onclick={() => ask(suggestion)}>{suggestion}</button>
				{/each}
			</div>
		</section>

		<section class="panel result" aria-live="polite" aria-label="답변">
			<span class="question">질문 · {result.question}</span>
			<strong class="summary">{result.summary}</strong>
			<div class="bars">
				{#each result.bars as bar (bar.label)}
					<div class="bar">
						<span class="label">{bar.label}</span>
						<span class="meter"><span style:width="{bar.percent}%"></span></span>
						<span class="value">{bar.value} {bar.unit}</span>
					</div>
				{/each}
			</div>
			<details>
				<summary>AI가 엑셀을 이렇게 찾았어요 (SQL)</summary>
				<pre>{result.sql}</pre>
			</details>
		</section>
	</div>
</div>

<style>
	.excel {
		flex: 1;
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
		gap: 1.5rem;
		align-items: start;
	}

	.panel {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1.25rem;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--panel);
		min-width: 0;
	}

	h2 {
		margin: 0;
		font-size: 1.05rem;
	}

	.file {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.xl {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 6px;
		background: var(--success);
		color: var(--panel);
		font-size: 0.8rem;
		font-weight: 700;
	}

	.count {
		margin-left: auto;
		font-size: 0.82rem;
		color: var(--muted);
	}

	.table-wrap {
		overflow: auto;
		border: 1px solid var(--border);
		border-radius: 6px;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.88rem;
	}

	th,
	td {
		padding: 0.55rem 0.75rem;
		text-align: left;
	}

	th {
		background: var(--bg);
	}

	td {
		border-top: 1px solid var(--border);
		transition: background 0.2s ease;
	}

	tr.used td {
		background: var(--accent-soft);
	}

	.num {
		text-align: right;
		font-weight: 700;
	}

	th.num {
		font-weight: 700;
	}

	.muted {
		color: var(--muted);
	}

	.hint {
		margin: 0;
		font-size: 0.75rem;
		color: var(--muted);
	}

	.side {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 0;
	}

	.ask h2 {
		font-size: 1.2rem;
	}

	form {
		display: flex;
		gap: 0.5rem;
	}

	input {
		flex: 1;
		min-width: 0;
		min-height: 52px;
		padding: 0 0.9rem;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--panel);
		color: var(--text);
		font: inherit;
	}

	input:focus {
		outline: 2px solid var(--accent-soft);
		border-color: var(--accent);
	}

	form button {
		min-width: 96px;
		min-height: 52px;
		border: none;
		border-radius: 8px;
		background: var(--accent);
		color: var(--panel);
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.chips button {
		min-height: 36px;
		padding: 0 0.9rem;
		border: 1px solid var(--accent);
		border-radius: 18px;
		background: var(--panel);
		color: var(--accent);
		font: inherit;
		font-size: 0.88rem;
		cursor: pointer;
	}

	.chips button[aria-pressed='true'] {
		background: var(--accent-soft);
		font-weight: 700;
	}

	.result {
		gap: 1rem;
	}

	.question {
		font-size: 0.82rem;
		color: var(--muted);
	}

	.summary {
		font-size: 1.1rem;
		line-height: 1.6;
	}

	.bars {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.bar {
		display: grid;
		grid-template-columns: 72px minmax(0, 1fr) 80px;
		gap: 0.75rem;
		align-items: center;
		font-size: 0.88rem;
	}

	.label {
		font-weight: 700;
	}

	.meter {
		height: 22px;
		border-radius: 3px;
		background: var(--accent-soft);
	}

	.meter span {
		display: block;
		height: 100%;
		border-radius: 3px;
		background: var(--accent);
		transition: width 0.3s ease;
	}

	.value {
		text-align: right;
	}

	details {
		font-size: 0.82rem;
		color: var(--muted);
	}

	summary {
		min-height: 32px;
		cursor: pointer;
	}

	/* Code block keeps a fixed dark look in both themes, like an editor. */
	pre {
		margin: 0.5rem 0 0;
		padding: 0.75rem 0.9rem;
		border-radius: 6px;
		background: #1e2124;
		color: #d7dae0;
		font-family: ui-monospace, 'Cascadia Code', monospace;
		font-size: 0.75rem;
		line-height: 1.7;
		white-space: pre-wrap;
	}

	@media (max-width: 900px) {
		.excel {
			grid-template-columns: 1fr;
		}
	}
</style>
