import { MAX_BASE64_LENGTH, MAX_IMAGES, isImageType, type ImageAttachment } from '#lib/attachments.ts';

const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/;

/** Validates the `images` field of a chat request. Throws with a user-facing message. */
export function parseImages(raw: unknown): ImageAttachment[] {
	if (raw === undefined || raw === null) {
		return [];
	}

	if (!Array.isArray(raw) || raw.length > MAX_IMAGES) {
		throw new Error(`이미지는 한 번에 ${MAX_IMAGES}장까지 첨부할 수 있습니다.`);
	}

	return raw.map((item, i) => {
		const { mediaType, data, name } = (item ?? {}) as Record<string, unknown>;

		if (!isImageType(mediaType)) {
			throw new Error(`${i + 1}번째 이미지: PNG, JPEG, GIF, WebP만 첨부할 수 있습니다.`);
		}

		if (typeof data !== 'string' || data.length === 0 || data.length > MAX_BASE64_LENGTH || !BASE64_RE.test(data)) {
			throw new Error(`${i + 1}번째 이미지: 이미지 데이터가 올바르지 않거나 너무 큽니다.`);
		}

		return { mediaType, data, name: typeof name === 'string' ? name.slice(0, 200) : '' };
	});
}
