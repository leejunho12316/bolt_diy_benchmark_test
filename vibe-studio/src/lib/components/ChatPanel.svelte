<script lang="ts">
	import { tick } from 'svelte';
	import type { ChatMessage } from '#lib/chat.ts';
	import type { ActionState } from '#lib/stores/workbench.svelte.ts';

	interface Props {
		title: string;
		messages: ChatMessage[];
		/** Set for chats started from the start-page wireframe, which rides along with the first request. */
		layoutNote?: string | null;
		actions: Record<string, ActionState>;
		busy: boolean;
		onsend: (text: string) => void;
		onstop: () => void;
	}

	let { title, messages, layoutNote = null, actions, busy, onsend, onstop }: Props = $props();

	let input = $state('');
	let listEl: HTMLDivElement | undefined = $state();

	const statusIcon: Record<ActionState['status'], string> = {
		pending: '○',
		running: '◐',
		complete: '●',
		failed: '✕'
	};

	function actionsFor(messageId: string) {
		return Object.values(actions).filter((a) => a.messageId === messageId);
	}

	function label(state: ActionState) {
		const { action } = state;
		return action.type === 'file' ? action.filePath : `$ ${action.content.trim()}`;
	}

	function submit(event?: SubmitEvent) {
		event?.preventDefault();
		const text = input.trim();

		if (!text || busy) {
			return;
		}

		input = '';
		onsend(text);
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
			event.preventDefault();
			submit();
		}
	}

	$effect(() => {
		// Follow the stream: scroll whenever the last message grows.
		void messages.length;
		void messages.at(-1)?.text;
		tick().then(() => listEl?.scrollTo({ top: listEl.scrollHeight }));
	});
</script>

