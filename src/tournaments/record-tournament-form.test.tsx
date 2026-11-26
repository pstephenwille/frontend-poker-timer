import { MAX_NOTE_LENGTH } from '@pstephenwille/poker-timer-contracts';
import { me as ann, members } from '@pstephenwille/poker-timer-contracts/fixtures';
import { fireEvent, screen, within } from '@testing-library/react';
import { type UserEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  acceptTournaments,
  failMembers,
  refuseTournaments,
  serveLeaderboard,
  serveMembers,
  signIn,
} from '../testing/fake-backend';
import { openAccountMenu } from '../testing/account-menu';
import { leaderboardEntry } from '../testing/leaderboard-entries';
import {
  annMember,
  bob,
  fillInEveryRequiredField,
  inactiveCal,
  openRecordForm,
  participant,
  PLAYED_ON,
  potField,
  save,
  tournamentsPosted,
  winnerChoice,
  winningHandChoice,
} from '../testing/record-tournament-form';

const PLAYED_ON_WITH_SECONDS = Date.UTC(2026, 10, 24, 4, 30, 12, 345);
const ONE_DAY_MILLIS = 24 * 60 * 60 * 1000;
const ONE_MINUTE_MILLIS = 60 * 1000;

const cal = { ...inactiveCal, active: true };

const opponentsGroup = () => screen.getByRole('group', { name: 'Final Hand Opponents (optional)' });
const opponent = (name: string) => within(opponentsGroup()).getByRole('checkbox', { name });
const opponentNames = () => within(opponentsGroup()).queryAllByRole('checkbox').map((box) => box.closest('label')?.textContent);
const noteField = () => screen.getByRole('textbox', { name: 'Note (optional)' });
const playedOnField = () => screen.getByLabelText<HTMLInputElement>('Played on');
const optionNames = (select: HTMLElement) => within(select).getAllByRole('option').map((option) => option.textContent);
const postedPlayedOn = () => JSON.parse(String(tournamentsPosted()[0]?.body)).playedOn;

beforeEach(() => {
  signIn(ann);
  serveMembers(members);
});

describe('the Participants', () => {
  test('are the active Members, all unchecked', async () => {
    openRecordForm();

    expect(await participant(annMember.displayName)).not.toBeChecked();
    expect(await participant(bob.displayName)).not.toBeChecked();
    expect(screen.queryByRole('checkbox', { name: inactiveCal.displayName })).not.toBeInTheDocument();
  });

  test('say so when the Members cannot be loaded', async () => {
    failMembers();
    vi.spyOn(console, 'error').mockImplementation(() => {});

    openRecordForm();

    expect(await screen.findByRole('alert')).toHaveTextContent("The Members couldn't be loaded. Reload the page to try again.");
  });
});

describe('the Winner', () => {
  test('is chosen from every active Member', async () => {
    openRecordForm();
    await participant(bob.displayName);

    expect(optionNames(winnerChoice())).toEqual(['Choose the Winner', annMember.displayName, bob.displayName]);
  });

  test('is checked as a Participant, and stays checked while they are the Winner', async () => {
    const user = openRecordForm();
    await participant(bob.displayName);

    await user.selectOptions(winnerChoice(), bob.displayName);

    expect(await participant(bob.displayName)).toBeChecked();
    expect(await participant(bob.displayName)).toBeDisabled();
  });

  test('stays checked as a Participant after another Member becomes the Winner', async () => {
    const user = openRecordForm();
    await participant(bob.displayName);
    await user.selectOptions(winnerChoice(), bob.displayName);

    await user.selectOptions(winnerChoice(), annMember.displayName);

    expect(await participant(bob.displayName)).toBeChecked();
    expect(await participant(bob.displayName)).toBeEnabled();
  });
});

describe('the Pot', () => {
  test('starts empty', async () => {
    openRecordForm();
    await participant(bob.displayName);

    expect(potField()).toHaveValue(null);
  });

  test.each(['', '12.5'])('is required as whole dollars, so %j does not save', async (pot) => {
    const user = openRecordForm();
    await fillInEveryRequiredField(user);
    await user.clear(potField());
    if (pot) await user.type(potField(), pot);

    await save(user);

    expect(screen.getByRole('alert')).toHaveTextContent('Enter the Pot in whole dollars.');
    expect(tournamentsPosted()).toEqual([]);
  });
});

