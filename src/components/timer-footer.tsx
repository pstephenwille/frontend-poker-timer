import { LastWinnerCard, ReigningChampionCard } from '../leaderboard/honor-cards';
import { pickHonors } from '../leaderboard/honors';
import { useLeaderboard } from '../leaderboard/use-leaderboard';
import { BlindsSchedule } from './blinds-schedule';

/** Honor cards are hidden, not replaced by placeholders, when the Leaderboard can't be fetched, so the timer looks as it did before. */
export function TimerFooter() {
  const leaderboard = useLeaderboard();

  if (leaderboard.status !== 'loaded') {
    return (
      <footer className="timer-footer">
        <BlindsSchedule />
      </footer>
    );
  }

  const honors = pickHonors(leaderboard.leaderboard);

  return (
    <footer className="timer-footer">
      <ReigningChampionCard reigningChampion={honors.reigningChampion} />
      <BlindsSchedule />
      <LastWinnerCard lastWinner={honors.lastWinner} />
    </footer>
  );
}
