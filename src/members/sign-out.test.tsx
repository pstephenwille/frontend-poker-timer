import { me as ann } from '@pstephenwille/poker-timer-contracts/fixtures';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { leaveApp } from '../browser/leave-app';
import { failSignOut, requestsTo, serveSignOut, signIn } from '../testing/fake-backend';
import { openAccountMenu } from '../testing/account-menu';
import { renderApp } from '../testing/render-app';

vi.mock('../browser/leave-app');

const COGNITO_SIGN_OUT_URL = 'https://auth.example.test/logout?client_id=example';
const SIGN_OUT_LOCKED_HINT = 'Sign out after the game';

describe('signing out', () => {
  test('ends the session, then signs out of Cognito too', async () => {
    signIn(ann);
    serveSignOut(COGNITO_SIGN_OUT_URL);
    const user = userEvent.setup();
    renderApp();

    await openAccountMenu(user);
    await user.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(requestsTo('/api/auth/logout')).toEqual([{ method: 'POST' }]);
    await vi.waitFor(() => expect(leaveApp).toHaveBeenCalledWith(COGNITO_SIGN_OUT_URL));
  });

  test('is disabled from Start until Reset, because it reloads the page', async () => {
    signIn(ann);
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: 'Start' }));
    await user.click(screen.getByRole('button', { name: 'Pause' }));
    await openAccountMenu(user);

    const signOut = screen.getByRole('button', { name: 'Sign out' });
    expect(signOut).toBeDisabled();
    expect(signOut).toHaveAttribute('title', SIGN_OUT_LOCKED_HINT);

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    await openAccountMenu(user);

    expect(screen.getByRole('button', { name: 'Sign out' })).toBeEnabled();
  });

  test('stays signed in, and logs the error, when the backend cannot end the session', async () => {
    signIn(ann);
    failSignOut();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    renderApp();

    await openAccountMenu(user);
    await user.click(screen.getByRole('button', { name: 'Sign out' }));

    await vi.waitFor(() => expect(consoleError).toHaveBeenCalledWith('Sign-out failed', expect.any(Error)));
    expect(leaveApp).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Signed in as Ann.AllIn' })).toBeInTheDocument();
  });
});
