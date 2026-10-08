import { error, json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db, schema } from '#lib/server/db/index.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request }) => {
	const { files, messageId } = (await request.json()) as {
		files: Record<string, string>;
		messageId?: string;
	};

	if (!files || typeof files !== 'object') {
		error(400, 'files is required');
	}

	const [chat] = await db.select({ id: schema.chats.id }).from(schema.chats).where(eq(schema.chats.id, params.id));

	if (!chat) {
		error(404, 'chat not found');
	}

	const id = crypto.randomUUID();
	await db.insert(schema.fileSnapshots).values({
		id,
		chatId: chat.id,
		messageId: messageId ?? null,
		files: JSON.stringify(files)
	});

	return json({ id });
};
