import { createContext, useContext, useReducer, useState } from 'react';
import { ALL_BLINDS, DEFAULT_BREAK_SECONDS, DEFAULT_LEVEL_SECONDS, initializeBlindsForNewGame } from './utils';


const booleanToggleReducer = (current: boolean, override?: unknown): boolean => typeof override === 'boolean' ? override
  : !current;

export type AudioRefs = {
  levelEndAudioRef: React.RefObject<HTMLAudioElement | null>;
  breakEndAudioRef: React.RefObject<HTMLAudioElement | null>;
};

export function usePokerGameEngine({ levelEndAudioRef, breakEndAudioRef }: AudioRefs) {
  const [hasGameStarted, setGameHasStarted] = useState(false)
  const [gameIsRunning, setGameIsRunning] = useReducer(booleanToggleReducer, false);
  const [resetGameToggled, toggleGameReset] = useReducer(booleanToggleReducer, false);
  const [isSettingsOpen, toggleSettings] = useReducer(booleanToggleReducer, false);
  const [breakIsActive, toggleBreakIsActive] = useReducer(booleanToggleReducer, false);
  const [isAudioEnabled, toggleAudio] = useReducer(booleanToggleReducer, true);
  const [currentLevel, incrementCurrentLevel] = useReducer((levelCount: number, override?: number) => (
    Number.isInteger(override)
  ) ? override
    : levelCount + 1, 0);
  const [blinds, setBlinds] = useState(ALL_BLINDS);
  const [levelDurationSeconds, setLevelDurationSeconds] = useState(DEFAULT_LEVEL_SECONDS);
  const [breakDurationSeconds, setBreakDurationSeconds] = useState(DEFAULT_BREAK_SECONDS);

  const resetGame = () => {
    toggleGameReset()
    setGameIsRunning(false);
    incrementCurrentLevel(0);
    setLevelDurationSeconds(DEFAULT_LEVEL_SECONDS)
    setBreakDurationSeconds(DEFAULT_BREAK_SECONDS)
    setGameHasStarted(false)
  };

  const endBreak = () => {
    toggleBreakIsActive(false)
    setGameIsRunning(hasGameStarted)
  }

  const startPokerGame = () => {
    if (hasGameStarted) {
      setGameIsRunning()
    }else{
      setGameHasStarted(true);
      setGameIsRunning(true)
    }

  }

  const gameState = {
    gameIsRunning,
    isSettingsOpen,
    isAudioEnabled,
    currentLevel,
    blinds,
    levelDurationSeconds,
    breakDurationSeconds,
    breakIsActive,
    resetGameToggled,
    hasGameStarted,
    levelEndAudioRef,
    breakEndAudioRef,
  };

  const gameActions = {
    startPokerGame,
    toggleGameReset,
    setBlinds,
    toggleBreakIsActive,
    endBreak,
    setGameIsRunning,
    toggleSettings,
    toggleAudio,
    incrementCurrentLevel,
    setLevelDurationSeconds,
    setBreakDurationSeconds,
    setStartingBlind: (startingBlind: number) => setBlinds(initializeBlindsForNewGame(startingBlind)),
    resetGame,
  };

  return { ...gameState, ...gameActions };
}

export const GameEngineContext = createContext<ReturnType<typeof usePokerGameEngine> | null>(null);

export function useGameEngine() {
  const context = useContext(GameEngineContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }

  return context;
}
