import { describe, it, expect } from 'vitest';
import handler, {
  normalizeRoute,
  isBotRequest,
  loadRouteMetadata,
  generateRouteHTML,
  BASE_URL,
  DEFAULT_ROUTE_METADATA,
} from './edge-meta.js';
import { ROUTE_METADATA as CLIENT_ROUTE_METADATA } from '../src/shared/seo/routeMetadata.js';

describe('Edge Meta & OpenGraph Synchronization', () => {
  describe('normalizeRoute', () => {
    it('normalizes routes with or without leading/trailing slashes', () => {
      expect(normalizeRoute('jee-mock-scores')).toBe('/jee-mock-scores');
      expect(normalizeRoute('/jee-mock-scores')).toBe('/jee-mock-scores');
      expect(normalizeRoute('/jee-mock-scores/')).toBe('/jee-mock-scores');
      expect(normalizeRoute('neet-mock-scores')).toBe('/neet-mock-scores');
      expect(normalizeRoute('/jee-study-planner')).toBe('/jee-study-planner');
      expect(normalizeRoute('/neet-study-planner')).toBe('/neet-study-planner');
      expect(normalizeRoute('/jee-study-timer')).toBe('/jee-study-timer');
      expect(normalizeRoute('/neet-study-timer')).toBe('/neet-study-timer');
    });

    it('resolves aliases accurately', () => {
      expect(normalizeRoute('/')).toBe('/jee-syllabus-tracker');
      expect(normalizeRoute('')).toBe('/jee-syllabus-tracker');
      expect(normalizeRoute(undefined)).toBe('/jee-syllabus-tracker');
      expect(normalizeRoute('/math')).toBe('/maths');
      expect(normalizeRoute('math')).toBe('/maths');
      expect(normalizeRoute('/planner')).toBe('/jee-study-planner');
      expect(normalizeRoute('planner')).toBe('/jee-study-planner');
      expect(normalizeRoute('/studyclock')).toBe('/jee-study-timer');
      expect(normalizeRoute('studyclock')).toBe('/jee-study-timer');
    });

    it('strips query parameters and hashes', () => {
      expect(normalizeRoute('/jee-mock-scores?tab=jee-main#stats')).toBe('/jee-mock-scores');
      expect(normalizeRoute('/neet-study-planner?view=weekly')).toBe('/neet-study-planner');
    });
  });

  describe('isBotRequest', () => {
    it('detects all major social link preview crawlers', () => {
      const socialCrawlers = [
        'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)',
        'Twitterbot/1.0',
        'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'WhatsApp/2.21.12.21 I',
        'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)',
        'TelegramBot (like TwitterBot)',
        'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
        'Slack-ImgProxy (+https://api.slack.com/robots)',
        'Applebot/0.1',
        'Pinterest/0.2 (+http://www.pinterest.com/bot.html)',
        'SkypeUriPreview Preview/0.5',
        'vkShare; +http://vk.com/dev/Share',
      ];

      for (const ua of socialCrawlers) {
        expect(isBotRequest(ua), `Expected ${ua} to be detected as bot`).toBe(true);
      }
    });

    it('detects search engines and AI crawlers', () => {
      const bots = [
        'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Mozilla/5.0 (compatible; Bingbot/2.0; +http://www.bing.com/bingbot.htm)',
        'DuckDuckBot/1.0; (+http://duckduckgo.com/duckduckbot.html)',
        'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)',
        'Mozilla/5.0 (compatible; ChatGPT-User/1.0; +https://openai.com/bot)',
        'Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/bot)',
        'Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
        'anthropic-ai',
        'Google-Extended',
        'cohere-ai',
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

  describe('Client and Edge Metadata Parity', () => {
    it('ensures client-side ROUTE_METADATA is 100% consistent with Edge metadata', () => {
      const edgeMeta = loadRouteMetadata();

      const requiredRoutes = [
        '/jee-mock-scores',
        '/neet-mock-scores',
        '/jee-study-planner',
        '/neet-study-planner',
        '/jee-study-timer',
        '/neet-study-timer',
        '/jee-syllabus-tracker',
        '/neet-syllabus-tracker',
        '/physics',
        '/chemistry',
        '/maths',
        '/biology',
        '/reports',
        '/changelog',
        '/privacy-policy',
        '/terms-of-service',
        '/import',
        '/support',
        '/community',
      ];

      for (const route of requiredRoutes) {
        expect(CLIENT_ROUTE_METADATA[route], `Client missing metadata for ${route}`).toBeDefined();
        expect(edgeMeta[route], `Edge missing metadata for ${route}`).toBeDefined();

        expect(CLIENT_ROUTE_METADATA[route].title).toBe(edgeMeta[route].title);
        expect(CLIENT_ROUTE_METADATA[route].description).toBe(edgeMeta[route].description);
      }
    });
  });

  describe('generateRouteHTML', () => {
    it('generates route-specific OpenGraph and Twitter tags for /jee-mock-scores', () => {
      const html = generateRouteHTML('/jee-mock-scores');

      expect(html).toContain(
        '<title>JEE &amp; NEET Mock Test Score Tracker | OJEET Tracker</title>'
      );
      expect(html).toContain(
        '<meta name="description" content="Track and analyze your mock test scores for JEE Main, JEE Advanced, and NEET UG." />'
      );
      expect(html).toContain(
        '<link rel="canonical" href="https://tracker.ojeet.tech/jee-mock-scores" />'
      );
      expect(html).toContain(
        '<meta property="og:title" content="JEE &amp; NEET Mock Test Score Tracker | OJEET Tracker" />'
      );
      expect(html).toContain(
        '<meta property="og:description" content="Track and analyze your mock test scores for JEE Main, JEE Advanced, and NEET UG." />'
      );
      expect(html).toContain(
        '<meta property="og:url" content="https://tracker.ojeet.tech/jee-mock-scores" />'
      );
      expect(html).toContain(
        '<meta property="og:image" content="https://tracker.ojeet.tech/og_image.jpg" />'
      );
      expect(html).toContain(
        '<meta name="twitter:title" content="JEE &amp; NEET Mock Test Score Tracker | OJEET Tracker" />'
      );
      expect(html).toContain(
        '<meta name="twitter:description" content="Track and analyze your mock test scores for JEE Main, JEE Advanced, and NEET UG." />'
      );
      expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />');

      // Semantic content
      expect(html).toContain('data-route="/jee-mock-scores"');
      expect(html).toContain('JEE &amp; NEET Mock Test Score Tracker &amp; Performance Analytics');
    });

    it('generates route-specific OpenGraph tags for /neet-mock-scores', () => {
      const html = generateRouteHTML('/neet-mock-scores');

      expect(html).toContain('<title>NEET Mock Test Score Tracker | OJEET Tracker</title>');
      expect(html).toContain(
        '<link rel="canonical" href="https://tracker.ojeet.tech/neet-mock-scores" />'
      );
      expect(html).toContain(
        '<meta property="og:title" content="NEET Mock Test Score Tracker | OJEET Tracker" />'
      );
      expect(html).toContain(
        '<meta property="og:url" content="https://tracker.ojeet.tech/neet-mock-scores" />'
      );
      expect(html).toContain('data-route="/neet-mock-scores"');
    });

    it('generates route-specific OpenGraph tags for /jee-study-planner and /neet-study-planner', () => {
      const jeePlannerHtml = generateRouteHTML('/jee-study-planner');
      expect(jeePlannerHtml).toContain(
        '<title>JEE Study Planner &amp; Daily Timetable | OJEET Tracker</title>'
      );
      expect(jeePlannerHtml).toContain(
        '<meta property="og:url" content="https://tracker.ojeet.tech/jee-study-planner" />'
      );

      const neetPlannerHtml = generateRouteHTML('/neet-study-planner');
      expect(neetPlannerHtml).toContain(
        '<title>NEET Study Planner &amp; Timetable App | OJEET Tracker</title>'
      );
      expect(neetPlannerHtml).toContain(
        '<meta property="og:url" content="https://tracker.ojeet.tech/neet-study-planner" />'
      );
    });

    it('generates route-specific OpenGraph tags for /jee-study-timer and /neet-study-timer', () => {
      const jeeTimerHtml = generateRouteHTML('/jee-study-timer');
      expect(jeeTimerHtml).toContain(
        '<title>JEE Study Timer &amp; Focus Pomodoro Clock | OJEET Tracker</title>'
      );
      expect(jeeTimerHtml).toContain(
        '<meta property="og:url" content="https://tracker.ojeet.tech/jee-study-timer" />'
      );

      const neetTimerHtml = generateRouteHTML('/neet-study-timer');
      expect(neetTimerHtml).toContain(
        '<title>NEET Study Timer &amp; Pomodoro Stopwatch | OJEET Tracker</title>'
      );
      expect(neetTimerHtml).toContain(
        '<meta property="og:url" content="https://tracker.ojeet.tech/neet-study-timer" />'
      );
    });

    it('injects JSON-LD structured data for WebPage', () => {
      const html = generateRouteHTML('/jee-mock-scores');
      expect(html).toContain('<script type="application/ld+json">');
      expect(html).toContain('"@type": "WebPage"');
      expect(html).toContain('https://tracker.ojeet.tech/jee-mock-scores#webpage');
    });

    it('unifies root / to point to canonical /jee-syllabus-tracker and matching og:url', () => {
      const html = generateRouteHTML('/');
      expect(html).toContain(
        '<link rel="canonical" href="https://tracker.ojeet.tech/jee-syllabus-tracker" />'
      );
      expect(html).toContain(
        '<meta property="og:url" content="https://tracker.ojeet.tech/jee-syllabus-tracker" />'
      );
    });

    it('falls back cleanly for unrecognized routes', () => {
      const html = generateRouteHTML('/some-unknown-route');
      expect(html).toContain(
        '<title>JEE Syllabus Tracker &amp; Study Dashboard | OJEET Tracker</title>'
      );
      expect(html).toContain(
        '<link rel="canonical" href="https://tracker.ojeet.tech/jee-syllabus-tracker" />'
      );
    });
  });

  describe('Serverless Handler Simulation', () => {
    function createMockRes() {
      const res: any = {
        statusCode: 200,
        headers: {},
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

    it('responds with 200 and route-specific metadata for Discord crawler', async () => {
      const req: any = {
        headers: {
          'user-agent': 'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)',
        },
        query: {
          route: 'jee-mock-scores',
        },
      };
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.headers['Content-Type']).toBe('text/html; charset=utf-8');
      expect(res.headers['Vary']).toBe('Accept, User-Agent');
      expect(res.headers['Cache-Control']).toContain('public, max-age=3600');
      expect(res.body).toContain('JEE &amp; NEET Mock Test Score Tracker | OJEET Tracker');
      expect(res.body).toContain(
        '<meta property="og:url" content="https://tracker.ojeet.tech/jee-mock-scores" />'
      );
    });

    it('responds with 200 and route-specific metadata for WhatsApp preview', async () => {
      const req: any = {
        headers: {
          'user-agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        },
        query: {
          route: 'neet-study-planner',
        },
      };
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toContain('NEET Study Planner &amp; Timetable App | OJEET Tracker');
      expect(res.body).toContain(
        '<meta property="og:url" content="https://tracker.ojeet.tech/neet-study-planner" />'
      );
    });

    it('responds with 200 and route-specific metadata for Twitterbot', async () => {
      const req: any = {
        headers: {
          'user-agent': 'Twitterbot/1.0',
        },
        query: {
          route: 'jee-study-timer',
        },
      };
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toContain(
        'JEE Study Timer &amp; Focus Pomodoro Clock | OJEET Tracker'
      );
      expect(res.body).toContain(
        '<meta name="twitter:title" content="JEE Study Timer &amp; Focus Pomodoro Clock | OJEET Tracker" />'
      );
    });

    it('responds with no-cache header for standard browser requests', async () => {
      const req: any = {
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
        },
        query: {
          route: 'reports',
        },
      };
      const res = createMockRes();

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.headers['Cache-Control']).toBe('no-cache, must-revalidate');
      expect(res.body).toContain('Study Analytics &amp; Performance Reports | OJEET Tracker');
    });
  });
});
