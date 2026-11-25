import { useEffect, useState, type ReactNode } from 'react';
import { CurrentMemberContext, type CurrentMemberState } from './current-member';
import { fetchMe } from './me-api';

/** Checked once per page load: signing in and out both reload the page. */
export function CurrentMemberProvider({ children }: { children: ReactNode }) {
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

  return <CurrentMemberContext value={state}>{children}</CurrentMemberContext>;
}
