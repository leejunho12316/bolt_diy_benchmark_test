import Anthropic from '@anthropic-ai/sdk';
import { ANTHROPIC_API_KEY, ANTHROPIC_MODEL } from '$app/env/private';

export const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

let imageSupport: Promise<boolean | null> | undefined;

/**
 * Whether the configured model accepts image input, from the Models API capabilities.
 * null when it can't be determined (lookup failed or no capability data); the request is then
 * attempted and the API itself reports any problem. Cached for the server's lifetime, but a
 * failed lookup is retried next time.
 */
export function supportsImages(): Promise<boolean | null> {
	imageSupport ??= client.models
		.retrieve(ANTHROPIC_MODEL)
		.then((model) => model.capabilities?.image_input.supported ?? null)
		.catch((error) => {
			console.warn('[llm] could not look up model capabilities', error);
			imageSupport = undefined;
			return null;
		});

	return imageSupport;
}

export { ANTHROPIC_MODEL };
