import type { LeaderboardEntry } from '@pstephenwille/poker-timer-contracts';

export type Honors = {
  lastWinner: LeaderboardEntry | null;
  reigningChampion: LeaderboardEntry | null;
};

const hasWon = (entry: LeaderboardEntry) => entry.lastWonAt !== null;

const wonMoreRecently = (latest: LeaderboardEntry, entry: LeaderboardEntry) =>
  entry.lastWonAt > latest.lastWonAt ? entry : latest;

export function pickHonors(leaderboard: LeaderboardEntry[]): Honors {
  const winners = leaderboard.filter(hasWon);
  if (winners.length === 0) return { lastWinner: null, reigningChampion: null };

  return {
    lastWinner: winners.reduce(wonMoreRecently),
    reigningChampion: winners.find((entry) => entry.rank === 1) ?? null,
  };
}
