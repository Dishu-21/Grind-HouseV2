import routeMetadataJson from './routeMetadata.json';

export interface RouteMeta {
  title: string;
  description: string;
  canonicalPath?: string;
  h1?: string;
  summary?: string;
}

export const ROUTE_METADATA: Record<string, RouteMeta> = routeMetadataJson;

export const ROUTE_ALIASES: Record<string, string> = {
  '/': '/jee-syllabus-tracker',
  '/math': '/maths',
  '/planner': '/jee-study-planner',
  '/studyclock': '/jee-study-timer',
};

export function getRouteMetadata(pathname: string): RouteMeta {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  const targetPath = ROUTE_ALIASES[normalizedPath] || normalizedPath;
  return ROUTE_METADATA[targetPath] ?? ROUTE_METADATA['/jee-syllabus-tracker'];
}
