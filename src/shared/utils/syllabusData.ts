import { Chapter, Subject, SubjectData } from '../types';
import physicsSyllabus from '../../data/syllabus/physics.json';
import chemistrySyllabus from '../../data/syllabus/chemistry.json';
import mathsSyllabus from '../../data/syllabus/maths.json';
import biologySyllabus from '../../data/syllabus/biology.json';

export interface JSONUnit {
  unit_number: number;
  unit_name: string;
  subtopics: string[];
}

export interface ChemistrySyllabus {
  Physical_Chemistry?: JSONUnit[];
  Inorganic_Chemistry?: JSONUnit[];
  Organic_Chemistry?: JSONUnit[];
}

export interface SyllabusResponse {
  JEE_Main_Physics_Syllabus_2026?: JSONUnit[];
  JEE_Main_Mathematics_Syllabus_2026?: JSONUnit[];
  JEE_Main_Chemistry_Syllabus_2026?: ChemistrySyllabus;
  NEET_Biology_Syllabus_2026?: JSONUnit[];
}

export const DEFAULT_MATERIAL_NAMES = ['NCERT', 'PYQs', 'Modules'];

export function parseSyllabusJSON(subject: string, data: SyllabusResponse): SubjectData {
  let units: JSONUnit[] = [];

  if (subject === 'physics') {
    units = data.JEE_Main_Physics_Syllabus_2026 || [];
  } else if (subject === 'maths') {
    units = data.JEE_Main_Mathematics_Syllabus_2026 || [];
  } else if (subject === 'biology') {
    units = data.NEET_Biology_Syllabus_2026 || [];
  } else if (subject === 'chemistry') {
    const chemData = data.JEE_Main_Chemistry_Syllabus_2026;
    if (chemData) {
      units = [
        ...(chemData.Physical_Chemistry || []),
        ...(chemData.Inorganic_Chemistry || []),
        ...(chemData.Organic_Chemistry || []),
      ];
    }
  }

  // Sort units by unit_number to ensure correct sequence
  const sortedUnits = [...units].sort((a, b) => a.unit_number - b.unit_number);

  const chapters: Chapter[] = sortedUnits.map((unit) => ({
    serial: unit.unit_number,
    name: unit.unit_name,
    materials: [...DEFAULT_MATERIAL_NAMES],
    subtopics: unit.subtopics ? [...unit.subtopics] : [],
  }));

  return {
    chapters,
    materialNames: [...DEFAULT_MATERIAL_NAMES],
  };
}

export const BUNDLED_SUBJECT_DATA: Record<Subject, SubjectData> = {
  physics: parseSyllabusJSON('physics', physicsSyllabus as SyllabusResponse),
  chemistry: parseSyllabusJSON('chemistry', chemistrySyllabus as SyllabusResponse),
  maths: parseSyllabusJSON('maths', mathsSyllabus as SyllabusResponse),
  biology: parseSyllabusJSON('biology', biologySyllabus as SyllabusResponse),
};

export function getBundledSubjectData(subject: Subject): SubjectData {
  const data = BUNDLED_SUBJECT_DATA[subject];
  if (!data) {
    throw new Error(`Failed to load syllabus for subject: ${subject}`);
  }
  // Return a deep clone so mutations by callers do not alter the canonical static data
  return {
    materialNames: [...data.materialNames],
    chapters: data.chapters.map((ch) => ({
      serial: ch.serial,
      name: ch.name,
      materials: [...ch.materials],
      subtopics: ch.subtopics ? [...ch.subtopics] : [],
    })),
  };
}

export function getAllBundledSubjectData(): Record<Subject, SubjectData> {
  return {
    physics: getBundledSubjectData('physics'),
    chemistry: getBundledSubjectData('chemistry'),
    maths: getBundledSubjectData('maths'),
    biology: getBundledSubjectData('biology'),
  };
}
