import type { LeaderboardEntry } from '@pstephenwille/poker-timer-contracts';
import { LEADERBOARD_PATH } from '../app-paths';
import { TimerExitLink } from '../components/timer-exit-link';
import { formatWinCount, formatWinDate } from './format';
import { handName } from './hand-names';
import { MemberAvatar } from './member-avatar';

const NO_WINNER_YET = 'No winner yet';

export function LastWinnerCard({ lastWinner }: { lastWinner: LeaderboardEntry | null }) {
  return (
    <section className="honor-card last-winner" aria-label="Last Winner">
      <h3>Last Winner</h3>
      {lastWinner ? (
        <>
          <MemberAvatar displayName={lastWinner.displayName} avatarUrl={lastWinner.avatarUrl} />
          <p className="honor-name">{lastWinner.displayName}</p>
          <p>{handName(lastWinner.latestWinningHand)}</p>
          <p>{formatWinDate(lastWinner.lastWonAt)}</p>
        </>
      ) : (
        <p>{NO_WINNER_YET}</p>
      )}
    </section>
  );
}

export function ReigningChampionCard({ reigningChampion }: { reigningChampion: LeaderboardEntry | null }) {
  return (
    <section className="honor-card reigning-champion" aria-label="Reigning Champion">
      <h3>Reigning Champion</h3>
      <TimerExitLink to={LEADERBOARD_PATH} className="honor-card-link">
        {reigningChampion ? (
          <>
            <MemberAvatar displayName={reigningChampion.displayName} avatarUrl={reigningChampion.avatarUrl} />
            <p className="honor-name">{reigningChampion.displayName}</p>
            <p>{formatWinCount(reigningChampion.wins)}</p>
          </>
        ) : (
          <p>{NO_WINNER_YET}</p>
        )}
      </TimerExitLink>
    </section>
  );
}
