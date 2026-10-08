import { fail, redirect } from '@sveltejs/kit';
import { db, schema } from '#lib/server/db/index.ts';
import { countBlocks, parseLayout } from '#lib/builder/validate.ts';
import { defaultProps, type Layout } from '#lib/builder/types.ts';
import { listDesigns, resolveDesignChoice } from '#lib/server/design/catalog.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ designs: listDesigns() });

/** Chat title from the wireframe: logo text, else the header's site name, ignoring untouched defaults. */
function projectName(layout: Layout) {
	const blocks = layout.pages.flatMap((page) => page.blocks);

	for (const [type, key] of [['logo', 'text'], ['header', 'brand']] as const) {
		const value = String(blocks.find((b) => b.type === type)?.props[key] ?? '').trim();

		if (value && value !== defaultProps(type)[key]) {
			return value.slice(0, 60);
		}
	}

	return null;
}

export const actions = {
	/** Creates a chat from the wireframe and the design template picked in the drawer. */
	start: async ({ request }) => {
		const form = await request.formData();
		const raw = form.get('layout');
		const design = resolveDesignChoice(form.get('design'));
		let layout;

		if (design === undefined) {
			return fail(400, { error: '알 수 없는 디자인 템플릿입니다' });
		}

		try {
			layout = parseLayout(JSON.parse(String(raw)));
		} catch (error) {
			return fail(400, { error: error instanceof Error ? error.message : '구성을 읽지 못했습니다' });
		}

		if (countBlocks(layout) === 0) {
			return fail(400, { error: '블록을 하나 이상 배치해 주세요' });
		}

		const id = crypto.randomUUID();

		await db.insert(schema.chats).values({
			id,
			title: projectName(layout) ?? '새 프로젝트',
			layout: JSON.stringify(layout),
			design
		});

		redirect(303, `/chat/${id}`);
	},

	/** The old entry point: an empty chat that starts from a typed prompt. */
	blank: async () => {
		const id = crypto.randomUUID();
		await db.insert(schema.chats).values({ id });

		redirect(303, `/chat/${id}`);
	}
} satisfies Actions;
