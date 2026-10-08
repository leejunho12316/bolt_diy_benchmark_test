<script lang="ts">
	import { onMount } from 'svelte';
	import ChatPanel from '#lib/components/ChatPanel.svelte';
	import PreviewPanel from '#lib/components/PreviewPanel.svelte';
	import { layoutSummary, layoutToReference } from '#lib/builder/prompt.ts';
	import { toChatMessage, type ChatMessage } from '#lib/chat.ts';
	import { toDataUrl, type ImageAttachment } from '#lib/attachments.ts';
	import { StreamingMessageParser } from '#lib/runtime/message-parser.ts';
	import { Workbench } from '#lib/stores/workbench.svelte.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const workbench = new Workbench();

	// Initial values only: the page component is recreated when navigating to another chat id.
	// svelte-ignore state_referenced_locally
	let messages = $state<ChatMessage[]>(data.messages.map(toChatMessage));
	// svelte-ignore state_referenced_locally
	let title = $state(data.chat.title);
	let busy = $state(false);
	let chatWidth = $state(420);
	let abortController: AbortController | undefined;
	let ready: Promise<void> = Promise.resolve();
	// Image support of the configured model; null until known (the server re-checks on send).
	let imageInput = $state<boolean | null>(null);
	let modelName = $state('');

	onMount(() => {
		ready = workbench.init(data.files);

		fetch('/api/model')
			.then((r) => r.json())
			.then((info: { model: string; imageInput: boolean | null }) => {
				imageInput = info.imageInput;
				modelName = info.model;
			})
			.catch(() => {});
	});

	async function send(text: string, images: ImageAttachment[] = []) {
		busy = true;
		abortController = new AbortController();

		// Wireframe chats keep their logo title; untitled chats take the first message.
		if (messages.length === 0 && (!data.layout || title === '새 프로젝트')) {
			title = (text || '이미지 요청').slice(0, 60);
		}

		// The server prepends the same text to the first user turn (see withLayoutReference in /api/chat).
		if (data.layout && messages.length === 0) {
			console.log(`[vibe-studio] 첫 요청에 함께 전달되는 배치 프롬프트:\n${layoutToReference(data.layout)}\n\n${text}`);
		}

		messages.push({ id: crypto.randomUUID(), role: 'user', text, files: [], images: images.map(toDataUrl) });
		messages.push({ id: `pending-${Date.now()}`, role: 'assistant', text: '', files: [], streaming: true });
		const reply = messages[messages.length - 1];

		try {
			await ready;
			const files = await workbench.readProjectFiles();

			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ chatId: data.chat.id, message: text, files, images }),
				signal: abortController.signal
			});

			if (!response.ok || !response.body) {
				// SvelteKit error() bodies are JSON { message }; show just the message.
				const body = await response.text();
				let message = body;

				try {
					message = JSON.parse(body).message ?? body;
				} catch {
					// Not JSON: keep the raw text.
				}

				throw new Error(message);
			}

			reply.id = response.headers.get('X-Message-Id') ?? reply.id;

			const parser = new StreamingMessageParser({
				artifactElement: () => '',
				callbacks: { onActionClose: (action) => workbench.enqueue(action) }
			});

			const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
			let raw = '';

			while (true) {
				const { done, value } = await reader.read();

				if (done) {
					break;
				}

				raw += value;
				reply.text += parser.parse(reply.id, raw);
			}
		} catch (error) {
			if (!abortController.signal.aborted) {
				reply.text += `\n\n⚠️ 요청 실패: ${error instanceof Error ? error.message : String(error)}`;
			}
		} finally {
			reply.streaming = false;
		}

		try {
			await workbench.finalize();
			await saveSnapshot(reply.id);
		} finally {
			busy = false;
		}
	}

	async function saveSnapshot(messageId: string) {
		const files = await workbench.readProjectFiles();

		await fetch(`/api/chats/${data.chat.id}/snapshot`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ files, messageId })
		});
	}

	function stop() {
		abortController?.abort();
	}

	function startResize(event: PointerEvent) {
		const handle = event.currentTarget as HTMLElement;
		handle.setPointerCapture(event.pointerId);

		const move = (e: PointerEvent) => {
			chatWidth = Math.min(Math.max(e.clientX, 300), window.innerWidth - 320);
		};
		const up = () => {
			handle.removeEventListener('pointermove', move);
			handle.removeEventListener('pointerup', up);
		};

		handle.addEventListener('pointermove', move);
		handle.addEventListener('pointerup', up);
	}
</script>

<svelte:head>
	<title>{title} · Vibe Studio</title>
</svelte:head>

<div class="workspace" style:--chat-width="{chatWidth}px">
	<ChatPanel
		{title}
		{messages}
		layoutNote={data.layout ? layoutSummary(data.layout) : null}
		designNote={data.designTitle}
		actions={workbench.actions}
		{busy}
		{imageInput}
		{modelName}
		onsend={send}
		onstop={stop}
	/>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="resizer" onpointerdown={startResize}></div>
	<PreviewPanel {workbench} />
</div>

<style>
	.workspace {
		display: grid;
		grid-template-columns: var(--chat-width) 6px 1fr;
		/* Pin the row to the viewport so long chats scroll inside the panel instead of growing the page. */
		grid-template-rows: minmax(0, 1fr);
		height: 100vh;
		height: 100dvh;
		overflow: hidden;
	}

	.resizer {
		cursor: col-resize;
		background: var(--border);
		touch-action: none;
	}

	.resizer:hover {
		background: var(--accent);
	}

	@media (max-width: 800px) {
		.workspace {
			grid-template-columns: 1fr;
			grid-template-rows: minmax(0, 55fr) minmax(0, 45fr);
		}

		.resizer {
			display: none;
		}
	}
</style>
