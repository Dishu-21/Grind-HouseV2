import { describe, it, expect } from 'vitest';
import handler, {
  normalizeSubject,
  isBotRequest,
  isMarkdownRequest,
  generateSyllabusMarkdown,
  generateSyllabusHTML,
} from './subject-prerender.js';

describe('Subject Prerender & Markdown Content Negotiation', () => {
  describe('normalizeSubject', () => {
    it('normalizes valid subjects and aliases', () => {
      expect(normalizeSubject('physics')).toBe('physics');
      expect(normalizeSubject('/physics/')).toBe('physics');
      expect(normalizeSubject('PHYSICS')).toBe('physics');
      expect(normalizeSubject('chemistry')).toBe('chemistry');
      expect(normalizeSubject('maths')).toBe('maths');
      expect(normalizeSubject('math')).toBe('maths'); // alias
      expect(normalizeSubject('/math/')).toBe('maths');
      expect(normalizeSubject('biology')).toBe('biology');
    });

    it('rejects unsupported subjects', () => {
      expect(normalizeSubject('history')).toBeNull();
      expect(normalizeSubject('')).toBeNull();
      expect(normalizeSubject(undefined)).toBeNull();
      expect(normalizeSubject(null)).toBeNull();
    });
  });

  describe('isBotRequest', () => {
    it('detects AI search crawlers and LLM agents', () => {
      const bots = [
        'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)',
        'Mozilla/5.0 (compatible; ChatGPT-User/1.0; +https://openai.com/bot)',
        'Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/bot)',
        'Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
        'anthropic-ai',
        'Google-Extended',
        'Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)',
        'cohere-ai',
        'OAI-SearchBot',
        'Bytespider',
        'Diffbot',
        'FacebookBot',
        'Meta-ExternalAgent',
        'Applebot-Extended',
        'Googlebot/2.1 (+http://www.google.com/bot.html)',
        'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)',
        'Twitterbot/1.0',
        'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'WhatsApp/2.21.12.21 I',
        'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)',
        'TelegramBot (like TwitterBot)',
        'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
      ];

      for (const ua of bots) {
        expect(isBotRequest(ua), `Expected ${ua} to be detected as bot`).toBe(true);
      }
    });

    it('distinguishes standard browsers from bots', () => {
      const browsers = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
        'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36',
      ];

      for (const ua of browsers) {
        expect(isBotRequest(ua), `Expected ${ua} not to be detected as bot`).toBe(false);
      }
    });
  });

  describe('isMarkdownRequest', () => {
    it('detects markdown request headers', () => {
      expect(isMarkdownRequest('text/markdown')).toBe(true);
      expect(isMarkdownRequest('text/x-markdown')).toBe(true);
      expect(isMarkdownRequest('text/html, text/markdown;q=0.9')).toBe(true);
    });

    it('detects query parameter overrides', () => {
      expect(isMarkdownRequest('', { format: 'markdown' })).toBe(true);
      expect(isMarkdownRequest('', { markdown: 'true' })).toBe(true);
    });

    it('returns false for standard browser accept headers', () => {
      expect(
        isMarkdownRequest(
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
        )
      ).toBe(false);
      expect(isMarkdownRequest('application/json')).toBe(false);
      expect(isMarkdownRequest('')).toBe(false);
    });
  });

  describe('generateSyllabusMarkdown', () => {
    it('generates structured, compact Markdown for Physics', () => {
      const md = generateSyllabusMarkdown('physics');
      expect(md).toContain('# Physics Syllabus');
      expect(md).toContain('https://tracker.ojeet.tech/physics');
      expect(md).toContain('## Metadata');
      expect(md).toContain('Total Units / Chapters**: 25');
      expect(md).toContain('Total Subtopics**: 201');
      expect(md).toContain('### Unit 1: Units and Measurements');
      expect(md).toContain('- [ ] Units of measurements');
      expect(md).toContain('- [ ] Dimensional analysis and its applications');
      expect(md).toContain('### Unit 25: Semiconductor Electronics');
    });

    it('generates structured Markdown for Chemistry with Physical, Inorganic, and Organic branches', () => {
      const md = generateSyllabusMarkdown('chemistry');
      expect(md).toContain('# Chemistry Syllabus');
      expect(md).toContain('Total Units / Chapters**: 25');
      expect(md).toContain('### Physical Chemistry');
      expect(md).toContain('#### Unit 1: Some Basic Concepts in Chemistry');
      expect(md).toContain('- [ ] Matter and its nature');
      expect(md).toContain('### Inorganic Chemistry');
      expect(md).toContain('#### Unit 10: Classification of Elements and Periodicity');
      expect(md).toContain('### Organic Chemistry');
      expect(md).toContain(
        '#### Unit 17: Organic Chemistry – Some Basic Principles and Techniques'
      );
    });

    it('generates structured Markdown for Mathematics', () => {
      const md = generateSyllabusMarkdown('maths');
      expect(md).toContain('# Mathematics Syllabus');
      expect(md).toContain('Total Units / Chapters**: 25');
      expect(md).toContain('Total Subtopics**: 102');
      expect(md).toContain('### Unit 1: Sets, Relations and Functions');
      expect(md).toContain('- [ ] Sets and their representation');
      expect(md).toContain('### Unit 25: Probability');
    });

    it('generates structured Markdown for Biology', () => {
      const md = generateSyllabusMarkdown('biology');
      expect(md).toContain('# Biology Syllabus');
      expect(md).toContain('Total Units / Chapters**: 33');
      expect(md).toContain('Total Subtopics**: 272');
      expect(md).toContain('### Unit 1: The Living World');
      expect(md).toContain('- [ ] Characteristics of living organisms');
      expect(md).toContain('### Unit 33: Biodiversity & Conservation');
    });
  });

  describe('generateSyllabusHTML', () => {
    it('produces semantic pre-rendered HTML with full unit and subtopic checklists for Physics', () => {
      const html = generateSyllabusHTML('physics');
      expect(html).toContain(
        '<title>Physics Syllabus Tracker – OJEET Tracker | JEE &amp; NEET</title>'
      );
      expect(html).toContain('content="https://tracker.ojeet.tech/physics"');
      expect(html).toContain('rel="canonical" href="https://tracker.ojeet.tech/physics"');
      expect(html).toContain('schema.org');
      expect(html).toContain('Physics 2026 Chapter Syllabus Checklist');

      // Semantic structure
      expect(html).toContain(
        '<main class="seo-fallback subject-prerendered-syllabus" data-subject="physics">'
      );
      expect(html).toContain('<h1>Physics Syllabus 2026');
      expect(html).toContain('<h3>Unit 1: Units and Measurements</h3>');
      expect(html).toContain('<h3>Unit 25: Semiconductor Electronics</h3>');

      // Checkboxes & labels
      expect(html).toContain('<input type="checkbox" disabled');
      expect(html).toContain('<span>Units of measurements</span>');
      expect(html).toContain('<span>Dimensional analysis and its applications</span>');

      // Navigation links
      expect(html).toContain('href="/chemistry"');
      expect(html).toContain('href="/maths"');
      expect(html).toContain('href="/biology"');
      expect(html).toContain('href="/llms.txt"');
    });

    it('renders Chemistry units with branch badges', () => {
      const html = generateSyllabusHTML('chemistry');
      expect(html).toContain(
        '<title>Chemistry Syllabus Tracker – OJEET Tracker | JEE &amp; NEET</title>'
      );
      expect(html).toContain('Unit 1: Some Basic Concepts in Chemistry');
      expect(html).toContain('Unit 10: Classification of Elements and Periodicity');
      expect(html).toContain('Unit 17: Organic Chemistry – Some Basic Principles and Techniques');
      expect(html).toContain('<span class="unit-branch-badge">Physical Chemistry</span>');
      expect(html).toContain('<span class="unit-branch-badge">Inorganic Chemistry</span>');
      expect(html).toContain('<span class="unit-branch-badge">Organic Chemistry</span>');
    });

    it('renders Mathematics and Biology units', () => {
      const mathsHtml = generateSyllabusHTML('maths');
      expect(mathsHtml).toContain('Unit 1: Sets, Relations and Functions');
      expect(mathsHtml).toContain('Unit 25: Probability');

      const bioHtml = generateSyllabusHTML('biology');
      expect(bioHtml).toContain('Unit 1: The Living World');
      expect(bioHtml).toContain('Unit 33: Biodiversity &amp; Conservation');
    });
  });

  describe('Edge Serverless handler', () => {
    function createMockRes() {
      const res: any = {
        statusCode: 200,
        headers: {} as Record<string, string>,
        body: '',
        status(code: number) {
          res.statusCode = code;
          return res;
        },
        setHeader(name: string, value: string) {
          res.headers[name] = value;
          return res;
        },
        send(data: string) {
          res.body = data;
          return res;
        },
      };
      return res;
    }

    it('serves Markdown for Accept: text/markdown', async () => {
      const res = createMockRes();
      const req = {
        url: '/physics',
        query: { subject: 'physics' },
        headers: {
          accept: 'text/markdown',
          'user-agent': 'GPTBot/1.0',
        },
      };

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.headers['Content-Type']).toBe('text/markdown; charset=utf-8');
      expect(res.headers['Vary']).toBe('Accept, User-Agent');
      expect(res.body).toContain('# Physics Syllabus');
      expect(res.body).toContain('- [ ] Units of measurements');
    });

    it('serves pre-rendered semantic HTML for bot crawlers', async () => {
      const res = createMockRes();
      const req = {
        url: '/chemistry',
        query: { subject: 'chemistry' },
        headers: {
          accept: 'text/html,application/xhtml+xml',
          'user-agent': 'Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/bot)',
        },
      };

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.headers['Content-Type']).toBe('text/html; charset=utf-8');
      expect(res.headers['Cache-Control']).toContain('s-maxage=86400');
      expect(res.body).toContain('Chemistry Syllabus Tracker');
      expect(res.body).toContain('Physical Chemistry');
      expect(res.body).toContain('Unit 1: Some Basic Concepts in Chemistry');
    });

    it('serves pre-rendered HTML with SPA boot scripts for standard browser requests', async () => {
      const res = createMockRes();
      const req = {
        url: '/maths',
        query: { subject: 'maths' },
        headers: {
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      };

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.headers['Content-Type']).toBe('text/html; charset=utf-8');
      expect(res.body).toContain('Maths Syllabus Tracker');
      expect(res.body).toContain('Unit 1: Sets, Relations and Functions');
      expect(res.body).toContain('<div id="root">');
    });

    it('returns 404 for unknown subject route', async () => {
      const res = createMockRes();
      const req = {
        url: '/economics',
        query: { subject: 'economics' },
        headers: {},
      };

      await handler(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.body).toContain('Subject syllabus route not found');
    });

    it('handles format query parameter override', async () => {
      const res = createMockRes();
      const req = {
        url: '/biology?format=markdown',
        query: { subject: 'biology', format: 'markdown' },
        headers: {
          accept: 'text/html',
          'user-agent': 'Mozilla/5.0 Chrome/120.0.0.0',
        },
      };

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.headers['Content-Type']).toBe('text/markdown; charset=utf-8');
      expect(res.body).toContain('# Biology Syllabus');
    });
  });
});
