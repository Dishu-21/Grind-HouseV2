import React from 'react';
import { NavView, View } from '../types';

export type { NavView, View };

/**
 * Checks if a click event is a primary left click without modifier keys.
 * Modified clicks (Cmd, Ctrl, Shift, Alt, Alt or secondary clicks should be ignored.
 */
export function isPlainLeftClick(event: React.MouseEvent): boolean {
  return event.button === 0 && !event.metaKey && !event.altKey && !event.ctrlKey && !event.shiftKey;
}

/**
 * Returns the canonical URL path for a given application view.
 */
export function getViewRoute(view: NavView, isNeet = false): string {
  switch (view) {
    case 'dashboard':
      return isNeet ? '/neet-syllabus-tracker' : '/jee-syllabus-tracker';
    case 'planner':
      return isNeet ? '/neet-study-planner' : '/jee-study-planner';
    case 'studyclock':
      return isNeet ? '/neet-study-timer' : '/jee-study-timer';
    case 'mockscores':
      return isNeet ? '/neet-mock-scores' : '/jee-mock-scores';
    case 'reports':
      return '/reports';
    case 'support':
      return '/support';
    case 'leaderboard':
      return '/leaderboard';
    default:
      return `/${view}`;
  }
}
