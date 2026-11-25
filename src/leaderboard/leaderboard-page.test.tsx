import { screen, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { leaderboardEntry } from '../testing/leaderboard-entries';
import { failLeaderboard, serveLeaderboard } from '../testing/fake-backend';
import { renderApp } from '../testing/render-app';

const rowTexts = (row: HTMLElement) =>
  within(row).getAllByRole('cell').map((cell) => cell.textContent);

describe('the Leaderboard page', () => {
  test('lists every Member in rank order with their standing', async () => {
    serveLeaderboard([
      leaderboardEntry('Ann', {
        rank: 1, wins: 3, tournamentsPlayed: 5, winRate: 0.6, totalWinnings: 360,
        latestWinningHand: 'full_house', lastWonAt: Date.UTC(2026, 5, 13, 12),
      }),
      leaderboardEntry('Cal', { rank: 2 }),
    ]);

    renderApp('/leaderboard');

    const table = await screen.findByRole('table', { name: 'Leaderboard' });
    const [, annRow, calRow] = within(table).getAllByRole('row');
    expect(rowTexts(annRow)).toEqual(['1', 'Ann', '3', '5', '60%', '$360', 'Full House']);
    expect(rowTexts(calRow)).toEqual(['2', 'Cal', '0', '0', '—', '$0', '—']);
  });

  test('says that Played counts only the Tournaments a Member was checked in', async () => {
    serveLeaderboard([leaderboardEntry('Ann')]);

    renderApp('/leaderboard');

    await screen.findByRole('table', { name: 'Leaderboard' });
    expect(screen.getByText('Played counts the Tournaments a Member was checked in as a Participant.')).toBeInTheDocument();
  });

  test('says so when the Leaderboard cannot be fetched', async () => {
    failLeaderboard();
    vi.spyOn(console, 'error').mockImplementation(() => {});

    renderApp('/leaderboard');

    expect(await screen.findByText("The Leaderboard couldn't be loaded.")).toBeInTheDocument();
  });
});
