import fs from 'fs';
import path from 'path';

// Subject metadata conforming to official NTA 2026 guidelines
export const SUBJECT_METADATA = {
  physics: {
    displayName: 'Physics',
    title: 'Physics Syllabus Tracker – OJEET Tracker | JEE & NEET',
    description:
      'Track your Physics chapter-wise preparation progress for JEE & NEET. Mark study materials completed for Mechanics, Electromagnetism, Optics, and Modern Physics.',
    examAlignment: 'NTA JEE Main, JEE Advanced & NEET UG 2026',
    dataKey: 'JEE_Main_Physics_Syllabus_2026',
    canonicalPath: '/physics',
  },
  chemistry: {
    displayName: 'Chemistry',
    title: 'Chemistry Syllabus Tracker – OJEET Tracker | JEE & NEET',
    description:
      'Track your Chemistry chapter-wise preparation progress for JEE & NEET. Monitor coverage across Physical, Organic, and Inorganic Chemistry topics and study resources.',
    examAlignment: 'NTA JEE Main, JEE Advanced & NEET UG 2026',
    dataKey: 'JEE_Main_Chemistry_Syllabus_2026',
    canonicalPath: '/chemistry',
  },
  maths: {
    displayName: 'Mathematics',
    title: 'Maths Syllabus Tracker – OJEET Tracker | JEE Prep',
    description:
      'Track your JEE Maths chapter-wise preparation progress. Stay organized with your preparation in Calculus, Algebra, Coordinate Geometry, and Vectors & 3D Geometry.',
    examAlignment: 'NTA JEE Main & JEE Advanced 2026',
    dataKey: 'JEE_Main_Mathematics_Syllabus_2026',
    canonicalPath: '/maths',
  },
  biology: {
    displayName: 'Biology',
    title: 'Biology Syllabus Tracker – OJEET Tracker | NEET Prep',
    description:
      'Track your NEET Biology chapter-wise preparation progress. Monitor coverage across Botany, Zoology, NCERT readings, PYQs, and study materials.',
    examAlignment: 'NTA NEET UG 2026',
    dataKey: 'NEET_Biology_Syllabus_2026',
    canonicalPath: '/biology',
  },
};

// Known AI search crawlers, LLM agents, citation engines, and social media link preview bots
export const BOT_USER_AGENTS_REGEX =
  /(GPTBot|ChatGPT-User|PerplexityBot|ClaudeBot|anthropic-ai|Google-Extended|Bingbot|cohere-ai|OAI-SearchBot|Bytespider|Diffbot|FacebookBot|Meta-ExternalAgent|Applebot-Extended|Applebot|Googlebot|DuckDuckBot|Baiduspider|YandexBot|ia_archiver|Slurp|Discordbot|Twitterbot|facebookexternalhit|WhatsApp|LinkedInBot|TelegramBot|Slackbot|Slack-ImgProxy|Pinterest|SkypeUriPreview|vkShare|W3C_Validator)/i;

/**
 * Normalizes subject string parameter.
 * Supports 'physics', 'chemistry', 'maths' (and alias 'math'), 'biology'.
 */
export function normalizeSubject(subject) {
  if (!subject) return null;
  const s = String(subject)
    .toLowerCase()
    .trim()
    .replace(/^\/+|\/+$/g, '');
  if (s === 'math') return 'maths';
  if (SUBJECT_METADATA[s]) return s;
  return null;
}

/**
 * Detects whether the request originates from a search crawler or AI evaluation bot.
 */
export function isBotRequest(userAgent = '') {
  return BOT_USER_AGENTS_REGEX.test(userAgent);
}

/**
 * Checks if client explicitly requests Markdown format via Accept header or query parameter.
 */
export function isMarkdownRequest(acceptHeader = '', query = {}) {
  if (query && (query.format === 'markdown' || query.markdown === 'true')) {
    return true;
  }
  const accept = (acceptHeader || '').toLowerCase();
  return accept.includes('text/markdown') || accept.includes('text/x-markdown');
}

/**
 * Loads and normalizes syllabus units and subtopics from disk.
 */
