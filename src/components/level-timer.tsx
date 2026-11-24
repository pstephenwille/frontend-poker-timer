import { useEffect, useEffectEvent, useMemo } from 'react';
import {
  formatTimeMMSS,
  runAfterDelay,
  playAudio,
  startConfettiCelebration,
} from '../utils';
import { useGameEngine } from '../game-engine';
import { useCountdown } from '../hooks/use-countdown';

const PAUSE_BETWEEN_LEVELS_MILLIS = 3_000;
const SMALL_BLIND_THAT_RETIRES_LOWEST_CHIPS = 15;

const getBlindForLevel = (blinds, level) => blinds[level] ?? blinds.at(-1);

const isColorUpBreakDue = (completedLevel, completedBlind) => {
  const isOpeningLevel = completedLevel === 0;
  const retiresLowestChips = completedBlind?.small === SMALL_BLIND_THAT_RETIRES_LOWEST_CHIPS;

  return !isOpeningLevel && retiresLowestChips;
};

export const LevelTimer = () => {
  const engine = useGameEngine()
  const currentBlind = getBlindForLevel(engine.blinds, engine.currentLevel)
  const [smallBlind, bigBlind] = useBlindsDisplayHook(currentBlind)

  const celebrateLevelEnd = () => {
    startConfettiCelebration();
    playAudio(engine.levelEndAudioRef, engine.isAudioEnabled);
  };

  const countdown = useCountdown({
    durationSeconds: engine.levelDurationSeconds,
    isRunning: engine.gameIsRunning,
    onComplete: celebrateLevelEnd,
  });

  const isPausedBetweenLevels = engine.gameIsRunning && countdown.isFinished;

  const startColorUpBreakIfDue = (completedLevel, completedBlind) => {
    if (isColorUpBreakDue(completedLevel, completedBlind)) {
      engine.toggleBreakIsActive(true)
    }
  }

  const advanceToNextLevel = useEffectEvent(() => {
    const completedLevel = engine.currentLevel
    const completedBlind = currentBlind

    countdown.reset()
    engine.incrementCurrentLevel()
    startColorUpBreakIfDue(completedLevel, completedBlind)
  });

  useEffect(function advanceAfterPauseBetweenLevels() {
    if (!isPausedBetweenLevels) return;

    const timeoutId = runAfterDelay(PAUSE_BETWEEN_LEVELS_MILLIS, advanceToNextLevel)

    return () => clearTimeout(timeoutId)
  }, [isPausedBetweenLevels])


  return (
    <div id={'main-display'} className="main-display">

      <div className="blinds-display">

        {smallBlind}

        <div className="time-remaining">
          <p className={'current-level'}>
            Level: {engine.currentLevel + 1}
          </p>
          <h2>{formatTimeMMSS(countdown.remainingSeconds)}</h2>
        </div>

        {bigBlind}

      </div>
    </div>
  )
};


const useBlindsDisplayHook = (currentBlind) => {
  const [smallBlind, bigBlind] = useMemo(() => {
    return [
      (
        <div className="small-blind">
          <p>Small Blind</p>
          <h2>{currentBlind?.small}</h2>
        </div>
      ),
      (
        <div className="big-blind">
          <p>Big Blind</p>
          <h2>{currentBlind?.big}</h2>
        </div>
      )
    ]
  }, [currentBlind])

  return [smallBlind, bigBlind]
}
