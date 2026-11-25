import { useNavigate } from 'react-router';
import { RECORD_TOURNAMENT_PATH } from '../app-paths';
import { useGameEngine } from '../game-engine';

/**
 * Played on is taken when End Tournament is pressed, and carried in the URL
 * so it survives a trip through sign-in before the Tournament is recorded.
 */
export function EndTournamentButton() {
  const engine = useGameEngine();
  const navigate = useNavigate();

  const endTournament = () => {
    const playedOn = Date.now();
    engine.resetGame();
    navigate(`${RECORD_TOURNAMENT_PATH}?playedOn=${playedOn}`);
  };

  return <button onClick={endTournament} disabled={!engine.hasGameStarted}>End Tournament</button>;
}
