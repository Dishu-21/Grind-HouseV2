import { useEffect } from 'react';

export const FAQ_JSONLD_SCRIPT_ID = 'faq-jsonld';
const BASE_URL = 'https://tracker.ojeet.tech';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const ASPIRANT_FAQS: FaqItem[] = [
  {
    id: 'pricing',
    question: 'Is OJEET Tracker completely free to use?',
    answer:
      'Yes, OJEET Tracker is 100% free with no subscription fees, no paywalls, and no hidden charges. All syllabus tracking, daily planning, and study timer features for JEE and NEET are accessible at zero cost.',
  },
  {
    id: 'offline',
    question: 'Does OJEET Tracker work offline without an internet connection?',
    answer:
      'Yes, OJEET Tracker is built as an offline-first web application. All chapter progress, study planner schedules, and timer logs persist in local browser storage, allowing you to track your JEE and NEET prep seamlessly in hostels, libraries, or during power outages without active internet.',
  },
  {
    id: 'syllabus-2026',
    question: 'Is OJEET Tracker updated with the latest 2026 JEE and NEET syllabus?',
    answer:
      'Yes, OJEET Tracker is fully updated for the 2026 exam cycle. It incorporates the latest National Testing Agency (NTA) and NMC syllabus changes for JEE Main, JEE Advanced, and NEET UG across Physics, Chemistry, Mathematics, and Biology, reflecting all officially deleted and modified chapters.',
  },
  {
    id: 'data-privacy',
    question: 'How is user study data stored, and is my preparation data private?',
    answer:
      'Your study data is saved locally on your device using client-side storage by default. OJEET Tracker does not sell or share personal study habits, completion percentages, or timetable records with third parties, ensuring your exam preparation remains completely private.',
  },
  {
    id: 'exams-subjects',
    question: 'What exams and subjects does OJEET Tracker cover?',
    answer:
      'OJEET Tracker supports JEE Main, JEE Advanced, and NEET UG preparation. It covers all core subjects: Physics, Chemistry, Mathematics (PCM) for engineering aspirants, as well as Biology (Botany and Zoology) for medical aspirants.',
  },
];

export interface FaqPageSchema {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  '@id': string;
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
}

export function generateFaqJsonLd(faqs: FaqItem[] = ASPIRANT_FAQS): FaqPageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${BASE_URL}/support#faq`,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function useFaqJsonLd(faqs: FaqItem[] = ASPIRANT_FAQS) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const schema = generateFaqJsonLd(faqs);
    let script = document.getElementById(FAQ_JSONLD_SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = FAQ_JSONLD_SCRIPT_ID;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema, null, 2);

    return () => {
      const el = document.getElementById(FAQ_JSONLD_SCRIPT_ID);
      if (el) {
        el.remove();
      }
    };
  }, [faqs]);
}
