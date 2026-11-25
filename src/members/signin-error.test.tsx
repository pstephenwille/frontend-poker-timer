import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import { renderApp } from '../testing/render-app';

const REF = '7f3c1a2e-9b4d-4c8e-a1f0-5d6e7f8a9b0c';

const signInReturnTo = async () => {
  const href = (await screen.findByRole('link', { name: 'Sign in' })).getAttribute('href');

  return new URLSearchParams(href.split('?')[1]).get('returnTo');
};

describe('a failed sign-in', () => {
  test.each([
    ['cancelled', 'Sign-in was cancelled.'],
    ['expired', 'Sign-in took too long. Please try again.'],
    ['deactivated', 'This account has been deactivated. Ask an admin to reactivate it.'],
  ])('%s shows its message, without the ref', async (code, message) => {
    renderApp(`/?signinError=${code}&ref=${REF}`);

    expect(screen.getByRole('alert')).toHaveTextContent(message);
    expect(screen.getByRole('alert')).not.toHaveTextContent(REF);
  });

  test('failed shows its message with the ref, for reporting', () => {
    renderApp(`/?signinError=failed&ref=${REF}`);

    expect(screen.getByRole('alert')).toHaveTextContent(`Sign-in failed. Please try again. (ref: ${REF})`);
  });

  test('takes the code and ref out of the URL, keeping the rest', async () => {
    renderApp(`/leaderboard?signinError=expired&ref=${REF}&highlight=ann`);

    expect(await signInReturnTo()).toBe('/leaderboard?highlight=ann');
    expect(screen.getByRole('alert')).toHaveTextContent('Sign-in took too long.');
  });

  test('can be dismissed', async () => {
    const user = userEvent.setup();
    renderApp(`/?signinError=cancelled&ref=${REF}`);

    await user.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('an unknown code shows nothing', () => {
    renderApp(`/?signinError=gremlins&ref=${REF}`);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
