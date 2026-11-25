import { createRoot } from 'react-dom/client'
import './index.css'
import { GameProvider } from './game-engine-context';
import { App } from './app';
import { BrowserRouter } from 'react-router';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <GameProvider>
      <App/>
    </GameProvider>
  </BrowserRouter>
)
