<script lang="ts">
	import { tick } from 'svelte';
	import type { ChatMessage } from '#lib/chat.ts';
	import { MAX_IMAGES, prepareImage, toDataUrl, type ImageAttachment } from '#lib/attachments.ts';
	import type { ActionState } from '#lib/stores/workbench.svelte.ts';

	interface Props {
		title: string;
		messages: ChatMessage[];
		/** Set for chats started from the start-page wireframe, which rides along with the first request. */
		layoutNote?: string | null;
		/** Title of the design template chosen in the start drawer; its guide goes with every request. */
		designNote?: string | null;
		actions: Record<string, ActionState>;
		busy: boolean;
		/** Whether the model accepts images: false blocks attaching, null (unknown) lets the server decide. */
		imageInput?: boolean | null;
		modelName?: string;
		onsend: (text: string, images: ImageAttachment[]) => void;
		onstop: () => void;
	}

	let {
		title,
		messages,
		layoutNote = null,
		designNote = null,
		actions,
		busy,
		imageInput = null,
		modelName = '',
		onsend,
		onstop
	}: Props = $props();

	let input = $state('');
	let listEl: HTMLDivElement | undefined = $state();
	let fileInput: HTMLInputElement | undefined = $state();

	let images = $state<ImageAttachment[]>([]);
	let dragDepth = $state(0);
	let notice = $state<string | null>(null);
	let noticeTimer: ReturnType<typeof setTimeout> | undefined;

	const unsupportedText = $derived(`현재 모델${modelName ? `(${modelName})` : ''}은 이미지 입력을 지원하지 않습니다.`);

	function showNotice(text: string) {
		notice = text;
		clearTimeout(noticeTimer);
		noticeTimer = setTimeout(() => (notice = null), 5000);
	}

	/** Adds dropped, pasted or picked images; a model without image input only gets a notice. */
	async function addImages(files: File[]) {
		if (imageInput === false) {
			showNotice(unsupportedText);
			return;
		}

		if (files.length === 0) {
			return;
		}

		const room = MAX_IMAGES - images.length;

		if (room <= 0) {
			showNotice(`이미지는 한 번에 ${MAX_IMAGES}장까지 첨부할 수 있습니다.`);
			return;
		}

		const results = await Promise.allSettled(files.slice(0, room).map(prepareImage));
		const failed = results.find((r): r is PromiseRejectedResult => r.status === 'rejected');

		images = [...images, ...results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []))];

		if (failed) {
			showNotice(failed.reason instanceof Error ? failed.reason.message : '이미지를 읽지 못했습니다.');
		} else if (files.length > room) {
			showNotice(`이미지는 한 번에 ${MAX_IMAGES}장까지 첨부할 수 있어 ${files.length - room}장은 제외했습니다.`);
		}
	}

	function attachClick() {
		if (imageInput === false) {
			showNotice(unsupportedText);
		} else {
			fileInput?.click();
		}
	}

	const hasFiles = (event: DragEvent) => event.dataTransfer?.types.includes('Files') ?? false;

	function ondragenter(event: DragEvent) {
		if (hasFiles(event)) {
			event.preventDefault();
			dragDepth++;
		}
	}

	function ondragover(event: DragEvent) {
		if (hasFiles(event)) {
			event.preventDefault();
			event.dataTransfer!.dropEffect = 'copy';
		}
	}

	function ondragleave(event: DragEvent) {
		if (hasFiles(event)) {
			dragDepth = Math.max(0, dragDepth - 1);
		}
	}

	function ondrop(event: DragEvent) {
		if (!hasFiles(event)) {
			return;
		}

		event.preventDefault();
		dragDepth = 0;
		addImages([...(event.dataTransfer?.files ?? [])].filter((file) => file.type.startsWith('image/')));
	}

	function onpaste(event: ClipboardEvent) {
		const files = [...(event.clipboardData?.files ?? [])].filter((file) => file.type.startsWith('image/'));

		if (files.length > 0) {
			event.preventDefault();
			addImages(files);
		}
	}

	function removeImage(index: number) {
		images = images.filter((_, i) => i !== index);
	}

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

		if ((!text && images.length === 0) || busy) {
			return;
		}

		const attached = images;
		input = '';
		images = [];
		onsend(text, attached);
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

