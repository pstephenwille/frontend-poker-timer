import { useRef } from 'react';
import { GameEngineContext, usePokerGameEngine } from './game-engine';

export function GameProvider({ children }: { children: React.ReactNode }) {
  const levelEndAudioRef = useRef<HTMLAudioElement>(null);
  const breakEndAudioRef = useRef<HTMLAudioElement>(null);
  const game = usePokerGameEngine({ levelEndAudioRef, breakEndAudioRef });

  return (
    <GameEngineContext.Provider value={game}>
      <audio ref={levelEndAudioRef} src="/assets/jackpot-winner.mp3" preload="auto" />
      <audio ref={breakEndAudioRef} src="/assets/air-horn.mp3" preload="auto" />
      {children}
    </GameEngineContext.Provider>
  );
}
