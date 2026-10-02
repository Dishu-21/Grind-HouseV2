import fs from 'fs';
import path from 'path';

export const BASE_URL = 'https://tracker.ojeet.tech';
export const SITE_NAME = 'OJEET Tracker';
export const OG_IMAGE = `${BASE_URL}/og_image.jpg`;

// Known AI search crawlers, LLM agents, citation engines, and social media link preview bots
export const BOT_USER_AGENTS_REGEX =
  /(GPTBot|ChatGPT-User|PerplexityBot|ClaudeBot|anthropic-ai|Google-Extended|Bingbot|cohere-ai|OAI-SearchBot|Bytespider|Diffbot|FacebookBot|Meta-ExternalAgent|Applebot-Extended|Applebot|Googlebot|DuckDuckBot|Baiduspider|YandexBot|ia_archiver|Slurp|Discordbot|Twitterbot|facebookexternalhit|WhatsApp|LinkedInBot|TelegramBot|Slackbot|Slack-ImgProxy|Pinterest|SkypeUriPreview|vkShare|W3C_Validator)/i;

export const ROUTE_ALIASES = {
  '/': '/jee-syllabus-tracker',
  '/math': '/maths',
  '/planner': '/jee-study-planner',
  '/studyclock': '/jee-study-timer',
};

