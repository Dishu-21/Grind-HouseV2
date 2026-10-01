import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Setup environment mocks for jsdom
if (typeof window !== 'undefined') {
  global.ResizeObserver = class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  } as unknown as typeof ResizeObserver;
}

// Mock react-player & MusicPlayerDrawer
vi.mock('react-player', () => ({
  default: () => <div data-testid="mock-react-player" />,
}));
vi.mock('../../features/music/components/MusicPlayerDrawer', () => ({
  MusicPlayerDrawer: () => <div data-testid="mock-music-drawer" />,
}));
vi.mock('../../features/chat/components/ChatDrawer', () => ({
  ChatDrawer: () => <div data-testid="mock-chat-drawer" />,
}));

// Mock Chart.js components
vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mock-line-chart" />,
  Doughnut: () => <div data-testid="mock-doughnut-chart" />,
  Bar: () => <div data-testid="mock-bar-chart" />,
}));

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

// Mock pwaRegister
vi.mock('../../shared/utils/pwaRegister', () => ({
  registerSW: vi.fn(() => vi.fn()),
}));

// Mock pwaBridge
vi.mock('../../shared/utils/pwaBridge', () => ({
  applyPwaUpdate: vi.fn(),
  getPwaBridgeState: vi.fn(() => ({})),
  subscribePwaBridge: vi.fn(() => () => {}),
  initPwaBridge: vi.fn(),
}));

describe('App Route Gating and Decoupled Onboarding Seam', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    document.title = '';
  });

  it('mounts /physics page content and metadata directly when localStorage is empty', async () => {
    render(
      <MemoryRouter initialEntries={['/physics']}>
        <App />
      </MemoryRouter>
    );

    // Verify physics page content mounts
    const physicsHeading = await screen.findByRole(
      'heading',
      { name: /physics/i, level: 1 },
      { timeout: 15000 }
    );
    expect(physicsHeading).toBeInTheDocument();

    // Verify document metadata was set for physics
    await waitFor(
      () => {
        expect(document.title).toMatch(/physics/i);
      },
      { timeout: 15000 }
    );

    // Verify onboarding flow and theme onboarding modal are NOT displayed
    expect(screen.queryByText(/sync your progress across devices/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/configure your study workspace/i)).not.toBeInTheDocument();
  });

  it('mounts /privacy-policy page content and metadata directly when localStorage is empty', async () => {
    render(
      <MemoryRouter initialEntries={['/privacy-policy']}>
        <App />
      </MemoryRouter>
    );

    // Verify privacy policy page content mounts
    const privacyHeading = await screen.findByRole(
      'heading',
      { name: /privacy policy/i },
      { timeout: 15000 }
    );
    expect(privacyHeading).toBeInTheDocument();

    // Verify document metadata was set
    await waitFor(
      () => {
        expect(document.title).toMatch(/privacy policy/i);
      },
      { timeout: 15000 }
    );

    // Verify onboarding flow is NOT displayed
    expect(screen.queryByText(/sync your progress across devices/i)).not.toBeInTheDocument();
  });

  it('presents OnboardingFlow on root dashboard route when onboarding is incomplete while executing metadata', async () => {
    render(
      <MemoryRouter initialEntries={['/jee-syllabus-tracker']}>
        <App />
      </MemoryRouter>
    );

    // Verify onboarding flow is presented
    const onboardingText = await screen.findByText(
      /sync your progress across devices/i,
      { selector: 'p' },
      { timeout: 15000 }
    );
    expect(onboardingText).toBeInTheDocument();

    // Verify document metadata was executed for the dashboard route
    await waitFor(
      () => {
        expect(document.title).toMatch(/jee/i);
      },
      { timeout: 15000 }
    );
  });

  it('mounts dashboard directly without OnboardingFlow when onboarding is already complete', async () => {
    window.localStorage.setItem('jee-tracker-onboarding-complete', 'true');

    render(
      <MemoryRouter initialEntries={['/jee-syllabus-tracker']}>
        <App />
      </MemoryRouter>
    );

    // Verify document metadata was set
    await waitFor(
      () => {
        expect(document.title).toMatch(/jee/i);
      },
      { timeout: 15000 }
    );

    // Verify onboarding flow is NOT displayed
    expect(screen.queryByText(/sync your progress across devices/i)).not.toBeInTheDocument();
  });
}, 35000);
