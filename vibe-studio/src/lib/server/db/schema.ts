import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Stored as epoch milliseconds so ordering within the same second stays stable.
const timestamp = (name: string) =>
	integer(name, { mode: 'timestamp_ms' })
		.notNull()
		.$defaultFn(() => new Date());

export const chats = sqliteTable('chats', {
	id: text('id').primaryKey(),
	title: text('title').notNull().default('새 프로젝트'),
	// JSON-encoded start-page wireframe (Layout), null for chats started from a blank prompt
	layout: text('layout'),
	createdAt: timestamp('created_at'),
	updatedAt: timestamp('updated_at').$onUpdate(() => new Date())
});

export const messages = sqliteTable(
	'messages',
	{
		id: text('id').primaryKey(),
		chatId: text('chat_id')
			.notNull()
			.references(() => chats.id, { onDelete: 'cascade' }),
		role: text('role', { enum: ['user', 'assistant'] }).notNull(),
		content: text('content').notNull(),
		createdAt: timestamp('created_at')
	},
	(t) => [index('messages_chat_idx').on(t.chatId, t.createdAt)]
);

export const fileSnapshots = sqliteTable(
	'file_snapshots',
	{
		id: text('id').primaryKey(),
		chatId: text('chat_id')
			.notNull()
			.references(() => chats.id, { onDelete: 'cascade' }),
		messageId: text('message_id'),
		// JSON-encoded Record<path, content>
		files: text('files').notNull(),
		createdAt: timestamp('created_at')
	},
	(t) => [index('file_snapshots_chat_idx').on(t.chatId, t.createdAt)]
);
