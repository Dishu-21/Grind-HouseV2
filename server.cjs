const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

const BOT_REGEX =
  /(GPTBot|ChatGPT-User|PerplexityBot|ClaudeBot|anthropic-ai|Google-Extended|Bingbot|cohere-ai|OAI-SearchBot|Bytespider|Diffbot|FacebookBot|Meta-ExternalAgent|Applebot-Extended|Applebot|Googlebot|DuckDuckBot|Baiduspider|YandexBot|ia_archiver|Slurp|Discordbot|Twitterbot|facebookexternalhit|WhatsApp|LinkedInBot|TelegramBot|Slackbot|Slack-ImgProxy|Pinterest|SkypeUriPreview|vkShare)/i;

// Subject prerendering for AI crawlers & markdown negotiation
app.get('/:subject(physics|chemistry|maths|math|biology)', async (req, res, next) => {
  const accept = (req.headers['accept'] || '').toLowerCase();
  const userAgent = req.headers['user-agent'] || '';
  const isMarkdown =
    accept.includes('text/markdown') ||
    accept.includes('text/x-markdown') ||
    req.query.format === 'markdown';
  const isBot = BOT_REGEX.test(userAgent);
  const isHtmlFormat = req.query.format === 'html' || req.query.prerender === 'true';

  if (isMarkdown || isBot || isHtmlFormat) {
    try {
      const { default: handler } = await import('./api/subject-prerender.js');
      return handler(req, res);
    } catch (err) {
      console.error('Subject prerender error in server.cjs:', err);
    }
  }
  next();
});

// Edge route metadata prerendering for social crawlers and search engines
app.get(
  '/:route(jee-mock-scores|neet-mock-scores|jee-study-planner|neet-study-planner|jee-study-timer|neet-study-timer|jee-syllabus-tracker|neet-syllabus-tracker|reports|changelog|privacy-policy|terms-of-service|import|support|community|planner|studyclock)',
  async (req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';
    const isBot = BOT_REGEX.test(userAgent);
    const isPrerender = req.query.prerender === 'true' || req.query.format === 'html';

    if (isBot || isPrerender) {
      try {
        const { default: handler } = await import('./api/edge-meta.js');
        req.query.route = req.params.route;
        return handler(req, res);
      } catch (err) {
        console.error('Edge meta error in server.cjs:', err);
      }
    }
    next();
  }
);

// Handle SPA routing: return index.html for all requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log('Press Ctrl+C to stop.');
});
