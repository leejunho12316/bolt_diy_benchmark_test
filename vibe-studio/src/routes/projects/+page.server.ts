import { fail } from '@sveltejs/kit';
import { desc, eq, sql } from 'drizzle-orm';
import { db, schema } from '#lib/server/db/index.ts';
import type { Actions, PageServerLoad } from './$types';

const { chats, messages, fileSnapshots } = schema;

export const load: PageServerLoad = async () => {
	const rows = await db
		.select({
			id: chats.id,
			title: chats.title,
			updatedAt: chats.updatedAt,
			messageCount: sql<number>`count(${messages.id})`,
			hasResult: sql<number>`exists(select 1 from ${fileSnapshots} where ${fileSnapshots.chatId} = ${chats.id})`
		})
		.from(chats)
		.leftJoin(messages, eq(messages.chatId, chats.id))
		.groupBy(chats.id)
		.orderBy(desc(chats.updatedAt));

	const projects = rows.map((row) => ({
		id: row.id,
		title: row.title,
		updatedAt: row.updatedAt.getTime(),
		// Each exchange is one user message plus one reply.
		turns: Math.ceil(row.messageCount / 2),
		hasResult: Boolean(row.hasResult)
	}));

	return {
		projects,
		summary: {
			projectCount: projects.length,
			withResult: projects.filter((p) => p.hasResult).length,
			latest: projects[0] ?? null
		}
	};
};

export const actions = {
	/** Deletes a project; its messages and file snapshots go with it (ON DELETE CASCADE). */
	delete: async ({ request }) => {
		const id = (await request.formData()).get('id');

		if (typeof id !== 'string' || !id) {
			return fail(400, { error: '삭제할 프로젝트를 찾지 못했습니다.' });
		}

		const deleted = await db.delete(chats).where(eq(chats.id, id)).returning({ title: chats.title });

		if (deleted.length === 0) {
			return fail(404, { error: '이미 삭제된 프로젝트입니다.' });
		}

		return { deleted: deleted[0].title };
	}
} satisfies Actions;