// Embedded route metadata as fallback if file reading fails
export const DEFAULT_ROUTE_METADATA = {
  '/jee-syllabus-tracker': {
    title: 'JEE Syllabus Tracker & Study Dashboard | OJEET Tracker',
    description:
      '100% Free, offline-first JEE & NEET tracker. Seamlessly manage your daily study planner, track PCM & Biology chapter completion, utilize a built-in study clock, and sync data.',
    canonicalPath: '/jee-syllabus-tracker',
    h1: 'JEE & NEET Syllabus Tracker 2026',
    summary:
      '100% Free, offline-first JEE & NEET tracker. Seamlessly manage your daily study planner, track PCM & Biology chapter completion, utilize a built-in study clock, and sync data.',
  },
  '/neet-syllabus-tracker': {
    title: 'NEET Syllabus Tracker – OJEET Tracker | Biology, Physics & Chemistry',
    description:
      'Free offline-first NEET UG syllabus tracker. Track chapter completion across Biology, Physics, and Chemistry, manage daily targets, and log study sessions.',
    canonicalPath: '/neet-syllabus-tracker',
    h1: 'NEET Syllabus Tracker 2026 (Biology, Physics & Chemistry)',
    summary:
      'Free offline-first NEET UG syllabus tracker. Track chapter completion across Biology, Physics, and Chemistry, manage daily targets, and log study sessions.',
  },
  '/physics': {
    title: 'Physics Syllabus Tracker – OJEET Tracker | JEE & NEET',
    description:
      'Track your Physics chapter-wise preparation progress for JEE & NEET. Mark study materials completed for Mechanics, Electromagnetism, Optics, and Modern Physics.',
    canonicalPath: '/physics',
    h1: 'Physics Syllabus Tracker 2026 (JEE Main, Advanced & NEET UG)',
    summary:
      'Track your Physics chapter-wise preparation progress for JEE & NEET. Mark study materials completed for Mechanics, Electromagnetism, Optics, and Modern Physics.',
  },
  '/chemistry': {
    title: 'Chemistry Syllabus Tracker – OJEET Tracker | JEE & NEET',
    description:
      'Track your Chemistry chapter-wise preparation progress for JEE & NEET. Monitor coverage across Physical, Organic, and Inorganic Chemistry topics and study resources.',
    canonicalPath: '/chemistry',
    h1: 'Chemistry Syllabus Tracker 2026 (JEE Main, Advanced & NEET UG)',
    summary:
      'Track your Chemistry chapter-wise preparation progress for JEE & NEET. Monitor coverage across Physical, Organic, and Inorganic Chemistry topics and study resources.',
  },
  '/maths': {
    title: 'Maths Syllabus Tracker – OJEET Tracker | JEE Prep',
    description:
      'Track your JEE Maths chapter-wise preparation progress. Stay organized with your preparation in Calculus, Algebra, Coordinate Geometry, and Vectors & 3D Geometry.',
    canonicalPath: '/maths',
    h1: 'Mathematics Syllabus Tracker 2026 (JEE Main & Advanced)',
    summary:
      'Track your JEE Maths chapter-wise preparation progress. Stay organized with your preparation in Calculus, Algebra, Coordinate Geometry, and Vectors & 3D Geometry.',
  },
  '/biology': {
    title: 'Biology Syllabus Tracker – OJEET Tracker | NEET Prep',
    description:
      'Track your NEET Biology chapter-wise preparation progress. Monitor coverage across Botany, Zoology, NCERT readings, PYQs, and study materials.',
    canonicalPath: '/biology',
    h1: 'Biology Syllabus Tracker 2026 (NEET UG Botany & Zoology)',
    summary:
      'Track your NEET Biology chapter-wise preparation progress. Monitor coverage across Botany, Zoology, NCERT readings, PYQs, and study materials.',
  },
  '/jee-study-planner': {
    title: 'JEE Study Planner & Daily Timetable | OJEET Tracker',
    description:
      'Interactive daily timetable app with rescheduling. Free study planner for JEE & NEET droppers and Class 12, weekly task manager, and progress calendar.',
    canonicalPath: '/jee-study-planner',
    h1: 'JEE & NEET Study Planner & Timetable App',
    summary:
      'Interactive daily timetable app with rescheduling. Free study planner for JEE & NEET droppers and Class 12, weekly task manager, and progress calendar.',
  },
  '/neet-study-planner': {
    title: 'NEET Study Planner & Timetable App | OJEET Tracker',
    description:
      'Free NEET study planner and timetable app for droppers & Class 12. Organize daily study schedules, track NCERT revisions, and manage task deadlines.',
    canonicalPath: '/neet-study-planner',
    h1: 'NEET Study Planner & Timetable App',
    summary:
      'Free NEET study planner and timetable app for droppers & Class 12. Organize daily study schedules, track NCERT revisions, and manage task deadlines.',
  },
  '/jee-study-timer': {
    title: 'JEE Study Timer & Focus Pomodoro Clock | OJEET Tracker',
    description:
      'Free online digital study stopwatch for JEE & NEET aspirants. Log your study hours, track focus sessions with a pomodoro timer, and analyze your preparation time.',
    canonicalPath: '/jee-study-timer',
    h1: 'JEE & NEET Study Timer & Pomodoro Stopwatch',
    summary:
      'Free online digital study stopwatch for JEE & NEET aspirants. Log your study hours, track focus sessions with a pomodoro timer, and analyze your preparation time.',
  },
  '/neet-study-timer': {
    title: 'NEET Study Timer & Pomodoro Stopwatch | OJEET Tracker',
    description:
      'Dedicated study timer for NEET aspirants. Focus on NCERT reading sessions, track daily study hours, and run pomodoro intervals with full offline support.',
    canonicalPath: '/neet-study-timer',
    h1: 'NEET Study Timer & Pomodoro Stopwatch',
    summary:
      'Dedicated study timer for NEET aspirants. Focus on NCERT reading sessions, track daily study hours, and run pomodoro intervals with full offline support.',
  },
  '/jee-mock-scores': {
    title: 'JEE & NEET Mock Test Score Tracker | OJEET Tracker',
    description: 'Track and analyze your mock test scores for JEE Main, JEE Advanced, and NEET UG.',
    canonicalPath: '/jee-mock-scores',
    h1: 'JEE & NEET Mock Test Score Tracker & Performance Analytics',
    summary:
      'Track and analyze your mock test scores for JEE Main, JEE Advanced, and NEET UG. Log exam marks, calculate percentage accuracy, monitor percentile trends, and identify weak topics across Physics, Chemistry, Mathematics, and Biology.',
  },
  '/neet-mock-scores': {
    title: 'NEET Mock Test Score Tracker | OJEET Tracker',
    description:
      'Track and analyze your NEET mock test scores, subject breakdowns, and preparation progress.',
    canonicalPath: '/neet-mock-scores',
    h1: 'NEET Mock Test Score Tracker & Performance Analytics',
    summary:
      'Track and analyze your NEET mock test scores, subject breakdowns, and preparation progress. Log Physics, Chemistry, and Biology scores, monitor negative marking impact, and track score trajectories toward 720.',
  },
  '/reports': {
    title: 'Study Analytics & Performance Reports | OJEET Tracker',
    description:
      'Analyze your JEE and NEET study hours, subject distribution, chapter completion velocity, and consistency reports.',
    canonicalPath: '/reports',
    h1: 'Study Analytics & Preparation Reports',
    summary:
      'Analyze your JEE and NEET study hours, subject distribution, chapter completion velocity, and consistency reports.',
  },
  '/changelog': {
    title: 'Changelog – OJEET Tracker',
    description: 'View the latest updates, features, and improvements to OJEET Tracker.',
    canonicalPath: '/changelog',
    h1: 'OJEET Tracker Product Changelog',
    summary: 'View the latest updates, features, and improvements to OJEET Tracker.',
  },
  '/privacy-policy': {
    title: 'Privacy Policy – OJEET Tracker',
    description: 'Read the OJEET Tracker privacy policy to understand how your data is handled.',
    canonicalPath: '/privacy-policy',
    h1: 'OJEET Tracker Privacy Policy',
    summary: 'Read the OJEET Tracker privacy policy to understand how your data is handled.',
  },
  '/terms-of-service': {
    title: 'Terms of Service – OJEET Tracker',
    description: 'Read the OJEET Tracker terms of service.',
    canonicalPath: '/terms-of-service',
    h1: 'OJEET Tracker Terms of Service',
    summary: 'Read the OJEET Tracker terms of service.',
  },
  '/import': {
    title: 'Import & Sync – OJEET Tracker',
    description: 'Import and sync your study data with OJEET Tracker.',
    canonicalPath: '/import',
    h1: 'Import, Export & Cross-Device Sync',
    summary: 'Import and sync your study data with OJEET Tracker.',
  },
  '/support': {
    title: 'Support & FAQs – Aspirant Help Desk | OJEET Tracker',
    description:
      'Get help and support with OJEET Tracker. Frequently asked questions, usage guides, and feedback.',
    canonicalPath: '/support',
    h1: 'Support & Aspirant Help Desk',
    summary:
      'Get help and support with OJEET Tracker. Frequently asked questions, usage guides, and feedback.',
  },
  '/community': {
    title: 'Aspirant Community & Peer Study Groups | OJEET Tracker',
    description:
      'Connect with fellow JEE and NEET aspirants. Share study progress, tips, and motivation.',
    canonicalPath: '/community',
    h1: 'Aspirant Community & Peer Study Groups',
    summary:
      'Connect with fellow JEE and NEET aspirants. Share study progress, tips, and motivation.',
  },
};

