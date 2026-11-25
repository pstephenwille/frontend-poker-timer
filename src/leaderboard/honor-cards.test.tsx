import { screen, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { leaderboardEntry } from '../testing/leaderboard-entries';
import { failLeaderboard, serveLeaderboard } from '../testing/fake-backend';
import { renderApp } from '../testing/render-app';

const JUNE_6_NOON_UTC = Date.UTC(2026, 5, 6, 12);
const JUNE_13_NOON_UTC = Date.UTC(2026, 5, 13, 12);

describe('honor cards on the timer screen', () => {
  test('show the Last Winner and the Reigning Champion', async () => {
    serveLeaderboard([
      leaderboardEntry('Ann', { rank: 1, wins: 3, latestWinningHand: 'flush', lastWonAt: JUNE_6_NOON_UTC }),
      leaderboardEntry('Bob', { rank: 2, wins: 1, latestWinningHand: 'full_house', lastWonAt: JUNE_13_NOON_UTC }),
    ]);

    renderApp();

    const lastWinner = await screen.findByRole('region', { name: 'Last Winner' });
    expect(within(lastWinner).getByText('Bob')).toBeInTheDocument();
    expect(within(lastWinner).getByText('Full House')).toBeInTheDocument();
    expect(within(lastWinner).getByText('Jun 13, 2026')).toBeInTheDocument();

    const champion = screen.getByRole('region', { name: 'Reigning Champion' });
    expect(within(champion).getByText('Ann')).toBeInTheDocument();
    expect(within(champion).getByText('3 wins')).toBeInTheDocument();
    expect(within(champion).getByRole('link')).toHaveAttribute('href', '/leaderboard');
  });

  test('say "No winner yet" before anyone has won', async () => {
    serveLeaderboard([leaderboardEntry('Ann'), leaderboardEntry('Bob')]);

    renderApp();

    const lastWinner = await screen.findByRole('region', { name: 'Last Winner' });
    expect(within(lastWinner).getByText('No winner yet')).toBeInTheDocument();
    const champion = screen.getByRole('region', { name: 'Reigning Champion' });
    expect(within(champion).getByText('No winner yet')).toBeInTheDocument();
  });

  test('are hidden, and the error logged, when the Leaderboard cannot be fetched', async () => {
    failLeaderboard();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderApp();

    await vi.waitFor(() => expect(consoleError).toHaveBeenCalled());
    expect(screen.queryByRole('region', { name: 'Last Winner' })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Reigning Champion' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start' })).toBeEnabled();
  });
});
