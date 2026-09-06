import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parseSubjectJSON,
  getBundledSubjectData,
  getAllBundledSubjectData,
  parseSyllabusJSON,
  BUNDLED_SUBJECT_DATA,
} from './jsonParser';
import { Subject } from '../types';

describe('jsonParser & syllabusData offline bundling', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('parseSubjectJSON (backward compatibility & offline loading)', () => {
    const subjects: Subject[] = ['physics', 'chemistry', 'maths', 'biology'];

    it.each(subjects)('loads %s syllabus data without network fetch', async (subject) => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
        throw new Error('Network fetch should not be called!');
      });

      const data = await parseSubjectJSON(subject);

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(data).toBeDefined();
      expect(data.materialNames).toEqual(['NCERT', 'PYQs', 'Modules']);
      expect(data.chapters.length).toBeGreaterThan(0);
    });

    it('loads Physics with 25 sorted chapters and subtopics', async () => {
      const data = await parseSubjectJSON('physics');
      expect(data.chapters).toHaveLength(25);
      expect(data.chapters[0].serial).toBe(1);
      expect(data.chapters[0].name).toBe('Units and Measurements');
      expect(data.chapters[0].subtopics).toContain('Units of measurements');
      expect(data.chapters[24].serial).toBe(25);

      // Verify strict sequential ordering
      data.chapters.forEach((chapter, index) => {
        expect(chapter.serial).toBe(index + 1);
        expect(chapter.materials).toEqual(['NCERT', 'PYQs', 'Modules']);
      });
    });

    it('loads Chemistry combining Physical, Inorganic, and Organic into 25 sorted chapters', async () => {
      const data = await parseSubjectJSON('chemistry');
      expect(data.chapters).toHaveLength(25);
      expect(data.chapters[0].serial).toBe(1);
      expect(data.chapters[0].name).toBe('Some Basic Concepts in Chemistry');
      expect(data.chapters[0].subtopics).toContain('Mole concept');

      // Verify sequence
      data.chapters.forEach((chapter, index) => {
        expect(chapter.serial).toBe(index + 1);
      });
    });

    it('loads Maths with 25 sorted chapters and subtopics', async () => {
      const data = await parseSubjectJSON('maths');
      expect(data.chapters).toHaveLength(25);
      expect(data.chapters[0].serial).toBe(1);
      expect(data.chapters[0].name).toBe('Sets, Relations and Functions');
      expect(data.chapters[0].subtopics).toContain('Power set');

      data.chapters.forEach((chapter, index) => {
        expect(chapter.serial).toBe(index + 1);
      });
    });

    it('loads Biology with 33 sorted chapters and subtopics', async () => {
      const data = await parseSubjectJSON('biology');
      expect(data.chapters).toHaveLength(33);
      expect(data.chapters[0].serial).toBe(1);
      expect(data.chapters[0].name).toBe('The Living World');
      expect(data.chapters[0].subtopics).toContain('Binomial nomenclature');

      data.chapters.forEach((chapter, index) => {
        expect(chapter.serial).toBe(index + 1);
      });
    });

    it('throws descriptive error when given an invalid subject', async () => {
      await expect(parseSubjectJSON('invalid_subject')).rejects.toThrow(
        'Failed to fetch JSON for subject: invalid_subject'
      );
    });
  });

  describe('getBundledSubjectData & immutability', () => {
    it('returns deep clones so caller mutations do not mutate canonical bundled data', () => {
      const clone1 = getBundledSubjectData('physics');
      clone1.materialNames.push('Custom Material');
      clone1.chapters[0].name = 'Modified Chapter Name';
      clone1.chapters[0].subtopics?.push('Fake Subtopic');

      const clone2 = getBundledSubjectData('physics');
      expect(clone2.materialNames).toEqual(['NCERT', 'PYQs', 'Modules']);
      expect(clone2.chapters[0].name).toBe('Units and Measurements');
      expect(clone2.chapters[0].subtopics).not.toContain('Fake Subtopic');
      expect(BUNDLED_SUBJECT_DATA.physics.chapters[0].name).toBe('Units and Measurements');
    });

    it('throws an error for unsupported subject', () => {
      expect(() => getBundledSubjectData('nonexistent' as any)).toThrow(
        'Failed to load syllabus for subject: nonexistent'
      );
    });
  });

  describe('getAllBundledSubjectData', () => {
    it('returns an object containing all 4 subjects ready for offline use', () => {
      const all = getAllBundledSubjectData();
      expect(Object.keys(all).sort()).toEqual(['biology', 'chemistry', 'maths', 'physics']);
      expect(all.physics.chapters.length).toBe(25);
      expect(all.chemistry.chapters.length).toBe(25);
      expect(all.maths.chapters.length).toBe(25);
      expect(all.biology.chapters.length).toBe(33);
    });
  });

  describe('parseSyllabusJSON custom data parser', () => {
    it('sorts units out of order by unit_number', () => {
      const customData = {
        JEE_Main_Physics_Syllabus_2026: [
          { unit_number: 3, unit_name: 'Laws of Motion', subtopics: ['Inertia'] },
          { unit_number: 1, unit_name: 'Units', subtopics: ['SI Units'] },
          { unit_number: 2, unit_name: 'Kinematics', subtopics: ['Velocity'] },
        ],
      };

      const result = parseSyllabusJSON('physics', customData);
      expect(result.chapters.map((c) => c.serial)).toEqual([1, 2, 3]);
      expect(result.chapters.map((c) => c.name)).toEqual(['Units', 'Kinematics', 'Laws of Motion']);
    });

    it('handles missing subtopics gracefully', () => {
      const customData = {
        JEE_Main_Mathematics_Syllabus_2026: [
          { unit_number: 1, unit_name: 'Sets', subtopics: undefined as any },
        ],
      };

      const result = parseSyllabusJSON('maths', customData);
      expect(result.chapters[0].subtopics).toEqual([]);
    });
  });
});
