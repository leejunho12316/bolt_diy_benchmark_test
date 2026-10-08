import { error } from '@sveltejs/kit';
import { findExample } from '#lib/examples/catalog.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const example = findExample(params.slug);

	if (!example) {
		error(404, '없는 예시입니다');
	}

	return { example };
};