export function loadSubjectUnits(subject, rootDir = process.cwd()) {
  const normSubject = normalizeSubject(subject);
  if (!normSubject) {
    throw new Error(`Unsupported subject: ${subject}`);
  }
  const meta = SUBJECT_METADATA[normSubject];

  const possiblePaths = [
    path.join(rootDir, 'public', 'data', `${normSubject}.json`),
    path.join(rootDir, 'src', 'data', 'syllabus', `${normSubject}.json`),
  ];

  let rawData = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        rawData = JSON.parse(fs.readFileSync(p, 'utf8'));
        break;
      } catch (err) {
        console.error(`Error reading ${p}:`, err);
      }
    }
  }

  if (!rawData) {
    throw new Error(`Could not find syllabus JSON dataset for ${normSubject}`);
  }

  let units = [];
  let branches = null;

  if (normSubject === 'chemistry') {
    const chemData = rawData.JEE_Main_Chemistry_Syllabus_2026 || {};
    branches = {
      Physical_Chemistry: (chemData.Physical_Chemistry || []).map((u) => ({
        ...u,
        branch: 'Physical Chemistry',
      })),
      Inorganic_Chemistry: (chemData.Inorganic_Chemistry || []).map((u) => ({
        ...u,
        branch: 'Inorganic Chemistry',
      })),
      Organic_Chemistry: (chemData.Organic_Chemistry || []).map((u) => ({
        ...u,
        branch: 'Organic Chemistry',
      })),
    };
    units = [
      ...branches.Physical_Chemistry,
      ...branches.Inorganic_Chemistry,
      ...branches.Organic_Chemistry,
    ].sort((a, b) => a.unit_number - b.unit_number);
  } else {
    units = (rawData[meta.dataKey] || [])
      .map((u) => ({
        ...u,
        subtopics: u.subtopics ? [...u.subtopics] : [],
      }))
      .sort((a, b) => a.unit_number - b.unit_number);
  }

  return { meta, units, branches };
}

/**
 * Generates structured, compact Markdown for direct LLM ingestion.
 */
