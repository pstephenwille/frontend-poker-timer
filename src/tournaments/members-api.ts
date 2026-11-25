import { Members } from '@pstephenwille/poker-timer-contracts';

const MEMBERS_URL = '/api/members';

export async function fetchMembers(): Promise<Members> {
  const response = await fetch(MEMBERS_URL);
  if (!response.ok) {
    throw new Error(`GET ${MEMBERS_URL} answered ${response.status}`);
  }

  return Members.parse(await response.json());
}
