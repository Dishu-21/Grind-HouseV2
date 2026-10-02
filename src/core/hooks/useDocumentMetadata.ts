import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ROUTE_METADATA,
  ROUTE_ALIASES,
  getRouteMetadata,
  type RouteMeta,
} from '../../shared/seo/routeMetadata';
import { useBreadcrumbsJsonLd } from '../../shared/seo/useBreadcrumbsJsonLd';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export const BASE_URL = 'https://tracker.ojeet.tech';
export const SITE_NAME = 'OJEET Tracker';
export const OG_IMAGE = `${BASE_URL}/og_image.jpg`;

export { ROUTE_METADATA, type RouteMeta };
export const routeMetadata = ROUTE_METADATA;

function setMetaTag(attribute: string, attrValue: string, content: string) {
  let element = document.querySelector(`meta[${attribute}="${attrValue}"]`);
  if (element) {
    element.setAttribute('content', content);
  } else {
    element = document.createElement('meta');
    element.setAttribute(attribute, attrValue);
    element.setAttribute('content', content);
    document.head.appendChild(element);
  }
}

function setCanonical(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (link) {
    link.href = url;
  } else {
    link = document.createElement('link');
    link.rel = 'canonical';
    link.href = url;
    document.head.appendChild(link);
  }
}

export function useDocumentMetadata() {
  const { pathname } = useLocation();

  useBreadcrumbsJsonLd(pathname);

  useEffect(() => {
    const normalizedPath = pathname.replace(/\/+$/, '') || '/';
    const targetPath = ROUTE_ALIASES[normalizedPath] || normalizedPath;
    const meta = getRouteMetadata(pathname);
    const canonicalPath =
      ROUTE_METADATA[targetPath]?.canonicalPath ||
      (normalizedPath === '/' ? '/jee-syllabus-tracker' : normalizedPath);
    const canonicalUrl = `${BASE_URL}${canonicalPath}`;

    // Document title
    document.title = meta.title;

    // Standard meta
    setMetaTag('name', 'description', meta.description);

    // Canonical
    setCanonical(canonicalUrl);

    // Open Graph
    setMetaTag('property', 'og:title', meta.title);
    setMetaTag('property', 'og:description', meta.description);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:image', OG_IMAGE);
    setMetaTag('property', 'og:site_name', SITE_NAME);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:locale', 'en_IN');

    // Twitter Card
    setMetaTag('name', 'twitter:title', meta.title);
    setMetaTag('name', 'twitter:description', meta.description);
    setMetaTag('name', 'twitter:image', OG_IMAGE);
    setMetaTag('name', 'twitter:card', 'summary_large_image');

    // Google Analytics Pageview Tracking
    if (window.gtag) {
      window.gtag('config', 'G-LPYD20N2G5', {
        page_path: pathname,
        page_title: meta.title,
      });
    }
  }, [pathname]);
}
