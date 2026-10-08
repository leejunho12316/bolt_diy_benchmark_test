<script lang="ts">
	import { DASHBOARD_SITES, INITIAL_CLIENTS, LATE_DAYS, contactLabel, summarize, type SiteFilter } from '../dashboard.ts';

	const FILTERS: { value: SiteFilter; label: string }[] = [
		{ value: 'all', label: '전체' },
		...DASHBOARD_SITES.map((s) => ({ value: s, label: s }))
	];

	let filter = $state<SiteFilter>('all');
	let clients = $state(INITIAL_CLIENTS.map((c) => ({ ...c })));

	const summary = $derived(summarize(filter));
	const visibleClients = $derived(clients.filter((c) => filter === 'all' || c.site === filter));
	const lateCount = $derived(visibleClients.filter((c) => c.days > LATE_DAYS).length);

	const kpis = $derived([
		{ label: '이번 달 기성', value: `${summary.thisMonth.toFixed(1)}억`, note: `지난달보다 ${summary.monthDelta.toFixed(1)}억 증가`, tone: '' },
		{ label: '평균 공정률', value: `${summary.progress}%`, note: `${summary.siteCount}개 현장 기준`, tone: '' },
		{ label: '미결 계약', value: String(summary.openContracts), note: '검토 필요', tone: summary.openContracts > 3 ? 'danger' : 'warning' },
		{ label: '협력업체', value: String(summary.partners), note: '등록된 업체 수', tone: '' }
	]);
</script>

<div class="dashboard">
	<div class="top">
		<h2>현장 · 거래처 통합 현황</h2>
		<div class="filters" role="group" aria-label="현장 선택">
			{#each FILTERS as option (option.value)}
				<button type="button" aria-pressed={filter === option.value} onclick={() => (filter = option.value)}>{option.label}</button>
			{/each}
		</div>
	</div>

	<section class="kpis" aria-label="주요 숫자">
		{#each kpis as kpi (kpi.label)}
			<div class="card">
				<span class="label">{kpi.label}</span>
				<strong class={kpi.tone}>{kpi.value}</strong>
				<span class="note">{kpi.note}</span>
			</div>
		{/each}
	</section>

	<div class="row">
		<section class="card" aria-labelledby="ds-chart">
			<h3 id="ds-chart">월별 기성 금액 <small>(억 원)</small></h3>
			<div class="chart">
				{#each summary.months as month, i (month.label)}
					<div class="col">
						<span class="value">{month.value.toFixed(1)}</span>
						<span class="bar" class:last={i === summary.months.length - 1} style:height="{month.percent}%"></span>
					</div>
				{/each}
			</div>
			<div class="axis">
				{#each summary.months as month (month.label)}<span>{month.label}</span>{/each}
			</div>
		</section>

		<section class="card" aria-labelledby="ds-crm">
			<div class="crm-head">
				<h3 id="ds-crm">거래처 최근 연락</h3>
				{#if lateCount > 0}<span class="late-count">연락 필요 {lateCount}곳</span>{/if}
			</div>
			<ul>
				{#each visibleClients as client (client.id)}
					{@const late = client.days > LATE_DAYS}
					<li class:late>
						<span class="who"><strong>{client.name}</strong><small>{client.site} · {client.kind}</small></span>
						<span class="ago">{contactLabel(client.days)}</span>
						{#if late}
							<button type="button" onclick={() => (client.days = 0)}>연락 완료</button>
						{:else}
							<span class="ok">정상</span>
						{/if}
					</li>
				{/each}
			</ul>
		</section>
	</div>
</div>

<style>
	.dashboard {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.top {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1rem;
	}

	h2 {
		flex: 1;
		margin: 0;
		font-size: 1.5rem;
	}

	.filters {
		display: flex;
	}

	.filters button {
		min-height: 44px;
		padding: 0 1.1rem;
		margin-left: -1px;
		border: 1px solid var(--border);
		background: var(--panel);
		color: var(--muted);
		font: inherit;
		font-size: 0.88rem;
		font-weight: 700;
		cursor: pointer;
	}

	.filters button:first-child {
		border-radius: 8px 0 0 8px;
	}

	.filters button:last-child {
		border-radius: 0 8px 8px 0;
	}

	.filters button[aria-pressed='true'] {
		position: relative;
		border-color: var(--accent);
		background: var(--accent);
		color: var(--panel);
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		padding: 1.25rem;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--panel);
		min-width: 0;
	}

	.kpis {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 1rem;
	}

	.label {
		font-size: 0.88rem;
		color: var(--muted);
	}

	.kpis strong {
		font-size: 1.9rem;
	}

	.kpis strong.warning {
		color: var(--warning);
	}

	.kpis strong.danger {
		color: var(--danger);
	}

	.note {
		font-size: 0.8rem;
		color: var(--muted);
	}

	.row {
		display: grid;
		grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
		gap: 1rem;
	}

	.row .card {
		gap: 0.9rem;
	}

	h3 {
		margin: 0;
		font-size: 1.05rem;
	}

	h3 small {
		font-size: 0.8rem;
		font-weight: 400;
		color: var(--muted);
	}

	.chart,
	.axis {
		display: grid;
		grid-template-columns: repeat(6, minmax(0, 1fr));
		gap: 1rem;
	}

	.chart {
		height: 260px;
		align-items: end;
		padding-bottom: 4px;
		border-bottom: 1px solid var(--border);
	}

	.col {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		align-items: center;
		gap: 0.4rem;
	}

	.value {
		font-size: 0.75rem;
		font-weight: 700;
	}

	.bar {
		width: 100%;
		border-radius: 3px 3px 0 0;
		background: var(--accent-soft);
		transition: height 0.3s ease;
	}

	.bar.last {
		background: var(--accent);
	}

	.axis {
		font-size: 0.8rem;
		color: var(--muted);
		text-align: center;
	}

	.crm-head {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
	}

	.late-count {
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--danger);
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		border-top: 2px solid var(--text);
	}

	li {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 90px 100px;
		gap: 0.6rem;
		align-items: center;
		padding: 0.6rem 0.25rem;
		border-bottom: 1px solid var(--border);
		font-size: 0.88rem;
	}

	li.late {
		background: var(--danger-soft);
	}

	.who {
		display: flex;
		flex-direction: column;
	}

	.who small {
		font-size: 0.75rem;
		color: var(--muted);
	}

	.ago {
		color: var(--muted);
	}

	li.late .ago {
		color: var(--danger);
		font-weight: 700;
	}

	li button {
		min-height: 36px;
		border: 1px solid var(--danger);
		border-radius: 6px;
		background: var(--panel);
		color: var(--danger);
		font: inherit;
		font-size: 0.8rem;
		font-weight: 700;
		cursor: pointer;
	}

	.ok {
		font-size: 0.8rem;
		color: var(--success);
	}

	@media (max-width: 900px) {
		.kpis {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.row {
			grid-template-columns: 1fr;
		}

		.chart,
		.axis {
			gap: 0.5rem;
		}
	}
</style>
