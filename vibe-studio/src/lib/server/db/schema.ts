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
	// Design template id from design-skills/ (null = let the agent decide)
	design: text('design'),
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
		// Total tokens Claude billed for this reply (input incl. cache + output); 0 for user messages
		tokens: integer('tokens').notNull().default(0),
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

export const messageAttachments = sqliteTable(
	'message_attachments',
	{
		id: text('id').primaryKey(),
		messageId: text('message_id')
			.notNull()
			.references(() => messages.id, { onDelete: 'cascade' }),
		chatId: text('chat_id')
			.notNull()
			.references(() => chats.id, { onDelete: 'cascade' }),
		// image/png | image/jpeg | image/gif | image/webp
		mediaType: text('media_type').notNull(),
		// Base64 image data, already downscaled by the client (long edge ≤ 1568px)
		data: text('data').notNull(),
		name: text('name').notNull().default(''),
		createdAt: timestamp('created_at')
	},
	(t) => [index('message_attachments_message_idx').on(t.messageId)]
);
