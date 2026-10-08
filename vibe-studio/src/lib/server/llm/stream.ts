import Anthropic from '@anthropic-ai/sdk';
import { ANTHROPIC_MODEL, client } from './client.ts';
import { buildSystem, toApiMessages, type ChatTurn, type ProjectFiles } from './prompt.ts';

export type { ChatTurn };

interface StreamOptions {
	history: ChatTurn[];
	files: ProjectFiles;
	/** SKILL.md body of the chat's design template, if one was chosen. */
	designGuide?: string | null;
	signal: AbortSignal;
	/** `tokens` is the billed total (input incl. cache reads/writes + output), 0 if the call failed. */
	onFinish: (text: string, tokens: number) => Promise<void>;
}

const MAX_TOKENS_NOTICE =
	'\n\n> ⚠️ 응답이 최대 길이에 도달해 중간에 끊겼습니다. "계속"이라고 입력하면 이어서 작성합니다.';
const REFUSAL_NOTICE = '\n\n> ⚠️ 이 요청은 처리할 수 없습니다. 요청 내용을 바꿔 다시 시도해 주세요.';

function totalTokens(usage: Anthropic.Beta.BetaUsage) {
	return (
		usage.input_tokens +
		usage.output_tokens +
		(usage.cache_creation_input_tokens ?? 0) +
		(usage.cache_read_input_tokens ?? 0)
	);
}

/** Streams Claude's reply as plain UTF-8 text and hands the full text to onFinish once it ends. */
export function streamCompletion({ history, files, designGuide, signal, onFinish }: StreamOptions) {
	const encoder = new TextEncoder();

	return new ReadableStream<Uint8Array>({
		async start(controller) {
			let text = '';
			let tokens = 0;
			const emit = (chunk: string) => {
				text += chunk;

				try {
					controller.enqueue(encoder.encode(chunk));
				} catch {
					// Client went away; keep accumulating so onFinish still saves the reply.
				}
			};

			const stream = client.beta.messages.stream(
				{
					model: ANTHROPIC_MODEL,
					max_tokens: 64000,
					system: buildSystem(designGuide),
					messages: toApiMessages(history, files),
					output_config: { effort: 'high' },
					betas: ['server-side-fallback-2026-07-01'],
					fallbacks: 'default'
				},
				{ signal }
			);

			try {
				for await (const event of stream) {
					if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
						emit(event.delta.text);
					}
				}

				const final = await stream.finalMessage();
				tokens = totalTokens(final.usage);

				if (final.stop_reason === 'max_tokens') {
					emit(MAX_TOKENS_NOTICE);
				} else if (final.stop_reason === 'refusal') {
					emit(REFUSAL_NOTICE);
				}
			} catch (error) {
				if (!signal.aborted) {
					console.error('[api/chat] Claude stream failed', error);
					const message = error instanceof Anthropic.APIError ? error.message : 'unknown error';
					emit(`\n\n> ⚠️ LLM 호출 중 오류가 발생했습니다: ${message}`);
				}
			}

			try {
				if (text) {
					await onFinish(text, tokens);
				}
			} finally {
				try {
					controller.close();
				} catch {
					// Already cancelled by the client; request.signal has aborted the upstream call.
				}
			}
		}
	});
}
