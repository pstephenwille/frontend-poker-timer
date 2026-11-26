import type { Me } from '@pstephenwille/poker-timer-contracts';
import { useEffect, useRef, useState } from 'react';
import { leaveApp } from '../browser/leave-app';
import { SiteNavLinks } from '../components/site-nav-links';
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
  const menuRef = useRef<HTMLDivElement>(null);
  const closeMenu = () => setIsOpen(false);

  useEffect(function closeOnOutsideClickOrEscape() {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      const isInsideMenu = event.target instanceof Node && menuRef.current?.contains(event.target);
      if (!isInsideMenu) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.code === 'Escape') setIsOpen(false);
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div className="account-menu" ref={menuRef}>
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
          <nav className="site-nav" onClick={closeMenu}>
            <SiteNavLinks />
          </nav>
          <hr />
          <SignOutButton />
        </div>
      )}
    </div>
  );
}
