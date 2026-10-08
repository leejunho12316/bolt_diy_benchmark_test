import { describe, expect, it } from 'vitest';
import { StreamingMessageParser } from './message-parser.ts';

describe('StreamingMessageParser action ids', () => {
	it('assigns distinct ids even when only onActionClose is registered', () => {
		const ids: string[] = [];
		const parser = new StreamingMessageParser({
			callbacks: { onActionClose: ({ actionId }) => ids.push(actionId) }
		});

		parser.parse(
			'm1',
			'<boltArtifact id="a" title="A"><boltAction type="file" filePath="a.ts">A</boltAction><boltAction type="shell">npm install</boltAction></boltArtifact>'
		);

		expect(ids).toEqual(['0', '1']);
	});
});
