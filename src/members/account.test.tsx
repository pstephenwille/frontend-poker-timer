import { me as ann } from '@pstephenwille/poker-timer-contracts/fixtures';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { failMe, renderApp, serveLeaderboard, signIn } from '../testing/render-app';

const SIGN_IN_LOCKED_HINT = 'Sign in after the game';
const ACCOUNT_CHECK_FAILED = 'Your account could not be checked';

describe('the header account area', () => {
  test('offers Sign in when signed out, coming back to the same page', async () => {
    renderApp('/leaderboard');

    expect(await screen.findByRole('link', { name: 'Sign in' }))
      .toHaveAttribute('href', '/api/auth/login?returnTo=%2Fleaderboard');
  });

  test('shows the signed-in Member instead of Sign in', async () => {
    signIn(ann);

    renderApp();

    expect(await screen.findByRole('img', { name: 'Signed in as Ann.AllIn' })).toBeInTheDocument();
    expect(screen.queryByText('Sign in')).not.toBeInTheDocument();
  });

  test('Sign in is disabled from Start until Reset, because it reloads the page', async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByRole('link', { name: 'Sign in' });

    await user.click(screen.getByRole('button', { name: 'Start' }));
    await user.click(screen.getByRole('button', { name: 'Pause' }));

    expect(screen.queryByRole('link', { name: 'Sign in' })).not.toBeInTheDocument();
    expect(screen.getByText('Sign in')).toHaveAttribute('title', SIGN_IN_LOCKED_HINT);

    await user.click(screen.getByRole('button', { name: 'Reset' }));

    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
  });

  test('shows neither, and logs the error, when the account cannot be checked', async () => {
    serveLeaderboard([]);
    failMe();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderApp();

    await vi.waitFor(() => expect(consoleError).toHaveBeenCalledWith(ACCOUNT_CHECK_FAILED, expect.any(Error)));
    expect(screen.queryByText('Sign in')).not.toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /Signed in as/ })).not.toBeInTheDocument();
  });
});
