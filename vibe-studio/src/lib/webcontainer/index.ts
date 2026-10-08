import { WebContainer } from '@webcontainer/api';

export const WORK_DIR_NAME = 'project';

let instance: Promise<WebContainer> | undefined = import.meta.hot?.data.webcontainer;

/** Boots the single WebContainer for this tab (only one may exist per page). Browser-only. */
export function getWebContainer() {
	if (!instance) {
		instance = WebContainer.boot({
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
