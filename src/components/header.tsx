import { BreakTimer } from './break-timer';
import { LevelSettings } from './level-settings';
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

export function Header({ isTimerShown }: { isTimerShown: boolean }) {
  const engine = useGameEngine();

  return (
    <>
      <div className="header">
        <AccountArea />
        {isTimerShown && <TimerControls />}
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