/**
 * Normalizes route string parameter.
 * Handles paths with or without leading/trailing slashes, and aliases.
 */
export function normalizeRoute(rawRoute) {
  if (!rawRoute) return '/jee-syllabus-tracker';
  let route = String(rawRoute).trim().split('?')[0].split('#')[0].replace(/\/+$/, '');

  if (!route || route === '/') {
    return '/jee-syllabus-tracker';
  }

  if (!route.startsWith('/')) {
    route = '/' + route;
  }

  if (ROUTE_ALIASES[route]) {
    return ROUTE_ALIASES[route];
  }

  return route;
}

/**
 * Detects whether the request originates from a search crawler, AI evaluation bot, or social link preview scraper.
 */
export function isBotRequest(userAgent = '') {
  return BOT_USER_AGENTS_REGEX.test(userAgent);
}

/**
 * Loads route metadata from disk or defaults.
 */
export function loadRouteMetadata(rootDir = process.cwd()) {
  const possiblePaths = [
    path.join(rootDir, 'src', 'shared', 'seo', 'routeMetadata.json'),
    path.join(rootDir, 'public', 'data', 'route-metadata.json'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const data = JSON.parse(fs.readFileSync(p, 'utf8'));
        return { ...DEFAULT_ROUTE_METADATA, ...data };
      } catch (err) {
        console.error(`Error loading route metadata from ${p}:`, err);
      }
    }
  }

  return DEFAULT_ROUTE_METADATA;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function replaceMetaTag(html, property, name, value) {
  const attr = property ? 'property' : 'name';
  const val = property || name;
  const regex = new RegExp(`<meta\\s+[^>]*?${attr}="${val}"[^>]*?>`, 'i');
  const newTag = `<meta ${attr}="${val}" content="${escapeHtml(value)}" />`;

  if (html.match(regex)) {
    return html.replace(regex, newTag);
  }
  return html.replace('</head>', `  ${newTag}\n  </head>`);
}

function replaceCanonical(html, canonicalUrl) {
  const regex = /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i;
  const newTag = `<link rel="canonical" href="${canonicalUrl}" />`;
  if (html.match(regex)) {
    return html.replace(regex, newTag);
  }
  return html.replace('</head>', `  ${newTag}\n  </head>`);
}

