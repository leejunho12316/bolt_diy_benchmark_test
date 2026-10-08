import { WebContainer } from '@webcontainer/api';

export const WORK_DIR_NAME = 'project';

let instance: Promise<WebContainer> | undefined = import.meta.hot?.data.webcontainer;
// Only one WebContainer may exist per page, so a new boot must wait for the previous teardown.
let teardown: Promise<void> = Promise.resolve();

/** Boots the single WebContainer for this tab, or returns the running one. Browser-only. */
export async function getWebContainer() {
	if (!instance) {
		await teardown;

		instance ??= WebContainer.boot({
			coep: 'credentialless',
			workdirName: WORK_DIR_NAME,
			forwardPreviewErrors: true
		});

		if (import.meta.hot) {
			import.meta.hot.data.webcontainer = instance;
		}
	}

	return instance;
}

/**
 * Tears the container down: every file and running process (dev server) goes with it.
 * Called when a project is opened or left, so one project's files and uploads never
 * leak into another project opened in the same tab.
 */
export function disposeWebContainer() {
	const current = instance;
	instance = undefined;

	if (import.meta.hot) {
		import.meta.hot.data.webcontainer = undefined;
	}

	if (current) {
		teardown = current.then((wc) => wc.teardown()).catch(() => {});
	}

	return teardown;
}
