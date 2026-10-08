import { error } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { db, schema } from '#lib/server/db/index.ts';
import { streamCompletion, type ChatTurn } from '#lib/server/llm/stream.ts';
import { layoutToReference } from '#lib/builder/prompt.ts';
import { parseLayout } from '#lib/builder/validate.ts';
import { getDesign } from '#lib/server/design/catalog.ts';
import { parseImages } from '#lib/server/attachments.ts';
import { ANTHROPIC_MODEL, supportsImages } from '#lib/server/llm/client.ts';
import { isImageType, uploadPath, type ImageAttachment } from '#lib/attachments.ts';
import type { RequestHandler } from './$types';

interface ChatRequest {
	chatId: string;
	message: string;
	files: Record<string, string>;
	images?: unknown;
}

/** Used as the request text when the user sends only images. */
const IMAGE_ONLY_MESSAGE = '첨부한 이미지를 참고해 주세요.';

export const POST: RequestHandler = async ({ request }) => {
	const { chatId, message: rawMessage, files, images: rawImages } = (await request.json()) as ChatRequest;

	let images: ImageAttachment[];

	try {
		images = parseImages(rawImages);
	} catch (e) {
		error(400, e instanceof Error ? e.message : '이미지를 읽지 못했습니다.');
	}

	const message = rawMessage?.trim() || (images.length > 0 ? IMAGE_ONLY_MESSAGE : '');

	if (!chatId || !message) {
		error(400, 'chatId and message are required');
	}

	// Checked here as well as in the UI so a stale page can't send images to a text-only model.
	if (images.length > 0 && (await supportsImages()) === false) {
		error(400, `현재 모델(${ANTHROPIC_MODEL})은 이미지 입력을 지원하지 않습니다.`);
	}

	const [chat] = await db.select().from(schema.chats).where(eq(schema.chats.id, chatId));

	if (!chat) {
		error(404, 'chat not found');
	}

	const history = await loadHistory(chatId);

	const userMessageId = crypto.randomUUID();
	await db.insert(schema.messages).values({ id: userMessageId, chatId, role: 'user', content: message });

	if (images.length > 0) {
		await db.insert(schema.messageAttachments).values(
			// The client picked the ids, so the files it already wrote into the project match these rows.
			images.map((image) => ({ ...image, messageId: userMessageId, chatId }))
		);
	}

	// Bump the project's last-activity time for the project list.
	await db.update(schema.chats).set({ updatedAt: new Date() }).where(eq(schema.chats.id, chatId));

	// Wireframe chats are titled from their logo block at creation; only untitled chats take the first message.
	if (history.length === 0 && (!chat.layout || chat.title === '새 프로젝트')) {
		await db
			.update(schema.chats)
			.set({ title: message.slice(0, 60) })
			.where(eq(schema.chats.id, chatId));
	}

	const assistantId = crypto.randomUUID();

	const body = streamCompletion({
		history: withLayoutReference(
			[...history, { role: 'user', content: message, images: images.map((image) => ({ ...image, path: uploadPath(image) })) }],
			chat.layout
		),
		files: files ?? {},
		designGuide: getDesign(chat.design)?.body,
		signal: request.signal,
		onFinish: async (text, tokens) => {
			await db.insert(schema.messages).values({ id: assistantId, chatId, role: 'assistant', content: text, tokens });
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

/** Stored turns in order, each user turn with the images that were attached to it. */
async function loadHistory(chatId: string): Promise<ChatTurn[]> {
	const [rows, attachments] = await Promise.all([
		db
			.select({ id: schema.messages.id, role: schema.messages.role, content: schema.messages.content })
			.from(schema.messages)
			.where(eq(schema.messages.chatId, chatId))
			.orderBy(asc(schema.messages.createdAt)),
		db
			.select({
				id: schema.messageAttachments.id,
				messageId: schema.messageAttachments.messageId,
				mediaType: schema.messageAttachments.mediaType,
				data: schema.messageAttachments.data,
				name: schema.messageAttachments.name
			})
			.from(schema.messageAttachments)
			.where(eq(schema.messageAttachments.chatId, chatId))
			.orderBy(asc(schema.messageAttachments.createdAt))
	]);

	return rows.map(({ id, role, content }) => {
		const images = attachments
			.filter((a) => a.messageId === id && isImageType(a.mediaType))
			.map((a) => {
				const mediaType = a.mediaType as ImageAttachment['mediaType'];
				return { mediaType, data: a.data, path: uploadPath({ id: a.id, name: a.name, mediaType }) };
			});

		return images.length > 0 ? { role, content, images } : { role, content };
	});
}
