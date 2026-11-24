import React from 'react';
import { LevelTimer } from './level-timer';
import { useGameEngine } from '../game-engine';

export const MainDisplay: React.FC<any> = () => {
  const engine = useGameEngine()

  return (
    <div key={`${engine.resetGameToggled}-${engine.levelDurationSeconds}`} id={'main-display'} className="main-display">
      <LevelTimer />
    </div>
  );
}; 
