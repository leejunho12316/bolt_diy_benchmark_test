<script lang="ts">
	import ExampleShell from '#lib/examples/ExampleShell.svelte';
	import Build from '#lib/examples/demos/Build.svelte';
	import Chatbot from '#lib/examples/demos/Chatbot.svelte';
	import Compare from '#lib/examples/demos/Compare.svelte';
	import Dashboard from '#lib/examples/demos/Dashboard.svelte';
	import Excel from '#lib/examples/demos/Excel.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const DEMOS = { chatbot: Chatbot, excel: Excel, build: Build, dashboard: Dashboard, compare: Compare };

	const example = $derived(data.example);
	const Demo = $derived(DEMOS[example.slug]);
</script>

<svelte:head>
	<title>{example.title} · 모범 예시 · Vibe Studio</title>
</svelte:head>

<ExampleShell
	title={example.title}
	notice={example.slug === 'compare' ? '실제 AI를 쓰지 않는 시뮬레이션이에요. 요청 한 줄로 화면이 어떻게 바뀌는지 비교해 보세요.' : undefined}
>
	{#key example.slug}
		<Demo />
	{/key}
</ExampleShell>
