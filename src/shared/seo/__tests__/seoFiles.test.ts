import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('SEO static files integrity (robots.txt & sitemap.xml)', () => {
  const robotsTxtPath = path.resolve(process.cwd(), 'public/robots.txt');
  const sitemapXmlPath = path.resolve(process.cwd(), 'public/sitemap.xml');

  const robotsTxt = fs.readFileSync(robotsTxtPath, 'utf-8');
  const sitemapXml = fs.readFileSync(sitemapXmlPath, 'utf-8');

  describe('robots.txt', () => {
    it('declares the canonical sitemap location', () => {
      expect(robotsTxt).toMatch(/^Sitemap:\s*https:\/\/tracker\.ojeet\.tech\/sitemap\.xml$/m);
    });

    it('contains Disallow rules for /import, /invite/, and /api/ under User-agent: *', () => {
      const generalAgentSection = robotsTxt.split(/User-agent:\s*\*/)[1];
      expect(generalAgentSection).toBeDefined();

      expect(generalAgentSection).toMatch(/Disallow:\s*\/import/);
      expect(generalAgentSection).toMatch(/Disallow:\s*\/invite\//);
      expect(generalAgentSection).toMatch(/Disallow:\s*\/api\//);
    });

    it('contains Disallow rules for /import, /invite/, and /api/ for search and AI crawlers', () => {
      const aiBotsSection = robotsTxt.split(/User-agent:\s*CCBot/)[0];
      expect(aiBotsSection).toContain('GPTBot');
      expect(aiBotsSection).toContain('ClaudeBot');
      expect(aiBotsSection).toContain('PerplexityBot');

      expect(aiBotsSection).toMatch(/Disallow:\s*\/import/);
      expect(aiBotsSection).toMatch(/Disallow:\s*\/invite\//);
      expect(aiBotsSection).toMatch(/Disallow:\s*\/api\//);
    });

    it('disallows bulk non-citing crawler CCBot', () => {
      expect(robotsTxt).toMatch(/User-agent:\s*CCBot\s*\nDisallow:\s*\//);
    });
  });

  describe('sitemap.xml', () => {
    const REQUIRED_INDEXABLE_ROUTES = [
      '/jee-syllabus-tracker',
      '/neet-syllabus-tracker',
      '/physics',
      '/chemistry',
      '/maths',
      '/biology',
      '/jee-study-planner',
      '/neet-study-planner',
      '/jee-study-timer',
      '/neet-study-timer',
      '/jee-mock-scores',
      '/neet-mock-scores',
      '/reports',
      '/support',
      '/community',
      '/changelog',
      '/privacy-policy',
      '/terms-of-service',
      '/llms.txt',
      '/pricing.md',
    ];

    const DISALLOWED_ROUTES = ['/import', '/invite', '/api'];

    it('conforms to sitemap schema structure', () => {
      expect(sitemapXml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(sitemapXml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    });

    it('contains all required public, indexable routes', () => {
      for (const route of REQUIRED_INDEXABLE_ROUTES) {
        const expectedLoc = `<loc>https://tracker.ojeet.tech${route}</loc>`;
        expect(sitemapXml, `Missing indexable route: ${expectedLoc}`).toContain(expectedLoc);
      }
    });

    it('excludes disallowed and internal utility routes', () => {
      for (const disallowed of DISALLOWED_ROUTES) {
        expect(sitemapXml).not.toContain(`https://tracker.ojeet.tech${disallowed}`);
      }
      // Ensure root alias is not present as a separate URL entry
      expect(sitemapXml).not.toContain('<loc>https://tracker.ojeet.tech/</loc>');
      expect(sitemapXml).not.toContain('<loc>https://tracker.ojeet.tech</loc>');
    });

    it('has a valid W3C ISO YYYY-MM-DD lastmod timestamp for every url entry', () => {
      const locMatches = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)];
      const lastmodMatches = [...sitemapXml.matchAll(/<lastmod>(.*?)<\/lastmod>/g)];

      expect(locMatches.length).toBeGreaterThan(0);
      expect(locMatches.length).toBe(lastmodMatches.length);

      const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

      for (const match of lastmodMatches) {
        const dateStr = match[1];
        expect(dateStr).toMatch(isoDatePattern);

        const parsed = Date.parse(dateStr);
        expect(Number.isNaN(parsed)).toBe(false);
      }
    });
  });
});
