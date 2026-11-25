import type { Me } from '@pstephenwille/poker-timer-contracts';
import { useLocation } from 'react-router';
import { useGameEngine } from '../game-engine';
import { MemberAvatar } from '../leaderboard/member-avatar';
import { useCurrentMember } from './use-current-member';

const SIGN_IN_URL = '/api/auth/login';
const SIGN_IN_LOCKED_HINT = 'Sign in after the game';

function SignInLink() {
  const engine = useGameEngine();
  const { pathname, search } = useLocation();

  if (engine.hasGameStarted) {
    return <span className="sign-in" aria-disabled="true" title={SIGN_IN_LOCKED_HINT}>Sign in</span>;
  }

  const returnTo = new URLSearchParams({ returnTo: `${pathname}${search}` });

  return <a className="sign-in" href={`${SIGN_IN_URL}?${returnTo}`}>Sign in</a>;
}

function SignedInMember({ me }: { me: Me }) {
  return (
    <span className="signed-in-member" role="img" aria-label={`Signed in as ${me.displayName}`}>
      <MemberAvatar displayName={me.displayName} avatarUrl={me.avatarUrl} />
    </span>
  );
}

/** Sign-in reloads the page, so it is held from Start until Reset, like leaving the timer during play. */
export function AccountArea() {
  const currentMember = useCurrentMember();

  if (currentMember.status === 'signedIn') return <SignedInMember me={currentMember.me} />;
  if (currentMember.status === 'signedOut') return <SignInLink />;

  return null;
}
