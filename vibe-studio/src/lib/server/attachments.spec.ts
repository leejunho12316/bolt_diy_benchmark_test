import { describe, expect, it } from 'vitest';
import { MAX_BASE64_LENGTH, MAX_IMAGES } from '#lib/attachments.ts';
import { parseImages } from './attachments.ts';
import { toApiMessages } from './llm/prompt.ts';

// 1×1 transparent PNG
const PIXEL = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

describe('parseImages', () => {
	it('accepts a missing field as no images', () => {
		expect(parseImages(undefined)).toEqual([]);
	});

	it('keeps valid images and trims names', () => {
		const [image] = parseImages([{ mediaType: 'image/png', data: PIXEL, name: 'x'.repeat(300) }]);
		expect(image.mediaType).toBe('image/png');
		expect(image.name).toHaveLength(200);
	});

	it.each([
		['too many', Array.from({ length: MAX_IMAGES + 1 }, () => ({ mediaType: 'image/png', data: PIXEL }))],
		['unsupported type', [{ mediaType: 'image/svg+xml', data: PIXEL }]],
		['not base64', [{ mediaType: 'image/png', data: 'not base64!' }]],
		['too large', [{ mediaType: 'image/png', data: 'A'.repeat(MAX_BASE64_LENGTH + 4) }]],
		['not a list', { mediaType: 'image/png', data: PIXEL }]
	])('rejects %s', (_name, input) => {
		expect(() => parseImages(input)).toThrow();
	});
});

describe('toApiMessages with images', () => {
	const messages = toApiMessages(
		[
			{ role: 'user', content: '이 디자인처럼 만들어줘', images: [{ mediaType: 'image/png', data: PIXEL }] },
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

	it('keeps earlier images in history and adds project files only to the latest turn', () => {
		expect(Array.isArray(messages[0].content)).toBe(true);
		expect(typeof messages[2].content).toBe('string');
		expect(messages[2].content).toContain('<current_project_files>');
		expect(messages[2].content).toContain('버튼 색만 바꿔줘');
	});
});
