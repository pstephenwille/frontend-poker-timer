import { screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

export async function openAccountMenu(user: UserEvent) {
  await user.click(await screen.findByRole('button', { name: /^Signed in as / }));
}
