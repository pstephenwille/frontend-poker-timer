import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import { leaderboardEntry } from './testing/leaderboard-entries';
import { renderApp, serveLeaderboard } from './testing/render-app';

const LEAVING_LOCKED_HINT = 'Pause the game to leave the timer';
const ONE_SECOND_INTO_THE_LEVEL = '09:59';
const CLOCK_TICK_WAIT = { timeout: 2_000 };

const ann = leaderboardEntry('Ann', { rank: 1, wins: 2, latestWinningHand: 'flush', lastWonAt: Date.UTC(2026, 5, 13, 12) });

const championCard = () => screen.findByRole('region', { name: 'Reigning Champion' });

describe('leaving the timer', () => {
  test('the header links to the Leaderboard and back to the timer', async () => {
    serveLeaderboard([ann]);
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('link', { name: 'Leaderboard' }));
    expect(await screen.findByRole('table', { name: 'Leaderboard' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Start' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Timer' }));
    expect(screen.getByRole('button', { name: 'Start' })).toBeVisible();
  });

  test('is blocked while the Level clock is Running', async () => {
    serveLeaderboard([ann]);
    const user = userEvent.setup();
    renderApp();
    await championCard();

    await user.click(screen.getByRole('button', { name: 'Start' }));

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Leaderboard')).toHaveAttribute('title', LEAVING_LOCKED_HINT);
    expect(within(await championCard()).getByText('Ann').closest('[title]')).toHaveAttribute('title', LEAVING_LOCKED_HINT);
  });

  test('is blocked during a Break', async () => {
    serveLeaderboard([ann]);
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: 'Start' }));
    await user.click(screen.getByRole('button', { name: 'Pause' }));
    await user.click(screen.getByRole('button', { name: 'Take Break' }));

    expect(screen.queryByRole('link', { name: 'Leaderboard' })).not.toBeInTheDocument();
    expect(screen.getByText('Leaderboard')).toHaveAttribute('title', LEAVING_LOCKED_HINT);
  });

  test('a Paused Tournament is still Paused, with the same time left, after visiting the Leaderboard', async () => {
    serveLeaderboard([ann]);
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: 'Start' }));
    await screen.findByText(ONE_SECOND_INTO_THE_LEVEL, {}, CLOCK_TICK_WAIT);
    await user.click(screen.getByRole('button', { name: 'Pause' }));

    await user.click(screen.getByRole('link', { name: 'Leaderboard' }));
    await screen.findByRole('table', { name: 'Leaderboard' });
    await user.click(screen.getByRole('link', { name: 'Timer' }));

    expect(screen.getByText(ONE_SECOND_INTO_THE_LEVEL)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Start' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Take Break' })).toBeEnabled();
  });

  test('Space does nothing while another page is showing', async () => {
    serveLeaderboard([ann]);
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: 'Start' }));
    await user.click(screen.getByRole('button', { name: 'Pause' }));
    await user.click(screen.getByRole('link', { name: 'Leaderboard' }));
    await user.keyboard(' ');
    await user.click(screen.getByRole('link', { name: 'Timer' }));

    expect(screen.getByRole('button', { name: 'Start' })).toBeVisible();
  });

  test('coming back to the timer fetches the Leaderboard again for the honor cards', async () => {
    const fetchStub = serveLeaderboard([leaderboardEntry('Ann')]);
    const user = userEvent.setup();
    renderApp();
    expect(within(await championCard()).getByText('No winner yet')).toBeInTheDocument();

    fetchStub.mockImplementation(async () => Response.json([ann]));
    await user.click(screen.getByRole('link', { name: 'Leaderboard' }));
    await user.click(screen.getByRole('link', { name: 'Timer' }));

    expect(within(await championCard()).getByText('Ann')).toBeInTheDocument();
  });
});
