import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('index.html SEO & Font Performance Integrity', () => {
  const indexHtmlPath = path.resolve(process.cwd(), 'index.html');
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');

  it('links manifest.webmanifest in <head>', () => {
    expect(indexHtml).toMatch(/<link\s+rel="manifest"\s+href="\/manifest\.webmanifest"\s*\/?>/i);
  });

  it('does not contain render-blocking fonts for Betania Patmos In or Cookie in <head>', () => {
    expect(indexHtml).not.toContain('Betania+Patmos+In');
    expect(indexHtml).not.toContain('Betania Patmos In');
    expect(indexHtml).not.toContain('family=Cookie');
  });

  it('does not contain .seo-fallback styles or 1x1 clipped cloaked text anti-pattern', () => {
    expect(indexHtml).not.toContain('.seo-fallback');
    expect(indexHtml).not.toContain('clip: rect(0, 0, 0, 0)');
    expect(indexHtml).not.toContain('html.js .seo-fallback');
    expect(indexHtml).not.toContain('id="seo-fallback"');
  });
});
