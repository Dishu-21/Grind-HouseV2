import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ROUTE_ALIASES, ROUTE_METADATA } from './routeMetadata';

export const BASE_URL = 'https://tracker.ojeet.tech';
export const BREADCRUMBS_SCRIPT_ID = 'breadcrumbs-jsonld';

export const BREADCRUMB_NAME_MAP: Record<string, string> = {
  '/': 'Home',
  '/jee-syllabus-tracker': 'JEE Syllabus Tracker',
  '/neet-syllabus-tracker': 'NEET Syllabus Tracker',
  '/physics': 'Physics Syllabus Tracker',
  '/chemistry': 'Chemistry Syllabus Tracker',
  '/maths': 'Maths Syllabus Tracker',
  '/biology': 'Biology Syllabus Tracker',
  '/jee-study-planner': 'JEE Study Planner',
  '/neet-study-planner': 'NEET Study Planner',
  '/jee-study-timer': 'JEE Study Timer',
  '/neet-study-timer': 'NEET Study Timer',
  '/reports': 'Study Analytics & Reports',
  '/jee-mock-scores': 'JEE Mock Scores',
  '/neet-mock-scores': 'NEET Mock Scores',
  '/changelog': 'Changelog',
  '/privacy-policy': 'Privacy Policy',
  '/terms-of-service': 'Terms of Service',
  '/import': 'Import & Sync',
  '/support': 'Support & FAQs',
  '/community': 'Community',
};

export interface BreadcrumbListItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item: string;
}

export interface BreadcrumbListSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: BreadcrumbListItem[];
}

export function getBreadcrumbName(pathname: string): string {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  const targetPath = ROUTE_ALIASES[normalizedPath] || normalizedPath;

  if (BREADCRUMB_NAME_MAP[targetPath]) {
    return BREADCRUMB_NAME_MAP[targetPath];
  }

  const meta = ROUTE_METADATA[targetPath];
  if (meta?.h1) {
    return meta.h1.split(' (')[0].split(' – ')[0].trim();
  }

  const segment = targetPath.split('/').filter(Boolean).pop() || 'Page';
  return segment
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

export function generateBreadcrumbsJsonLd(pathname: string): BreadcrumbListSchema {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  const targetPath = ROUTE_ALIASES[normalizedPath] || normalizedPath;
  const canonicalPath = ROUTE_METADATA[targetPath]?.canonicalPath || targetPath;

  const items: BreadcrumbListItem[] = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: `${BASE_URL}/`,
    },
  ];

  // If we are at the root itself (and not mapped to a deep canonical path like /jee-syllabus-tracker)
  if (normalizedPath === '/' && canonicalPath === '/') {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items,
    };
  }

  // Deep route item
  const pageName = getBreadcrumbName(targetPath);
  items.push({
    '@type': 'ListItem',
    position: 2,
    name: pageName,
    item: `${BASE_URL}${canonicalPath}`,
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

export function useBreadcrumbsJsonLd(customPathname?: string) {
  let locationPathname = '/';
  try {
    const location = useLocation();
    locationPathname = location.pathname;
  } catch {
    // Fallback if rendered outside of Router context
    if (typeof window !== 'undefined') {
      locationPathname = window.location.pathname;
    }
  }

  const pathname = customPathname ?? locationPathname;

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const schema = generateBreadcrumbsJsonLd(pathname);
    let script = document.getElementById(BREADCRUMBS_SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = BREADCRUMBS_SCRIPT_ID;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema, null, 2);

    return () => {
      const el = document.getElementById(BREADCRUMBS_SCRIPT_ID);
      if (el) {
        el.remove();
      }
    };
  }, [pathname]);
}
