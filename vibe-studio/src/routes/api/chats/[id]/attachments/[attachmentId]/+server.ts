import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db, schema } from '#lib/server/db/index.ts';
import type { RequestHandler } from './$types';

const { messageAttachments } = schema;

/**
 * Serves a stored image of one project: for the chat history thumbnails and to restore the
 * file into the project's WebContainer. An id from another project returns 404.
 */
export const GET: RequestHandler = async ({ params }) => {
	const [image] = await db
		.select({ mediaType: messageAttachments.mediaType, data: messageAttachments.data })
		.from(messageAttachments)
		.where(and(eq(messageAttachments.id, params.attachmentId), eq(messageAttachments.chatId, params.id)));

	if (!image) {
		error(404, 'attachment not found');
	}

	return new Response(Buffer.from(image.data, 'base64'), {
		headers: {
			'Content-Type': image.mediaType,
			// Attachments never change once stored.
			'Cache-Control': 'private, max-age=31536000, immutable',
			// The page is cross-origin isolated (COEP require-corp); same-origin images still need this.
			'Cross-Origin-Resource-Policy': 'same-origin'
		}
	});
};