<section class="chat">
	<header>
		<span class="logo">◆</span>
		<h1>{title}</h1>
	</header>

	<div class="messages" bind:this={listEl}>
		{#if messages.length === 0}
			<div class="empty">
				<p class="empty-title">무엇을 만들어 볼까요?</p>
				{#if layoutNote}
					<p class="layout-chip"><span>▦</span> 시작 페이지에서 만든 화면 배치 ({layoutNote})</p>
					<p>어떤 앱인지 설명해 주세요. 첫 요청에 위 배치가 함께 전달되어, 요소들의 위치 관계를 참고해 만들어 드립니다.</p>
				{:else}
					<p>만들고 싶은 웹앱을 설명하면 SvelteKit 코드로 만들어 오른쪽에 바로 띄워 드립니다.</p>
				{/if}
				<ul>
					<li>할 일 목록 앱, 목록은 /api/todos 엔드포인트로 관리</li>
					<li>마크다운 메모장, 메모는 서버에 저장</li>
					<li>환율 계산기 랜딩 페이지</li>
				</ul>
			</div>
		{/if}

		{#each messages as message, index (message.id)}
			<article class="message {message.role}">
				{#if layoutNote && index === 0 && message.role === 'user'}
					<span class="layout-chip attached"><span>▦</span> 화면 배치 함께 전달 ({layoutNote})</span>
				{/if}
				{#if message.text.trim()}
					<div class="bubble">{message.text.trim()}</div>
				{/if}

				{#if message.role === 'assistant'}
					{@const live = actionsFor(message.id)}
					{#if live.length > 0}
						<ul class="actions">
							{#each live as state (state.key)}
								<li class={state.status}>
									<span class="icon">{statusIcon[state.status]}</span>
									<code>{label(state)}</code>
								</li>
							{/each}
						</ul>
					{:else if message.files.length > 0}
						<ul class="actions">
							{#each message.files as file (file)}
								<li class="complete"><span class="icon">●</span><code>{file}</code></li>
							{/each}
						</ul>
					{/if}

					{#if message.streaming && !message.text.trim() && live.length === 0}
						<div class="typing"><span></span><span></span><span></span></div>
					{/if}
				{/if}
			</article>
		{/each}
	</div>

	<form class="composer" onsubmit={submit}>
		<textarea
			bind:value={input}
			{onkeydown}
			rows="3"
			placeholder="만들고 싶은 앱이나 바꾸고 싶은 점을 적어 주세요 (Shift+Enter 줄바꿈)"
		></textarea>
		{#if busy}
			<button type="button" class="stop" onclick={onstop}>중지</button>
		{:else}
			<button type="submit" disabled={!input.trim()}>보내기</button>
		{/if}
	</form>
</section>

<style>
	.chat {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-width: 0;
		min-height: 0;
		overflow: hidden;
		background: var(--panel);
	}

	header {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.9rem 1.1rem;
		border-bottom: 1px solid var(--border);
	}

	.logo {
		color: var(--accent);
	}

	h1 {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.messages {
		flex: 1;
		/* Without min-height: 0 a flex child grows to fit its content and never scrolls. */
		min-height: 0;
		overflow-y: auto;
		padding: 1rem 1.1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.empty {
		margin: auto 0;
		color: var(--muted);
		font-size: 0.9rem;
		line-height: 1.6;
	}

	.empty-title {
		color: var(--text);
		font-size: 1.15rem;
		font-weight: 600;
		margin: 0 0 0.4rem;
	}

	.empty ul {
		padding-left: 1.1rem;
	}

	.layout-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		margin: 0.2rem 0 0.6rem;
		padding: 0.3rem 0.6rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: var(--panel);
		color: var(--text);
		font-size: 0.8rem;
	}

	.layout-chip span {
		color: var(--accent);
	}

	.layout-chip.attached {
		align-self: flex-end;
		margin: 0;
	}

	.message {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.bubble {
		white-space: pre-wrap;
		word-break: keep-all;
		overflow-wrap: anywhere;
		line-height: 1.6;
		font-size: 0.92rem;
	}

	.user .bubble {
		align-self: flex-end;
		max-width: 85%;
		background: var(--accent-soft);
		padding: 0.6rem 0.85rem;
		border-radius: 12px 12px 2px 12px;
	}

	.actions {
		list-style: none;
		margin: 0;
		padding: 0.5rem 0.7rem;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg);
		font-size: 0.8rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.actions li {
		display: flex;
		gap: 0.5rem;
		align-items: baseline;
		min-width: 0;
	}

	.actions code {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.icon {
		width: 1rem;
		flex: none;
		color: var(--muted);
	}

	.running .icon {
		color: var(--accent);
	}

	.complete .icon {
		color: var(--success);
	}

	.failed .icon,
	.failed code {
		color: var(--danger);
	}

	.typing {
		display: flex;
		gap: 4px;
	}

	.typing span {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--muted);
		animation: blink 1.2s infinite ease-in-out;
	}

	.typing span:nth-child(2) {
		animation-delay: 0.2s;
	}

	.typing span:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes blink {
		0%,
		80%,
		100% {
			opacity: 0.2;
		}
		40% {
			opacity: 1;
		}
	}

	.composer {
		display: flex;
		gap: 0.5rem;
		padding: 0.8rem;
		border-top: 1px solid var(--border);
	}

	textarea {
		flex: 1;
		resize: none;
		font: inherit;
		font-size: 0.9rem;
		padding: 0.6rem 0.7rem;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg);
		color: var(--text);
	}

	textarea:focus {
		outline: 2px solid var(--accent-soft);
		border-color: var(--accent);
	}

	button {
		align-self: flex-end;
		font: inherit;
		font-size: 0.85rem;
		font-weight: 600;
		padding: 0.55rem 0.9rem;
		border: none;
		border-radius: 8px;
		background: var(--accent);
		color: white;
		cursor: pointer;
	}

	button:disabled {
		opacity: 0.4;
		cursor: default;
	}

	.stop {
		background: var(--danger);
	}
</style>
