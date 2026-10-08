import { StreamingMessageParser } from '#lib/runtime/message-parser.ts';

export interface ChatMessage {
	id: string;
	role: 'user' | 'assistant';
	/** Text with artifacts stripped out. */
	text: string;
	/** File paths written by this message (shown for messages loaded from history). */
	files: string[];
	/** Image URLs attached to a user message (data: URLs while sending, /api/attachments/<id> after). */
	images?: string[];
	streaming?: boolean;
}

export interface StoredMessage {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	/** Ids of images attached to a user message. */
	attachmentIds?: string[];
}

/** Re-parses a saved assistant reply into display text plus the files it wrote, without executing anything. */
export function toChatMessage(stored: StoredMessage): ChatMessage {
	if (stored.role === 'user') {
		const images = stored.attachmentIds?.map((id) => `/api/attachments/${id}`);
		return { id: stored.id, role: 'user', text: stored.content, files: [], images };
	}

	const files: string[] = [];
	const parser = new StreamingMessageParser({
		artifactElement: () => '',
		callbacks: {
			onActionClose: ({ action }) => {
				if (action.type === 'file' && !files.includes(action.filePath)) {
					files.push(action.filePath);
				}
			}
		}
	});

	return { id: stored.id, role: 'assistant', text: parser.parse(stored.id, stored.content), files };
}
