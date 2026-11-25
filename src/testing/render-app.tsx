import type { LeaderboardEntry } from '@pstephenwille/poker-timer-contracts';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import { App } from '../app';
import { GameProvider } from '../game-engine-context';

export function serveLeaderboard(entries: LeaderboardEntry[]) {
  const fetchStub = vi.fn(async () => Response.json(entries));
  vi.stubGlobal('fetch', fetchStub);

  return fetchStub;
}

export function failLeaderboard() {
  vi.stubGlobal('fetch', vi.fn(async () => new Response('Bad gateway', { status: 502 })));
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