describe('Played on', () => {
  test("comes from the URL's playedOn, shown in local time", async () => {
    openRecordForm();
    await participant(bob.displayName);

    expect(new Date(playedOnField().value).getTime()).toBe(PLAYED_ON);
  });

  test('is now when the URL has none', async () => {
    openRecordForm('/tournaments/new');
    await participant(bob.displayName);

    const shownMillis = new Date(playedOnField().value).getTime();
    expect(Date.now() - shownMillis).toBeLessThan(ONE_MINUTE_MILLIS);
    expect(Date.now() - shownMillis).toBeGreaterThanOrEqual(0);
  });

  test("left as it is, saves the URL's exact instant, seconds and all", async () => {
    acceptTournaments();
    serveLeaderboard([]);
    const user = openRecordForm(`/tournaments/new?playedOn=${PLAYED_ON_WITH_SECONDS}`);
    await fillInEveryRequiredField(user);

    await save(user);

    await screen.findByRole('table', { name: 'Leaderboard' });
    expect(postedPlayedOn()).toBe(PLAYED_ON_WITH_SECONDS);
  });

  test('once edited, saves the instant typed, in local time', async () => {
    acceptTournaments();
    serveLeaderboard([]);
    const user = openRecordForm(`/tournaments/new?playedOn=${PLAYED_ON_WITH_SECONDS}`);
    await fillInEveryRequiredField(user);

    fireEvent.change(playedOnField(), { target: { value: '2026-11-20T21:15' } });
    await save(user);

    await screen.findByRole('table', { name: 'Leaderboard' });
    expect(postedPlayedOn()).toBe(new Date(2026, 10, 20, 21, 15).getTime());
  });

  test("can't be in the future", async () => {
    const user = openRecordForm(`/tournaments/new?playedOn=${Date.now() + ONE_DAY_MILLIS}`);
    await fillInEveryRequiredField(user);

    await save(user);

    expect(screen.getByRole('alert')).toHaveTextContent("Played on can't be in the future");
    expect(tournamentsPosted()).toEqual([]);
  });
});

describe('the Final Hand Opponents', () => {
  beforeEach(() => {
    serveMembers([annMember, bob, cal]);
  });

  async function chooseWinner(user: UserEvent, winnerName: string) {
    await participant(winnerName);
    await user.selectOptions(winnerChoice(), winnerName);
  }

  test('are chosen from every active Member other than the Winner', async () => {
    const user = openRecordForm();

    await chooseWinner(user, bob.displayName);

    expect(opponentNames()).toEqual([annMember.displayName, cal.displayName]);
  });

  test('are checked as Participants, and stay checked while marked', async () => {
    const user = openRecordForm();
    await chooseWinner(user, bob.displayName);

    await user.click(opponent(cal.displayName));

    expect(await participant(cal.displayName)).toBeChecked();
    expect(await participant(cal.displayName)).toBeDisabled();
  });

  test('stay checked as Participants once unmarked', async () => {
    const user = openRecordForm();
    await chooseWinner(user, bob.displayName);
    await user.click(opponent(cal.displayName));

    await user.click(opponent(cal.displayName));

    expect(await participant(cal.displayName)).toBeChecked();
    expect(await participant(cal.displayName)).toBeEnabled();
  });

  test('lose a Member who becomes the Winner', async () => {
    const user = openRecordForm();
    await chooseWinner(user, bob.displayName);
    await user.click(opponent(cal.displayName));

    await user.selectOptions(winnerChoice(), cal.displayName);
    await user.selectOptions(winnerChoice(), bob.displayName);

    expect(opponent(cal.displayName)).not.toBeChecked();
  });
});

describe('the Note', () => {
  test(`stops at ${MAX_NOTE_LENGTH} characters`, async () => {
    const user = openRecordForm();
    await participant(bob.displayName);

    await user.click(noteField());
    await user.paste('x'.repeat(MAX_NOTE_LENGTH + 1));

    expect(noteField()).toHaveValue('x'.repeat(MAX_NOTE_LENGTH));
  });
});

