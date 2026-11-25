import type { Me } from '@pstephenwille/poker-timer-contracts';
import { createContext, useContext } from 'react';

export type CurrentMemberState =
  | { status: 'checking' }
  | { status: 'signedIn'; me: Me }
  | { status: 'signedOut' }
  | { status: 'failed' };

export const ACCOUNT_CHECK_FAILED_MESSAGE = "Couldn't check whether you're signed in. Reload the page to try again.";

export const CurrentMemberContext = createContext<CurrentMemberState | null>(null);

export function useCurrentMember(): CurrentMemberState {
  const state = useContext(CurrentMemberContext);
  if (!state) throw new Error('useCurrentMember must be used inside a CurrentMemberProvider');

  return state;
}
