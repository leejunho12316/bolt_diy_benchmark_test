// Minimal SvelteKit 2 project mounted before the first prompt so `npm install` runs while the user types.
// Pinned to Vite 6 (esbuild) rather than Vite 8 (rolldown native bindings) for WebContainer compatibility.
export const TEMPLATE_FILES: Record<string, string> = {
	'package.json': JSON.stringify(
		{
			name: 'vibe-app',
			private: true,
			version: '0.0.1',
			type: 'module',
			scripts: {
				dev: 'vite dev',
				build: 'vite build',
				preview: 'vite preview',
				prepare: "svelte-kit sync || echo ''"
			},
			devDependencies: {
				'@sveltejs/adapter-auto': '^6.1.1',
				'@sveltejs/kit': '^2.70.3',
				'@sveltejs/vite-plugin-svelte': '^5.1.1',
				svelte: '^5.57.2',
				typescript: '^5.8.0',
				vite: '^6.4.4'
			}
		},
		null,
		2
	) + '\n',
	'svelte.config.js': `import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: { adapter: adapter() }
};

export default config;
`,
	'vite.config.ts': `import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()]
});
`,
	'tsconfig.json': JSON.stringify(
		{
			extends: './.svelte-kit/tsconfig.json',
			compilerOptions: {
				allowJs: true,
				checkJs: true,
				esModuleInterop: true,
				forceConsistentCasingInFileNames: true,
				resolveJsonModule: true,
				skipLibCheck: true,
				sourceMap: true,
				strict: true,
				moduleResolution: 'bundler'
			}
		},
		null,
		2
	) + '\n',
	'src/app.html': `<!doctype html>
<html lang="ko">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>
`,
	'src/app.d.ts': `declare global {
	namespace App {}
}

export {};
`,
	'src/routes/+page.svelte': `<main>
	<h1>Vibe Studio</h1>
	<p>왼쪽 채팅창에 만들고 싶은 앱을 설명해 보세요.</p>
</main>

<style>
	main {
		min-height: 100vh;
		display: grid;
		place-content: center;
		text-align: center;
		font-family: system-ui, sans-serif;
		color: #334155;
	}

	h1 {
		margin: 0 0 0.5rem;
		font-size: 2rem;
	}
</style>
`
};
