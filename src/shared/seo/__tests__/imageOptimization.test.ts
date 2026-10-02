import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Image WebP Conversion & Core Web Vitals Optimization (Issue #34)', () => {
  const publicDir = path.resolve(process.cwd(), 'public');
  const onboardingWebpPath = path.join(publicDir, 'onboardingImage.webp');
  const blueBotWebpPath = path.join(publicDir, 'blueBot.webp');
  const musicBotWebpPath = path.join(publicDir, 'musicBot.webp');
  const ogImageWebpPath = path.join(publicDir, 'og_image.webp');
  const blueBotPngPath = path.join(publicDir, 'blueBot.png');
  const musicBotPngPath = path.join(publicDir, 'musicBot.png');

  describe('Asset Existence and Size Limits', () => {
    it('converts onboardingImage.jpg to onboardingImage.webp under 70 KB', () => {
      expect(fs.existsSync(onboardingWebpPath), 'onboardingImage.webp should exist').toBe(true);
      const stats = fs.statSync(onboardingWebpPath);
      // Under 70 KB (70 * 1024 = 71,680 bytes)
      expect(stats.size).toBeLessThan(70 * 1024);
    });

    it('creates optimized blueBot.webp and musicBot.webp under 35 KB each', () => {
      expect(fs.existsSync(blueBotWebpPath), 'blueBot.webp should exist').toBe(true);
      expect(fs.existsSync(musicBotWebpPath), 'musicBot.webp should exist').toBe(true);

      const blueBotSize = fs.statSync(blueBotWebpPath).size;
      const musicBotSize = fs.statSync(musicBotWebpPath).size;

      expect(blueBotSize).toBeLessThan(35 * 1024);
      expect(musicBotSize).toBeLessThan(35 * 1024);
    });

    it('optimizes fallback PNG bot avatars from original >240 KB to under 90 KB', () => {
      expect(fs.existsSync(blueBotPngPath)).toBe(true);
      expect(fs.existsSync(musicBotPngPath)).toBe(true);

      const bluePngSize = fs.statSync(blueBotPngPath).size;
      const musicPngSize = fs.statSync(musicBotPngPath).size;

      expect(bluePngSize).toBeLessThan(90 * 1024);
      expect(musicPngSize).toBeLessThan(90 * 1024);
    });

    it('creates optimized og_image.webp under 80 KB', () => {
      expect(fs.existsSync(ogImageWebpPath), 'og_image.webp should exist').toBe(true);
      const ogSize = fs.statSync(ogImageWebpPath).size;
      expect(ogSize).toBeLessThan(80 * 1024);
    });

    it('reduces total initial image payload by over 80%', () => {
      // Baseline total: ~1,450 KB (onboardingImage 811KB, blueBot 247KB, musicBot 256KB, og_image 136KB)
      const baselineTotalBytes = 810948 + 247380 + 255969 + 135771; // 1,450,068 bytes
      const maxAllowedBytes = baselineTotalBytes * 0.2; // 80% reduction means <= 20% of baseline (~290 KB)

      const webpTotalBytes =
        fs.statSync(onboardingWebpPath).size +
        fs.statSync(blueBotWebpPath).size +
        fs.statSync(musicBotWebpPath).size +
        fs.statSync(ogImageWebpPath).size;

      expect(webpTotalBytes).toBeLessThan(maxAllowedBytes);
    });
  });

  describe('Component Layout Dimensions & CLS Elimination', () => {
    it('OnboardingLayout uses WebP with fallback and includes explicit width and height on images', () => {
      const layoutFile = path.resolve(
        process.cwd(),
        'src/features/onboarding/OnboardingLayout.tsx'
      );
      const content = fs.readFileSync(layoutFile, 'utf-8');

      expect(content).toContain('onboardingImage.webp');
      expect(content).toContain('onboardingImage.jpg');
      expect(content).toMatch(/width=\{?\d+\}?/);
      expect(content).toMatch(/height=\{?\d+\}?/);
    });

    it('ChatDrawer references WebP avatars and specifies explicit width and height', () => {
      const chatFile = path.resolve(process.cwd(), 'src/features/chat/components/ChatDrawer.tsx');
      const content = fs.readFileSync(chatFile, 'utf-8');

      expect(content).toContain('blueBot.webp');
      // Every img in ChatDrawer should have width and height
      const imgMatches = content.match(/<img[^>]+>/g) || [];
      expect(imgMatches.length).toBeGreaterThan(0);
      for (const img of imgMatches) {
        expect(img).toMatch(/width=/);
        expect(img).toMatch(/height=/);
      }
      // Non-critical drawer images should use loading="lazy"
      expect(content).toContain('loading="lazy"');
    });

    it('MusicPlayerDrawer references WebP avatar and specifies explicit width, height, and lazy loading', () => {
      const musicFile = path.resolve(
        process.cwd(),
        'src/features/music/components/MusicPlayerDrawer.tsx'
      );
      const content = fs.readFileSync(musicFile, 'utf-8');

      expect(content).toContain('musicBot.webp');
      const botImgMatches = content.match(/<img[^>]+musicBot[^>]+>/g) || [];
      expect(botImgMatches.length).toBeGreaterThan(0);
      for (const img of botImgMatches) {
        expect(img).toMatch(/width=/);
        expect(img).toMatch(/height=/);
      }
      expect(content).toContain('loading="lazy"');
    });

    it('StepPersonalize imports/references WebP bot avatars and sets loading="lazy"', () => {
      const stepFile = path.resolve(
        process.cwd(),
        'src/features/onboarding/steps/StepPersonalize.tsx'
      );
      const content = fs.readFileSync(stepFile, 'utf-8');

      expect(content).toContain('blueBot.webp');
      expect(content).toContain('musicBot.webp');
      expect(content).toContain('loading="lazy"');
    });
  });
});
