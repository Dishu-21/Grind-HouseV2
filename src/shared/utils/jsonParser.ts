import { Subject, SubjectData } from '../types';
import {
  getBundledSubjectData,
  getAllBundledSubjectData,
  parseSyllabusJSON,
  JSONUnit,
  ChemistrySyllabus,
  SyllabusResponse,
  BUNDLED_SUBJECT_DATA,
} from './syllabusData';

export type { JSONUnit, ChemistrySyllabus, SyllabusResponse };
export { parseSyllabusJSON, getBundledSubjectData, getAllBundledSubjectData, BUNDLED_SUBJECT_DATA };

/**
 * Loads subject syllabus data. Returns bundled data without runtime HTTP fetch.
 * Kept async for full backward compatibility with existing callers and tests.
 */
export async function parseSubjectJSON(subject: string): Promise<SubjectData> {
  const validSubjects: Subject[] = ['physics', 'chemistry', 'maths', 'biology'];
  if (!validSubjects.includes(subject as Subject)) {
    throw new Error(`Failed to fetch JSON for subject: ${subject}`);
  }
  return getBundledSubjectData(subject as Subject);
}

