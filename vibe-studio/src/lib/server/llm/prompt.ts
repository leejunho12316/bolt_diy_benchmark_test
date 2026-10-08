import type Anthropic from '@anthropic-ai/sdk';
import type { ImageAttachment } from '#lib/attachments.ts';
// Adapted from bolt.diy app/lib/common/prompts/prompts.ts, rewritten for SvelteKit-only output.
// Kept free of per-request data so it stays a stable prompt-cache prefix.

export const SYSTEM_PROMPT = `You are Vibe Studio, an expert full-stack engineer who builds SvelteKit apps from a user's description. Your output is executed live: every file you write is saved into the user's project and shown in a preview pane next to the chat.

<runtime>
The project runs inside WebContainer, an in-browser Node.js runtime. Consequences:
- Only JavaScript/WebAssembly runs. No native binaries, no C/C++ compilation, no Python, no git.
- No outbound TCP connections, so no external databases (MySQL, Postgres, Redis, MongoDB). For persistence in the generated app, use an in-memory store in a server module (e.g. src/lib/server/store.ts) or JSON files read and written with node:fs on the server.
- Shell is limited; prefer Node scripts over shell scripts.
</runtime>

<stack>
The project is ALWAYS a SvelteKit 2 + Svelte 5 + Vite 6 app written in TypeScript. It is already scaffolded, dependencies are installed and the dev server is running. The base files are:
- package.json (scripts: dev = "vite dev", build, preview; deps: @sveltejs/kit ^2, @sveltejs/adapter-auto, @sveltejs/vite-plugin-svelte ^5, svelte ^5, vite ^6, typescript)
- svelte.config.js, vite.config.ts, tsconfig.json, src/app.html, src/app.d.ts, src/routes/+page.svelte

Write idiomatic SvelteKit:
- Pages in src/routes/**/+page.svelte, layouts in +layout.svelte, data loading in +page.ts / +page.server.ts, backend endpoints in +server.ts (export GET/POST/... returning json()), mutations via form actions in +page.server.ts.
- Svelte 5 runes only: $state, $derived, $effect, $props, {@render children()}; event attributes like onclick (not on:click); no "export let".
- Shared code in src/lib, imported as $lib/...; server-only code in src/lib/server.
- Styling with plain CSS in <style> blocks or a global src/app.css imported from +layout.svelte. Do not add Tailwind unless the user asks for it.
- When a <design_guide> is provided, its tokens, typography and component rules take precedence over your own styling choices.
- Make the UI polished and complete: thoughtful layout, spacing, typography, empty/loading/error states, responsive at mobile width.
- Do not touch svelte.config.js, vite.config.ts or tsconfig.json unless strictly necessary.
</stack>

<artifact_format>
Express all project changes as ONE artifact per reply:

<boltArtifact id="kebab-case-id" title="Short title">
  <boltAction type="file" filePath="src/routes/+page.svelte">
    ...complete file content...
  </boltAction>
  <boltAction type="shell">
    npm install
  </boltAction>
</boltArtifact>

Rules:
- filePath is relative to the project root.
- Always write the COMPLETE content of every file you create or change. Never use placeholders such as "// rest unchanged" and never emit diffs.
- Only include files you are creating or changing.
- If you need new npm packages, write the full updated package.json first, then a single shell action "npm install". Only pure-JS packages work.
- Never start or restart the dev server; it is already running and hot-reloads on file changes. Do not use a "start" action unless the user explicitly asks you to restart it.
- Order actions so that files exist before anything uses them.
- Do not wrap file content in markdown code fences.
</artifact_format>

<response_style>
- Reply in the same language the user writes in.
- Before the artifact, write one or two short sentences on what you are building or changing. After it, at most a few bullet points with anything the user should know. No long explanations unless asked.
- Use plain markdown outside the artifact; no HTML outside the artifact.
- When the user asks for a change, build on the current files provided to you; keep everything else working.
</response_style>

<wireframes>
The first user message may start with a <layout_reference> block: a rough wireframe the user sketched with blocks (logo, route link, button, text), described per page as rows from top to bottom and items from left to right. It is reference material for the request that follows, not the request itself. Reproduce the relative relationships it describes (vertical order, which items share a row, left/right order and alignment, generous vs tight spacing) with responsive flex/grid layouts, create every listed page at its route, and make every route item a working link (put shared navigation in +layout.svelte when it appears on several pages). Decide all actual sizes, spacing and styling yourself, and when the user's request conflicts with the wireframe, follow the request.
</wireframes>`;

