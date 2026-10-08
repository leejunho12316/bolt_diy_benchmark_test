<script lang="ts">
	import { DASHBOARD_SITES, INITIAL_CLIENTS, LATE_DAYS, contactLabel, summarize, type SiteFilter } from '../dashboard.ts';

	const FILTERS: { value: SiteFilter; label: string }[] = [
		{ value: 'all', label: '전체' },
		...DASHBOARD_SITES.map((s) => ({ value: s, label: s }))
	];

	const MENU = ['대시보드', '현장', '거래처', '계약', '설정'];

	let filter = $state<SiteFilter>('all');
	let clients = $state(INITIAL_CLIENTS.map((c) => ({ ...c })));

	const summary = $derived(summarize(filter));
	const visibleClients = $derived(clients.filter((c) => filter === 'all' || c.site === filter));
	const lateCount = $derived(visibleClients.filter((c) => c.days > LATE_DAYS).length);

	const kpis = $derived([
		{
			label: '이번 달 기성',
			value: `${summary.thisMonth.toFixed(1)}억`,
			badge: `▲ ${summary.monthDelta.toFixed(1)}억`,
			tone: 'up',
			note: '지난달 대비'
		},
		{ label: '평균 공정률', value: `${summary.progress}%`, badge: '', tone: '', note: `${summary.siteCount}개 현장 기준` },
		{
			label: '미결 계약',
			value: String(summary.openContracts),
			badge: summary.openContracts > 3 ? '검토 필요' : '',
			tone: 'down',
			note: '서명 대기'
		},
		{ label: '협력업체', value: String(summary.partners), badge: '', tone: '', note: '등록된 업체 수' }
	]);
</script>

