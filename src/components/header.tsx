import { Link } from 'react-router';
import { BreakTimer } from './break-timer';
import { LevelSettings } from './level-settings';
import { TimerExitLink } from './timer-exit-link';
import { useGameEngine } from '../game-engine';

function TimerControls() {
  const engine = useGameEngine();

  return (
    <div className="controls">
      <button onClick={engine.startPokerGame}>{engine.gameIsRunning? 'Pause': 'Start'}</button>
      <button onClick={engine.resetGame}>Reset</button>
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

export function Header({ isTimerShown }: { isTimerShown: boolean }) {
  const engine = useGameEngine();

  return (
    <>
      <div className="header">
        {isTimerShown && <TimerControls />}
        <nav className="site-nav">
          {isTimerShown
            ? <TimerExitLink to="/leaderboard">Leaderboard</TimerExitLink>
            : <Link to="/">Timer</Link>}
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