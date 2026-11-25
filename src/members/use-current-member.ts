import type { Me } from '@pstephenwille/poker-timer-contracts';
import { useEffect, useState } from 'react';
import { fetchMe } from './me-api';

export type CurrentMemberState =
  | { status: 'checking' }
  | { status: 'signedIn'; me: Me }
  | { status: 'signedOut' }
  | { status: 'failed' };

/** Checked once per page load: signing in and out both reload the page. */
export function useCurrentMember(): CurrentMemberState {
  const [state, setState] = useState<CurrentMemberState>({ status: 'checking' });

  useEffect(function checkWhoIsSignedIn() {
    let isStillMounted = true;

    fetchMe()
      .then((me) => {
        if (isStillMounted) setState(me ? { status: 'signedIn', me } : { status: 'signedOut' });
      })
      .catch((error: unknown) => {
        console.error('Your account could not be checked', error);
        if (isStillMounted) setState({ status: 'failed' });
      });

    return () => {
      isStillMounted = false;
    };
  }, []);

  return state;
}
