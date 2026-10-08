import { error } from '@sveltejs/kit';
import { asc, desc, eq } from 'drizzle-orm';
import { db, schema } from '#lib/server/db/index.ts';
import { parseLayout } from '#lib/builder/validate.ts';
import type { Layout } from '#lib/builder/types.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [chat] = await db.select().from(schema.chats).where(eq(schema.chats.id, params.id));

	if (!chat) {
		error(404, '프로젝트를 찾을 수 없습니다.');
	}

	const [messages, [snapshot]] = await Promise.all([
		db
			.select({ id: schema.messages.id, role: schema.messages.role, content: schema.messages.content })
			.from(schema.messages)
			.where(eq(schema.messages.chatId, chat.id))
			.orderBy(asc(schema.messages.createdAt)),
		db
			.select({ files: schema.fileSnapshots.files })
			.from(schema.fileSnapshots)
			.where(eq(schema.fileSnapshots.chatId, chat.id))
			.orderBy(desc(schema.fileSnapshots.createdAt))
			.limit(1)
	]);

	let layout: Layout | null = null;

	try {
		layout = chat.layout ? parseLayout(JSON.parse(chat.layout)) : null;
	} catch {
		// Unreadable layout: the chat still works as a plain prompt chat.
	}

	return {
		chat: { id: chat.id, title: chat.title },
		layout,
		messages,
		files: snapshot ? (JSON.parse(snapshot.files) as Record<string, string>) : null
	};
};
