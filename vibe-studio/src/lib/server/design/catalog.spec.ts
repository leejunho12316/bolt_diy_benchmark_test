import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildSystem } from '../llm/prompt.ts';
import { getDesign, listDesigns, parseSkill, resolveDesignChoice } from './catalog.ts';

describe('design catalog', () => {
	const designs = listDesigns();

	it('ships ten templates with the existing gov-portal skill first', () => {
		expect(designs).toHaveLength(10);
		expect(designs[0].id).toBe('gov-portal');
	});

	it('gives every template a title, description, tags and a generated preview image', () => {
		for (const design of designs) {
			expect(design.title, design.id).not.toBe(design.id);
			expect(design.description.length, design.id).toBeGreaterThan(10);
			expect(design.tags.length, design.id).toBeGreaterThan(0);
			expect(existsSync(resolve('static', design.preview.slice(1))), `${design.preview} (run pnpm design:previews)`).toBe(true);
		}
	});

	it('returns the guide body without frontmatter', () => {
		const body = getDesign('minimal-mono')?.body ?? '';
		expect(body.startsWith('# 미니멀 모노크롬')).toBe(true);
		expect(body).not.toContain('tags:');
		expect(getDesign('nope')).toBeNull();
	});

	it('rejects a SKILL.md without frontmatter', () => {
		expect(() => parseSkill('broken', '# no frontmatter')).toThrow();
	});
});

describe('resolveDesignChoice', () => {
	it('treats an empty or missing value as the 기본 option', () => {
		expect(resolveDesignChoice('')).toBeNull();
		expect(resolveDesignChoice(null)).toBeNull();
	});

	it('accepts known ids and rejects unknown ones', () => {
		expect(resolveDesignChoice('saas-clean')).toBe('saas-clean');
		expect(resolveDesignChoice('../secrets')).toBeUndefined();
	});
});

describe('buildSystem', () => {
	it('sends only the base prompt without a design', () => {
		const blocks = buildSystem(null);
		expect(blocks).toHaveLength(1);
		expect(blocks[0].cache_control).toEqual({ type: 'ephemeral' });
	});

	it('adds the design guide as a second cached block', () => {
		const blocks = buildSystem(getDesign('neo-brutal')!.body);
		expect(blocks).toHaveLength(2);
		expect(blocks[1].cache_control).toEqual({ type: 'ephemeral' });
		expect(blocks[1].text.startsWith('<design_guide>')).toBe(true);
		expect(blocks[1].text).toContain('# 네오 브루탈리즘 스킬');
		expect(blocks[1].text.trimEnd().endsWith('</design_guide>')).toBe(true);
	});
});
