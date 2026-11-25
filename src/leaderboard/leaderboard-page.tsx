import type { LeaderboardEntry } from '@pstephenwille/poker-timer-contracts';
import { formatDollars, formatOptional, formatWinRate } from './format';
import { handName } from './hand-names';
import { MemberAvatar } from './member-avatar';
import { useLeaderboard } from './use-leaderboard';

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const latestHand = entry.latestWinningHand && handName(entry.latestWinningHand);

  return (
    <tr>
      <td>{entry.rank}</td>
      <td className="leaderboard-member">
        <MemberAvatar displayName={entry.displayName} avatarUrl={entry.avatarUrl} />
        {entry.displayName}
      </td>
      <td>{entry.wins}</td>
      <td>{entry.tournamentsPlayed}</td>
      <td>{formatWinRate(entry.winRate)}</td>
      <td>{formatDollars(entry.totalWinnings)}</td>
      <td>{formatOptional(latestHand)}</td>
    </tr>
  );
}

export function LeaderboardPage() {
  const state = useLeaderboard();

  if (state.status === 'loading') return <p className="leaderboard-status">Loading the Leaderboard…</p>;
  if (state.status === 'failed') return <p className="leaderboard-status">The Leaderboard couldn't be loaded.</p>;

  return (
    <table className="leaderboard">
      <caption>Leaderboard</caption>
      <thead>
        <tr>
          <th scope="col">Rank</th>
          <th scope="col">Member</th>
          <th scope="col">Wins</th>
          <th scope="col">Played</th>
          <th scope="col">Win rate</th>
          <th scope="col">Winnings</th>
          <th scope="col">Latest Winning Hand</th>
        </tr>
      </thead>
      <tbody>
        {state.leaderboard.map((entry) => <LeaderboardRow key={entry.userId} entry={entry} />)}
      </tbody>
    </table>
  );
}
