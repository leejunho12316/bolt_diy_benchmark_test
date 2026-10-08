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
	<header class="intro">
		<span class="meta">FILE · 자재_입출고_2026.xlsx · {MATERIAL_ROWS.length} ROWS</span>
		<h2>엑셀에게 물어보기</h2>
	</header>

	<div class="grid">
		<section class="sheet" aria-labelledby="xl-file">
			<h3 id="xl-file" class="label">데이터</h3>
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
							<td class="mono">{row.date}</td>
							<td>{row.site}</td>
							<td>{row.material}</td>
							<td class="num">{row.qty}</td>
							<td class="muted">{row.unit}</td>
						</tr>
					{/each}
				</tbody>
			</table>
			<p class="caption">질문에 쓰인 행은 굵게 표시돼요.</p>
		</section>

		<div class="side">
			<section aria-labelledby="xl-ask">
				<h3 id="xl-ask" class="label">질문</h3>
				<form
					onsubmit={(e) => {
						e.preventDefault();
						ask(draft);
					}}
				>
					<input aria-label="질문 입력" placeholder="예: 현장별 철근 사용량 합계는?" bind:value={draft} />
					<button type="submit">질문하기</button>
				</form>
				<ol class="chips">
					{#each EXCEL_SUGGESTIONS as suggestion, i (suggestion)}
						<li>
							<button type="button" aria-pressed={question === suggestion} onclick={() => ask(suggestion)}>
								<span class="mono">{String(i + 1).padStart(2, '0')}</span>
								<span class="text">{suggestion}</span>
								<span class="arrow" aria-hidden="true">→</span>
							</button>
						</li>
					{/each}
				</ol>
			</section>

			<section class="result" aria-live="polite" aria-label="답변">
				<h3 class="label">답변 · {result.question}</h3>
				<p class="summary">{result.summary}</p>
				<div class="bars">
					{#each result.bars as bar (bar.label)}
						<div class="bar">
							<span class="bar-label">{bar.label}</span>
							<span class="meter"><span style:width="{bar.percent}%"></span></span>
							<span class="num">{bar.value} {bar.unit}</span>
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
</div>

<style>
	/* Design skill: minimal-mono (tokens from .theme-minimal-mono) */
	.excel {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 40px;
		padding: 24px 16px;
	}

	.meta,
	.mono,
	.label {
		font-family: var(--font-mono);
		letter-spacing: 0.04em;
	}

	.meta {
		font-size: 13px;
		font-weight: 500;
		color: var(--ink-2);
	}

	.intro {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding-bottom: 24px;
		border-bottom: 1px solid var(--ink);
	}

	h2 {
		margin: 0;
		font-size: clamp(36px, 5vw, 56px);
		font-weight: 700;
		line-height: 1.1;
		letter-spacing: -0.03em;
	}

	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 64px;
		align-items: start;
	}

	.label {
		margin: 0 0 16px;
		font-size: 13px;
		font-weight: 500;
		color: var(--ink-2);
		text-transform: uppercase;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 15px;
	}

	th {
		padding: 10px 8px;
		border-bottom: 1px solid var(--ink);
		font-family: var(--font-mono);
		font-size: 13px;
		font-weight: 500;
		color: var(--ink-2);
		text-align: left;
	}

	td {
		padding: 10px 8px;
		border-bottom: 1px solid var(--line);
		color: var(--ink-3);
		transition:
			color var(--dur),
			background var(--dur);
	}

	tr.used td {
		background: var(--paper-2);
		color: var(--ink);
		font-weight: 700;
	}

	.num {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.mono {
		font-size: 13px;
	}

	.caption {
		margin: 12px 0 0;
		font-size: 14px;
		color: var(--ink-2);
	}

	.side {
		display: flex;
		flex-direction: column;
		gap: 56px;
		min-width: 0;
	}

	form {
		display: flex;
		align-items: flex-end;
		gap: 16px;
	}

	input {
		flex: 1;
		min-width: 0;
		height: 52px;
		padding: 0;
		border: none;
		border-bottom: 1px solid var(--ink);
		border-radius: 0;
		background: transparent;
		color: var(--ink);
		font: inherit;
		font-size: 17px;
	}

	input:focus {
		outline: none;
		border-bottom-width: 2px;
	}

	form button {
		height: 52px;
		padding: 0 28px;
		border: none;
		border-radius: 0;
		background: var(--ink);
		color: var(--paper);
		font: inherit;
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
	}

	.chips {
		list-style: none;
		margin: 24px 0 0;
		padding: 0;
		border-top: 1px solid var(--line);
	}

	.chips button {
		width: 100%;
		display: grid;
		grid-template-columns: 48px 1fr 24px;
		align-items: center;
		min-height: 52px;
		padding: 0 8px;
		border: none;
		border-bottom: 1px solid var(--line);
		background: transparent;
		color: var(--ink);
		font: inherit;
		font-size: 15px;
		text-align: left;
		cursor: pointer;
		transition: background var(--dur);
	}

	.chips button:hover,
	.chips button[aria-pressed='true'] {
		background: var(--paper-2);
	}

	.chips button[aria-pressed='true'] .text {
		font-weight: 700;
		text-decoration: underline;
		text-underline-offset: 6px;
	}

	.chips .mono {
		color: var(--ink-3);
	}

	.arrow {
		transition: transform var(--dur);
	}

	.chips button:hover .arrow {
		transform: translateX(4px);
	}

	.summary {
		margin: 0 0 24px;
		font-size: 24px;
		font-weight: 600;
		line-height: 1.4;
		letter-spacing: -0.02em;
	}

	.bars {
		display: flex;
		flex-direction: column;
		border-top: 1px solid var(--line);
	}

	.bar {
		display: grid;
		grid-template-columns: 80px minmax(0, 1fr) 80px;
		gap: 16px;
		align-items: center;
		min-height: 48px;
		border-bottom: 1px solid var(--line);
		font-size: 15px;
	}

	.bar-label {
		font-weight: 600;
	}

	.meter {
		height: 8px;
		background: var(--paper-2);
	}

	.meter span {
		display: block;
		height: 100%;
		background: var(--ink);
		transition: width var(--dur);
	}

	details {
		margin-top: 24px;
		font-size: 14px;
		color: var(--ink-2);
	}

	summary {
		min-height: 32px;
		text-decoration: underline;
		text-underline-offset: 4px;
		cursor: pointer;
	}

	pre {
		margin: 12px 0 0;
		padding: 16px;
		border-left: 1px solid var(--ink);
		background: var(--paper-2);
		color: var(--ink);
		font-family: var(--font-mono);
		font-size: 13px;
		line-height: 1.7;
		white-space: pre-wrap;
	}

	button:focus-visible,
	summary:focus-visible {
		outline: 2px solid var(--focus);
		outline-offset: 3px;
	}

	@media (max-width: 960px) {
		.grid {
			grid-template-columns: 1fr;
			gap: 48px;
		}

		.excel {
			padding: 16px 0;
		}
	}
</style>
