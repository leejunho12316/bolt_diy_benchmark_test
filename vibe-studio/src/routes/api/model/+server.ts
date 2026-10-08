import { json } from '@sveltejs/kit';
import { ANTHROPIC_MODEL, supportsImages } from '#lib/server/llm/client.ts';
import type { RequestHandler } from './$types';

/** What the chat UI needs to know about the configured model. imageInput is null when unknown. */
export const GET: RequestHandler = async () => {
	return json({ model: ANTHROPIC_MODEL, imageInput: await supportsImages() });
};
