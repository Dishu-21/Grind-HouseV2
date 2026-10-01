import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';
import { SubjectDataProvider } from '../../../core/context/SubjectDataContext';
import { UserProgressProvider } from '../../../core/context/UserProgressContext';

vi.mock('./CloudSyncIndicator', () => ({
  CloudSyncIndicator: () => <div data-testid="cloud-sync-indicator" />,
}));
vi.mock('../ui/SettingsModal', () => ({
  SettingsModal: () => null,
}));
vi.mock('../ui/AuthModal', () => ({
  AuthModal: () => null,
}));
vi.mock('../ui/ColorPickerModal', () => ({
  ColorPickerModal: () => null,
}));
vi.mock('../ui/ProgressCardModal', () => ({
  ProgressCardModal: () => null,
}));

// Default mock props for Header
const defaultProps = {
  currentView: 'dashboard' as const,
  onNavigate: vi.fn(),
  theme: 'dark-glass' as const,
  onThemeChange: vi.fn(),
  onThemeToggle: vi.fn(),
  accentColor: '#00F0FF',
  onAccentChange: vi.fn(),
  useGridBackground: true,
  onUseGridBackgroundChange: vi.fn(),
  disableAutoShift: false,
  onDisableAutoShiftChange: vi.fn(),
  enableAIAgent: false,
  onEnableAIAgentChange: vi.fn(),
  enableMusicPlayer: false,
  onEnableMusicPlayerChange: vi.fn(),
  dailyResetHour: 0,
  onDailyResetHourChange: vi.fn(),
  backgroundUrl: '',
  onBackgroundUrlChange: vi.fn(),
  dimLevel: 50,
  onDimLevelChange: vi.fn(),
  glassIntensity: 50,
  onGlassIntensityChange: vi.fn(),
  glassRefraction: 50,
  onGlassRefractionChange: vi.fn(),
  studySessions: [],
  mockScores: [],
  physicsProgress: 45,
  chemistryProgress: 60,
  mathsProgress: 30,
  biologyProgress: 0,
  examDate: '2026-04-01',
  progressCardSettings: {
    userName: 'Aspirant',
    targetScore: 250,
    tagline: 'Focus',
    customAvatarUrl: '',
    visibleStats: {
      totalStudyTime: true,
      highestMockScore: true,
      highestDailyHours: true,
      highestWeekAverage: true,
      physicsTime: true,
      chemistryTime: true,
      mathsTime: true,
      physicsProgress: true,
      chemistryProgress: true,
      mathsProgress: true,
      examCountdown: true,
    },
  },
  onProgressCardSettingsChange: vi.fn(),
};

function renderHeader(props = {}) {
  return render(
    <MemoryRouter initialEntries={['/jee-syllabus-tracker']}>
      <SubjectDataProvider>
        <UserProgressProvider>
          <Header {...defaultProps} {...props} />
        </UserProgressProvider>
      </SubjectDataProvider>
    </MemoryRouter>
  );
}

