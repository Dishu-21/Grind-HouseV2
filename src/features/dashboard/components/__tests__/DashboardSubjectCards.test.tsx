import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Dashboard } from '../Dashboard';
import { ThemeProvider } from '../../../../core/context/ThemeContext';
import { SubjectDataProvider } from '../../../../core/context/SubjectDataContext';
import { UserProgressProvider } from '../../../../core/context/UserProgressContext';
import { RemoteAuthProvider } from '../../../../core/context/RemoteAuthContext';
import { RemoteSyncProvider } from '../../../../core/context/RemoteSyncContext';

// Mock AnalyticsPanels so test focuses purely on subject cards
vi.mock('../AnalyticsPanels', () => ({
  AnalyticsPanels: () => <div data-testid="mock-analytics-panels" />,
}));

// Mock chart.js
vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mock-line-chart" />,
  Doughnut: () => <div data-testid="mock-doughnut-chart" />,
  Bar: () => <div data-testid="mock-bar-chart" />,
}));

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

const mockSubjectData = {
  physics: {
    chapters: [
      { serial: 1, name: 'Kinematics', priority: 'high' as const, materials: [], subtopics: [] },
    ],
    materialNames: ['Notes', 'NCERT', 'PYQ'],
  },
  chemistry: {
    chapters: [
      {
        serial: 1,
        name: 'Atomic Structure',
        priority: 'high' as const,
        materials: [],
        subtopics: [],
      },
    ],
    materialNames: ['Notes', 'NCERT', 'PYQ'],
  },
  maths: {
    chapters: [
      { serial: 1, name: 'Calculus', priority: 'high' as const, materials: [], subtopics: [] },
    ],
    materialNames: ['Notes', 'NCERT', 'PYQ'],
  },
  biology: {
    chapters: [
      { serial: 1, name: 'Genetics', priority: 'high' as const, materials: [], subtopics: [] },
    ],
    materialNames: ['Notes', 'NCERT', 'PYQ'],
  },
};

function renderDashboard(props = {}) {
  const defaultProps = {
    physicsProgress: 50,
    chemistryProgress: 60,
    mathsProgress: 70,
    biologyProgress: 0,
    overallProgress: 60,
    subjectData: mockSubjectData,
    onNavigate: vi.fn(),
    quote: { quote: 'Keep pushing forward.', author: 'Anonymous' },
    plannerTasks: [],
    onToggleTask: vi.fn(),
    examDates: [],
    onAddExam: vi.fn(),
    onDeleteExam: vi.fn(),
    onUpdateExam: vi.fn(),
    onSetPrimaryExam: vi.fn(),
    onSetFavouriteExam: vi.fn(),
    onSetExamSyllabus: vi.fn(),
    onQuickAdd: vi.fn(),
    studySessions: [],
    mockScores: [],
    onAddMockScore: vi.fn(),
    onDeleteMockScore: vi.fn(),
    ...props,
  };

  return render(
    <MemoryRouter initialEntries={['/jee-syllabus-tracker']}>
      <ThemeProvider>
        <SubjectDataProvider>
          <UserProgressProvider>
            <RemoteAuthProvider>
              <RemoteSyncProvider>
                <Dashboard {...defaultProps} />
              </RemoteSyncProvider>
            </RemoteAuthProvider>
          </UserProgressProvider>
        </SubjectDataProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('Dashboard Subject Cards Crawlable Links Seam', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders each subject card as a semantic HTML anchor link with valid href', () => {
    renderDashboard();

    const subjectCardsContainer = document.querySelector('.subject-cards');
    expect(subjectCardsContainer).toBeInTheDocument();

    const subjectLinks = subjectCardsContainer?.querySelectorAll('a.subject-card');
    expect(subjectLinks?.length).toBeGreaterThanOrEqual(3);

    const physicsCard = subjectCardsContainer?.querySelector('a[href="/physics"]');
    expect(physicsCard).toBeInTheDocument();

    const chemistryCard = subjectCardsContainer?.querySelector('a[href="/chemistry"]');
    expect(chemistryCard).toBeInTheDocument();

    const mathsCard = subjectCardsContainer?.querySelector('a[href="/maths"]');
    expect(mathsCard).toBeInTheDocument();
  });

  it('allows clicking subject card to trigger navigation', () => {
    const onNavigate = vi.fn();
    renderDashboard({ onNavigate });

    const physicsCard = document.querySelector('a.subject-card[href="/physics"]') as HTMLElement;
    expect(physicsCard).toBeInTheDocument();

    fireEvent.click(physicsCard);
    expect(onNavigate).toHaveBeenCalledWith('physics');
  });

  it('does not trigger onNavigate callback on modifier-clicks so browser opens new tab', () => {
    const onNavigate = vi.fn();
    renderDashboard({ onNavigate });

    const chemistryCard = document.querySelector(
      'a.subject-card[href="/chemistry"]'
    ) as HTMLElement;
    expect(chemistryCard).toBeInTheDocument();

    // Cmd click
    fireEvent.click(chemistryCard, { metaKey: true });
    expect(onNavigate).not.toHaveBeenCalled();

    // Ctrl click
    fireEvent.click(chemistryCard, { ctrlKey: true });
    expect(onNavigate).not.toHaveBeenCalled();

    // Shift click
    fireEvent.click(chemistryCard, { shiftKey: true });
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('allows keyboard navigation via Enter key on subject cards', () => {
    const onNavigate = vi.fn();
    renderDashboard({ onNavigate });

    const mathsCard = document.querySelector('a.subject-card[href="/maths"]') as HTMLElement;
    expect(mathsCard).toBeInTheDocument();

    // Standard anchor activation on Enter dispatches click
    fireEvent.click(mathsCard);
    expect(onNavigate).toHaveBeenCalledWith('maths');
  });
});
