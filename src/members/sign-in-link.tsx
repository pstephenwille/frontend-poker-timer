import type { ReactNode } from 'react';
import { useLocation } from 'react-router';
import { useGameEngine } from '../game-engine';
import { signInUrl } from './sign-in-url';

const SIGN_IN_LOCKED_HINT = 'Sign in after the game';

type SignInLinkProps = {
  className: string;
  children: ReactNode;
};

/** Sign-in reloads the page, so it is held from Start until Reset, like leaving the timer during play. */
export function SignInLink({ className, children }: SignInLinkProps) {
  const engine = useGameEngine();
  const { pathname, search } = useLocation();

  if (engine.hasGameStarted) {
    return <span className={className} aria-disabled="true" title={SIGN_IN_LOCKED_HINT}>{children}</span>;
  }

  return <a className={className} href={signInUrl(`${pathname}${search}`)}>{children}</a>;
}