describe('saving', () => {
  test('needs a Winner', async () => {
    const user = openRecordForm();
    await user.click(await participant(bob.displayName));

    await save(user);

    const problems = screen.getByRole('alert');
    expect(problems).toHaveTextContent('Choose the Winner.');
    expect(problems).toHaveTextContent('Choose the Winning Hand.');
    expect(tournamentsPosted()).toEqual([]);
  });

  test('records the Tournament and shows the Leaderboard', async () => {
    acceptTournaments();
    serveLeaderboard([]);
    const user = openRecordForm();
    await fillInEveryRequiredField(user);

    await save(user);

    expect(await screen.findByRole('table', { name: 'Leaderboard' })).toBeInTheDocument();
    const [request] = tournamentsPosted();
    expect(request?.method).toBe('POST');
    expect(JSON.parse(String(request?.body))).toEqual({
      playedOn: PLAYED_ON,
      participantIds: [annMember.id, bob.id],
      winnerId: bob.id,
      winningHand: 'full_house',
      pot: 120,
    });
  });

  test('records a Tournament with only its Winner', async () => {
    acceptTournaments();
    serveLeaderboard([]);
    const user = openRecordForm();
    await participant(bob.displayName);
    await user.selectOptions(winnerChoice(), bob.displayName);
    await user.selectOptions(winningHandChoice(), 'Full House');
    await user.type(potField(), '120');

    await save(user);

    expect(await screen.findByRole('table', { name: 'Leaderboard' })).toBeInTheDocument();
    expect(JSON.parse(String(tournamentsPosted()[0]?.body))).toEqual({
      playedOn: PLAYED_ON,
      participantIds: [bob.id],
      winnerId: bob.id,
      winningHand: 'full_house',
      pot: 120,
    });
  });

  test('sends the Final Hand Opponents and the Note as entered', async () => {
    acceptTournaments();
    serveLeaderboard([]);
    const user = openRecordForm();
    await fillInEveryRequiredField(user);
    await user.click(opponent(annMember.displayName));
    await user.type(noteField(), 'Rivered the boat.');

    await save(user);

    await screen.findByRole('table', { name: 'Leaderboard' });
    expect(JSON.parse(String(tournamentsPosted()[0]?.body))).toMatchObject({
      finalHandOpponentIds: [annMember.id],
      note: 'Rivered the boat.',
    });
  });

  test("keeps the form filled and shows the backend's message when it refuses", async () => {
    refuseTournaments(403, {
      error: { code: 'recorder_not_participant', message: 'You can only record a tournament you played in' },
    });
    const user = openRecordForm();
    await fillInEveryRequiredField(user);

    await save(user);

    expect(await screen.findByRole('alert')).toHaveTextContent('You can only record a tournament you played in');
    expect(await participant(bob.displayName)).toBeChecked();
    expect(winnerChoice()).toHaveDisplayValue(bob.displayName);
    expect(potField()).toHaveValue(120);
  });
});

describe('after a save', () => {
  const leaderboardWithBobJustWon = [
    leaderboardEntry(bob.displayName, { userId: bob.id, rank: 1, wins: 1, lastWonAt: PLAYED_ON }),
    leaderboardEntry(annMember.displayName, { userId: annMember.id, rank: 2 }),
  ];
  const leaderboardRow = (name: string) => screen.getByRole('row', { name: new RegExp(name) });

  async function recordBobsWin() {
    acceptTournaments();
    serveLeaderboard(leaderboardWithBobJustWon);
    const user = openRecordForm();
    await fillInEveryRequiredField(user);
    await save(user);
    await screen.findByRole('table', { name: 'Leaderboard' });

    return user;
  }

  test("the Leaderboard highlights the new Winner's row", async () => {
    await recordBobsWin();

    expect(leaderboardRow(bob.displayName)).toHaveAttribute('aria-current', 'true');
    expect(leaderboardRow(annMember.displayName)).not.toHaveAttribute('aria-current');
  });

  test('the highlight is gone when the Leaderboard is opened again', async () => {
    const user = await recordBobsWin();

    await openAccountMenu(user);

    await user.click(screen.getByRole('link', { name: 'Timer' }));
    await openAccountMenu(user);
    await user.click(screen.getByRole('link', { name: 'Leaderboard' }));

    await screen.findByRole('table', { name: 'Leaderboard' });
    expect(leaderboardRow(bob.displayName)).not.toHaveAttribute('aria-current');
  });

  test('going back to the timer shows the new Tournament on both honor cards', async () => {
    const user = await recordBobsWin();

    await openAccountMenu(user);

    await user.click(screen.getByRole('link', { name: 'Timer' }));

    const lastWinner = await screen.findByRole('region', { name: 'Last Winner' });
    expect(within(lastWinner).getByText(bob.displayName)).toBeInTheDocument();
    const champion = screen.getByRole('region', { name: 'Reigning Champion' });
    expect(within(champion).getByText(bob.displayName)).toBeInTheDocument();
  });
});
