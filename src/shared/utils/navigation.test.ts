import { describe, it, expect } from 'vitest';
import { getViewRoute, isPlainLeftClick } from './navigation';

describe('getViewRoute', () => {
  describe('JEE mode (default)', () => {
    it('returns /jee-syllabus-tracker for dashboard', () => {
      expect(getViewRoute('dashboard', false)).toBe('/jee-syllabus-tracker');
    });

    it('returns /jee-study-planner for planner', () => {
      expect(getViewRoute('planner', false)).toBe('/jee-study-planner');
    });

    it('returns /jee-study-timer for studyclock', () => {
      expect(getViewRoute('studyclock', false)).toBe('/jee-study-timer');
    });

    it('returns /jee-mock-scores for mockscores', () => {
      expect(getViewRoute('mockscores', false)).toBe('/jee-mock-scores');
    });

    it('returns /reports for reports', () => {
      expect(getViewRoute('reports', false)).toBe('/reports');
    });

    it('returns /support for support', () => {
      expect(getViewRoute('support', false)).toBe('/support');
    });

    it('returns /community for community', () => {
      expect(getViewRoute('community', false)).toBe('/community');
    });

    it('returns /physics, /chemistry, /maths, /biology for subjects', () => {
      expect(getViewRoute('physics', false)).toBe('/physics');
      expect(getViewRoute('chemistry', false)).toBe('/chemistry');
      expect(getViewRoute('maths', false)).toBe('/maths');
      expect(getViewRoute('biology', false)).toBe('/biology');
    });
  });

  describe('NEET mode', () => {
    it('returns /neet-syllabus-tracker for dashboard', () => {
      expect(getViewRoute('dashboard', true)).toBe('/neet-syllabus-tracker');
    });

    it('returns /neet-study-planner for planner', () => {
      expect(getViewRoute('planner', true)).toBe('/neet-study-planner');
    });

    it('returns /neet-study-timer for studyclock', () => {
      expect(getViewRoute('studyclock', true)).toBe('/neet-study-timer');
    });

    it('returns /neet-mock-scores for mockscores', () => {
      expect(getViewRoute('mockscores', true)).toBe('/neet-mock-scores');
    });

    it('returns /{subject} for subjects in NEET mode as well', () => {
      expect(getViewRoute('physics', true)).toBe('/physics');
      expect(getViewRoute('biology', true)).toBe('/biology');
    });
  });
});

describe('isPlainLeftClick', () => {
  it('returns true for an unmodified primary left click', () => {
    const event = {
      button: 0,
      metaKey: false,
      altKey: false,
      ctrlKey: false,
      shiftKey: false,
    } as React.MouseEvent;
    expect(isPlainLeftClick(event)).toBe(true);
  });

  it('returns false when metaKey is pressed (Cmd click)', () => {
    const event = {
      button: 0,
      metaKey: true,
      altKey: false,
      ctrlKey: false,
      shiftKey: false,
    } as React.MouseEvent;
    expect(isPlainLeftClick(event)).toBe(false);
  });

  it('returns false when ctrlKey is pressed (Ctrl click)', () => {
    const event = {
      button: 0,
      metaKey: false,
      altKey: false,
      ctrlKey: true,
      shiftKey: false,
    } as React.MouseEvent;
    expect(isPlainLeftClick(event)).toBe(false);
  });

  it('returns false when shiftKey is pressed', () => {
    const event = {
      button: 0,
      metaKey: false,
      altKey: false,
      ctrlKey: false,
      shiftKey: true,
    } as React.MouseEvent;
    expect(isPlainLeftClick(event)).toBe(false);
  });

  it('returns false when altKey is pressed', () => {
    const event = {
      button: 0,
      metaKey: false,
      altKey: true,
      ctrlKey: false,
      shiftKey: false,
    } as React.MouseEvent;
    expect(isPlainLeftClick(event)).toBe(false);
  });

  it('returns false for non-primary clicks (middle click or right click)', () => {
    const middleClick = {
      button: 1,
      metaKey: false,
      altKey: false,
      ctrlKey: false,
      shiftKey: false,
    } as React.MouseEvent;
    expect(isPlainLeftClick(middleClick)).toBe(false);

    const rightClick = {
      button: 2,
      metaKey: false,
      altKey: false,
      ctrlKey: false,
      shiftKey: false,
    } as React.MouseEvent;
    expect(isPlainLeftClick(rightClick)).toBe(false);
  });
});