export function generateSyllabusMarkdown(subject, rootDir = process.cwd()) {
  const { meta, units, branches } = loadSubjectUnits(subject, rootDir);
  const totalSubtopics = units.reduce((acc, u) => acc + (u.subtopics ? u.subtopics.length : 0), 0);

  let md = `# ${meta.displayName} Syllabus (${meta.examAlignment})\n\n`;
  md += `> Official NTA 2026 syllabus chapter and subtopic breakdown for ${meta.displayName}. Track preparation progress, NCERT coverage, and revision cycles offline with OJEET Tracker (https://tracker.ojeet.tech${meta.canonicalPath}).\n\n`;

  md += `## Metadata\n`;
  md += `- **Subject**: ${meta.displayName}\n`;
  md += `- **Exam Alignment**: ${meta.examAlignment}\n`;
  md += `- **Total Units / Chapters**: ${units.length}\n`;
  md += `- **Total Subtopics**: ${totalSubtopics}\n`;
  md += `- **Status**: 100% compliant with NTA & NMC 2026 syllabus\n`;
  md += `- **Access**: 100% Free, offline-first local storage, zero ads, no sign-in required\n`;
  md += `- **Canonical URL**: https://tracker.ojeet.tech${meta.canonicalPath}\n\n`;

  md += `## Chapter & Subtopic Checklist\n\n`;

  if (branches) {
    for (const [branchKey, branchUnits] of Object.entries(branches)) {
      const branchName = branchKey.replace(/_/g, ' ');
      md += `### ${branchName}\n\n`;
      for (const unit of branchUnits) {
        md += `#### Unit ${unit.unit_number}: ${unit.unit_name}\n`;
        if (unit.subtopics && unit.subtopics.length > 0) {
          for (const subtopic of unit.subtopics) {
            md += `- [ ] ${subtopic}\n`;
          }
        } else {
          md += `- [ ] General Unit Review\n`;
        }
        md += `\n`;
      }
    }
  } else {
    for (const unit of units) {
      md += `### Unit ${unit.unit_number}: ${unit.unit_name}\n`;
      if (unit.subtopics && unit.subtopics.length > 0) {
        for (const subtopic of unit.subtopics) {
          md += `- [ ] ${subtopic}\n`;
        }
      } else {
        md += `- [ ] General Unit Review\n`;
      }
      md += `\n`;
    }
  }

  md += `---\n\n`;
  md += `## Related Syllabi & Preparation Tools\n`;
  md += `- [Physics Syllabus Tracker](https://tracker.ojeet.tech/physics)\n`;
  md += `- [Chemistry Syllabus Tracker](https://tracker.ojeet.tech/chemistry)\n`;
  md += `- [Mathematics Syllabus Tracker](https://tracker.ojeet.tech/maths)\n`;
  md += `- [Biology Syllabus Tracker](https://tracker.ojeet.tech/biology)\n`;
  md += `- [Daily Study Planner](https://tracker.ojeet.tech/jee-study-planner)\n`;
  md += `- [Focus Study Clock & Pomodoro](https://tracker.ojeet.tech/jee-study-timer)\n`;
  md += `- [LLMs Agent Manifest](https://tracker.ojeet.tech/llms.txt)\n`;
  md += `- [100% Free Pricing & Privacy](https://tracker.ojeet.tech/pricing.md)\n`;

  return md;
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
 * Generates pre-rendered semantic HTML containing complete unit titles,
 * chapter lists, and subtopic checklists derived from syllabus JSON datasets.
 */
export function generateSyllabusHTML(subject, options = {}) {
  const rootDir = options.rootDir || process.cwd();
  const { meta, units } = loadSubjectUnits(subject, rootDir);
  const totalSubtopics = units.reduce((acc, u) => acc + (u.subtopics ? u.subtopics.length : 0), 0);

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
      // Minimal fallback shell if index.html is missing
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

  const canonicalUrl = `https://tracker.ojeet.tech${meta.canonicalPath}`;

  // Update Page Title and Meta Description
  html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
  html = replaceMetaTag(html, null, 'description', meta.description);

  // Update Canonical and Open Graph / Twitter Tags
  html = replaceCanonical(html, canonicalUrl);
  html = replaceMetaTag(html, 'og:title', null, meta.title);
  html = replaceMetaTag(html, null, 'twitter:title', meta.title);
  html = replaceMetaTag(html, 'og:description', null, meta.description);
  html = replaceMetaTag(html, null, 'twitter:description', meta.description);
  html = replaceMetaTag(html, 'og:url', null, canonicalUrl);

  // Build JSON-LD structured data for the subject syllabus
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${canonicalUrl}#itemlist`,
    name: `${meta.displayName} 2026 Chapter Syllabus Checklist`,
    description: `Complete chapter and unit syllabus breakdown for ${meta.displayName} (${meta.examAlignment})`,
    numberOfItems: units.length,
    itemListElement: units.map((u, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `Unit ${u.unit_number}: ${u.unit_name}`,
      description: `Covers ${(u.subtopics || []).length} key subtopics for ${meta.examAlignment}`,
    })),
  };

  const jsonLdScript = `\n    <script type="application/ld+json">\n${JSON.stringify(jsonLdData, null, 2)}\n    </script>`;
  html = html.replace('</head>', `${jsonLdScript}\n  </head>`);

  // Render Units and Subtopics Semantic HTML
  const renderedUnitsHtml = units
    .map(
      (unit) => `
        <article class="syllabus-unit-card" id="unit-${unit.unit_number}">
          <header class="unit-card-header">
            ${unit.branch ? `<span class="unit-branch-badge">${escapeHtml(unit.branch)}</span>` : ''}
            <h3>Unit ${unit.unit_number}: ${escapeHtml(unit.unit_name)}</h3>
          </header>
          <p class="subtopic-count-meta">${(unit.subtopics || []).length} Subtopics</p>
          <ul class="subtopics-list">
            ${(unit.subtopics || [])
              .map(
                (st) => `
              <li class="subtopic-item">
                <label>
                  <input type="checkbox" disabled aria-label="${escapeHtml(st)}" />
                  <span>${escapeHtml(st)}</span>
                </label>
              </li>`
              )
              .join('')}
          </ul>
        </article>`
    )
    .join('');

  const prerenderedMain = `
      <main class="seo-fallback subject-prerendered-syllabus" data-subject="${subject}">
        <header class="subject-seo-header">
          <nav aria-label="Breadcrumb" class="seo-breadcrumb">
            <a href="/">Home</a> &rsaquo;
            <a href="/jee-syllabus-tracker">Syllabus</a> &rsaquo;
            <span>${escapeHtml(meta.displayName)}</span>
          </nav>
          <h1>${escapeHtml(meta.displayName)} Syllabus 2026 (${escapeHtml(meta.examAlignment)})</h1>
          <p class="subject-seo-summary">
            ${escapeHtml(meta.description)} Free, offline-first interactive syllabus tracker with chapter checklists, revision tracking, and study session timers.
          </p>
          <div class="subject-stats-bar">
            <span><strong>${units.length}</strong> Total Chapters</span>
            <span><strong>${totalSubtopics}</strong> Subtopics</span>
            <span><strong>100% Free</strong> Offline Tracker</span>
          </div>
        </header>

        <section class="syllabus-breakdown" aria-label="${escapeHtml(meta.displayName)} Units and Subtopics">
          <h2>Chapter-Wise Syllabus &amp; Subtopic Checklist</h2>
          <div class="units-container">
            ${renderedUnitsHtml}
          </div>
        </section>

        <section class="seo-syllabus-nav">
          <h2>Explore Other Subject Syllabi &amp; Tools</h2>
          <ul>
            <li><a href="/physics">Physics Syllabus Tracker</a></li>
            <li><a href="/chemistry">Chemistry Syllabus Tracker</a></li>
            <li><a href="/maths">Mathematics Syllabus Tracker</a></li>
            <li><a href="/biology">Biology Syllabus Tracker</a></li>
            <li><a href="/jee-study-planner">Daily Study Planner</a></li>
            <li><a href="/jee-study-timer">Focus Study Clock</a></li>
            <li><a href="/pricing.md">100% Free Guarantee</a></li>
            <li><a href="/llms.txt">AI Agents Knowledge Base</a></li>
          </ul>
        </section>
      </main>`;

  // Replace default app-boot-loader or seo-fallback within #root or inject into #root
  const fallbackRegex = /(<(?:main|div)\s+class="seo-fallback[^"]*"[\s\S]*?<\/(?:main|div)>)/;
  if (html.includes('<div id="app-boot-loader"')) {
    html = html.replace(
      /<div\s+id="app-boot-loader"[\s\S]*?<\/div>\s*<\/div>/,
      `${prerenderedMain.trim()}\n    </div>`
    );
  } else if (fallbackRegex.test(html)) {
    html = html.replace(fallbackRegex, prerenderedMain.trim());
  } else if (html.includes('<div id="root">')) {
    html = html.replace('<div id="root">', `<div id="root">${prerenderedMain}`);
  }

  return html;
}

