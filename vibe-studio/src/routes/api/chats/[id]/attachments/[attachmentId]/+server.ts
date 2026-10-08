import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db, schema } from '#lib/server/db/index.ts';
import type { RequestHandler } from './$types';

/** Serves a stored chat image so the chat history can show thumbnails without inlining base64. */
export const GET: RequestHandler = async ({ params }) => {
	const [image] = await db
		.select({ mediaType: schema.messageAttachments.mediaType, data: schema.messageAttachments.data })
		.from(schema.messageAttachments)
		.where(eq(schema.messageAttachments.id, params.id));

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
