import { describe, expect, it } from 'vitest';
import { MAX_BASE64_LENGTH, MAX_IMAGES, uploadPath, uploadUrl } from '#lib/attachments.ts';
import { parseImages } from './attachments.ts';
import { toApiMessages } from './llm/prompt.ts';

const ID = '3f2a9c1e-7b4d-4c1a-9e2f-0a1b2c3d4e5f';
// 1×1 transparent PNG
const PIXEL = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

describe('parseImages', () => {
	it('accepts a missing field as no images', () => {
		expect(parseImages(undefined)).toEqual([]);
	});

	it('keeps valid images and trims names', () => {
		const [image] = parseImages([{ id: ID, mediaType: 'image/png', data: PIXEL, name: 'x'.repeat(300) }]);
		expect(image.mediaType).toBe('image/png');
		expect(image.name).toHaveLength(200);
	});

	it.each([
		['too many', Array.from({ length: MAX_IMAGES + 1 }, () => ({ id: ID, mediaType: 'image/png', data: PIXEL }))],
		['missing id', [{ mediaType: 'image/png', data: PIXEL }]],
		['path-like id', [{ id: '../../etc/passwd', mediaType: 'image/png', data: PIXEL }]],
		['unsupported type', [{ id: ID, mediaType: 'image/svg+xml', data: PIXEL }]],
		['not base64', [{ id: ID, mediaType: 'image/png', data: 'not base64!' }]],
		['too large', [{ id: ID, mediaType: 'image/png', data: 'A'.repeat(MAX_BASE64_LENGTH + 4) }]],
		['not a list', { id: ID, mediaType: 'image/png', data: PIXEL }]
	])('rejects %s', (_name, input) => {
		expect(() => parseImages(input)).toThrow();
	});
});

describe('toApiMessages with images', () => {
	const messages = toApiMessages(
		[
			{ role: 'user', content: '이 디자인처럼 만들어줘', images: [{ mediaType: 'image/png', data: PIXEL }] },
			{ role: 'assistant', content: '참고했습니다.' },
			{
				role: 'user',
				content: '이 아이콘을 ? 버튼에 써줘',
				images: [{ mediaType: 'image/png', data: PIXEL, path: 'static/uploads/3f2a9c1e-help.png' }]
			},
			{ role: 'assistant', content: '만들었습니다.' },
			{ role: 'user', content: '버튼 색만 바꿔줘' }
		],
		{ 'src/routes/+page.svelte': '<h1>hi</h1>' }
	);

	it('puts the images before the text of their turn', () => {
		expect(messages[0].content).toEqual([
			{ type: 'image', source: { type: 'base64', media_type: 'image/png', data: PIXEL } },
			{ type: 'text', text: '이 디자인처럼 만들어줘' }
		]);
	});

	it('tells the model where an uploaded image lives in the project', () => {
		const text = (messages[2].content as { type: string; text?: string }[]).at(-1)?.text ?? '';
		expect(text).toContain('<attached_files>');
		expect(text).toContain('static/uploads/3f2a9c1e-help.png (페이지에서는 /uploads/3f2a9c1e-help.png)');
	});

	it('adds no file note for images without a project path', () => {
		const text = (messages[0].content as { type: string; text?: string }[]).at(-1)?.text ?? '';
		expect(text).toBe('이 디자인처럼 만들어줘');
	});

	it('keeps earlier images in history and adds project files only to the latest turn', () => {
		expect(Array.isArray(messages[0].content)).toBe(true);
		expect(typeof messages[4].content).toBe('string');
		expect(messages[4].content).toContain('<current_project_files>');
		expect(messages[4].content).toContain('버튼 색만 바꿔줘');
	});
});

describe('uploadPath', () => {
	it('builds a safe, unique path under static/uploads', () => {
		expect(uploadPath({ id: ID, name: 'Help Icon (1).PNG', mediaType: 'image/png' })).toBe('static/uploads/3f2a9c1e-help-icon-1.png');
		expect(uploadPath({ id: ID, name: '../../시안.jpeg', mediaType: 'image/jpeg' })).toBe('static/uploads/3f2a9c1e-image.jpg');
	});

	it('maps a project path to the URL the generated app serves', () => {
		expect(uploadUrl('static/uploads/3f2a9c1e-help.png')).toBe('/uploads/3f2a9c1e-help.png');
	});
});