/**
 * Generates semantic fallback HTML tailored to the given route.
 */
export function generateRouteSemanticHtml(route, meta) {
  const breadcrumbLabel = meta.title.split('–')[0]?.split('|')[0]?.trim() || 'Tracker';

  return `
      <main class="seo-fallback route-prerendered-content" data-route="${escapeHtml(meta.canonicalPath || route)}">
        <header class="route-seo-header">
          <nav aria-label="Breadcrumb" class="seo-breadcrumb">
            <a href="/">Home</a> &rsaquo;
            <span>${escapeHtml(breadcrumbLabel)}</span>
          </nav>
          <h1>${escapeHtml(meta.h1 || meta.title)}</h1>
          <p class="route-seo-summary">
            ${escapeHtml(meta.summary || meta.description)}
          </p>
          <div class="route-stats-bar">
            <span><strong>100% Free</strong> Offline Tracker</span>
            <span><strong>NTA 2026</strong> Aligned</span>
            <span><strong>Zero Ads</strong> Privacy First</span>
          </div>
        </header>

        <section class="route-feature-overview" aria-label="Feature Overview">
          <h2>Overview &amp; Features</h2>
          <p>${escapeHtml(meta.description)}</p>
        </section>

        <section class="seo-quick-links" aria-label="Quick Links">
          <h2>JEE &amp; NEET Preparation Suite</h2>
          <ul>
            <li><a href="/jee-syllabus-tracker">JEE &amp; NEET Syllabus Dashboard</a></li>
            <li><a href="/neet-syllabus-tracker">NEET UG Syllabus Tracker</a></li>
            <li><a href="/physics">Physics Syllabus Tracker</a></li>
            <li><a href="/chemistry">Chemistry Syllabus Tracker</a></li>
            <li><a href="/maths">Mathematics Syllabus Tracker</a></li>
            <li><a href="/biology">Biology Syllabus Tracker</a></li>
            <li><a href="/jee-study-planner">Daily Study Planner &amp; Timetable</a></li>
            <li><a href="/jee-study-timer">Focus Study Timer &amp; Pomodoro</a></li>
            <li><a href="/jee-mock-scores">JEE Mock Test Score Tracker</a></li>
            <li><a href="/neet-mock-scores">NEET Mock Test Score Tracker</a></li>
            <li><a href="/pricing.md">100% Free Guarantee</a></li>
            <li><a href="/llms.txt">AI Search Agents Knowledge Base</a></li>
          </ul>
        </section>
      </main>`;
}

/**
 * Generates pre-rendered HTML with route-specific metadata and semantic content.
 */
