import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useDocumentMetadata, BASE_URL } from '../useDocumentMetadata';
import { ROUTE_METADATA } from '../../../shared/seo/routeMetadata';
import React from 'react';

describe('useDocumentMetadata Hook', () => {
  beforeEach(() => {
    // Clear head elements before each test
    document.title = '';
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.remove();
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.remove();
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.remove();
  });

  afterEach(() => {
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.remove();
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.remove();
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.remove();
  });

  function renderWithRouter(initialEntry: string) {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
    );
    return renderHook(() => useDocumentMetadata(), { wrapper });
  }

  it('sets self-referencing canonical tag and og:url for /jee-syllabus-tracker', () => {
    renderWithRouter('/jee-syllabus-tracker');

    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    expect(canonical).not.toBeNull();
    expect(canonical.href).toBe(`${BASE_URL}/jee-syllabus-tracker`);

    const ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement;
    expect(ogUrl).not.toBeNull();
    expect(ogUrl.content).toBe(`${BASE_URL}/jee-syllabus-tracker`);
  });

  it('unifies root / to point to canonical /jee-syllabus-tracker', () => {
    renderWithRouter('/');

    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    expect(canonical).not.toBeNull();
    expect(canonical.href).toBe(`${BASE_URL}/jee-syllabus-tracker`);

    const ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement;
    expect(ogUrl).not.toBeNull();
    expect(ogUrl.content).toBe(`${BASE_URL}/jee-syllabus-tracker`);
  });

  it('resolves alias routes like /math to canonical /maths', () => {
    renderWithRouter('/math');

    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    expect(canonical).not.toBeNull();
    expect(canonical.href).toBe(`${BASE_URL}/maths`);

    const ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement;
    expect(ogUrl).not.toBeNull();
    expect(ogUrl.content).toBe(`${BASE_URL}/maths`);
  });

  it('resolves alias routes like /planner to canonical /jee-study-planner', () => {
    renderWithRouter('/planner');

    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    expect(canonical).not.toBeNull();
    expect(canonical.href).toBe(`${BASE_URL}/jee-study-planner`);

    const ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement;
    expect(ogUrl).not.toBeNull();
    expect(ogUrl.content).toBe(`${BASE_URL}/jee-study-planner`);
  });

  it('sets self-referencing canonical tag for subpages like /physics', () => {
    renderWithRouter('/physics');

    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    expect(canonical).not.toBeNull();
    expect(canonical.href).toBe(`${BASE_URL}/physics`);

    const ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement;
    expect(ogUrl).not.toBeNull();
    expect(ogUrl.content).toBe(`${BASE_URL}/physics`);
  });

  it('sets self-referencing canonical tag for subpages like /chemistry', () => {
    renderWithRouter('/chemistry');

    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    expect(canonical).not.toBeNull();
    expect(canonical.href).toBe(`${BASE_URL}/chemistry`);
  });

  it('sets self-referencing canonical tag for subpages like /biology', () => {
    renderWithRouter('/biology');

    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    expect(canonical).not.toBeNull();
    expect(canonical.href).toBe(`${BASE_URL}/biology`);
  });

  it('sets self-referencing canonical tag for /neet-syllabus-tracker', () => {
    renderWithRouter('/neet-syllabus-tracker');

    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    expect(canonical).not.toBeNull();
    expect(canonical.href).toBe(`${BASE_URL}/neet-syllabus-tracker`);
  });

  it('sets self-referencing canonical tag for unmapped subpages matching the requested path', () => {
    renderWithRouter('/invite/studygroup123');

    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    expect(canonical).not.toBeNull();
    expect(canonical.href).toBe(`${BASE_URL}/invite/studygroup123`);

    const ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement;
    expect(ogUrl).not.toBeNull();
    expect(ogUrl.content).toBe(`${BASE_URL}/invite/studygroup123`);
  });

  it('sets dedicated title, description, and canonical tag for /reports', () => {
    renderWithRouter('/reports');

    expect(document.title).toBe(ROUTE_METADATA['/reports'].title);
    expect(document.title).not.toBe(ROUTE_METADATA['/jee-syllabus-tracker'].title);

    const desc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    expect(desc).not.toBeNull();
    expect(desc.content).toBe(ROUTE_METADATA['/reports'].description);
    expect(desc.content).not.toBe(ROUTE_METADATA['/jee-syllabus-tracker'].description);

    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    expect(canonical).not.toBeNull();
    expect(canonical.href).toBe(`${BASE_URL}/reports`);
    expect(canonical.href).not.toBe(`${BASE_URL}/jee-syllabus-tracker`);
  });

  it('sets dedicated title, description, and canonical tag for /support', () => {
    renderWithRouter('/support');

    expect(document.title).toBe(ROUTE_METADATA['/support'].title);
    expect(document.title).not.toBe(ROUTE_METADATA['/jee-syllabus-tracker'].title);

    const desc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    expect(desc).not.toBeNull();
    expect(desc.content).toBe(ROUTE_METADATA['/support'].description);
    expect(desc.content).not.toBe(ROUTE_METADATA['/jee-syllabus-tracker'].description);

    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    expect(canonical).not.toBeNull();
    expect(canonical.href).toBe(`${BASE_URL}/support`);
    expect(canonical.href).not.toBe(`${BASE_URL}/jee-syllabus-tracker`);
  });

  it('sets dedicated title, description, and canonical tag for /community', () => {
    renderWithRouter('/community');

    expect(document.title).toBe(ROUTE_METADATA['/community'].title);
    expect(document.title).not.toBe(ROUTE_METADATA['/jee-syllabus-tracker'].title);

    const desc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    expect(desc).not.toBeNull();
    expect(desc.content).toBe(ROUTE_METADATA['/community'].description);
    expect(desc.content).not.toBe(ROUTE_METADATA['/jee-syllabus-tracker'].description);

    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    expect(canonical).not.toBeNull();
    expect(canonical.href).toBe(`${BASE_URL}/community`);
    expect(canonical.href).not.toBe(`${BASE_URL}/jee-syllabus-tracker`);
  });
});
