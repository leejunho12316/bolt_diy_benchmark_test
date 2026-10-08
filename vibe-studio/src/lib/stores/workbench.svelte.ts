// Runs parsed actions against the WebContainer and tracks preview state.
// Simplified port of bolt.diy's ActionRunner (app/lib/runtime/action-runner.ts) + PreviewsStore.
import type { FileSystemTree, WebContainer, WebContainerProcess } from '@webcontainer/api';
import type { ActionCallbackData } from '#lib/runtime/message-parser.ts';
import type { BoltAction } from '#lib/runtime/actions.ts';
import { disposeWebContainer, getWebContainer } from '#lib/webcontainer/index.ts';
import { UPLOADS_DIR, base64ToBytes, uploadPath, type ImageAttachment } from '#lib/attachments.ts';
import { TEMPLATE_FILES } from '#lib/webcontainer/template.ts';

export type ProjectFiles = Record<string, string>;

/** A stored attachment to copy back into the project: its project path and where to download it. */
export interface UploadFile {
	path: string;
	url: string;
}
export type PreviewStatus = 'idle' | 'booting' | 'installing' | 'starting' | 'ready' | 'error';
export type ActionStatus = 'pending' | 'running' | 'complete' | 'failed';

export interface ActionState {
	key: string;
	messageId: string;
	action: BoltAction;
	status: ActionStatus;
}

export interface Alert {
	title: string;
	detail: string;
}

