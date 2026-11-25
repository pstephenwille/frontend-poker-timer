import type { LeaderboardEntry, Me } from '@pstephenwille/poker-timer-contracts';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import { App } from '../app';
import { GameProvider } from '../game-engine-context';

type RouteResponder = () => Response;

const LEADERBOARD_URL = '/api/leaderboard';
const ME_URL = '/api/me';

const signedOut: RouteResponder = () => Response.json({ error: { code: 'unauthorized', message: 'Sign in first' } }, { status: 401 });
const serverError: RouteResponder = () => new Response('Bad gateway', { status: 502 });
const notFound: RouteResponder = () => new Response('Not found', { status: 404 });

let responderByUrl = new Map<string, RouteResponder>();

/** Called before each test, so every test starts signed out with no Leaderboard served. */
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

export function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <GameProvider>
        <App />
      </GameProvider>
    </MemoryRouter>,
  );
}
