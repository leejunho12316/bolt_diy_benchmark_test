import Anthropic from '@anthropic-ai/sdk';
import { ANTHROPIC_API_KEY, ANTHROPIC_MODEL } from '$app/env/private';
import { SYSTEM_PROMPT, createFilesContext, summarizeArtifacts, type ProjectFiles } from './prompt.ts';

const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

export interface ChatTurn {
	role: 'user' | 'assistant';
	content: string;
}

interface StreamOptions {
	history: ChatTurn[];
	files: ProjectFiles;
	signal: AbortSignal;
	onFinish: (text: string) => Promise<void>;
}

const MAX_TOKENS_NOTICE =
	'\n\n> ⚠️ 응답이 최대 길이에 도달해 중간에 끊겼습니다. "계속"이라고 입력하면 이어서 작성합니다.';
const REFUSAL_NOTICE = '\n\n> ⚠️ 이 요청은 처리할 수 없습니다. 요청 내용을 바꿔 다시 시도해 주세요.';

function toApiMessages(history: ChatTurn[], files: ProjectFiles): Anthropic.Beta.BetaMessageParam[] {
	const lastIndex = history.length - 1;

	return history.map((turn, index) => {
		if (turn.role === 'assistant') {
			return { role: 'assistant', content: summarizeArtifacts(turn.content) };
		}

		if (index === lastIndex) {
			const context = createFilesContext(files);
			return { role: 'user', content: context ? `${context}\n\n${turn.content}` : turn.content };
		}

		return { role: 'user', content: turn.content };
	});
}

/** Streams Claude's reply as plain UTF-8 text and hands the full text to onFinish once it ends. */
export function streamCompletion({ history, files, signal, onFinish }: StreamOptions) {
	const encoder = new TextEncoder();

	return new ReadableStream<Uint8Array>({
		async start(controller) {
			let text = '';
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
					system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
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
					await onFinish(text);
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
