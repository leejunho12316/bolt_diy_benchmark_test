<script lang="ts">
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<!-- SvelteKit reuses a page component when only the [id] param changes. Keying on the project id
     recreates it, so /chat/A → /chat/B disposes A's WebContainer and boots a fresh one for B. -->
{#key page.params.id}
	{@render children()}
{/key}
