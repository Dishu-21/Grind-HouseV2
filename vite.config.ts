/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf-8')
) as { version?: string };
const appVersion = packageJson.version ?? '0.0.0';
const appBuildId = `${appVersion}-${new Date().toISOString()}`;
const isTest = !!(
  process.env.VITEST ||
  process.env.NODE_ENV === 'test' ||
  process.argv.some((arg) => arg.includes('vitest'))
);

import type { ViteDevServer, Plugin, Connect } from 'vite';

function syllabusPrerenderDevPlugin(): Plugin {
  return {
    name: 'syllabus-prerender-dev',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(
        async (
          req: Connect.IncomingMessage & { query?: Record<string, string> },
          res,
          next: Connect.NextFunction
        ) => {
          const rawUrl = req.url || '';
          const pathname = rawUrl.split('?')[0];
          const subjectMatch = pathname.match(/^\/(physics|chemistry|maths|math|biology)\/?$/);
          const routeMatch = pathname.match(
            /^\/(jee-mock-scores|neet-mock-scores|jee-study-planner|neet-study-planner|jee-study-timer|neet-study-timer|jee-syllabus-tracker|neet-syllabus-tracker|reports|changelog|privacy-policy|terms-of-service|import|support|community|planner|studyclock)\/?$/
          );

          if (subjectMatch || routeMatch) {
            const accept = (req.headers['accept'] || '').toLowerCase();
            const userAgent = req.headers['user-agent'] || '';
            const isMarkdown =
              accept.includes('text/markdown') ||
              accept.includes('text/x-markdown') ||
              rawUrl.includes('format=markdown');
            const isBot =
              /(GPTBot|ChatGPT-User|PerplexityBot|ClaudeBot|anthropic-ai|Google-Extended|Bingbot|cohere-ai|OAI-SearchBot|Bytespider|Diffbot|FacebookBot|Meta-ExternalAgent|Applebot-Extended|Applebot|Googlebot|DuckDuckBot|Baiduspider|YandexBot|ia_archiver|Slurp|Discordbot|Twitterbot|facebookexternalhit|WhatsApp|LinkedInBot|TelegramBot|Slackbot|Slack-ImgProxy|Pinterest|SkypeUriPreview|vkShare)/i.test(
                userAgent
              );
            const forcePrerender =
              rawUrl.includes('format=html') || rawUrl.includes('prerender=true');

            if (subjectMatch && (isMarkdown || isBot || forcePrerender)) {
              try {
                const { default: handler } = await import('./api/subject-prerender.js');
                const urlObj = new URL(req.url, 'http://localhost');
                req.query = Object.fromEntries(urlObj.searchParams);
                req.query.subject = subjectMatch[1];
                return handler(req, res);
              } catch (err) {
                console.error('Subject prerender middleware error:', err);
              }
            } else if (routeMatch && (isBot || forcePrerender)) {
              try {
                const { default: handler } = await import('./api/edge-meta.js');
                const urlObj = new URL(req.url, 'http://localhost');
                req.query = Object.fromEntries(urlObj.searchParams);
                req.query.route = routeMatch[1];
                return handler(req, res);
              } catch (err) {
                console.error('Edge meta prerender middleware error:', err);
              }
            }
          }
          next();
        }
      );
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
    __APP_BUILD_ID__: JSON.stringify(appBuildId),
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-framer': ['framer-motion'],
          'vendor-charts': ['chart.js', 'react-chartjs-2'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
  resolve: {
    alias: isTest
      ? [
          {
            find: './pwaRegister',
            replacement: path.resolve(__dirname, 'src/shared/utils/pwaRegister.dummy.ts'),
          },
        ]
      : [],
  },
  plugins: [
    react(),
    !isTest && syllabusPrerenderDevPlugin(),
    !isTest &&
      VitePWA({
        injectRegister: false,
        registerType: 'autoUpdate',
        includeAssets: ['logo.png', 'og_image.jpg', 'og_image.webp'],
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,webp,json,webmanifest}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'google-fonts-stylesheets',
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'static-image-assets',
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        manifest: {
          name: 'OJEE-Tracker',
          short_name: 'OJEE-Tracker',
          description:
            'Track your IIT JEE syllabus progress, daily planner, and study clock offline.',
          theme_color: '#06b6d4',
          background_color: '#f8fafc',
          display: 'standalone',
          icons: [
            {
              src: 'logo.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'logo.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
      }),
  ].filter(Boolean) as any,
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
  },
});
