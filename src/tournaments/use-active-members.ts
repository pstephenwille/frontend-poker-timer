import type { MemberSummary } from '@pstephenwille/poker-timer-contracts';
import { useEffect, useState } from 'react';
import { fetchMembers } from './members-api';

export type ActiveMembersState =
  | { status: 'loading' }
  | { status: 'loaded'; members: MemberSummary[] }
  | { status: 'failed' };

/** Deactivated Members can't be recorded as playing, so they are left off the list. */
export function useActiveMembers(): ActiveMembersState {
  const [state, setState] = useState<ActiveMembersState>({ status: 'loading' });

  useEffect(function loadMembersOnMount() {
    let isStillMounted = true;

    fetchMembers()
      .then((members) => {
        const activeMembers = members.filter((member) => member.active);
        if (isStillMounted) setState({ status: 'loaded', members: activeMembers });
      })
      .catch((error: unknown) => {
        console.error('The Members could not be loaded', error);
        if (isStillMounted) setState({ status: 'failed' });
      });

    return () => {
      isStillMounted = false;
    };
  }, []);

  return state;
}
