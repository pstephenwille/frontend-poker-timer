import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { useGameEngine } from '../game-engine';

const LEAVING_LOCKED_HINT = 'Pause the game to leave the timer';

type TimerExitLinkProps = {
  to: string;
  className?: string;
  children: ReactNode;
};

/** The table is watching the clock while it runs or a Break is on, so the timer can't be left then. */
export function TimerExitLink({ to, className, children }: TimerExitLinkProps) {
  const engine = useGameEngine();
  const isPlayInProgress = engine.gameIsRunning || engine.breakIsActive;

  if (isPlayInProgress) {
    return (
      <span className={className} aria-disabled="true" title={LEAVING_LOCKED_HINT}>
        {children}
      </span>
    );
  }

  return <Link to={to} className={className}>{children}</Link>;
}
