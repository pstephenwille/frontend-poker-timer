import { Leaderboard } from '@pstephenwille/poker-timer-contracts';

const LEADERBOARD_URL = '/api/leaderboard';

export async function fetchLeaderboard(): Promise<Leaderboard> {
  const response = await fetch(LEADERBOARD_URL);
  if (!response.ok) {
    throw new Error(`GET ${LEADERBOARD_URL} answered ${response.status}`);
  }

  return Leaderboard.parse(await response.json());
}
