import type { Leaderboard } from '@pstephenwille/poker-timer-contracts';
import { useEffect, useState } from 'react';
import { fetchLeaderboard } from './leaderboard-api';

export type LeaderboardState =
  | { status: 'loading' }
  | { status: 'loaded'; leaderboard: Leaderboard }
  | { status: 'failed' };

/** Fetched once per mount, with no polling: the Leaderboard only changes when a Tournament is recorded. */
export function useLeaderboard(): LeaderboardState {
  const [state, setState] = useState<LeaderboardState>({ status: 'loading' });

  useEffect(function loadLeaderboardOnMount() {
    let isStillMounted = true;

    fetchLeaderboard()
      .then((leaderboard) => {
        if (isStillMounted) setState({ status: 'loaded', leaderboard });
      })
      .catch((error: unknown) => {
        console.error('The Leaderboard could not be loaded', error);
        if (isStillMounted) setState({ status: 'failed' });
      });

    return () => {
      isStillMounted = false;
    };
  }, []);

  return state;
}
