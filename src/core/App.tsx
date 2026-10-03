import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../shared/components/layout/Header';
import { Footer } from '../shared/components/layout/Footer';
import { ThemeOnboardingModal } from '../shared/components/ui/ThemeOnboardingModal';
import { TopLoader } from '../shared/components/ui/TopLoader';
import { topLoader } from '../shared/hooks/useTopLoader';
import { View } from '../shared/types';
import { getLogicalTodayStr } from '../shared/utils/date';
import { getViewRoute } from '../shared/utils/navigation';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import { SubjectDataProvider } from './context/SubjectDataContext';
import { UserProgressProvider, useUserProgress } from './context/UserProgressContext';
import { RemoteAuthProvider } from './context/RemoteAuthContext';
import { RemoteSyncProvider } from './context/RemoteSyncContext';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';
import { useDocumentMetadata } from './hooks/useDocumentMetadata';
import { useAutoShiftTasks } from './hooks/useAutoShiftTasks';

import { AppRoutes } from './AppRoutes';

const ChatDrawer = lazy(() =>
  import('../features/chat/components/ChatDrawer').then((m) => ({ default: m.ChatDrawer }))
);

const MusicPlayerDrawer = lazy(() =>
  import('../features/music/components/MusicPlayerDrawer').then((m) => ({
    default: m.MusicPlayerDrawer,
  }))
);

const OnboardingFlow = lazy(() =>
  import('../features/onboarding/OnboardingFlow').then((m) => ({
    default: m.OnboardingFlow,
  }))
);

interface AppContentProps {
  onboardingComplete: boolean;
}

