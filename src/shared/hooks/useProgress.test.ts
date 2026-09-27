import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useProgress, ChapterFilter } from './useProgress';
import { AppProgress, Subject, SubjectData } from '../types';

describe('useProgress', () => {
  const mockSubjectData: Record<Subject, SubjectData | null> = {
    physics: {
      chapters: [
        { serial: 1, name: 'Units & Dimensions', materials: ['Notes', 'PYQs'] },
        { serial: 2, name: 'Kinematics', materials: ['Notes', 'PYQs'] },
        { serial: 3, name: 'NLM', materials: ['Notes', 'PYQs'] },
      ],
      materialNames: ['Notes', 'PYQs'],
    },
    chemistry: {
      chapters: [
        { serial: 10, name: 'Mole Concept', materials: ['Notes', 'PYQs'] },
      ],
      materialNames: ['Notes', 'PYQs'],
    },
    maths: {
      chapters: [],
      materialNames: ['Notes', 'PYQs'],
    },
    biology: null,
  };

  const mockProgress: AppProgress = {
    physics: {
      1: {
        completed: { Notes: true, PYQs: false },
        priority: 'medium',
      },
      2: {
        completed: { Notes: true, PYQs: true },
        priority: 'high',
      },
      3: {
        completed: { Notes: false, PYQs: false },
        priority: 'low',
      },
    },
    chemistry: {
      10: {
        completed: { Notes: true, PYQs: true },
        priority: 'high',
      },
    },
    maths: {},
    biology: {},
  };

  it('computes full syllabus progress when filter is undefined', () => {
    const { result } = renderHook(() => useProgress(mockProgress, mockSubjectData, undefined));
    // Physics: chapter 1 has 1 material completed, chapter 2 has 2, chapter 3 has 0 -> total 3 completed out of 6 materials (3 chapters * 2 materials) = 50%
    expect(result.current.physicsProgress).toBe(50);
    // Chemistry: chapter 10 has 2 completed out of 2 materials = 100%
    expect(result.current.chemistryProgress).toBe(100);
    // Maths: 0/0 -> 0%
    expect(result.current.mathsProgress).toBe(0);
    // Overall: (3 + 2) / (6 + 2) = 5 / 8 = 62.5 -> Math.round -> 63%
    expect(result.current.overallProgress).toBe(63);
  });

  it('computes scoped progress when a subset of chapter serials is passed in filter', () => {
    // Filter physics to only chapter 2 (where both Notes and PYQs are completed = 2/2)
    const filter: ChapterFilter = {
      physics: new Set([2]),
    };
    const { result } = renderHook(() => useProgress(mockProgress, mockSubjectData, filter));
    // Physics should now be 2/2 = 100%
    expect(result.current.physicsProgress).toBe(100);
    // Chemistry not present in filter -> defaults to full subject (2/2 = 100%)
    expect(result.current.chemistryProgress).toBe(100);
    // Overall: (2 + 2) / (2 + 2) = 100%
    expect(result.current.overallProgress).toBe(100);
  });

  it('treats subject absent from filter as full subject progress', () => {
    const filter: ChapterFilter = {
      physics: new Set([1]), // only chapter 1 (1/2 completed = 50%)
      // chemistry is absent -> should count full chemistry (2/2 = 100%)
    };
    const { result } = renderHook(() => useProgress(mockProgress, mockSubjectData, filter));
    expect(result.current.physicsProgress).toBe(50);
    expect(result.current.chemistryProgress).toBe(100);
    // Overall: (1 + 2) / (2 + 2) = 3 / 4 = 75%
    expect(result.current.overallProgress).toBe(75);
  });

  it('handles empty filter set appropriately or guards against no matching chapters', () => {
    // If a filter is passed with an empty Set or no matching chapters for that subject, totalItems is 0 -> progress is 0
    const filter: ChapterFilter = {
      physics: new Set([999]), // non-existent chapter
    };
    const { result } = renderHook(() => useProgress(mockProgress, mockSubjectData, filter));
    expect(result.current.physicsProgress).toBe(0);
  });

  it('computes overall progress scoped to activeSubjects, ignoring inactive subjects', () => {
    const subjectDataWithBio: Record<Subject, SubjectData | null> = {
      ...mockSubjectData,
      biology: {
        chapters: [
          { serial: 1, name: 'The Living World', materials: ['Notes', 'PYQs'] },
          { serial: 2, name: 'Biological Classification', materials: ['Notes', 'PYQs'] },
        ],
        materialNames: ['Notes', 'PYQs'],
      },
    };

    // If activeSubjects is ['physics', 'chemistry'], biology (4 uncompleted items) must not dilute progress
    const { result } = renderHook(() =>
      useProgress(mockProgress, subjectDataWithBio, undefined, ['physics', 'chemistry'])
    );
    // (3 + 2) / (6 + 2) = 62.5 -> 63% (instead of 5 / 12 = 42%)
    expect(result.current.overallProgress).toBe(63);
  });

  it('reports 100% overall progress when all active subjects are 100%, even if inactive subject has 0%', () => {
    const allCompletedProgress: AppProgress = {
      physics: {
        1: { completed: { Notes: true, PYQs: true }, priority: 'high' },
        2: { completed: { Notes: true, PYQs: true }, priority: 'high' },
        3: { completed: { Notes: true, PYQs: true }, priority: 'high' },
      },
      chemistry: {
        10: { completed: { Notes: true, PYQs: true }, priority: 'high' },
      },
      maths: {},
      biology: {},
    };

    const subjectDataWithBio: Record<Subject, SubjectData | null> = {
      ...mockSubjectData,
      biology: {
        chapters: [
          { serial: 1, name: 'The Living World', materials: ['Notes', 'PYQs'] },
          { serial: 2, name: 'Biological Classification', materials: ['Notes', 'PYQs'] },
        ],
        materialNames: ['Notes', 'PYQs'],
      },
    };

    const { result } = renderHook(() =>
      useProgress(allCompletedProgress, subjectDataWithBio, undefined, ['physics', 'chemistry'])
    );
    expect(result.current.physicsProgress).toBe(100);
    expect(result.current.chemistryProgress).toBe(100);
    expect(result.current.overallProgress).toBe(100);
  });
});
