import { Logout } from '@pstephenwille/poker-timer-contracts';

const LOGOUT_URL = '/api/auth/logout';

/** Ends the app's session and returns where to send the browser to end Cognito's session too. */
export async function endSession(): Promise<string> {
  const response = await fetch(LOGOUT_URL, { method: 'POST' });
  if (!response.ok) {
    throw new Error(`POST ${LOGOUT_URL} answered ${response.status}`);
  }

  return Logout.parse(await response.json()).signOutUrl;
}
