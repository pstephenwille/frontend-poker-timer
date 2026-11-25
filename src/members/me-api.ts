import { Me } from '@pstephenwille/poker-timer-contracts';

const ME_URL = '/api/me';
const UNAUTHORIZED = 401;

/** Resolves to null when nobody is signed in: the backend answers 401 without a valid session. */
export async function fetchMe(): Promise<Me | null> {
  const response = await fetch(ME_URL);
  if (response.status === UNAUTHORIZED) return null;
  if (!response.ok) {
    throw new Error(`GET ${ME_URL} answered ${response.status}`);
  }

  return Me.parse(await response.json());
}
