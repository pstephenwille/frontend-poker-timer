import { me as ann, members } from '@pstephenwille/poker-timer-contracts/fixtures';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { QRCodeSVG } from 'qrcode.react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { failMembers, serveMembers, signIn } from '../testing/fake-backend';
import {
  annMember,
  bob,
  inactiveCal,
  openRecordForm,
  participant,
  potField,
} from '../testing/record-tournament-form';
import { renderApp } from '../testing/render-app';

const newlyRegisteredCal = { ...inactiveCal, active: true };
const REGISTER_CAPTION = 'Not listed? Scan to register';

const registerUrl = () => `${window.location.origin}/api/auth/login?returnTo=%2Fme`;
const pathsOf = (svg: Element | null) => [...(svg?.querySelectorAll('path') ?? [])].map((path) => path.getAttribute('d'));

/** A QR code can't be read back in jsdom, so the one shown is compared with one drawn for the expected URL. */
function expectRegisterCodeForSignInReturningToMe() {
  const shownCode = screen.getByRole('figure', { name: REGISTER_CAPTION }).querySelector('svg');
  const { container } = render(<QRCodeSVG value={registerUrl()} />);

  expect(pathsOf(shownCode)).toEqual(pathsOf(container.querySelector('svg')));
}

describe('the register QR code', () => {
  test('shows on the form, encoding sign-in that returns to /me', async () => {
    signIn(ann);
    serveMembers(members);

    openRecordForm();

    await participant(bob.displayName);
    expectRegisterCodeForSignInReturningToMe();
  });

  test('shows on the signed-out prompt too', async () => {
    renderApp('/tournaments/new');

    await screen.findByRole('link', { name: 'Sign in to record' });
    expectRegisterCodeForSignInReturningToMe();
  });
});

describe('the Participant list', () => {
  beforeEach(() => {
    signIn(ann);
    serveMembers(members);
  });

  test("says players without an account can't be recorded", async () => {
    openRecordForm();

    await participant(bob.displayName);
    expect(screen.getByText(/Players without an account can't be recorded/)).toBeInTheDocument();
  });

  test('adds a newly registered Member when the window is focused again, keeping what was filled in', async () => {
    const user = openRecordForm();
    await user.click(await participant(bob.displayName));
    await user.type(potField(), '120');

    serveMembers([annMember, bob, newlyRegisteredCal]);
    fireEvent.focus(window);

    expect(await participant(newlyRegisteredCal.displayName)).not.toBeChecked();
    expect(await participant(bob.displayName)).toBeChecked();
    expect(potField()).toHaveValue(120);
  });

  test('adds a newly registered Member on Refresh, keeping what was filled in', async () => {
    const user = openRecordForm();
    await user.click(await participant(bob.displayName));

    serveMembers([annMember, bob, newlyRegisteredCal]);
    await user.click(screen.getByRole('button', { name: 'Refresh' }));

    expect(await participant(newlyRegisteredCal.displayName)).toBeInTheDocument();
    expect(await participant(bob.displayName)).toBeChecked();
  });

  test('keeps the list it has, and says so, when a refresh fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = openRecordForm();
    await user.click(await participant(bob.displayName));

    failMembers();
    await user.click(screen.getByRole('button', { name: 'Refresh' }));

    expect(await screen.findByRole('status')).toHaveTextContent("The Members couldn't be refreshed. Try Refresh again.");
    expect(await participant(bob.displayName)).toBeChecked();
  });
});

describe('the /me placeholder', () => {
  test('tells a newly registered Member they can now be recorded', async () => {
    signIn(ann);

    renderApp('/me');

    const page = await screen.findByRole('main');
    expect(await within(page).findByText(`You're registered, ${ann.displayName}.`, { exact: false }))
      .toHaveTextContent('The host can now check you on the Record form.');
  });

  test('offers Sign in to register, returning to /me, when signed out', async () => {
    renderApp('/me');

    expect(await screen.findByRole('link', { name: 'Sign in to register' }))
      .toHaveAttribute('href', '/api/auth/login?returnTo=%2Fme');
  });
});
