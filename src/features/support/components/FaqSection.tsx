import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { ASPIRANT_FAQS, useFaqJsonLd, FaqItem } from '../../../shared/seo/faqData';

interface FaqSectionProps {
  faqs?: FaqItem[];
  defaultOpenId?: string | null;
}

export const FaqSection: React.FC<FaqSectionProps> = ({
  faqs = ASPIRANT_FAQS,
  defaultOpenId = 'pricing',
}) => {
  // Inject FAQPage JSON-LD in head
  useFaqJsonLd(faqs);

  const [openIds, setOpenIds] = useState<Record<string, boolean>>(() => {
    return defaultOpenId ? { [defaultOpenId]: true } : {};
  });

  const toggleFaq = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section className="support-faq-section" aria-labelledby="faq-section-heading">
      <div className="support-faq-header">
        <div className="support-faq-badge">
          <HelpCircle size={16} aria-hidden="true" />
          <span>Aspirant Knowledge Base</span>
        </div>
        <h2 id="faq-section-heading" className="support-faq-title">
          Frequently Asked Questions
        </h2>
        <p className="support-faq-subtitle">
          Everything you need to know about OJEET Tracker, offline persistence, and the 2026 syllabus.
        </p>
      </div>

      <div className="support-faq-list" role="region" aria-label="Aspirant Questions Accordion">
        {faqs.map((faq) => {
          const isOpen = Boolean(openIds[faq.id]);
          return (
            <div
              key={faq.id}
              className={`support-faq-item ${isOpen ? 'open' : ''}`}
              data-testid={`faq-item-${faq.id}`}
            >
              <button
                type="button"
                className="support-faq-question-btn"
                onClick={() => toggleFaq(faq.id)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${faq.id}`}
                id={`faq-question-${faq.id}`}
              >
                <span className="support-faq-question-text">{faq.question}</span>
                <span className={`support-faq-icon-wrapper ${isOpen ? 'rotated' : ''}`}>
                  <ChevronDown size={18} aria-hidden="true" />
                </span>
              </button>
              <div
                id={`faq-answer-${faq.id}`}
                role="region"
                aria-labelledby={`faq-question-${faq.id}`}
                className={`support-faq-answer-wrapper ${isOpen ? 'expanded' : 'collapsed'}`}
              >
                <p className="support-faq-answer-text">{faq.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
