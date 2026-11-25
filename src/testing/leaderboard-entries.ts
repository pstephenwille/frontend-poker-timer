import type { LeaderboardEntry } from '@pstephenwille/poker-timer-contracts';

export const leaderboardEntry = (
  displayName: string,
  overrides: Partial<LeaderboardEntry> = {},
): LeaderboardEntry => ({
  userId: crypto.randomUUID(),
  displayName,
  avatarUrl: null,
  rank: 1,
  wins: 0,
  tournamentsPlayed: 0,
  winRate: null,
  totalWinnings: 0,
  latestWinningHand: null,
  lastWonAt: null,
  ...overrides,
});
