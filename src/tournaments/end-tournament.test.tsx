import { me as ann, members } from '@pstephenwille/poker-timer-contracts/fixtures';
import { screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { openAccountMenu } from '../testing/account-menu';
import { acceptTournaments, serveLeaderboard, serveMembers, signIn } from '../testing/fake-backend';
import { fillInEveryRequiredField, leaderboardShown, save, tournamentsPosted } from '../testing/record-tournament-form';
import { renderApp } from '../testing/render-app';

const TOURNAMENT_ENDED_AT = Date.UTC(2026, 10, 24, 5, 47, 31, 250);

const endTournamentButton = () => screen.getByRole('button', { name: 'End Tournament' });
const startTheTournament = (user: UserEvent) => user.click(screen.getByRole('button', { name: 'Start' }));
const pauseTheTournament = (user: UserEvent) => user.click(screen.getByRole('button', { name: 'Pause' }));

function openTheTimer() {
  const user = userEvent.setup();
  renderApp();

  return user;
}

beforeEach(() => {
  serveLeaderboard([]);
});

describe('End Tournament', () => {
  test('is disabled until the Tournament has started', () => {
    openTheTimer();

    expect(endTournamentButton()).toBeDisabled();
  });

  test('is enabled while Running and while Paused', async () => {
    const user = openTheTimer();

    await startTheTournament(user);
    expect(endTournamentButton()).toBeEnabled();

    await pauseTheTournament(user);
    expect(endTournamentButton()).toBeEnabled();
  });

  test('Resets the timer and opens the Record page without asking first', async () => {
    const confirm = vi.spyOn(window, 'confirm');
    signIn(ann);
    serveMembers(members);
    const user = openTheTimer();
    await startTheTournament(user);
    await pauseTheTournament(user);

    await user.click(endTournamentButton());

    expect(await screen.findByRole('heading', { name: 'Record a Tournament' })).toBeInTheDocument();
    expect(confirm).not.toHaveBeenCalled();
    await openAccountMenu(user);
    await user.click(screen.getByRole('link', { name: 'Timer' }));
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
    expect(endTournamentButton()).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Take Break' })).toBeDisabled();
  });

  test('records the moment the Tournament ended as Played on', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(TOURNAMENT_ENDED_AT);
    signIn(ann);
    serveMembers(members);
    acceptTournaments();
    const user = openTheTimer();
    await startTheTournament(user);

    await user.click(endTournamentButton());
    await fillInEveryRequiredField(user);
    await save(user);

    await leaderboardShown();
    expect(JSON.parse(String(tournamentsPosted()[0]?.body)).playedOn).toBe(TOURNAMENT_ENDED_AT);
  });
});