export function generateRouteHTML(rawRoute, options = {}) {
  const rootDir = options.rootDir || process.cwd();
  const normRoute = normalizeRoute(rawRoute);

  // If this is a subject route, delegate to generateSyllabusHTML from subject-prerender if available
  const subjectMatch = normRoute.match(/^\/(physics|chemistry|maths|biology)$/);
  if (subjectMatch && options.generateSyllabusHTML) {
    try {
      return options.generateSyllabusHTML(subjectMatch[1], options);
    } catch {
      // Fall through to standard route rendering
    }
  }

  const allMeta = loadRouteMetadata(rootDir);
  const meta = allMeta[normRoute] || allMeta['/jee-syllabus-tracker'];
  const canonicalUrl = `${BASE_URL}${meta.canonicalPath || normRoute}`;

  let htmlTemplate = options.templateHtml;
  if (!htmlTemplate) {
    let htmlPath = options.isDev
      ? path.join(rootDir, 'index.html')
      : path.join(rootDir, 'dist', 'index.html');

    if (!fs.existsSync(htmlPath)) {
      htmlPath = path.join(rootDir, 'index.html');
    }

    if (fs.existsSync(htmlPath)) {
      htmlTemplate = fs.readFileSync(htmlPath, 'utf8');
    } else {
      // Minimal fallback shell
      htmlTemplate = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${meta.title}</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;
    }
  }

  let html = htmlTemplate;

  // Development Vite preamble
  if (options.isDev) {
    const preamble = `
    <script type="module" src="/@vite/client"></script>
    <script type="module">
      import { injectIntoGlobalHook } from "/@react-refresh"
      injectIntoGlobalHook(window)
      window.$RefreshReg$ = () => {}
      window.$RefreshSig$ = () => (type) => type
      window.__vite_plugin_react_preamble_installed__ = true
    </script>
  `;
    html = html.replace('<head>', `<head>${preamble}`);
  }

  // Update Page Title and Meta Description
  html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
  html = replaceMetaTag(html, null, 'description', meta.description);

  // Update Canonical Link
  html = replaceCanonical(html, canonicalUrl);

  // Update Open Graph Tags
  html = replaceMetaTag(html, 'og:title', null, meta.title);
  html = replaceMetaTag(html, 'og:description', null, meta.description);
  html = replaceMetaTag(html, 'og:url', null, canonicalUrl);
  html = replaceMetaTag(html, 'og:image', null, OG_IMAGE);
  html = replaceMetaTag(html, 'og:site_name', null, SITE_NAME);
  html = replaceMetaTag(html, 'og:type', null, 'website');
  html = replaceMetaTag(html, 'og:locale', null, 'en_IN');

  // Update Twitter Card Tags
  html = replaceMetaTag(html, null, 'twitter:title', meta.title);
  html = replaceMetaTag(html, null, 'twitter:description', meta.description);
  html = replaceMetaTag(html, null, 'twitter:image', OG_IMAGE);
  html = replaceMetaTag(html, null, 'twitter:card', 'summary_large_image');

  // Build JSON-LD structured data for the page
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: meta.title,
    description: meta.description,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      name: SITE_NAME,
      url: `${BASE_URL}/`,
    },
  };

  const jsonLdScript = `\n    <script type="application/ld+json">\n${JSON.stringify(jsonLdData, null, 2)}\n    </script>`;
  html = html.replace('</head>', `${jsonLdScript}\n  </head>`);

  // Replace default app-boot-loader or seo-fallback within #root or inject into #root
  const prerenderedContent = generateRouteSemanticHtml(normRoute, meta);
  const fallbackRegex = /(<(?:main|div)\s+class="seo-fallback[^"]*"[\s\S]*?<\/(?:main|div)>)/;
  if (html.includes('<div id="app-boot-loader"')) {
    html = html.replace(
      /<div\s+id="app-boot-loader"[\s\S]*?<\/div>\s*<\/div>/,
      `${prerenderedContent.trim()}\n    </div>`
    );
  } else if (fallbackRegex.test(html)) {
    html = html.replace(fallbackRegex, prerenderedContent.trim());
  } else if (html.includes('<div id="root">')) {
    html = html.replace('<div id="root">', `<div id="root">${prerenderedContent}`);
  }

  return html;
}

/**
 * Serverless / Edge Function Handler
 */
export default async function handler(req, res) {
  try {
    const rawRoute =
      (req.query && (req.query.route || req.query.r || req.query.path)) ||
      (req.url && req.url.split('?')[0]);

    const userAgent = (req.headers && req.headers['user-agent']) || '';
    const isBot = isBotRequest(userAgent);
    const host = (req.headers && (req.headers['x-forwarded-host'] || req.headers.host)) || '';
    const isDev =
      host.includes('localhost') ||
      host.includes('127.0.0.1') ||
      process.env.NODE_ENV === 'development' ||
      process.env.VERCEL_ENV === 'development';

    // Lazy load generateSyllabusHTML if subject route
    let generateSyllabusHTMLFn = null;
    const norm = normalizeRoute(rawRoute);
    if (/^\/(physics|chemistry|maths|biology)$/.test(norm)) {
      try {
        const subPrerender = await import('./subject-prerender.js');
        generateSyllabusHTMLFn = subPrerender.generateSyllabusHTML;
      } catch {
        // Fall back to standard route rendering
      }
    }

    const html = generateRouteHTML(rawRoute, {
      isDev,
      generateSyllabusHTML: generateSyllabusHTMLFn,
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader(
      'Cache-Control',
      isBot
        ? 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'
        : 'no-cache, must-revalidate'
    );
    res.setHeader('Vary', 'Accept, User-Agent');
    return res.status(200).send(html);
  } catch (error) {
    console.error('Error generating edge route meta:', error);
    try {
      let htmlPath = path.join(process.cwd(), 'dist', 'index.html');
      if (!fs.existsSync(htmlPath)) {
        htmlPath = path.join(process.cwd(), 'index.html');
      }
      const fallbackHtml = fs.readFileSync(htmlPath, 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(fallbackHtml);
    } catch {
      return res.status(500).send('Internal Server Error');
    }
  }
}
