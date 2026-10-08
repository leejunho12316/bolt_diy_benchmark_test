// Image attachments for chat requests, shared by the chat UI and /api/chat.

export const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'] as const;
export type ImageMediaType = (typeof IMAGE_TYPES)[number];

export const MAX_IMAGES = 5;
/** Claude downsamples anything larger, so resizing first only saves upload and storage. */
export const MAX_EDGE = 1568;
/** API limit per image is 5 MB; base64 adds a third. */
export const MAX_BASE64_LENGTH = Math.floor((5 * 1024 * 1024 * 4) / 3);

export interface ImageAttachment {
	mediaType: ImageMediaType;
	/** Base64 without the data: prefix. */
	data: string;
	name: string;
}

export function isImageType(value: unknown): value is ImageMediaType {
	return typeof value === 'string' && (IMAGE_TYPES as readonly string[]).includes(value);
}

/**
 * Browser only: decodes an image file, scales its long edge down to MAX_EDGE and re-encodes it
 * (PNG keeps transparency; everything else becomes JPEG). GIFs lose animation, which Claude ignores anyway.
 */
export async function prepareImage(file: File): Promise<ImageAttachment> {
	if (!isImageType(file.type)) {
		throw new Error(`${file.name}: PNG, JPEG, GIF, WebP 이미지만 첨부할 수 있습니다.`);
	}

	const bitmap = await createImageBitmap(file);
	const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
	const width = Math.round(bitmap.width * scale);
	const height = Math.round(bitmap.height * scale);

	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height);
	bitmap.close();

	const mediaType: ImageMediaType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
	const dataUrl = canvas.toDataURL(mediaType, 0.9);
	const data = dataUrl.slice(dataUrl.indexOf(',') + 1);

	if (data.length > MAX_BASE64_LENGTH) {
		throw new Error(`${file.name}: 이미지가 너무 큽니다.`);
	}

	return { mediaType, data, name: file.name };
}

export const toDataUrl = (image: Pick<ImageAttachment, 'mediaType' | 'data'>) =>
	`data:${image.mediaType};base64,${image.data}`;
