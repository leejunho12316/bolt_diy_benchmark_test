import type { Handle } from '@sveltejs/kit/hooks';

// WebContainer needs a cross-origin isolated page (SharedArrayBuffer). Same headers as bolt.diy's entry.server.tsx.
export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
	response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');

	return response;
};
