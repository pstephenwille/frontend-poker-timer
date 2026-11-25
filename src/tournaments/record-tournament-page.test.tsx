import { me as ann, members } from '@pstephenwille/poker-timer-contracts/fixtures';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { failMe, serveLeaderboard, serveMembers, signIn } from '../testing/fake-backend';
import { renderApp } from '../testing/render-app';

const LEAVING_LOCKED_HINT = 'Pause the game to leave the timer';
const SIGN_IN_LOCKED_HINT = 'Sign in after the game';
const PLAYED_ON = Date.UTC(2026, 10, 24, 4, 30);

const recordForm = () => screen.findByRole('form', { name: 'Record a Tournament' });

beforeEach(() => {
  serveMembers(members);
});

describe('the Record a Tournament page', () => {
  test('signed out, it offers Sign in to record, coming back to the same URL with its playedOn', async () => {
    renderApp(`/tournaments/new?playedOn=${PLAYED_ON}`);

    expect(await screen.findByRole('link', { name: 'Sign in to record' }))
      .toHaveAttribute('href', `/api/auth/login?returnTo=%2Ftournaments%2Fnew%3FplayedOn%3D${PLAYED_ON}`);
    expect(screen.queryByRole('form', { name: 'Record a Tournament' })).not.toBeInTheDocument();
  });

  test('signed in, it shows the form instead of the prompt', async () => {
    signIn(ann);

    renderApp('/tournaments/new');

    expect(await recordForm()).toBeInTheDocument();
    expect(screen.queryByText('Sign in to record')).not.toBeInTheDocument();
  });

  test('Sign in to record is disabled while a Tournament is Paused, because it reloads the page', async () => {
    serveLeaderboard([]);
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: 'Start' }));
    await user.click(screen.getByRole('button', { name: 'Pause' }));
    await user.click(screen.getByRole('link', { name: 'Record' }));

    expect(await screen.findByText('Sign in to record')).toHaveAttribute('title', SIGN_IN_LOCKED_HINT);
    expect(screen.queryByRole('link', { name: 'Sign in to record' })).not.toBeInTheDocument();
  });

  test('says so when the account cannot be checked', async () => {
    failMe();
    vi.spyOn(console, 'error').mockImplementation(() => {});

    renderApp('/tournaments/new');

    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't check whether you're signed in.");
  });
});

describe('the header Record link', () => {
  test('opens the page from Not Started', async () => {
    signIn(ann);
    serveLeaderboard([]);
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('link', { name: 'Record' }));

    expect(await recordForm()).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Start' })).not.toBeInTheDocument();
  });

  test('opens the page from Paused', async () => {
    signIn(ann);
    serveLeaderboard([]);
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: 'Start' }));
    await user.click(screen.getByRole('button', { name: 'Pause' }));
    await user.click(screen.getByRole('link', { name: 'Record' }));

    expect(await recordForm()).toBeInTheDocument();
  });

  test('is disabled while Running', async () => {
    serveLeaderboard([]);
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: 'Start' }));

    expect(screen.queryByRole('link', { name: 'Record' })).not.toBeInTheDocument();
    expect(screen.getByText('Record')).toHaveAttribute('title', LEAVING_LOCKED_HINT);
  });

  test('is disabled On Break', async () => {
    serveLeaderboard([]);
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: 'Start' }));
    await user.click(screen.getByRole('button', { name: 'Pause' }));
    await user.click(screen.getByRole('button', { name: 'Take Break' }));

    expect(screen.queryByRole('link', { name: 'Record' })).not.toBeInTheDocument();
    expect(screen.getByText('Record')).toHaveAttribute('title', LEAVING_LOCKED_HINT);
  });

  test('the Record page links back to the timer and the Leaderboard', async () => {
    renderApp('/tournaments/new');

    expect(await screen.findByRole('link', { name: 'Timer' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Leaderboard' })).toHaveAttribute('href', '/leaderboard');
    expect(screen.queryByRole('link', { name: 'Record' })).not.toBeInTheDocument();
  });
});
