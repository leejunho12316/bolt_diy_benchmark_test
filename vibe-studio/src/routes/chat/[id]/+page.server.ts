import { error } from '@sveltejs/kit';
import { asc, desc, eq } from 'drizzle-orm';
import { db, schema } from '#lib/server/db/index.ts';
import { parseLayout } from '#lib/builder/validate.ts';
import { getDesign } from '#lib/server/design/catalog.ts';
import type { Layout } from '#lib/builder/types.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [chat] = await db.select().from(schema.chats).where(eq(schema.chats.id, params.id));

	if (!chat) {
		error(404, '프로젝트를 찾을 수 없습니다.');
	}

	const [rows, attachments, [snapshot]] = await Promise.all([
		db
			.select({ id: schema.messages.id, role: schema.messages.role, content: schema.messages.content })
			.from(schema.messages)
			.where(eq(schema.messages.chatId, chat.id))
			.orderBy(asc(schema.messages.createdAt)),
		db
			.select({ id: schema.messageAttachments.id, messageId: schema.messageAttachments.messageId })
			.from(schema.messageAttachments)
			.where(eq(schema.messageAttachments.chatId, chat.id))
			.orderBy(asc(schema.messageAttachments.createdAt)),
		db
			.select({ files: schema.fileSnapshots.files })
			.from(schema.fileSnapshots)
			.where(eq(schema.fileSnapshots.chatId, chat.id))
			.orderBy(desc(schema.fileSnapshots.createdAt))
			.limit(1)
	]);

	// Only ids go to the page; the images themselves load from /api/attachments/<id>.
	const messages = rows.map((message) => {
		const attachmentIds = attachments.filter((a) => a.messageId === message.id).map((a) => a.id);
		return attachmentIds.length > 0 ? { ...message, attachmentIds } : message;
	});

	let layout: Layout | null = null;

	try {
		layout = chat.layout ? parseLayout(JSON.parse(chat.layout)) : null;
	} catch {
		// Unreadable layout: the chat still works as a plain prompt chat.
	}

	return {
		chat: { id: chat.id, title: chat.title },
		layout,
		designTitle: getDesign(chat.design)?.title ?? null,
		messages,
		files: snapshot ? (JSON.parse(snapshot.files) as Record<string, string>) : null
	};
};