const IGNORED_DIRS = new Set(['node_modules', '.svelte-kit', '.git', 'build', '.vercel']);
const IGNORED_FILES = new Set(['package-lock.json']);
const MAX_LOG_LINES = 300;
const DEV_COMMAND_RE = /^\s*(npm\s+run\s+dev|pnpm\s+(run\s+)?dev|vite(\s+dev)?)\b/;
const INSTALL_COMMAND_RE = /\bnpm\s+(install|i|ci)\b/;
// eslint-disable-next-line no-control-regex
const ANSI_RE = /\x1b\[[0-9;?]*[ -/]*[@-~]/g;

function normalizePath(path: string) {
	return path.replace(/^\/home\/project\//, '').replace(/^\.?\/+/, '');
}

function toTree(files: ProjectFiles): FileSystemTree {
	const tree: FileSystemTree = {};

	for (const [path, contents] of Object.entries(files)) {
		const parts = normalizePath(path).split('/');
		let node = tree;

		parts.forEach((part, index) => {
			if (index === parts.length - 1) {
				node[part] = { file: { contents } };
			} else {
				const existing = node[part];

				if (!existing || !('directory' in existing)) {
					node[part] = { directory: {} };
				}

				node = (node[part] as { directory: FileSystemTree }).directory;
			}
		});
	}

	return tree;
}

export class Workbench {
	status = $state<PreviewStatus>('idle');
	previewUrl = $state<string | null>(null);
	previewKey = $state(0);
	logs = $state<string[]>([]);
	alert = $state<Alert | null>(null);
	actions = $state<Record<string, ActionState>>({});

	#wc: WebContainer | undefined;
	#queue: Promise<void> = Promise.resolve();
	#devProcess: WebContainerProcess | undefined;
	#installedPackageJson = '';

	/**
	 * Boots a fresh WebContainer for this project, mounts its snapshot (or the base template) plus
	 * its uploaded images, installs deps and starts the dev server.
	 */
	async init(files: ProjectFiles | null, uploads: UploadFile[] = []) {
		if (this.status !== 'idle') {
			return;
		}

		try {
			this.status = 'booting';
			// Start clean even if another project's container is still around in this tab.
			await disposeWebContainer();
			const wc = await getWebContainer();
			this.#wc = wc;

			wc.on('server-ready', (_port, url) => {
				this.previewUrl = url;
				this.status = 'ready';
			});

			wc.on('preview-message', (message) => {
				if (message.type === 'PREVIEW_UNCAUGHT_EXCEPTION' || message.type === 'PREVIEW_UNHANDLED_REJECTION') {
					this.alert = {
						title: '미리보기에서 오류가 발생했습니다',
						detail: `${'message' in message ? message.message : 'Unknown error'}\n${message.pathname}${message.search}`
					};
				}
			});

			wc.on('error', ({ message }) => {
				this.alert = { title: 'WebContainer 오류', detail: message };
			});

			await wc.mount(toTree(files ?? TEMPLATE_FILES));
			await this.#restoreUploads(uploads);
			await this.#install();
			await this.#startDevServer();
		} catch (error) {
			this.status = 'error';
			this.alert = { title: '실행 환경을 준비하지 못했습니다', detail: String(error) };
		}
	}

	/** Called from the parser's onActionClose. Actions run strictly in order, like bolt.diy's runner. */
	enqueue({ messageId, actionId, action }: ActionCallbackData) {
		const key = `${messageId}:${actionId}`;
		this.actions[key] = { key, messageId, action, status: 'pending' };

		this.#queue = this.#queue.then(() => this.#run(key));
	}

	/** Runs after a reply finishes: installs dependencies if package.json changed without an install action. */
	async finalize() {
		this.#queue = this.#queue.then(async () => {
			const pkg = await this.#readFile('package.json');

			if (pkg !== null && pkg !== this.#installedPackageJson) {
				await this.#install();
			}

			if (!this.#devProcess) {
				await this.#startDevServer();
			}
		});

		await this.#queue;
	}

	/** Copies newly attached images into the project so generated code can reference them by URL. */
	async writeUploads(images: ImageAttachment[]) {
		for (const image of images) {
			await this.#writeBytes(uploadPath(image), base64ToBytes(image.data));
		}
	}

	/** Leaving the project: tear the container down so nothing carries over to the next one. */
	dispose() {
		this.#wc = undefined;
		this.#devProcess = undefined;
		return disposeWebContainer();
	}

	reloadPreview() {
		this.previewKey++;
	}

	async readProjectFiles(): Promise<ProjectFiles> {
		const wc = this.#wc;

		if (!wc) {
			return {};
		}

		const files: ProjectFiles = {};

		const walk = async (dir: string) => {
			const entries = await wc.fs.readdir(dir, { withFileTypes: true });

			for (const entry of entries) {
				const path = dir === '.' ? entry.name : `${dir}/${entry.name}`;

				if (entry.isDirectory()) {
					// Uploads are binary and already stored per chat in the DB; they are restored from there.
					if (!IGNORED_DIRS.has(entry.name) && path !== UPLOADS_DIR) {
						await walk(path);
					}
				} else if (entry.isFile() && !IGNORED_FILES.has(entry.name)) {
					files[path] = await wc.fs.readFile(path, 'utf-8');
				}
			}
		};

		await walk('.');

		return files;
	}

	async #run(key: string) {
		const state = this.actions[key];
		const { action } = state;
		state.status = 'running';

		try {
			if (action.type === 'file') {
				await this.#writeFile(action.filePath, action.content);
			} else if (action.type === 'start' || DEV_COMMAND_RE.test(action.content)) {
				// The dev server is already running and hot-reloads, so only start it if it isn't.
				if (!this.#devProcess) {
					await this.#startDevServer();
				}
			} else {
				await this.#shell(action.content.trim());
			}

			state.status = 'complete';
		} catch (error) {
			state.status = 'failed';
			this.alert = {
				title: action.type === 'file' ? `파일 저장 실패: ${action.filePath}` : `명령 실패: ${action.content.trim()}`,
				detail: String(error instanceof Error ? error.message : error)
			};
		}
	}

	async #writeFile(filePath: string, content: string) {
		const wc = this.#requireWc();
		const path = normalizePath(filePath);
		const folder = path.split('/').slice(0, -1).join('/');

		if (folder) {
			await wc.fs.mkdir(folder, { recursive: true });
		}

		await wc.fs.writeFile(path, content);
	}

	async #restoreUploads(uploads: UploadFile[]) {
		const results = await Promise.allSettled(
			uploads.map(async ({ path, url }) => {
				const response = await fetch(url);

				if (!response.ok) {
					throw new Error(`${path}: ${response.status}`);
				}

				await this.#writeBytes(path, new Uint8Array(await response.arrayBuffer()));
			})
		);
		const failed = results.filter((r) => r.status === 'rejected').length;

		if (failed > 0) {
			this.alert = { title: '첨부 이미지를 복원하지 못했습니다', detail: `${failed}개 파일을 프로젝트에 넣지 못했습니다.` };
		}
	}

	async #writeBytes(path: string, bytes: Uint8Array) {
		const wc = this.#requireWc();
		await wc.fs.mkdir(path.split('/').slice(0, -1).join('/'), { recursive: true });
		await wc.fs.writeFile(path, bytes);
	}

	async #readFile(path: string) {
		try {
			return await this.#requireWc().fs.readFile(path, 'utf-8');
		} catch {
			return null;
		}
	}

	async #shell(command: string) {
		const exitCode = await this.#spawnAndWait('jsh', ['-c', command]);

		if (INSTALL_COMMAND_RE.test(command)) {
			this.#installedPackageJson = (await this.#readFile('package.json')) ?? '';
		}

		if (exitCode !== 0) {
			throw new Error(`exit code ${exitCode}\n${this.logs.slice(-15).join('\n')}`);
		}
	}

	async #install() {
		const previous = this.status;
		this.status = 'installing';

		const exitCode = await this.#spawnAndWait('npm', ['install', '--no-audit', '--no-fund']);
		this.#installedPackageJson = (await this.#readFile('package.json')) ?? '';

		if (exitCode !== 0) {
			this.status = 'error';
			throw new Error(`npm install failed (exit code ${exitCode})`);
		}

		this.status = previous === 'ready' ? 'ready' : 'starting';
	}

	async #startDevServer() {
		const wc = this.#requireWc();

		if (this.status !== 'ready') {
			this.status = 'starting';
		}

		const process = await wc.spawn('npm', ['run', 'dev']);
		this.#devProcess = process;
		this.#pipeLogs(process);

		// dispose() clears #devProcess before tearing down, so a teardown-killed server is not reported;
		// teardown rejects the exit promise ("Process aborted"), which is expected there.
		process.exit
			.then((code) => {
				if (this.#devProcess === process) {
					this.#devProcess = undefined;
					this.status = 'error';
					this.alert = {
						title: '개발 서버가 종료되었습니다',
						detail: `exit code ${code}\n${this.logs.slice(-20).join('\n')}`
					};
				}
			})
			.catch(() => {});
	}

	async #spawnAndWait(command: string, args: string[]) {
		const process = await this.#requireWc().spawn(command, args);
		this.#pipeLogs(process);

		return process.exit;
	}

	#pipeLogs(process: WebContainerProcess) {
		process.output.pipeTo(
			new WritableStream({
				write: (chunk) => {
					const lines = chunk
						.replace(ANSI_RE, '')
						.split(/\r?\n/)
						.map((line) => line.trimEnd())
						.filter(Boolean);

					if (lines.length > 0) {
						this.logs = [...this.logs, ...lines].slice(-MAX_LOG_LINES);
					}
				}
			})
		).catch(() => {
			// The stream aborts when the container is torn down (project switch); nothing to report.
		});
	}

	#requireWc() {
		if (!this.#wc) {
			throw new Error('WebContainer is not ready');
		}

		return this.#wc;
	}
}
