<script lang="ts">
	import { tick } from 'svelte';
	import { CHATBOT_DOCS, CHATBOT_SUGGESTIONS, answerQuestion } from '../chatbot.ts';

	interface Message {
		id: number;
		from: 'bot' | 'me';
		text: string;
		sources: string[];
	}

	let nextId = 1;
	let messages = $state<Message[]>([
		{
			id: 0,
			from: 'bot',
			text: '안녕하세요! 현장 문서 4건을 읽어 두었어요. 일정, 담당자, 출역 인원 등 무엇이든 물어보세요.',
			sources: []
		}
	]);
	let draft = $state('');
	let log: HTMLElement;

	const usedDocs = $derived.by(() => {
		const last = messages[messages.length - 1];
		return last.from === 'bot' ? last.sources : [];
	});

	async function ask(question: string) {
		const text = question.trim();
		if (!text) return;

		const answer = answerQuestion(text);
		messages.push(
			{ id: nextId++, from: 'me', text, sources: [] },
			{ id: nextId++, from: 'bot', text: answer.text, sources: answer.sources }
		);
		draft = '';
		await tick();
		log.scrollTop = log.scrollHeight;
	}
</script>

{#snippet leaf()}
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z" /><path d="M5 19l7-7" /></svg>
{/snippet}

<div class="chatbot">
	<aside aria-label="학습한 문서">
		<div class="bot-id">
			<span class="avatar" aria-hidden="true">{@render leaf()}</span>
			<span><strong>현장 문서 도우미</strong><small>○○ 신축공사 현장</small></span>
		</div>
		<h2>학습한 현장 문서</h2>
		<ul>
			{#each CHATBOT_DOCS as doc (doc)}
				<li class:used={usedDocs.includes(doc)}>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" /><path d="M14 3v5h5" /></svg>
					{doc}
				</li>
			{/each}
		</ul>
		<p class="hint">답변에 쓰인 문서는 초록색으로 표시돼요.</p>
	</aside>

	<section aria-label="대화">
		<p class="eyebrow">{@render leaf()} 현장 문서로 답하는 AI</p>
		<div class="log" bind:this={log} aria-live="polite">
			{#each messages as message (message.id)}
				<div class="bubble {message.from}">
					<span>{message.text}</span>
					{#if message.sources.length > 0}
						<span class="sources">
							{#each message.sources as source (source)}<span>{@render leaf()} {source}</span>{/each}
						</span>
					{/if}
				</div>
			{/each}
		</div>

		<div class="chips">
			{#each CHATBOT_SUGGESTIONS as suggestion (suggestion)}
				<button type="button" onclick={() => ask(suggestion)}>{suggestion}</button>
			{/each}
		</div>

		<form
			onsubmit={(e) => {
				e.preventDefault();
				ask(draft);
			}}
		>
			<input aria-label="질문 입력" placeholder="현장에 대해 궁금한 것을 물어보세요" bind:value={draft} />
			<button type="submit">보내기</button>
		</form>
	</section>
</div>

<style>
	/* Design skill: nature-green (tokens from .theme-nature-green) */
	.chatbot {
		flex: 1;
		display: grid;
		grid-template-columns: 300px minmax(0, 1fr);
		gap: 24px;
		min-height: 560px;
	}

	aside {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 24px;
		border-radius: var(--radius);
		background: var(--sage);
	}

	.bot-id {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.bot-id > span:last-child {
		display: flex;
		flex-direction: column;
	}

	.bot-id strong {
		font-family: var(--font-serif);
		font-size: 19px;
		color: var(--forest);
	}

	.avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		border-radius: var(--pebble);
		background: var(--forest);
		color: var(--surface);
	}

	.avatar :global(svg) {
		width: 22px;
		height: 22px;
	}

	small {
		font-size: 14px;
		color: var(--forest-2);
	}

	h2 {
		margin: 8px 0 0;
		font-family: var(--font-serif);
		font-size: 17px;
		color: var(--forest);
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	li {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 14px;
		border-radius: var(--radius-pill);
		background: var(--surface);
		font-size: 14px;
		color: var(--ink-2);
		transition:
			background var(--dur),
			color var(--dur);
	}

	li.used {
		background: var(--forest);
		color: var(--surface);
		font-weight: 600;
	}

	.hint {
		margin: 0;
		font-size: 14px;
		line-height: 1.6;
		color: var(--forest-2);
	}

	section {
		display: flex;
		flex-direction: column;
		gap: 16px;
		min-height: 0;
		padding: 24px 32px;
		border-radius: var(--radius-lg, 28px);
		background: var(--surface);
		box-shadow: var(--shadow);
	}

	.eyebrow {
		display: flex;
		align-items: center;
		gap: 6px;
		margin: 0;
		font-size: 14px;
		font-weight: 600;
		color: var(--forest);
	}

	.log {
		flex: 1;
		min-height: 360px;
		max-height: 60vh;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.bubble {
		max-width: 72%;
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 14px 18px;
		border-radius: var(--radius);
		font-size: 16px;
		line-height: 1.8;
	}

	.bubble.bot {
		align-self: flex-start;
		border-bottom-left-radius: 6px;
		background: var(--bg);
		color: var(--forest-2);
	}

	.bubble.me {
		align-self: flex-end;
		border-bottom-right-radius: 6px;
		background: var(--sage-2);
		color: var(--forest-2);
	}

	.sources {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.sources span {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 2px 10px;
		border-radius: var(--radius-pill);
		background: var(--sage-2);
		color: var(--forest);
		font-size: 13px;
		font-weight: 600;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.chips button {
		min-height: 40px;
		padding: 0 16px;
		border: 1.5px solid var(--forest);
		border-radius: var(--radius-pill);
		background: transparent;
		color: var(--forest);
		font: inherit;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: background var(--dur);
	}

	.chips button:hover {
		background: var(--sage-2);
	}

	form {
		display: flex;
		gap: 8px;
	}

	input {
		flex: 1;
		min-width: 0;
		height: 50px;
		padding: 0 16px;
		border: 1px solid var(--line);
		border-radius: var(--radius-sm);
		background: var(--surface);
		color: var(--forest-2);
		font: inherit;
	}

	input:focus {
		outline: none;
		border-color: var(--forest);
		box-shadow: 0 0 0 3px var(--sage-2);
	}

	form button {
		height: 50px;
		padding: 0 26px;
		border: none;
		border-radius: var(--radius-pill);
		background: var(--forest);
		color: var(--surface);
		font: inherit;
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
		transition: background var(--dur);
	}

	form button:hover {
		background: var(--forest-2);
	}

	button:focus-visible {
		outline: 2px solid var(--forest);
		outline-offset: 3px;
	}

	@media (max-width: 960px) {
		.chatbot {
			grid-template-columns: 1fr;
		}

		section {
			padding: 16px;
		}

		.bubble {
			max-width: 88%;
		}
	}
</style>
