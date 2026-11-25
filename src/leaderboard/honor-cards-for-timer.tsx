import { pickHonors } from './honors';
import { LastWinnerCard, ReigningChampionCard } from './honor-cards';
import { useLeaderboard } from './use-leaderboard';

/** Hidden, not replaced by placeholders, when the Leaderboard can't be fetched, so the timer looks as it did before. */
export function HonorCardsForTimer() {
  const leaderboard = useLeaderboard();
  if (leaderboard.status !== 'loaded') return null;

  const honors = pickHonors(leaderboard.leaderboard);

  return (
    <>
      <LastWinnerCard lastWinner={honors.lastWinner} />
      <ReigningChampionCard reigningChampion={honors.reigningChampion} />
    </>
  );
}