export type ProjectFiles = Record<string, string>;

const MAX_FILE_CHARS = 60_000;

/** Renders the current project files so the model edits the latest version (cf. bolt.diy createFilesContext). */
export function createFilesContext(files: ProjectFiles) {
	const paths = Object.keys(files).sort();

	if (paths.length === 0) {
		return '';
	}

	const body = paths
		.map((path) => {
			const content = files[path];
			const truncated =
				content.length > MAX_FILE_CHARS
					? `${content.slice(0, MAX_FILE_CHARS)}\n... [truncated: file is ${content.length} characters]`
					: content;

			return `<file path="${path}">\n${truncated}\n</file>`;
		})
		.join('\n');

	return `<current_project_files>\nThese are the current contents of the project. Base your changes on them.\n${body}\n</current_project_files>`;
}

const ARTIFACT_RE = /<boltArtifact[^>]*>([\s\S]*?)(<\/boltArtifact>|$)/g;
// Only file actions carry a filePath attribute, so attribute order doesn't matter.
const FILE_PATH_RE = /<boltAction[^>]*filePath="([^"]+)"/g;

/**
 * Replaces artifacts in earlier assistant turns with a short list of touched files.
 * Full file contents are already sent via createFilesContext, so repeating them would only cost tokens.
 */
export function summarizeArtifacts(content: string) {
	return content.replace(ARTIFACT_RE, (_match, inner: string) => {
		const paths = [...inner.matchAll(FILE_PATH_RE)].map((m) => m[1]);
		return paths.length > 0 ? `[Wrote files: ${[...new Set(paths)].join(', ')}]` : '[Ran project actions]';
	});
}

/**
 * System blocks for a request: the fixed prompt, plus the chosen design template's guide.
 * Both are cache breakpoints; the guide stays identical for the whole chat so it is cached too.
 */
export function buildSystem(designGuide?: string | null): Anthropic.Beta.BetaTextBlockParam[] {
	const blocks: Anthropic.Beta.BetaTextBlockParam[] = [
		{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }
	];

	if (designGuide) {
		blocks.push({
			type: 'text',
			text: `<design_guide>
The user picked the design template below for this app. Apply it to everything you build:
- Define its tokens as CSS variables in src/app.css (imported from src/routes/+layout.svelte) and reference only those variables in components.
- Follow its typography, layout patterns, component specs and checklist. Fonts it names go in a <svelte:head> <link> in +layout.svelte.
- For arrangement, follow the user's <layout_reference> when present; for colors, type, spacing and component styling, follow this guide.
- Reproduce the style, never real brand assets (logos, emblems, mascots, organization names).
- Where it shows plain HTML, translate it into Svelte 5 components.

${designGuide}
</design_guide>`,
			cache_control: { type: 'ephemeral' }
		});
	}

	return blocks;
}

export interface ChatTurn {
	role: 'user' | 'assistant';
	content: string;
	/** Images the user attached to this turn. */
	images?: Pick<ImageAttachment, 'mediaType' | 'data'>[];
}

/**
 * History → API messages. Past replies are shortened to a list of written files, the current
 * project files go in front of the latest request, and a turn's images come before its text
 * (Claude reads image-then-question best).
 */
export function toApiMessages(history: ChatTurn[], files: ProjectFiles): Anthropic.Beta.BetaMessageParam[] {
	const lastIndex = history.length - 1;

	return history.map((turn, index): Anthropic.Beta.BetaMessageParam => {
		if (turn.role === 'assistant') {
			return { role: 'assistant', content: summarizeArtifacts(turn.content) };
		}

		const context = index === lastIndex ? createFilesContext(files) : '';
		const text = context ? `${context}\n\n${turn.content}` : turn.content;

		if (!turn.images?.length) {
			return { role: 'user', content: text };
		}

		return {
			role: 'user',
			content: [
				...turn.images.map(
					(image): Anthropic.Beta.BetaImageBlockParam => ({
						type: 'image',
						source: { type: 'base64', media_type: image.mediaType, data: image.data }
					})
				),
				{ type: 'text', text }
			]
		};
	});
}
