import type { Me } from '@pstephenwille/poker-timer-contracts';
import { useState } from 'react';
import { leaveApp } from '../browser/leave-app';
import { useGameEngine } from '../game-engine';
import { MemberAvatar } from '../leaderboard/member-avatar';
import { endSession } from './sign-out-api';

const SIGN_OUT_LOCKED_HINT = 'Sign out after the game';

function SignOutButton() {
  const engine = useGameEngine();

  const signOut = async () => {
    try {
      leaveApp(await endSession());
    } catch (error) {
      console.error('Sign-out failed', error);
    }
  };

  if (engine.hasGameStarted) {
    return <button className="sign-out" disabled title={SIGN_OUT_LOCKED_HINT}>Sign out</button>;
  }

  return <button className="sign-out" onClick={signOut}>Sign out</button>;
}

/**
 * Sign-out ends Cognito's session as well as the app's, so the next sign-in on
 * this device can be someone else; that reloads the page, so it waits for Reset.
 */
export function AccountMenu({ me }: { me: Me }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="account-menu">
      <button
        className="signed-in-member"
        aria-label={`Signed in as ${me.displayName}`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        <MemberAvatar displayName={me.displayName} avatarUrl={me.avatarUrl} />
      </button>
      {isOpen && (
        <div className="account-menu-items">
          <SignOutButton />
        </div>
      )}
    </div>
  );
}
