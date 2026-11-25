import { members } from '@pstephenwille/poker-timer-contracts/fixtures';
import { screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { requestsTo } from './fake-backend';
import { renderApp } from './render-app';

export const [annMember, bob, inactiveCal] = members;
export const PLAYED_ON = Date.UTC(2026, 10, 24, 4, 30);
const RECORD_URL = `/tournaments/new?playedOn=${PLAYED_ON}`;

export const participant = async (name: string) =>
  within(await screen.findByRole('group', { name: 'Participants' })).getByRole('checkbox', { name });
export const winnerChoice = () => screen.getByRole('combobox', { name: 'Winner' });
export const winningHandChoice = () => screen.getByRole('combobox', { name: 'Winning Hand' });
export const potField = () => screen.getByRole('spinbutton', { name: 'Pot ($)' });
export const save = (user: UserEvent) => user.click(screen.getByRole('button', { name: 'Save' }));
export const tournamentsPosted = () => requestsTo('/api/tournaments');
export const leaderboardShown = () => screen.findByRole('table', { name: 'Leaderboard' });

/** Ann and Bob play, and Bob wins with a Full House for a $120 Pot. */
export async function fillInEveryRequiredField(user: UserEvent) {
  await user.click(await participant(annMember.displayName));
  await user.click(await participant(bob.displayName));
  await user.selectOptions(winnerChoice(), bob.displayName);
  await user.selectOptions(winningHandChoice(), 'Full House');
  await user.type(potField(), '120');
}

export function openRecordForm(path = RECORD_URL) {
  const user = userEvent.setup();
  renderApp(path);

  return user;
}