/**
 * Serverless / Edge Function Handler
 */
export default async function handler(req, res) {
  try {
    const rawSubject =
      (req.query && (req.query.subject || req.query.s)) ||
      (req.url && req.url.split('?')[0].split('/').filter(Boolean).pop());

    const subject = normalizeSubject(rawSubject);

    if (!subject) {
      return res
        .status(404)
        .send(
          'Subject syllabus route not found. Supported subject routes: /physics, /chemistry, /maths, /biology'
        );
    }

    const acceptHeader = (req.headers && req.headers['accept']) || '';
    const userAgent = (req.headers && req.headers['user-agent']) || '';
    const query = req.query || {};

    // 1. Content Negotiation for Markdown
    if (isMarkdownRequest(acceptHeader, query)) {
      const markdown = generateSyllabusMarkdown(subject);
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader(
        'Cache-Control',
        'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800'
      );
      res.setHeader('Vary', 'Accept, User-Agent');
      return res.status(200).send(markdown);
    }

    // 2. Pre-rendered HTML for AI search crawlers or direct visits
    const isBot = isBotRequest(userAgent);
    const host = (req.headers && (req.headers['x-forwarded-host'] || req.headers.host)) || '';
    const isDev =
      host.includes('localhost') ||
      host.includes('127.0.0.1') ||
      process.env.NODE_ENV === 'development' ||
      process.env.VERCEL_ENV === 'development';

    const html = generateSyllabusHTML(subject, { isDev });
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
    console.error('Error generating subject prerender:', error);
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