<div class="dashboard">
	<nav class="sidebar" aria-label="대시보드 메뉴">
		<span class="brand"><span class="logo" aria-hidden="true">◆</span> 현장 통합관리</span>
		<span class="section">메뉴</span>
		{#each MENU as item, i (item)}
			<span class="menu" class:active={i === 0} aria-current={i === 0 ? 'page' : undefined}>{item}</span>
		{/each}
	</nav>

	<div class="content">
		<div class="topbar">
			<h2>현장 · 거래처 통합 현황</h2>
			<div class="segment" role="group" aria-label="현장 선택">
				{#each FILTERS as option (option.value)}
					<button type="button" aria-pressed={filter === option.value} onclick={() => (filter = option.value)}>{option.label}</button>
				{/each}
			</div>
		</div>

		<section class="kpis" aria-label="주요 숫자">
			{#each kpis as kpi (kpi.label)}
				<div class="card kpi">
					<span class="card-title">{kpi.label}</span>
					<strong>{kpi.value}</strong>
					<span class="foot">
						{#if kpi.badge}<span class="badge {kpi.tone}">{kpi.badge}</span>{/if}
						<span class="caption">{kpi.note}</span>
					</span>
				</div>
			{/each}
		</section>

		<div class="row">
			<section class="card" aria-labelledby="ds-chart">
				<div class="card-head">
					<h3 id="ds-chart" class="card-title">월별 기성 금액 (억 원)</h3>
					<span class="legend"><span class="dot c1"></span>이번 달 <span class="dot c2"></span>이전</span>
				</div>
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
				<div class="card-head">
					<h3 id="ds-crm" class="card-title">거래처 최근 연락</h3>
					{#if lateCount > 0}<span class="badge down late-count">연락 필요 {lateCount}곳</span>{/if}
				</div>
				<table>
					<thead>
						<tr><th scope="col">거래처</th><th scope="col">최근 연락</th><th scope="col">상태</th></tr>
					</thead>
					<tbody>
						{#each visibleClients as client (client.id)}
							{@const late = client.days > LATE_DAYS}
							<tr class:late>
								<td><strong>{client.name}</strong><small>{client.site} · {client.kind}</small></td>
								<td class="num">{contactLabel(client.days)}</td>
								<td>
									{#if late}
										<button type="button" onclick={() => (client.days = 0)}>연락 완료</button>
									{:else}
										<span class="status"><span class="dot ok"></span>정상</span>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</section>
		</div>
	</div>
</div>

<style>
	/* Design skill: dark-dashboard (tokens from .theme-dark-dashboard) */
	.dashboard {
		flex: 1;
		display: grid;
		grid-template-columns: 220px minmax(0, 1fr);
		border: 1px solid var(--line);
		border-radius: var(--radius);
		overflow: hidden;
		font-size: 14px;
		line-height: 1.55;
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 20px 12px;
		background: var(--surface);
		border-right: 1px solid var(--line);
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 0 8px 16px;
		font-size: 15px;
		font-weight: 700;
	}

	.logo {
		color: var(--accent);
	}

	.section {
		padding: 8px 8px 4px;
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.06em;
		color: var(--ink-3);
	}

	.menu {
		display: flex;
		align-items: center;
		height: 40px;
		padding: 0 12px;
		border-radius: var(--radius-sm);
		font-weight: 500;
		color: var(--ink-2);
	}

	.menu.active {
		background: var(--surface-2);
		color: var(--ink);
		box-shadow: inset 3px 0 0 var(--accent);
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 0 24px 24px;
		min-width: 0;
	}

	.topbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
		min-height: 64px;
		border-bottom: 1px solid var(--line);
	}

	h2 {
		flex: 1;
		margin: 0;
		font-size: 22px;
		font-weight: 700;
	}

	.segment {
		display: flex;
		padding: 3px;
		border: 1px solid var(--line);
		border-radius: var(--radius-sm);
		background: var(--surface);
	}

	.segment button {
		height: 36px;
		padding: 0 14px;
		border: none;
		border-radius: 4px;
		background: transparent;
		color: var(--ink-2);
		font: inherit;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: background var(--dur);
	}

	.segment button[aria-pressed='true'] {
		background: var(--accent);
		color: var(--accent-ink);
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 18px;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--surface);
		min-width: 0;
	}

	.card-title {
		margin: 0;
		font-size: 14px;
		font-weight: 600;
		color: var(--ink-2);
	}

	.kpis {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 16px;
	}

	.kpi {
		gap: 6px;
	}

	.kpi strong {
		font-size: 30px;
		line-height: 1.1;
		font-variant-numeric: tabular-nums;
	}

	.foot {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.badge {
		padding: 2px 8px;
		border-radius: 4px;
		font-size: 12px;
		font-weight: 600;
	}

	.badge.up {
		background: rgb(52 211 153 / 0.12);
		color: var(--up);
	}

	.badge.down {
		background: rgb(248 113 113 / 0.12);
		color: var(--down);
	}

	.caption {
		font-size: 12px;
		font-weight: 500;
		color: var(--ink-3);
	}

	.row {
		display: grid;
		grid-template-columns: minmax(0, 8fr) minmax(0, 5fr);
		gap: 16px;
	}

	.card-head {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.legend {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		color: var(--ink-3);
	}

	.dot {
		display: inline-block;
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	.dot.c1 {
		background: var(--chart-1);
	}

	.dot.c2 {
		margin-left: 8px;
		background: var(--chart-2);
	}

	.dot.ok {
		background: var(--up);
	}

	.chart,
	.axis {
		display: grid;
		grid-template-columns: repeat(6, minmax(0, 1fr));
		gap: 16px;
	}

	.chart {
		height: 240px;
		align-items: end;
		background: repeating-linear-gradient(to top, var(--line) 0 1px, transparent 1px 60px);
	}

	.col {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		align-items: center;
		gap: 6px;
	}

	.value {
		font-size: 12px;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		color: var(--ink-2);
	}

	.bar {
		width: 70%;
		border-radius: 4px 4px 0 0;
		background: var(--chart-2);
		transition: height var(--dur);
	}

	.bar.last {
		background: var(--chart-1);
	}

	.axis {
		font-size: 12px;
		color: var(--ink-3);
		text-align: center;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 13px;
	}

	th {
		padding: 8px;
		border-bottom: 1px solid var(--line);
		font-size: 12px;
		font-weight: 600;
		color: var(--ink-3);
		text-align: left;
	}

	td {
		height: 44px;
		padding: 6px 8px;
		border-bottom: 1px solid var(--line);
		transition: background var(--dur);
	}

	tr:hover td {
		background: var(--surface-2);
	}

	td strong {
		display: block;
	}

	td small {
		font-size: 12px;
		color: var(--ink-3);
	}

	.num {
		font-variant-numeric: tabular-nums;
		color: var(--ink-2);
	}

	tr.late .num {
		color: var(--down);
		font-weight: 600;
	}

	.status {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: var(--ink-2);
	}

	td button {
		height: 32px;
		padding: 0 10px;
		border: 1px solid var(--down);
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--down);
		font: inherit;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
	}

	td button:hover {
		background: rgb(248 113 113 / 0.12);
	}

	button:focus-visible {
		outline: 1px solid var(--accent);
		box-shadow: 0 0 0 3px rgb(34 211 238 / 0.25);
	}

	@media (max-width: 1100px) {
		.kpis {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.row {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 768px) {
		.dashboard {
			grid-template-columns: 1fr;
		}

		.sidebar {
			display: none;
		}

		.content {
			padding: 0 12px 12px;
		}

		.chart,
		.axis {
			gap: 6px;
		}
	}
</style>
