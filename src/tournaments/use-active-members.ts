import type { MemberSummary } from '@pstephenwille/poker-timer-contracts';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchMembers } from './members-api';

export type ActiveMembersState =
  | { status: 'loading' }
  | { status: 'loaded'; members: MemberSummary[]; refreshFailed: boolean }
  | { status: 'failed' };

/** Deactivated Members can't be recorded as playing, so they are left off the list. */
async function fetchActiveMembers() {
  const members = await fetchMembers();

  return members.filter((member) => member.active);
}

/**
 * Refreshed whenever the window regains focus, so a player who has just registered on
 * their own phone appears without a reload. A failed refresh keeps the list already shown.
 */
export function useActiveMembers(): ActiveMembersState & { refresh: () => void } {
  const [state, setState] = useState<ActiveMembersState>({ status: 'loading' });
  const isMountedRef = useRef(true);

  const refresh = useCallback(() => {
    fetchActiveMembers()
      .then((members) => {
        if (isMountedRef.current) setState({ status: 'loaded', members, refreshFailed: false });
      })
      .catch((error: unknown) => {
        console.error('The Members could not be loaded', error);
        if (!isMountedRef.current) return;
        setState((current) => current.status === 'loaded' ? { ...current, refreshFailed: true } : { status: 'failed' });
      });
  }, []);

  useEffect(function loadMembersNowAndOnFocus() {
    isMountedRef.current = true;
    refresh();
    window.addEventListener('focus', refresh);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('focus', refresh);
    };
  }, [refresh]);

  return { ...state, refresh };
}
