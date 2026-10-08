// Renders design-skills/<id>/preview.html to static/design-previews/<id>.png (640×400) for the
// design drawer cards. Uses the system Chrome; set CHROME_PATH if it is not in the default spot.
import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';

const root = resolve(import.meta.dirname, '..');
const skillsDir = join(root, 'design-skills');
const outDir = join(root, 'static', 'design-previews');

const chromePath =
	process.env.CHROME_PATH ??
	[
		'C:/Program Files/Google/Chrome/Application/chrome.exe',
		'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
		'/usr/bin/google-chrome'
	].find((p) => existsSync(p));

if (!chromePath) {
	throw new Error('Chrome을 찾지 못했습니다. CHROME_PATH 환경변수로 경로를 지정하세요.');
}

const only = process.argv.slice(2);
const ids = readdirSync(skillsDir).filter(
	(id) => existsSync(join(skillsDir, id, 'preview.html')) && (only.length === 0 || only.includes(id))
);

const browser = await chromium.launch({ executablePath: chromePath });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 0.5 });

for (const id of ids) {
	await page.goto(pathToFileURL(join(skillsDir, id, 'preview.html')).href, { waitUntil: 'networkidle' });
	await page.evaluate(() => document.fonts.ready);
	await page.screenshot({ path: join(outDir, `${id}.png`) });
	console.log(`✓ ${id}`);
}

await browser.close();
