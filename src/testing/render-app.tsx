import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { App } from '../app';
import { GameProvider } from '../game-engine-context';

export function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <GameProvider>
        <App />
      </GameProvider>
    </MemoryRouter>,
  );
}
