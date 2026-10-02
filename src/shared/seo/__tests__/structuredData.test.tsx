import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, renderHook } from '@testing-library/react';
import fs from 'node:fs';
import path from 'node:path';
import { MemoryRouter } from 'react-router-dom';

import {
  generateBreadcrumbsJsonLd,
  useBreadcrumbsJsonLd,
  BREADCRUMBS_SCRIPT_ID,
  BASE_URL,
} from '../useBreadcrumbsJsonLd';
import {
  generateSubjectJsonLd,
  useSubjectJsonLd,
  SUBJECT_JSONLD_SCRIPT_ID,
} from '../useSubjectJsonLd';
import {
  generateFaqJsonLd,
  FAQ_JSONLD_SCRIPT_ID,
} from '../faqData';
import { FaqSection } from '../../../features/support/components/FaqSection';
import { Chapter } from '../../types';

describe('Structured Data (JSON-LD) Schemas', () => {
  afterEach(() => {
    // Clean up any test injected scripts in head
    document.getElementById(BREADCRUMBS_SCRIPT_ID)?.remove();
    document.getElementById(SUBJECT_JSONLD_SCRIPT_ID)?.remove();
    document.getElementById(FAQ_JSONLD_SCRIPT_ID)?.remove();
  });

  describe('1. index.html WebApplication Schema', () => {
    const indexHtmlPath = path.resolve(process.cwd(), 'index.html');
    const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');

    // Extract the json-ld script block
    const jsonLdMatch = indexHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    const parsedData = jsonLdMatch ? JSON.parse(jsonLdMatch[1]) : null;
    const graph = parsedData?.['@graph'] || [];
    const webApp = graph.find((item: any) =>
      Array.isArray(item['@type'])
        ? item['@type'].includes('WebApplication')
        : item['@type'] === 'WebApplication'
    );

    it('contains WebApplication schema in index.html', () => {
      expect(webApp).toBeDefined();
    });

    it('specifies softwareVersion 3.6.0', () => {
      expect(webApp?.softwareVersion).toBe('3.6.0');
    });

    it('specifies applicationCategory as EducationalApplication and operatingSystem as Any', () => {
      expect(webApp?.applicationCategory).toBe('EducationalApplication');
      expect(webApp?.operatingSystem).toBe('Any');
    });

    it('includes rich image and screenshot properties', () => {
      expect(webApp?.image).toBe('https://tracker.ojeet.tech/og_image.jpg');
      expect(webApp?.screenshot).toBe('https://tracker.ojeet.tech/og_image.jpg');
    });

    it('includes free offers property', () => {
      expect(webApp?.offers?.price).toBe('0');
      expect(webApp?.offers?.priceCurrency).toBe('INR');
    });
  });

  describe('2. BreadcrumbList Schema Generation & Dynamic Injection', () => {
    const deepRoutes = [
      { path: '/physics', expectedName: 'Physics Syllabus Tracker' },
      { path: '/chemistry', expectedName: 'Chemistry Syllabus Tracker' },
      { path: '/maths', expectedName: 'Maths Syllabus Tracker' },
      { path: '/biology', expectedName: 'Biology Syllabus Tracker' },
      { path: '/jee-study-planner', expectedName: 'JEE Study Planner' },
      { path: '/neet-study-planner', expectedName: 'NEET Study Planner' },
      { path: '/jee-study-timer', expectedName: 'JEE Study Timer' },
      { path: '/neet-study-timer', expectedName: 'NEET Study Timer' },
      { path: '/reports', expectedName: 'Study Analytics & Reports' },
      { path: '/jee-mock-scores', expectedName: 'JEE Mock Scores' },
      { path: '/neet-mock-scores', expectedName: 'NEET Mock Scores' },
      { path: '/support', expectedName: 'Support & FAQs' },
    ];

    it.each(deepRoutes)(
      'generates valid BreadcrumbList schema with position, name, and valid URL for $path',
      ({ path, expectedName }) => {
        const schema = generateBreadcrumbsJsonLd(path);

        expect(schema['@context']).toBe('https://schema.org');
        expect(schema['@type']).toBe('BreadcrumbList');
        expect(schema.itemListElement).toHaveLength(2);

        // Root crumb
        expect(schema.itemListElement[0]).toEqual({
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${BASE_URL}/`,
        });

        // Deep crumb
        expect(schema.itemListElement[1]).toEqual({
          '@type': 'ListItem',
          position: 2,
          name: expectedName,
          item: `${BASE_URL}${path}`,
        });
      }
    );

    it('resolves alias routes like /math and /planner to canonical breadcrumb targets', () => {
      const mathSchema = generateBreadcrumbsJsonLd('/math');
      expect(mathSchema.itemListElement[1].item).toBe(`${BASE_URL}/maths`);
      expect(mathSchema.itemListElement[1].name).toBe('Maths Syllabus Tracker');

      const plannerSchema = generateBreadcrumbsJsonLd('/planner');
      expect(plannerSchema.itemListElement[1].item).toBe(`${BASE_URL}/jee-study-planner`);
      expect(plannerSchema.itemListElement[1].name).toBe('JEE Study Planner');
    });

    it('dynamically injects BreadcrumbList JSON-LD into document.head via useBreadcrumbsJsonLd hook', () => {
      renderHook(() => useBreadcrumbsJsonLd('/physics'));

      const script = document.getElementById(BREADCRUMBS_SCRIPT_ID) as HTMLScriptElement;
      expect(script).not.toBeNull();
      expect(script.type).toBe('application/ld+json');

      const parsed = JSON.parse(script.textContent || '{}');
      expect(parsed['@type']).toBe('BreadcrumbList');
      expect(parsed.itemListElement[1].name).toBe('Physics Syllabus Tracker');
      expect(parsed.itemListElement[1].item).toBe(`${BASE_URL}/physics`);
    });

    it('cleans up breadcrumbs script on hook unmount', () => {
      const { unmount } = renderHook(() => useBreadcrumbsJsonLd('/physics'));
      expect(document.getElementById(BREADCRUMBS_SCRIPT_ID)).not.toBeNull();

      unmount();
      expect(document.getElementById(BREADCRUMBS_SCRIPT_ID)).toBeNull();
    });
  });

  describe('3. Syllabus ItemList / DefinedTermSet Schema Generation', () => {
    const mockChapters: Chapter[] = [
      { serial: 1, name: 'Units and Measurements', materials: ['NCERT'] },
      { serial: 2, name: 'Kinematics', materials: ['NCERT', 'PYQ'] },
      { serial: 3, name: 'Laws of Motion', materials: ['NCERT'] },
    ];

    it('generates ItemList schema representing syllabus chapters with serial and name', () => {
      const schema = generateSubjectJsonLd('physics', mockChapters);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('ItemList');
      expect(schema.name).toContain('Physics Syllabus Chapters');
      expect(schema.numberOfItems).toBe(3);
      expect(schema.itemListElement).toHaveLength(3);

      expect(schema.itemListElement[0]).toEqual({
        '@type': 'ListItem',
        position: 1,
        name: 'Units and Measurements',
        item: {
          '@type': 'DefinedTerm',
          '@id': 'https://tracker.ojeet.tech/physics#chapter-1',
          name: 'Units and Measurements',
          termCode: 'CH-1',
          inDefinedTermSet: {
            '@type': 'DefinedTermSet',
            '@id': 'https://tracker.ojeet.tech/physics#syllabus',
            name: 'Physics Syllabus 2026',
            url: 'https://tracker.ojeet.tech/physics',
          },
        },
      });

      expect(schema.itemListElement[1].position).toBe(2);
      expect(schema.itemListElement[1].name).toBe('Kinematics');
      expect(schema.itemListElement[1].item.termCode).toBe('CH-2');
    });

    it('dynamically injects ItemList JSON-LD into head and cleans up on unmount', () => {
      const { unmount } = renderHook(() => useSubjectJsonLd('chemistry', mockChapters));

      const script = document.getElementById(SUBJECT_JSONLD_SCRIPT_ID) as HTMLScriptElement;
      expect(script).not.toBeNull();

      const parsed = JSON.parse(script.textContent || '{}');
      expect(parsed['@type']).toBe('ItemList');
      expect(parsed.name).toContain('Chemistry');
      expect(parsed.numberOfItems).toBe(3);

      unmount();
      expect(document.getElementById(SUBJECT_JSONLD_SCRIPT_ID)).toBeNull();
    });

    it('does not inject script if chapters are empty or undefined', () => {
      renderHook(() => useSubjectJsonLd('maths', []));
      expect(document.getElementById(SUBJECT_JSONLD_SCRIPT_ID)).toBeNull();
    });
  });

  describe('4. FAQPage Schema & Visible FAQ Section Rendering', () => {
    it('generates valid FAQPage schema addressing all 5 required aspirant queries', () => {
      const schema = generateFaqJsonLd();

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('FAQPage');
      expect(schema.mainEntity).toHaveLength(5);

      const questions = schema.mainEntity.map((q) => q.name);

      expect(questions).toContain('Is OJEET Tracker completely free to use?');
      expect(questions).toContain('Does OJEET Tracker work offline without an internet connection?');
      expect(questions).toContain(
        'Is OJEET Tracker updated with the latest 2026 JEE and NEET syllabus?'
      );
      expect(questions).toContain(
        'How is user study data stored, and is my preparation data private?'
      );
      expect(questions).toContain('What exams and subjects does OJEET Tracker cover?');

      schema.mainEntity.forEach((item) => {
        expect(item['@type']).toBe('Question');
        expect(item.acceptedAnswer['@type']).toBe('Answer');
        expect(item.acceptedAnswer.text.length).toBeGreaterThan(20);
      });
    });

    it('renders visible, accessible FAQ accordion section with questions and default opened answer', () => {
      render(
        <MemoryRouter>
          <FaqSection defaultOpenId="pricing" />
        </MemoryRouter>
      );

      // Section and heading
      expect(
        screen.getByRole('heading', { level: 2, name: /Frequently Asked Questions/i })
      ).toBeInTheDocument();

      // All 5 question buttons rendered
      const pricingBtn = screen.getByRole('button', {
        name: /Is OJEET Tracker completely free to use\?/i,
      });
      expect(pricingBtn).toBeInTheDocument();
      expect(pricingBtn).toHaveAttribute('aria-expanded', 'true');

      // Answer text for pricing is visible
      expect(screen.getByText(/100% free with no subscription fees/i)).toBeInTheDocument();

      // Second question is initially collapsed
      const offlineBtn = screen.getByRole('button', {
        name: /Does OJEET Tracker work offline without an internet connection\?/i,
      });
      expect(offlineBtn).toBeInTheDocument();
      expect(offlineBtn).toHaveAttribute('aria-expanded', 'false');

      // Clicking offline question expands it
      fireEvent.click(offlineBtn);
      expect(offlineBtn).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText(/built as an offline-first web application/i)).toBeInTheDocument();
    });

    it('injects FAQPage JSON-LD script into head and cleans up on unmount', () => {
      const { unmount } = render(
        <MemoryRouter>
          <FaqSection />
        </MemoryRouter>
      );

      const script = document.getElementById(FAQ_JSONLD_SCRIPT_ID) as HTMLScriptElement;
      expect(script).not.toBeNull();
      expect(script.type).toBe('application/ld+json');

      const parsed = JSON.parse(script.textContent || '{}');
      expect(parsed['@type']).toBe('FAQPage');
      expect(parsed.mainEntity).toHaveLength(5);

      unmount();
      expect(document.getElementById(FAQ_JSONLD_SCRIPT_ID)).toBeNull();
    });
  });
});
