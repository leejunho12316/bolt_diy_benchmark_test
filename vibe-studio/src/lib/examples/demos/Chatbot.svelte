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

<div class="chatbot">
	<aside aria-label="학습한 문서">
		<div class="bot-id">
			<span class="avatar" aria-hidden="true">AI</span>
			<span><strong>현장 문서 도우미</strong><small>○○ 신축공사 현장</small></span>
		</div>
		<h2>학습한 현장 문서</h2>
		<ul>
			{#each CHATBOT_DOCS as doc (doc)}
				<li class:used={usedDocs.includes(doc)}>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" /><path d="M14 3v5h5" /></svg>
					{doc}
				</li>
			{/each}
		</ul>
		<p class="hint">답변에 쓰인 문서는 강조되어 표시돼요.</p>
	</aside>

	<section aria-label="대화">
		<div class="log" bind:this={log} aria-live="polite">
			{#each messages as message (message.id)}
				<div class="bubble {message.from}">
					<span>{message.text}</span>
					{#if message.sources.length > 0}
						<span class="sources">
							{#each message.sources as source (source)}<span>{source}</span>{/each}
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
	.chatbot {
		flex: 1;
		display: grid;
		grid-template-columns: 280px minmax(0, 1fr);
		min-height: 560px;
		border: 1px solid var(--border);
		border-radius: 10px;
		overflow: hidden;
		background: var(--bg);
	}

	aside {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
		padding: 1.5rem 1.25rem;
		background: var(--panel);
		border-right: 1px solid var(--border);
	}

	.bot-id {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.bot-id > span:last-child {
		display: flex;
		flex-direction: column;
	}

	.avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 8px;
		background: var(--accent);
		color: var(--panel);
		font-size: 0.8rem;
		font-weight: 700;
	}

	small {
		font-size: 0.75rem;
		color: var(--muted);
	}

	h2 {
		margin: 0.5rem 0 0;
		font-size: 0.88rem;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 0.75rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--bg);
		font-size: 0.82rem;
		color: var(--muted);
		transition: background 0.2s ease;
	}

	li.used {
		border-color: var(--accent);
		background: var(--accent-soft);
		color: var(--text);
		font-weight: 600;
	}

	.hint {
		margin: 0;
		font-size: 0.75rem;
		line-height: 1.6;
		color: var(--muted);
	}

	section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
		max-width: 900px;
		margin: 0 auto;
		padding: 1.5rem 2rem;
		min-height: 0;
	}

	.log {
		flex: 1;
		min-height: 360px;
		max-height: 60vh;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
	}

	.bubble {
		max-width: 72%;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.9rem 1.1rem;
		border-radius: 12px;
		line-height: 1.7;
	}

	.bubble.bot {
		align-self: flex-start;
		border: 1px solid var(--border);
		background: var(--panel);
	}

	.bubble.me {
		align-self: flex-end;
		background: var(--accent-soft);
	}

	.sources {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.sources span {
		padding: 0.1rem 0.5rem;
		border-radius: 4px;
		background: var(--accent-soft);
		color: var(--accent);
		font-size: 0.75rem;
		font-weight: 700;
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

	.chips button:hover {
		background: var(--accent-soft);
	}

	form {
		display: flex;
		gap: 0.5rem;
	}

	input {
		flex: 1;
		min-width: 0;
		min-height: 52px;
		padding: 0 1rem;
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

	@media (max-width: 800px) {
		.chatbot {
			grid-template-columns: 1fr;
		}

		aside {
			border-right: none;
			border-bottom: 1px solid var(--border);
		}

		section {
			padding: 1rem;
		}

		.bubble {
			max-width: 88%;
		}
	}
</style>
