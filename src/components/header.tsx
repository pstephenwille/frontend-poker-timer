import { Link, useLocation } from 'react-router';
import { LEADERBOARD_PATH, RECORD_TOURNAMENT_PATH, TIMER_PATH } from '../app-paths';
import { BreakTimer } from './break-timer';
import { LevelSettings } from './level-settings';
import { TimerExitLink } from './timer-exit-link';
import { useGameEngine } from '../game-engine';
import { AccountArea } from '../members/account-area';
import { EndTournamentButton } from '../tournaments/end-tournament-button';

function TimerControls() {
  const engine = useGameEngine();

  return (
    <div className="controls">
      <button onClick={engine.startPokerGame}>{engine.gameIsRunning? 'Pause': 'Start'}</button>
      <button onClick={engine.resetGame}>Reset</button>
      <EndTournamentButton />
      <button onClick={engine.toggleBreakIsActive} disabled={!engine.hasGameStarted}>
        {engine.breakIsActive? 'End Break' : 'Take Break'}
      </button>
      <button id={'toggleSettingsButton'} onClick={engine.toggleSettings}>
        {engine.isSettingsOpen ? 'Hide Settings' : 'Settings'}
      </button>
      <button onClick={engine.toggleAudio}>
        {engine.isAudioEnabled ? 'Mute Sound' : 'Enable Sound'}
      </button>
    </div>
  );
}

const PAGES_LINKED_FROM_HEADER = [
  { path: TIMER_PATH, label: 'Timer' },
  { path: LEADERBOARD_PATH, label: 'Leaderboard' },
  { path: RECORD_TOURNAMENT_PATH, label: 'Record' },
];

function SiteNavLinks({ isTimerShown }: { isTimerShown: boolean }) {
  const { pathname } = useLocation();
  const otherPages = PAGES_LINKED_FROM_HEADER.filter(({ path }) => path !== pathname);

  return otherPages.map(({ path, label }) => isTimerShown
    ? <TimerExitLink key={path} to={path}>{label}</TimerExitLink>
    : <Link key={path} to={path}>{label}</Link>);
}

export function Header({ isTimerShown }: { isTimerShown: boolean }) {
  const engine = useGameEngine();

  return (
    <>
      <div className="header">
        {isTimerShown && <TimerControls />}
        <nav className="site-nav">
          <SiteNavLinks isTimerShown={isTimerShown} />
          <AccountArea />
        </nav>
      </div>

      {engine.breakIsActive &&(
        <BreakTimer breakDurationSeconds={engine.breakDurationSeconds}  />
      )}

      {engine.isSettingsOpen &&
          <LevelSettings />
      }
    </>

  )
}