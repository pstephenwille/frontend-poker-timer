import type { ErrorEnvelope, LeaderboardEntry, Me, MemberSummary } from '@pstephenwille/poker-timer-contracts';
import { tournament } from '@pstephenwille/poker-timer-contracts/fixtures';
import { vi } from 'vitest';

type RouteResponder = () => Response;

const LEADERBOARD_URL = '/api/leaderboard';
const ME_URL = '/api/me';
const LOGOUT_URL = '/api/auth/logout';
const MEMBERS_URL = '/api/members';
const TOURNAMENTS_URL = '/api/tournaments';
const CREATED = 201;

const signedOut: RouteResponder = () => Response.json({ error: { code: 'unauthorized', message: 'Sign in first' } }, { status: 401 });
const serverError: RouteResponder = () => new Response('Bad gateway', { status: 502 });
const notFound: RouteResponder = () => new Response('Not found', { status: 404 });

let responderByUrl = new Map<string, RouteResponder>();

/**
 * Called before each test, so every test starts signed out with no Leaderboard served.
 * Kept apart from render-app so the setup file loads no app code before a test's vi.mock.
 */
export function resetFakeBackend() {
  responderByUrl = new Map([[ME_URL, signedOut]]);
  vi.stubGlobal('fetch', vi.fn(async (url: string) => (responderByUrl.get(url) ?? notFound)()));
}

export function serveLeaderboard(entries: LeaderboardEntry[]) {
  responderByUrl.set(LEADERBOARD_URL, () => Response.json(entries));
}

export function failLeaderboard() {
  responderByUrl.set(LEADERBOARD_URL, serverError);
}

export function signIn(me: Me) {
  responderByUrl.set(ME_URL, () => Response.json(me));
}

export function failMe() {
  responderByUrl.set(ME_URL, serverError);
}

export function serveSignOut(signOutUrl: string) {
  responderByUrl.set(LOGOUT_URL, () => Response.json({ signOutUrl }));
}

export function failSignOut() {
  responderByUrl.set(LOGOUT_URL, serverError);
}

export function serveMembers(members: MemberSummary[]) {
  responderByUrl.set(MEMBERS_URL, () => Response.json(members));
}

export function failMembers() {
  responderByUrl.set(MEMBERS_URL, serverError);
}

export function acceptTournaments() {
  responderByUrl.set(TOURNAMENTS_URL, () => Response.json(tournament, { status: CREATED }));
}

export function refuseTournaments(status: number, envelope: ErrorEnvelope) {
  responderByUrl.set(TOURNAMENTS_URL, () => Response.json(envelope, { status }));
}

export function requestsTo(url: string) {
  return vi.mocked(fetch).mock.calls
    .filter(([requestedUrl]) => requestedUrl === url)
    .map(([, init]) => init);
}