<section class="chat" class:dragging={dragDepth > 0} aria-label="채팅" {ondragenter} {ondragover} {ondragleave} {ondrop}>
	{#if dragDepth > 0}
		<div class="drop-overlay" aria-hidden="true">
			<span class="drop-icon">⇪</span>
			{imageInput === false ? '현재 모델은 이미지를 지원하지 않습니다' : '이미지를 놓아 첨부하세요'}
		</div>
	{/if}

	<header>
		<a class="back" href="/projects" aria-label="내 프로젝트로 돌아가기" title="내 프로젝트">‹</a>
		<span class="logo">◆</span>
		<h1>{title}</h1>
	</header>

	<div class="messages" bind:this={listEl}>
		{#if messages.length === 0}
			<div class="empty">
				<p class="empty-title">무엇을 만들어 볼까요?</p>
				{#if layoutNote || designNote}
					<div class="chips">
						{#if layoutNote}<span class="layout-chip"><span>▦</span> 화면 배치 ({layoutNote})</span>{/if}
						{#if designNote}<span class="layout-chip"><span>◐</span> 디자인: {designNote}</span>{/if}
					</div>
					<p>어떤 앱인지 설명해 주세요. 위 설정이 요청과 함께 전달되어 배치와 디자인을 참고해 만들어 드립니다.</p>
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
				{#if (layoutNote || designNote) && index === 0 && message.role === 'user'}
					<div class="chips attached">
						{#if layoutNote}<span class="layout-chip"><span>▦</span> 화면 배치 함께 전달 ({layoutNote})</span>{/if}
						{#if designNote}<span class="layout-chip"><span>◐</span> 디자인: {designNote}</span>{/if}
					</div>
				{/if}
				{#if message.images?.length}
					<div class="sent-images">
						{#each message.images as src, i (i)}
							<a href={src} target="_blank" rel="noreferrer"><img {src} alt="첨부 이미지 {i + 1}" loading="lazy" /></a>
						{/each}
					</div>
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

	{#if notice}
		<div class="notice" role="alert">
			<span>{notice}</span>
			<button type="button" onclick={() => (notice = null)} aria-label="알림 닫기">✕</button>
		</div>
	{/if}

	<form class="composer" onsubmit={submit}>
		{#if images.length > 0}
			<ul class="attachments" aria-label="첨부한 이미지">
				{#each images as image, i (i)}
					<li>
						<img src={toDataUrl(image)} alt={image.name || `첨부 이미지 ${i + 1}`} />
						<button type="button" onclick={() => removeImage(i)} aria-label="{image.name || '이미지'} 첨부 취소">✕</button>
					</li>
				{/each}
			</ul>
		{/if}
		<div class="composer-row">
			<button type="button" class="attach" onclick={attachClick} aria-label="이미지 첨부" title="이미지 첨부 (끌어다 놓거나 붙여넣기도 됩니다)">
				<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
					><path d="m21 12-8.6 8.6a5 5 0 0 1-7-7l8.5-8.6a3.4 3.4 0 0 1 4.8 4.8l-8.5 8.6a1.7 1.7 0 0 1-2.4-2.4l7.9-7.9" /></svg
				>
			</button>
			<input
				bind:this={fileInput}
				type="file"
				accept="image/png,image/jpeg,image/gif,image/webp"
				multiple
				hidden
				onchange={(e) => {
					addImages([...(e.currentTarget.files ?? [])]);
					e.currentTarget.value = '';
				}}
			/>
			<textarea
				bind:value={input}
				{onkeydown}
				{onpaste}
				rows="3"
				placeholder="만들고 싶은 앱이나 바꾸고 싶은 점을 적어 주세요. 이미지는 끌어다 놓아 첨부할 수 있어요 (Shift+Enter 줄바꿈)"
			></textarea>
			{#if busy}
				<button type="button" class="stop" onclick={onstop}>중지</button>
			{:else}
				<button type="submit" disabled={!input.trim() && images.length === 0}>보내기</button>
			{/if}
		</div>
	</form>
</section>

<style>
	.chat {
		position: relative;
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

	.back {
		display: grid;
		place-items: center;
		width: 28px;
		height: 28px;
		margin-left: -0.35rem;
		border-radius: 6px;
		color: var(--muted);
		font-size: 1.3rem;
		line-height: 1;
		text-decoration: none;
	}

	.back:hover {
		background: var(--bg);
		color: var(--accent);
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

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin: 0.2rem 0 0.6rem;
	}

	.chips .layout-chip {
		margin: 0;
	}

	.chips.attached {
		justify-content: flex-end;
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
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.8rem;
		border-top: 1px solid var(--border);
	}

	.composer-row {
		display: flex;
		gap: 0.5rem;
	}

	.attach {
		display: grid;
		place-items: center;
		width: 38px;
		height: 38px;
		padding: 0;
		border: 1px solid var(--border);
		background: var(--bg);
		color: var(--muted);
	}

	.attach:hover {
		color: var(--accent);
		border-color: var(--accent);
	}

	.attachments {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.attachments li {
		position: relative;
	}

	.attachments img {
		display: block;
		width: 64px;
		height: 64px;
		object-fit: cover;
		border-radius: 8px;
		border: 1px solid var(--border);
	}

	.attachments button {
		position: absolute;
		top: -6px;
		right: -6px;
		width: 22px;
		height: 22px;
		padding: 0;
		border-radius: 50%;
		background: var(--text);
		color: var(--panel);
		font-size: 0.65rem;
		line-height: 1;
	}

	.sent-images {
		align-self: flex-end;
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: 0.4rem;
		max-width: 85%;
	}

	.sent-images img {
		display: block;
		width: 96px;
		height: 96px;
		object-fit: cover;
		border-radius: 10px;
		border: 1px solid var(--border);
	}

	.notice {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		margin: 0 0.8rem;
		padding: 0.6rem 0.75rem;
		border: 1px solid var(--danger);
		border-radius: 8px;
		background: var(--danger-soft);
		color: var(--danger);
		font-size: 0.85rem;
		word-break: keep-all;
	}

	.notice span {
		flex: 1;
	}

	.notice button {
		padding: 0 0.2rem;
		background: none;
		color: inherit;
		font-size: 0.8rem;
	}

	.drop-overlay {
		position: absolute;
		inset: 0.5rem;
		z-index: 5;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		border: 2px dashed var(--accent);
		border-radius: 12px;
		background: color-mix(in srgb, var(--panel) 88%, transparent);
		color: var(--accent);
		font-weight: 600;
		pointer-events: none;
	}

	.drop-icon {
		font-size: 2rem;
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
