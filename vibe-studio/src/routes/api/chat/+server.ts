import { error } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { db, schema } from '#lib/server/db/index.ts';
import { streamCompletion, type ChatTurn } from '#lib/server/llm/stream.ts';
import { layoutToReference } from '#lib/builder/prompt.ts';
import { parseLayout } from '#lib/builder/validate.ts';
import type { RequestHandler } from './$types';

interface ChatRequest {
	chatId: string;
	message: string;
	files: Record<string, string>;
}

export const POST: RequestHandler = async ({ request }) => {
	const { chatId, message, files } = (await request.json()) as ChatRequest;

	if (!chatId || !message?.trim()) {
		error(400, 'chatId and message are required');
	}

	const [chat] = await db.select().from(schema.chats).where(eq(schema.chats.id, chatId));

	if (!chat) {
		error(404, 'chat not found');
	}

	const history = await db
		.select({ role: schema.messages.role, content: schema.messages.content })
		.from(schema.messages)
		.where(eq(schema.messages.chatId, chatId))
		.orderBy(asc(schema.messages.createdAt));

	await db.insert(schema.messages).values({ id: crypto.randomUUID(), chatId, role: 'user', content: message });

	// Wireframe chats are titled from their logo block at creation; only untitled chats take the first message.
	if (history.length === 0 && (!chat.layout || chat.title === '새 프로젝트')) {
		await db
			.update(schema.chats)
			.set({ title: message.trim().slice(0, 60) })
			.where(eq(schema.chats.id, chatId));
	}

	const assistantId = crypto.randomUUID();

	const body = streamCompletion({
		history: withLayoutReference([...history, { role: 'user', content: message }], chat.layout),
		files: files ?? {},
		signal: request.signal,
		onFinish: async (text) => {
			await db.insert(schema.messages).values({ id: assistantId, chatId, role: 'assistant', content: text });
		}
	});

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'no-cache',
			'X-Message-Id': assistantId
		}
	});
};

/**
 * Chats started from the start page carry a wireframe. It is attached to the first user turn
 * (on every request, so the prompt prefix stays identical for caching) as reference only.
 */
function withLayoutReference(turns: ChatTurn[], rawLayout: string | null): ChatTurn[] {
	if (!rawLayout) {
		return turns;
	}

	let reference: string;

	try {
		reference = layoutToReference(parseLayout(JSON.parse(rawLayout)));
	} catch {
		return turns;
	}

	const [first, ...rest] = turns;

	console.log(`[api/chat] layout reference attached to the first user turn:\n${reference}`);

	return [{ ...first, content: `${reference}\n\n${first.content}` }, ...rest];
}
