import type { ErrorEnvelope, LeaderboardEntry, Me, MemberSummary } from '@pstephenwille/poker-timer-contracts';
import { tournament } from '@pstephenwille/poker-timer-contracts/fixtures';
import { vi } from 'vitest';

type RouteResponder = () => Response;

const LEADERBOARD_URL = '/api/leaderboard';
const ME_URL = '/api/me';
const LOGOUT_URL = '/api/auth/logout';
const MEMBERS_URL = '/api/members';
const TOURNAMENTS_URL = '/api/tournaments';
export const PHOTO_GRANT_URL = `/api/tournaments/${tournament.id}/photo/uploads`;
export const PHOTO_STORAGE_URL = 'https://media.example.test/uploads';
export const PHOTO_CONFIRM_URL = `/api/tournaments/${tournament.id}/photo`;
export const PHOTO_GRANT_FIELDS = { key: 'uploads/7a1e2c3d.jpg', policy: 'example-policy' };
const PHOTO_MEDIA_ID = '7a1e2c3d-4b5f-4e6a-8c9d-0e1f2a3b4c5d';
const CREATED = 201;
const NO_CONTENT = 204;
const FORBIDDEN = 403;
const ONE_HOUR_MILLIS = 60 * 60 * 1000;

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

/** The grant expires an hour after the request, as the backend's does. */
export function servePhotoUploads() {
  const expiresAt = Date.now() + ONE_HOUR_MILLIS;
  const grant = { mediaId: PHOTO_MEDIA_ID, url: PHOTO_STORAGE_URL, fields: PHOTO_GRANT_FIELDS, expiresAt };
  responderByUrl.set(PHOTO_GRANT_URL, () => Response.json(grant, { status: CREATED }));
  responderByUrl.set(PHOTO_STORAGE_URL, () => new Response(null, { status: NO_CONTENT }));
  responderByUrl.set(PHOTO_CONFIRM_URL, () => Response.json({ ...tournament, photo: { status: 'processing' } }));
}

/** Storage refuses the post, as S3 does when the grant's policy isn't met. */
export function failPhotoStorage() {
  responderByUrl.set(PHOTO_STORAGE_URL, () => new Response('<Error><Code>AccessDenied</Code></Error>', { status: FORBIDDEN }));
}

export function requestedUrls() {
  return vi.mocked(fetch).mock.calls.map(([requestedUrl]) => String(requestedUrl));
}

export function requestsTo(url: string) {
  return vi.mocked(fetch).mock.calls
    .filter(([requestedUrl]) => requestedUrl === url)
    .map(([, init]) => init);
}
