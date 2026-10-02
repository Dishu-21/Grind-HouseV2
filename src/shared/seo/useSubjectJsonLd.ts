import { useEffect } from 'react';
import { Subject, Chapter } from '../types';

export const SUBJECT_JSONLD_SCRIPT_ID = 'subject-syllabus-jsonld';
const BASE_URL = 'https://tracker.ojeet.tech';

export const SUBJECT_DISPLAY_NAMES: Record<Subject, string> = {
  physics: 'Physics',
  chemistry: 'Chemistry',
  maths: 'Mathematics',
  biology: 'Biology',
};

export interface SubjectChapterDefinedTerm {
  '@type': 'DefinedTerm';
  '@id': string;
  name: string;
  termCode: string;
  inDefinedTermSet: {
    '@type': 'DefinedTermSet';
    '@id': string;
    name: string;
    url: string;
  };
}

export interface SubjectChapterListItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item: SubjectChapterDefinedTerm;
}

export interface SubjectItemListSchema {
  '@context': 'https://schema.org';
  '@type': 'ItemList';
  '@id': string;
  name: string;
  description: string;
  numberOfItems: number;
  itemListElement: SubjectChapterListItem[];
}

export function generateSubjectJsonLd(
  subject: Subject,
  chapters: Chapter[]
): SubjectItemListSchema {
  const title = SUBJECT_DISPLAY_NAMES[subject] || subject;
  const subjectUrl = `${BASE_URL}/${subject}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${subjectUrl}#syllabus-list`,
    name: `${title} Syllabus Chapters (JEE & NEET 2026)`,
    description: `Official chapter-wise syllabus list for ${title} covering JEE Main, JEE Advanced, and NEET UG 2026 examination requirements.`,
    numberOfItems: chapters.length,
    itemListElement: chapters.map((chapter, index) => {
      const serial = chapter.serial ?? index + 1;
      return {
        '@type': 'ListItem',
        position: serial,
        name: chapter.name,
        item: {
          '@type': 'DefinedTerm',
          '@id': `${subjectUrl}#chapter-${serial}`,
          name: chapter.name,
          termCode: `CH-${serial}`,
          inDefinedTermSet: {
            '@type': 'DefinedTermSet',
            '@id': `${subjectUrl}#syllabus`,
            name: `${title} Syllabus 2026`,
            url: subjectUrl,
          },
        },
      };
    }),
  };
}

export function useSubjectJsonLd(subject: Subject, chapters?: Chapter[] | null) {
  useEffect(() => {
    if (typeof document === 'undefined' || !chapters || chapters.length === 0) {
      return;
    }

    const schema = generateSubjectJsonLd(subject, chapters);
    let script = document.getElementById(SUBJECT_JSONLD_SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = SUBJECT_JSONLD_SCRIPT_ID;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema, null, 2);

    return () => {
      const el = document.getElementById(SUBJECT_JSONLD_SCRIPT_ID);
      if (el) {
        el.remove();
      }
    };
  }, [subject, chapters]);
}
