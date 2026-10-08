import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	ANTHROPIC_API_KEY: {
		description: 'Anthropic API key used by /api/chat'
	},
	ANTHROPIC_MODEL: {
		description: 'Claude model id for code generation',
		schema: (value) => value || 'claude-opus-5-5'
	},
	DATABASE_PATH: {
		description: 'SQLite database file path, created on first run',
		schema: (value) => value || 'data/vibe-studio.db'
	}
});
