import { Header } from './components/header';
import { TimerScreen } from './components/timer-screen';
import './App.css'
import { useGameEngine } from './game-engine';
import { useEffect, useEffectEvent } from 'react';
import { Route, Routes, useLocation } from 'react-router';
import { LeaderboardPage } from './leaderboard/leaderboard-page';
import { SigninErrorBanner } from './members/signin-error-banner';
import { CurrentMemberProvider } from './members/current-member-provider';
import { RecordTournamentPage } from './tournaments/record-tournament-page';
import { LEADERBOARD_PATH, RECORD_TOURNAMENT_PATH, TIMER_PATH } from './app-paths';

const isTypingInFormField = (target: EventTarget | null) =>
  target instanceof HTMLInputElement
  || target instanceof HTMLSelectElement
  || target instanceof HTMLTextAreaElement;

const preventSpaceFromScrollingPageOnKeyDown = (event: KeyboardEvent) => event.preventDefault();

const stopFocusedButtonFromAlsoClickingOnKeyUp = (target: EventTarget | null) => {
  if (target instanceof HTMLButtonElement) target.blur();
};

export function App() {
  const engine = useGameEngine();
  const isTimerShown = useLocation().pathname === TIMER_PATH;

  const closeOpenOverlays = () => {
    if (engine.breakIsActive) {
      engine.endBreak()
    }
    if (engine.isSettingsOpen) {
      engine.toggleSettings(false)
    }
  };

  const toggleGameClockWithSpaceBar = (event: KeyboardEvent) => {
    if (isTypingInFormField(event.target)) return;

    preventSpaceFromScrollingPageOnKeyDown(event);
    stopFocusedButtonFromAlsoClickingOnKeyUp(event.target);

    const isOverlayCoveringGameClock = engine.breakIsActive || engine.isSettingsOpen;
    const isKeyHeldDown = event.repeat;
    const canToggleGameClock = engine.hasGameStarted && !isOverlayCoveringGameClock && !isKeyHeldDown;

    if (canToggleGameClock) engine.setGameIsRunning();
  };

  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (!isTimerShown) return;
    if (event.code === 'Escape') closeOpenOverlays();
    if (event.code === 'Space') toggleGameClockWithSpaceBar(event);
  });

  useEffect(function listenForKeyboardShortcuts() {
    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);


  return (
    <CurrentMemberProvider>
      <div className="app">
        <Header isTimerShown={isTimerShown} />
        <SigninErrorBanner />
        <TimerScreen isShown={isTimerShown} />
        <Routes>
          <Route path={TIMER_PATH} element={null} />
          <Route path={LEADERBOARD_PATH} element={<LeaderboardPage />} />
          <Route path={RECORD_TOURNAMENT_PATH} element={<RecordTournamentPage />} />
        </Routes>
      </div>
    </CurrentMemberProvider>
  )
}