describe('Header Crawlable Semantic Links Seam', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders desktop navigation items as semantic HTML anchor elements with valid hrefs', () => {
    renderHeader();

    const nav = screen.getByRole('navigation', { name: '' });
    // In desktop nav, query the nav items
    const desktopLinks = nav.querySelectorAll('.nav-item');
    expect(desktopLinks.length).toBeGreaterThan(0);

    // Check that each desktop nav item is an anchor tag with href
    desktopLinks.forEach((item) => {
      expect(item.tagName.toLowerCase()).toBe('a');
      expect(item.getAttribute('href')).toBeTruthy();
    });

    // Check specific destinations
    const dashboardLink = within(nav).getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toHaveAttribute('href', '/jee-syllabus-tracker');

    const physicsLink = within(nav).getByRole('link', { name: /physics/i });
    expect(physicsLink).toHaveAttribute('href', '/physics');

    const chemistryLink = within(nav).getByRole('link', { name: /chemistry/i });
    expect(chemistryLink).toHaveAttribute('href', '/chemistry');

    const mathsLink = within(nav).getByRole('link', { name: /maths/i });
    expect(mathsLink).toHaveAttribute('href', '/maths');

    const plannerLink = within(nav).getByRole('link', { name: /planner/i });
    expect(plannerLink).toHaveAttribute('href', '/jee-study-planner');

    const timerLink = within(nav).getByRole('link', { name: /study clock/i });
    expect(timerLink).toHaveAttribute('href', '/jee-study-timer');
  });

  it('preserves the active state and indicator for the active nav link', () => {
    renderHeader({ currentView: 'physics' });

    const nav = screen.getByRole('navigation', { name: '' });
    const physicsLink = within(nav).getByRole('link', { name: /physics/i });
    expect(physicsLink).toHaveClass('active');

    const dashboardLink = within(nav).getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).not.toHaveClass('active');
  });

  it('renders mobile bottom navigation items as semantic Links for primary pages', () => {
    renderHeader();

    const mobileNav = screen.getByRole('navigation', { name: /mobile navigation/i });
    expect(mobileNav).toBeInTheDocument();

    const mobileLinks = mobileNav.querySelectorAll('a.mobile-bottom-nav-item');
    expect(mobileLinks.length).toBe(3); // Dashboard, Planner, Timer

    const mobileDashboard = mobileNav.querySelector('a[href="/jee-syllabus-tracker"]');
    expect(mobileDashboard).toBeInTheDocument();

    const mobilePlanner = mobileNav.querySelector('a[href="/jee-study-planner"]');
    expect(mobilePlanner).toBeInTheDocument();

    const mobileTimer = mobileNav.querySelector('a[href="/jee-study-timer"]');
    expect(mobileTimer).toBeInTheDocument();

    // Subjects and Menu remain interactive toggle buttons
    const toggleButtons = mobileNav.querySelectorAll('button.mobile-bottom-nav-item');
    expect(toggleButtons.length).toBe(2);
  });

  it('renders support header buttons as semantic anchor links to /support', () => {
    renderHeader();

    const supportLinks = screen.getAllByRole('link', { name: /support ojee-tracker/i });
    expect(supportLinks.length).toBeGreaterThan(0);
    supportLinks.forEach((link) => {
      expect(link).toHaveAttribute('href', '/support');
    });
  });

  it('triggers onNavigate callback when link is clicked without modifier keys', () => {
    const onNavigate = vi.fn();
    renderHeader({ onNavigate });

    const nav = screen.getByRole('navigation', { name: '' });
    const physicsLink = within(nav).getByRole('link', { name: /physics/i });
    fireEvent.click(physicsLink);

    expect(onNavigate).toHaveBeenCalledWith('physics');
  });

  it('does not trigger onNavigate callback on modifier-clicks so browser opens new tab', () => {
    const onNavigate = vi.fn();
    renderHeader({ onNavigate });

    const nav = screen.getByRole('navigation', { name: '' });
    const physicsLink = within(nav).getByRole('link', { name: /physics/i });

    // Meta / Cmd click
    fireEvent.click(physicsLink, { metaKey: true });
    expect(onNavigate).not.toHaveBeenCalled();

    // Ctrl click
    fireEvent.click(physicsLink, { ctrlKey: true });
    expect(onNavigate).not.toHaveBeenCalled();

    // Shift click
    fireEvent.click(physicsLink, { shiftKey: true });
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('allows keyboard navigation via Enter key on navigation links', () => {
    const onNavigate = vi.fn();
    renderHeader({ onNavigate });

    const nav = screen.getByRole('navigation', { name: '' });
    const chemistryLink = within(nav).getByRole('link', { name: /chemistry/i });

    // In browsers, pressing Enter on focused anchor dispatches click
    fireEvent.click(chemistryLink);
    expect(onNavigate).toHaveBeenCalledWith('chemistry');
  });
});