function AppContent({ onboardingComplete }: AppContentProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    theme,
    setTheme,
    toggleTheme,
    accentColor,
    setAccentColor,
    backgroundUrl,
    setBackgroundUrl,
    dimLevel,
    setDimLevel,
    glassIntensity,
    setGlassIntensity,
    glassRefraction,
    setGlassRefraction,
    useGridBackground,
    setUseGridBackground,
  } = useTheme();

  const {
    plannerTasks,
    setPlannerTasks,
    studySessions,
    mockScores,
    primaryExamDate,
    disableAutoShift,
    setDisableAutoShift,
    enableAIAgent,
    setEnableAIAgent,
    enableMusicPlayer,
    setEnableMusicPlayer,
    dailyResetHour,
    setDailyResetHour,
    physicsProgress,
    chemistryProgress,
    mathsProgress,
    biologyProgress,
    progressCardSettings,
    setProgressCardSettings,
    examMode,
  } = useUserProgress();

  const [plannerDateToOpen, setPlannerDateToOpen] = useState<string | null>(null);
  const isNeet = examMode === 'neet';

  const getCurrentView = (): View => {
    const path = location.pathname.substring(1);
    if (path === 'jee-syllabus-tracker' || path === 'neet-syllabus-tracker') return 'dashboard';
    if (path === 'jee-study-planner' || path === 'neet-study-planner') return 'planner';
    if (path === 'jee-study-timer' || path === 'neet-study-timer') return 'studyclock';
    if (path === 'reports') return 'reports';
    if (path === 'jee-mock-scores' || path === 'neet-mock-scores') return 'mockscores';
    if (path === 'support') return 'support';
    if (path === 'leaderboard') return 'leaderboard';
    return path as View;
  };

  const currentView = getCurrentView();

  const handleNavigate = useCallback(
    (view: View) => {
      topLoader.start();
      navigate(getViewRoute(view, isNeet));
    },
    [isNeet, navigate]
  );

  const handleQuickAddTask = useCallback(
    (date: string) => {
      topLoader.start();
      setPlannerDateToOpen(date);
      navigate(isNeet ? '/neet-study-planner' : '/jee-study-planner');
    },
    [navigate, isNeet]
  );

  useEffect(() => {
    const currentPath = location.pathname;
    if (isNeet) {
      if (currentPath === '/jee-syllabus-tracker')
        navigate('/neet-syllabus-tracker', { replace: true });
      else if (currentPath === '/jee-study-planner')
        navigate('/neet-study-planner', { replace: true });
      else if (currentPath === '/jee-study-timer') navigate('/neet-study-timer', { replace: true });
      else if (currentPath === '/jee-mock-scores') navigate('/neet-mock-scores', { replace: true });
    } else {
      if (currentPath === '/neet-syllabus-tracker')
        navigate('/jee-syllabus-tracker', { replace: true });
      else if (currentPath === '/neet-study-planner')
        navigate('/jee-study-planner', { replace: true });
      else if (currentPath === '/neet-study-timer') navigate('/jee-study-timer', { replace: true });
      else if (currentPath === '/neet-mock-scores') navigate('/jee-mock-scores', { replace: true });
    }
  }, [isNeet, location.pathname, navigate]);

  const onQuickAddTaskStatic = useCallback(() => {
    handleQuickAddTask(getLogicalTodayStr(dailyResetHour));
  }, [handleQuickAddTask, dailyResetHour]);

  useGlobalShortcuts(handleQuickAddTask);
  useAutoShiftTasks(plannerTasks, setPlannerTasks, disableAutoShift, dailyResetHour);
  useDocumentMetadata();

  return (
    <div className={`app ${enableAIAgent ? 'has-chat-fab' : ''}`.trim()}>
      <TopLoader />
      <div className="top-header-wrapper">
        <Header
          currentView={currentView}
          onNavigate={handleNavigate}
          theme={theme}
          onThemeChange={setTheme}
          onThemeToggle={toggleTheme}
          accentColor={accentColor}
          onAccentChange={setAccentColor}
          useGridBackground={useGridBackground}
          onUseGridBackgroundChange={setUseGridBackground}
          disableAutoShift={disableAutoShift}
          onDisableAutoShiftChange={setDisableAutoShift}
          enableAIAgent={enableAIAgent}
          onEnableAIAgentChange={setEnableAIAgent}
          enableMusicPlayer={enableMusicPlayer}
          onEnableMusicPlayerChange={setEnableMusicPlayer}
          dailyResetHour={dailyResetHour}
          onDailyResetHourChange={setDailyResetHour}
          backgroundUrl={backgroundUrl}
          onBackgroundUrlChange={setBackgroundUrl}
          dimLevel={dimLevel}
          onDimLevelChange={setDimLevel}
          glassIntensity={glassIntensity}
          onGlassIntensityChange={setGlassIntensity}
          glassRefraction={glassRefraction}
          onGlassRefractionChange={setGlassRefraction}
          studySessions={studySessions}
          mockScores={mockScores}
          physicsProgress={physicsProgress}
          chemistryProgress={chemistryProgress}
          mathsProgress={mathsProgress}
          biologyProgress={biologyProgress}
          examDate={primaryExamDate}
          progressCardSettings={progressCardSettings}
          onProgressCardSettingsChange={setProgressCardSettings}
        />
      </div>
      <main className="main-content">
        <AppRoutes
          onNavigate={handleNavigate}
          plannerDateToOpen={plannerDateToOpen}
          onConsumeInitialDate={() => setPlannerDateToOpen(null)}
          onQuickAddTask={onQuickAddTaskStatic}
        />
      </main>
      <Footer />
      {onboardingComplete && <ThemeOnboardingModal />}
      {enableAIAgent && (
        <Suspense fallback={null}>
          <ChatDrawer />
        </Suspense>
      )}
      {enableMusicPlayer && (
        <Suspense fallback={null}>
          <MusicPlayerDrawer />
        </Suspense>
      )}
    </div>
  );
}

const DASHBOARD_ROUTES = new Set(['/', '/jee-syllabus-tracker', '/neet-syllabus-tracker']);

function AppShell() {
  const location = useLocation();
  const [onboardingComplete, setOnboardingComplete] = useState(() => {
    return localStorage.getItem('jee-tracker-onboarding-complete') === 'true';
  });

  const normalizedPath = location.pathname.replace(/\/+$/, '') || '/';
  const isDashboardRoute = DASHBOARD_ROUTES.has(normalizedPath);
  const showOnboarding = !onboardingComplete && isDashboardRoute;

  return (
    <RemoteSyncProvider>
      <AppContent onboardingComplete={onboardingComplete} />
      {showOnboarding && (
        <Suspense fallback={null}>
          <OnboardingFlow onComplete={() => setOnboardingComplete(true)} />
        </Suspense>
      )}
    </RemoteSyncProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <RemoteAuthProvider>
        <SubjectDataProvider>
          <UserProgressProvider>
            <AppShell />
          </UserProgressProvider>
        </SubjectDataProvider>
      </RemoteAuthProvider>
    </ThemeProvider>
  );
}

export default App;
