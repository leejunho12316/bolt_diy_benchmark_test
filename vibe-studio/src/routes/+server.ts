import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// First-time visitors land on the example gallery; the project list lives at /projects.
export const GET: RequestHandler = () => {
	redirect(307, '/examples');
};
